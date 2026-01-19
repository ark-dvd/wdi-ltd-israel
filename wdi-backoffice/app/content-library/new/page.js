'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewContentLibraryItemPage() {
  const router = useRouter();
  const [item, setItem] = useState({
    title: '',
    description: '',
    url: '',
    category: 'מפרטים ותקנות',
    order: 100,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!item.title || !item.url) {
      setMessage('כותרת וקישור הם שדות חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/content-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage('נוצר בהצלחה! ✓');
        setTimeout(() => {
          router.push(`/content-library/${data._id || data.id}`);
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

  function updateField(field, value) {
    setItem(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/content-library" className="text-gray-400 hover:text-gray-600">
            → חזרה לרשימה
          </Link>
          <h1 className="text-2xl font-bold text-wdi-blue">קישור חדש</h1>
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

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              placeholder="משהב"ט - המפרט הכללי לעבודות בנייה"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea
              value={item.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              placeholder="תיאור קצר של המשאב"
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
              placeholder="https://..."
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
    </div>
  );
}
