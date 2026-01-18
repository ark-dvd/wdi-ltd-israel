'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientEditPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then(res => res.json())
      .then(data => setItem(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
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
    if (!confirm('האם למחוק את הלקוח?')) return;
    try {
      await fetch(`/api/clients/${params.id}`, { method: 'DELETE' });
      router.push('/clients');
    } catch (error) {
      setMessage('שגיאה במחיקה');
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docId', params.id);
    formData.append('fieldName', 'logo');
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.image) {
        setItem(prev => ({ ...prev, logo: data.image }));
        setMessage('לוגו הועלה בהצלחה! ✓');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('שגיאה בהעלאת לוגו');
    } finally {
      setUploading(false);
    }
  }

  function updateField(field, value) {
    setItem(prev => ({ ...prev, [field]: value }));
  }

  function getImageUrl(image) {
    if (!image?.asset?._ref) return null;
    const ref = image.asset._ref;
    const [, id, dimensions, format] = ref.split('-');
    return `https://cdn.sanity.io/images/hrkxr0r8/production/${id}-${dimensions}.${format}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div>
      </div>
    );
  }

  if (!item) return <div className="text-center py-12">לקוח לא נמצא</div>;

  const logoUrl = getImageUrl(item.logo);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/clients" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">{item.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-green-500">{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">לוגו</label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
              {logoUrl ? (
                <img src={logoUrl} alt={item.name} className="max-w-full max-h-full object-contain p-2" />
              ) : (
                <span className="text-2xl text-gray-400">🏢</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                {uploading ? 'מעלה...' : (logoUrl ? 'החלף לוגו' : 'העלה לוגו')}
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הלקוח</label>
          <input
            type="text"
            value={item.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
          <input
            type="text"
            value={item.category || ''}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.isActive !== false}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">פעיל</span>
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
          🗑️ מחק לקוח
        </button>
      </div>
    </div>
  );
}
