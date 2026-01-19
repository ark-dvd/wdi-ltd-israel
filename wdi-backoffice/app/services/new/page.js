'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ICON_OPTIONS = [
  { value: 'drafting-compass', label: '📐 ניהול תכנון', emoji: '📐' },
  { value: 'file-alt', label: '📄 מסמכים', emoji: '📄' },
  { value: 'hard-hat', label: '👷 פיקוח', emoji: '👷' },
  { value: 'users', label: '👥 ייצוג', emoji: '👥' },
  { value: 'project-diagram', label: '📊 PMO', emoji: '📊' },
  { value: 'clipboard-check', label: '✅ איכות', emoji: '✅' },
  { value: 'book', label: '📚 ניהול ידע', emoji: '📚' },
  { value: 'file-signature', label: '📝 היתרים', emoji: '📝' },
];

export default function NewServicePage() {
  const router = useRouter();
  const [service, setService] = useState({
    title: '',
    shortDescription: '',
    description: '',
    icon: 'drafting-compass',
    slug: '',
    isActive: true,
    order: 100,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!service.title) {
      setMessage('שם השירות הוא שדה חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage('נוצר בהצלחה! ✓');
        setTimeout(() => {
          router.push(`/services/${data._id || data.id}`);
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
    setService(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/services" className="text-gray-400 hover:text-gray-600">
            → חזרה לרשימה
          </Link>
          <h1 className="text-2xl font-bold text-wdi-blue">שירות חדש</h1>
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">פרטי השירות</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם השירות *</label>
              <input
                type="text"
                value={service.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="ניהול תכנון"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר</label>
              <input
                type="text"
                value={service.shortDescription || ''}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="תיאור קצר שיופיע בכרטיס"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אייקון</label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('icon', opt.value)}
                    className={`p-3 rounded-lg border-2 text-center transition ${
                      service.icon === opt.value
                        ? 'border-wdi-blue bg-wdi-blue/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
              <textarea
                value={service.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="תיאור מפורט של השירות"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (לכתובת URL)</label>
                <input
                  type="text"
                  value={service.slug || ''}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                  dir="ltr"
                  placeholder="design-management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
                <input
                  type="number"
                  value={service.order || 100}
                  onChange={(e) => updateField('order', parseInt(e.target.value) || 100)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={service.isActive !== false}
                  onChange={(e) => updateField('isActive', e.target.checked)}
                  className="w-4 h-4 text-wdi-blue border-gray-300 rounded focus:ring-wdi-blue"
                />
                <span className="text-sm font-medium text-gray-700">שירות פעיל (מוצג באתר)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
