'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContentLibraryEditPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  async function fetchItem() {
    try {
      const res = await fetch(`/api/content-library/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      } else {
        setMessage('פריט לא נמצא');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      setMessage('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!item.title || !item.url) {
      setMessage('כותרת וקישור הם שדות חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/content-library/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        setMessage('נשמר בהצלחה! ✓');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await res.json();
        setMessage(`שגיאה: ${error.error || 'שגיאה בשמירה'}`);
      }
    } catch (error) {
      setMessage('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפריט?')) return;
    
    try {
      const res = await fetch(`/api/content-library/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/content-library');
      } else {
        setMessage('שגיאה במחיקה');
      }
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

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">פריט לא נמצא</p>
        <Link href="/content-library" className="text-wdi-blue hover:text-wdi-gold">חזרה לרשימה</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/content-library" className="text-gray-400 hover:text-gray-600">
            → חזרה לרשימה
          </Link>
          <h1 className="text-2xl font-bold text-wdi-blue">עריכת {item.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </span>
          )}
          <button onClick={handleDelete} className="px-4 py-2 text-red-500 hover:text-red-700 text-sm">
            מחק
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea
              value={item.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קישור *</label>
            <input
              type="url"
              value={item.url || ''}
              onChange={(e) => updateField('url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              dir="ltr"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select
              value={item.category || 'מפרטים ותקנות'}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
            >
              <option value="מפרטים ותקנות">מפרטים ותקנות</option>
              <option value="גופים ממשלתיים">גופים ממשלתיים</option>
              <option value="מקורות בינלאומיים">מקורות בינלאומיים</option>
              <option value="כלים ומשאבים">כלים ומשאבים</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
            <input
              type="number"
              value={item.order || 100}
              onChange={(e) => updateField('order', parseInt(e.target.value) || 100)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Preview link */}
      <div className="mt-4 bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>🔗 קישור:</strong>{' '}
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            {item.url}
          </a>
        </p>
      </div>
    </div>
  );
}
