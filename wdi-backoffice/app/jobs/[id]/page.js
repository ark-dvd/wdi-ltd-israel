'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JobEditPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchJob(); }, [params.id]);

  async function fetchJob() {
    try {
      const res = await fetch(`/api/jobs/${params.id}`);
      if (res.ok) setJob(await res.json());
    } catch { }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!job.title) { setMessage('שם המשרה הוא שדה חובה'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(job) });
      if (res.ok) { setMessage('נשמר! ✓'); setTimeout(() => setMessage(''), 3000); }
    } catch { setMessage('שגיאה'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('למחוק?')) return;
    try {
      const res = await fetch(`/api/jobs/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/jobs');
    } catch { }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div></div>;
  if (!job) return <div className="text-center py-12"><Link href="/jobs" className="text-wdi-blue">חזרה</Link></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs" className="text-gray-400 hover:text-gray-600">→ חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">עריכת {job.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>{message}</span>}
          <button onClick={handleDelete} className="text-red-500 text-sm">מחק</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">{saving ? 'שומר...' : 'שמור'}</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">שם המשרה *</label><input type="text" value={job.title || ''} onChange={(e) => setJob(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label><input type="text" value={job.location || ''} onChange={(e) => setJob(p => ({ ...p, location: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סוג משרה</label>
            <select value={job.type || 'משרה מלאה'} onChange={(e) => setJob(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="משרה מלאה">משרה מלאה</option>
              <option value="משרה חלקית">משרה חלקית</option>
              <option value="פרילנס">פרילנס</option>
            </select>
          </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label><textarea value={job.description || ''} onChange={(e) => setJob(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">דרישות</label><textarea value={job.requirements || ''} onChange={(e) => setJob(p => ({ ...p, requirements: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={job.isActive !== false} onChange={(e) => setJob(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4" /><span>משרה פעילה</span></label></div>
      </div>
    </div>
  );
}
