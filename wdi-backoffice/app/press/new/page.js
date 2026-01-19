'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPressPage() {
  const router = useRouter();
  const [item, setItem] = useState({
    title: '',
    source: '',
    date: '',
    url: '',
    logo: '',
    order: 100,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!item.title || !item.source) {
      setMessage('כותרת ומקור הם שדות חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage('נוצר בהצלחה! ✓');
        setTimeout(() => {
          router.push(`/press/${data._id || data.id}`);
        }, 1000);
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

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage('יש להעלות קובץ תמונה בלבד');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('גודל התמונה חייב להיות עד 5MB');
      return;
    }
    
    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'images/press');
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.image) {
        setItem(prev => ({ ...prev, logo: data.image }));
        setMessage('לוגו הועלה! ✓');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`שגיאה: ${data.error || 'שגיאה בהעלאה'}`);
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
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return `https://raw.githubusercontent.com/ark-dvd/wdi-ltd-israel/main${image.startsWith('/') ? '' : '/'}${image}`;
    }
    return null;
  }

  const logoUrl = getImageUrl(item.logo);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/press" className="text-gray-400 hover:text-gray-600">
            → חזרה לרשימה
          </Link>
          <h1 className="text-2xl font-bold text-wdi-blue">כתבה חדשה</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">לוגו המקור</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="לוגו" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-3xl text-gray-300">📰</span>
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
                className={`cursor-pointer px-4 py-2 rounded-lg text-sm inline-block ${
                  uploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {uploading ? 'מעלה...' : 'העלה לוגו'}
              </label>
              <p className="text-xs text-gray-500 mt-2">לוגו של העיתון/אתר</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">פרטי הכתבה</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כותרת הכתבה *</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="WDI מובילה פרויקט חדשני..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מקור (שם העיתון/אתר) *</label>
              <input
                type="text"
                value={item.source || ''}
                onChange={(e) => updateField('source', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="כלכליסט"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
              <input
                type="text"
                value={item.date || ''}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="ינואר 2025"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קישור לכתבה</label>
              <input
                type="url"
                value={item.url || ''}
                onChange={(e) => updateField('url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                dir="ltr"
                placeholder="https://..."
              />
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
      </div>
    </div>
  );
}
