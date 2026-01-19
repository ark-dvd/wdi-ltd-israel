'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewJobPage() {
  const router = useRouter();
  const [job, setJob] = useState({ title: '', location: 'נתניה', type: 'משרה מלאה', description: '', requirements: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!job.title) { setMessage('שם המשרה הוא שדה חובה'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(job) });
      if (res.ok) { const data = await res.json(); setMessage('נוצר! ✓'); setTimeout(() => router.push(`/jobs/${data._id || data.id}`), 1000); }
      else { const error = await res.json(); setMessage(`שגיאה: ${error.error}`); }
    } catch { setMessage('שגיאה'); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs" className="text-gray-400 hover:text-gray-600">→ חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">משרה חדשה</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">{saving ? 'שומר...' : 'שמור'}</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">שם המשרה *</label><input type="text" value={job.title} onChange={(e) => setJob(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label><input type="text" value={job.location} onChange={(e) => setJob(p => ({ ...p, location: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סוג משרה</label>
            <select value={job.type} onChange={(e) => setJob(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="משרה מלאה">משרה מלאה</option>
              <option value="משרה חלקית">משרה חלקית</option>
              <option value="פרילנס">פרילנס</option>
            </select>
          </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label><textarea value={job.description} onChange={(e) => setJob(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">דרישות</label><textarea value={job.requirements} onChange={(e) => setJob(p => ({ ...p, requirements: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={job.isActive} onChange={(e) => setJob(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4" /><span>משרה פעילה</span></label></div>
      </div>
    </div>
  );
}
