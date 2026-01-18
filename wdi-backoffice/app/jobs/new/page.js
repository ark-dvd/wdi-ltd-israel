'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const typeOptions = [
  { value: 'full-time', label: 'משרה מלאה' },
  { value: 'part-time', label: 'משרה חלקית' },
  { value: 'freelance', label: 'פרילנס' },
];

export default function NewJobPage() {
  const router = useRouter();
  const [job, setJob] = useState({
    title: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!job.title || !job.location) {
      setMessage('כותרת ומיקום הם שדות חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage('נוצר בהצלחה! ✓');
        setTimeout(() => {
          router.push(`/jobs/${data._id || data.id}`);
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
    setJob(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">הוספת משרה חדשה</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('שגיאה') ? 'text-red-500' : 'text-green-500'}`}>{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'צור משרה'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">כותרת המשרה *</label>
          <input
            type="text"
            value={job.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מיקום *</label>
            <input
              type="text"
              value={job.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="תל אביב / חיפה / מרכז"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סוג משרה</label>
            <select
              value={job.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור המשרה</label>
          <textarea
            value={job.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">דרישות</label>
          <textarea
            value={job.requirements}
            onChange={(e) => updateField('requirements', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={job.active}
              onChange={(e) => updateField('active', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">משרה פעילה</span>
          </label>
        </div>
      </div>
    </div>
  );
}
