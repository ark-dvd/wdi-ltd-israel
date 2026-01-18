'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestimonialEditPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/testimonials/${params.id}`)
      .then(res => res.json())
      .then(data => setItem(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/testimonials/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        setMessage('נשמר בהצלחה! ✓');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('האם למחוק את ההמלצה?')) return;
    try {
      await fetch(`/api/testimonials/${params.id}`, { method: 'DELETE' });
      router.push('/testimonials');
    } catch (error) {
      setMessage('שגיאה במחיקה');
    }
  }

  function updateField(field, value) {
    setItem(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div>
      </div>
    );
  }

  if (!item) return <div className="text-center py-12">המלצה לא נמצאה</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/testimonials" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">המלצה מאת {item.author}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-green-500">{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הממליץ</label>
          <input
            type="text"
            value={item.author || ''}
            onChange={(e) => updateField('author', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
            <input
              type="text"
              value={item.role || ''}
              onChange={(e) => updateField('role', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">חברה</label>
            <input
              type="text"
              value={item.company || ''}
              onChange={(e) => updateField('company', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תוכן ההמלצה</label>
          <textarea
            value={item.text || ''}
            onChange={(e) => updateField('text', e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.featured || false}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">מומלצת</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.isActive !== false}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">פעילה</span>
          </label>
          <div>
            <label className="text-sm text-gray-700 ml-2">סדר:</label>
            <input
              type="number"
              value={item.order || 0}
              onChange={(e) => updateField('order', parseInt(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm">
          🗑️ מחק המלצה
        </button>
      </div>
    </div>
  );
}
