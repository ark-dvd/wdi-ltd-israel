'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestimonialEditPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchItem(); }, [params.id]);

  async function fetchItem() {
    try {
      const res = await fetch(`/api/testimonials/${params.id}`);
      if (res.ok) setItem(await res.json());
      else setMessage('לא נמצא');
    } catch { setMessage('שגיאה'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!item.name || !item.text) { setMessage('שם וציטוט הם שדות חובה'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/testimonials/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (res.ok) { setMessage('נשמר! ✓'); setTimeout(() => setMessage(''), 3000); }
    } catch { setMessage('שגיאה'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('למחוק?')) return;
    try {
      const res = await fetch(`/api/testimonials/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/testimonials');
    } catch { setMessage('שגיאה'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div></div>;
  if (!item) return <div className="text-center py-12"><Link href="/testimonials" className="text-wdi-blue">חזרה</Link></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/testimonials" className="text-gray-400 hover:text-gray-600">→ חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">עריכת המלצה</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>{message}</span>}
          <button onClick={handleDelete} className="text-red-500 text-sm">מחק</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">{saving ? 'שומר...' : 'שמור'}</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">שם *</label><input type="text" value={item.name || ''} onChange={(e) => setItem(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label><input type="text" value={item.title || ''} onChange={(e) => setItem(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">חברה</label><input type="text" value={item.company || ''} onChange={(e) => setItem(p => ({ ...p, company: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">ציטוט *</label><textarea value={item.text || ''} onChange={(e) => setItem(p => ({ ...p, text: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
      </div>
    </div>
  );
}
