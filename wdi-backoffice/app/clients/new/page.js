'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [client, setClient] = useState({
    name: '',
    logo: '',
    order: 10,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!client.name) {
      setMessage('שם הלקוח הוא שדה חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage('נוצר בהצלחה! ✓');
        setTimeout(() => {
          router.push(`/clients/${data._id || data.id}`);
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
    setClient(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/clients" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">הוספת לקוח חדש</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('שגיאה') ? 'text-red-500' : 'text-green-500'}`}>{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'צור לקוח'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הלקוח *</label>
          <input
            type="text"
            value={client.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">נתיב לוגו</label>
          <input
            type="text"
            value={client.logo}
            onChange={(e) => updateField('logo', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
            placeholder="/images/clients/logo.png"
          />
          <p className="text-xs text-gray-500 mt-1">העלה קודם את הלוגו לתיקיית images/clients</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
          <input
            type="number"
            value={client.order}
            onChange={(e) => updateField('order', parseInt(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
