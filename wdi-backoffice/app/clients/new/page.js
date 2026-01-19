'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [client, setClient] = useState({ name: '', logo: '', order: 100 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        setTimeout(() => router.push(`/clients/${data._id || data.id}`), 1000);
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

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('יש להעלות קובץ תמונה בלבד');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'images/clients');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.image) {
        setClient(prev => ({ ...prev, logo: data.image }));
        setMessage('לוגו הועלה! ✓');
      } else {
        setMessage(`שגיאה: ${data.error}`);
      }
    } catch (error) {
      setMessage('שגיאה בהעלאה');
    } finally {
      setUploading(false);
    }
  }

  const imageUrl = client.logo && (client.logo.startsWith('http') ? client.logo : `https://raw.githubusercontent.com/ark-dvd/wdi-ltd-israel/main${client.logo}`);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/clients" className="text-gray-400 hover:text-gray-600">→ חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">לקוח חדש</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הלקוח *</label>
          <input type="text" value={client.name} onChange={(e) => setClient(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">לוגו</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-contain p-2" /> : '🏢'}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className={`cursor-pointer px-4 py-2 rounded-lg text-sm inline-block ${uploading ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {uploading ? 'מעלה...' : 'העלה לוגו'}
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
          <input type="number" value={client.order} onChange={(e) => setClient(prev => ({ ...prev, order: parseInt(e.target.value) || 100 }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
