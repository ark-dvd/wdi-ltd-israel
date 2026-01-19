'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientEditPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchClient(); }, [params.id]);

  async function fetchClient() {
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      if (res.ok) setClient(await res.json());
      else setMessage('לקוח לא נמצא');
    } catch (error) {
      setMessage('שגיאה בטעינה');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!client.name) { setMessage('שם הלקוח הוא שדה חובה'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (res.ok) { setMessage('נשמר! ✓'); setTimeout(() => setMessage(''), 3000); }
      else setMessage('שגיאה בשמירה');
    } catch { setMessage('שגיאה'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('למחוק?')) return;
    try {
      const res = await fetch(`/api/clients/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/clients');
    } catch { setMessage('שגיאה במחיקה'); }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'images/clients');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.image) {
        setClient(prev => ({ ...prev, logo: data.image }));
        setMessage('לוגו הועלה! לחץ שמור ✓');
      }
    } catch { setMessage('שגיאה בהעלאה'); }
    finally { setUploading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div></div>;
  if (!client) return <div className="text-center py-12"><p className="text-gray-500 mb-4">לקוח לא נמצא</p><Link href="/clients" className="text-wdi-blue">חזרה</Link></div>;

  const imageUrl = client.logo && (client.logo.startsWith('http') ? client.logo : `https://wdi.co.il${client.logo}`);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/clients" className="text-gray-400 hover:text-gray-600">→ חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">עריכת {client.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>{message}</span>}
          <button onClick={handleDelete} className="text-red-500 text-sm">מחק</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">{saving ? 'שומר...' : 'שמור'}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הלקוח *</label>
          <input type="text" value={client.name || ''} onChange={(e) => setClient(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
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
                {uploading ? 'מעלה...' : 'החלף לוגו'}
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
          <input type="number" value={client.order || 100} onChange={(e) => setClient(prev => ({ ...prev, order: parseInt(e.target.value) || 100 }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
