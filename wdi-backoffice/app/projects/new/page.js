'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const categoryOptions = [
  { value: 'בטחוני', label: 'בטחוני' },
  { value: 'מסחרי', label: 'מסחרי' },
  { value: 'תעשייתי', label: 'תעשייתי' },
  { value: 'מגורים', label: 'מגורים' },
  { value: 'תשתיות', label: 'תשתיות' },
  { value: 'ציבורי', label: 'ציבורי' },
];

const serviceOptions = [
  'ניהול תכנון',
  'מסמכי דרישות, אפיון ופרוגרמה',
  'ניהול ביצוע ופיקוח',
  'ייצוג בעלי עניין',
  'ניהול והבטחת איכות',
  'ניהול תב״ע והיתרים',
  'שירותי PMO',
  'ניהול הידע בפרויקט',
];

export default function NewProjectPage() {
  const router = useRouter();
  const [project, setProject] = useState({
    title: '',
    client: '',
    category: 'מסחרי',
    description: '',
    services: [],
    year: new Date().getFullYear().toString(),
    featured: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!project.title || !project.client) {
      setMessage('שם פרויקט ולקוח הם שדות חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage('נוצר בהצלחה! ✓');
        setTimeout(() => {
          router.push(`/projects/${data._id || data.id}`);
        }, 1000);
      } else {
        const error = await res.json();
        setMessage(`שגיאה: ${error.error}`);
      }
    } catch (error) {
      setMessage('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setProject(prev => ({ ...prev, [field]: value }));
  }

  function toggleService(service) {
    const services = project.services || [];
    if (services.includes(service)) {
      updateField('services', services.filter(s => s !== service));
    } else {
      updateField('services', [...services, service]);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">הוספת פרויקט חדש</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('שגיאה') ? 'text-red-500' : 'text-green-500'}`}>{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'צור פרויקט'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הפרויקט *</label>
          <input
            type="text"
            value={project.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">לקוח / מזמין עבודה *</label>
          <input
            type="text"
            value={project.client}
            onChange={(e) => updateField('client', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select
              value={project.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שנה</label>
            <input
              type="text"
              value={project.year}
              onChange={(e) => updateField('year', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
          <textarea
            value={project.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">שירותים</label>
          <div className="grid grid-cols-2 gap-2">
            {serviceOptions.map(service => (
              <label key={service} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(project.services || []).includes(service)}
                  onChange={() => toggleService(service)}
                  className="w-4 h-4"
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={project.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">פרויקט מומלץ (מוצג בעמוד הראשי)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
