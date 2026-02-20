'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { apiList, apiPost, apiPut, apiDelete, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';
import RichTextEditor from '../../RichTextEditor';

interface Job {
  _id: string; title: string; description?: unknown[]; requirements?: unknown[];
  location?: string; type?: string; department?: string; contactEmail?: string;
  jobNumber?: string; region?: string; workplace?: string; isNew?: boolean;
  isActive: boolean; order: number; updatedAt: string;
}
type Filter = 'all' | 'active' | 'hidden';

export function JobsTab() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Job>>({ title: '', location: '', type: '', department: '', contactEmail: '', isActive: true, order: 0 });
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try { const r = await apiList<Job>('/api/admin/jobs'); setItems(r.data); }
    catch (e) { setFetchErr(e as ErrorEnvelope); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((i) => filter === 'active' ? i.isActive : filter === 'hidden' ? !i.isActive : true);
  const openCreate = () => { setEditId(null); setForm({ title: '', location: '', type: '', department: '', contactEmail: '', isActive: true, order: 0 }); reset(); setPanelOpen(true); };
  const openEdit = (i: Job) => { setEditId(i._id); setForm({ ...i }); reset(); setPanelOpen(true); };

  const handleSave = async () => {
    const r = await execute(async () => {
      if (editId) return apiPut<Job>(`/api/admin/jobs/${editId}`, { ...form, updatedAt: form.updatedAt });
      return apiPost<Job>('/api/admin/jobs', form);
    });
    if (r) { const d = (r as { data: Job }).data; setItems((p) => editId ? p.map((i) => i._id === editId ? d : i) : [...p, d]); setPanelOpen(false); addToast(editId ? 'משרה עודכנה' : 'משרה נוצרה', 'success'); }
  };
  const handleDelete = async (id: string) => {
    const item = items.find((i) => i._id === id); if (!item) return;
    const r = await execute(() => apiDelete(`/api/admin/jobs/${id}`, { updatedAt: item.updatedAt }));
    if (r) { setItems((p) => p.filter((i) => i._id !== id)); setPanelOpen(false); setDelConfirm(null); addToast('משרה נמחקה', 'success'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען משרות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchItems} /></div>;

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">משרות</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition" type="button"><Plus size={16} />הוסף משרה</button>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        {([['all', 'הכל'], ['active', 'פעיל'], ['hidden', 'מוסתר']] as [Filter, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === k ? 'bg-wdi-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} type="button">{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? <p className="text-gray-500 text-center py-12">אין משרות</p> : (
        <div className="space-y-2">
          {filtered.map((j) => (
            <button key={j._id} onClick={() => openEdit(j)} className="w-full bg-white rounded-lg border border-gray-200 p-4 text-right hover:border-wdi-primary/30 hover:shadow-wdi-sm transition flex items-center justify-between" type="button">
              <div><p className="font-semibold text-gray-900">{j.title}</p><p className="text-sm text-gray-500">{[j.department, j.location, j.type].filter(Boolean).join(' • ')}</p></div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${j.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{j.isActive ? 'פעילה' : 'מוסתרת'}</span>
            </button>
          ))}
        </div>
      )}
      <SlidePanel open={panelOpen} title={editId ? 'עריכת משרה' : 'משרה חדשה'} onClose={() => setPanelOpen(false)} footer={
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isLocked} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">{isLocked ? 'שומר...' : 'שמור'}</button>
          {editId && <button onClick={() => setDelConfirm(editId)} disabled={isLocked} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50" type="button">מחק</button>}
        </div>
      }>
        <ErrorRenderer error={mutErr} onReload={fetchItems} onDismiss={reset} />
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת משרה *</label><input type="text" value={form.title ?? ''} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /><FieldError error={mutErr?.fieldErrors?.title} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label><input type="text" value={form.location ?? ''} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סוג משרה</label>
            <select value={form.type ?? ''} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary">
              <option value="">בחר סוג</option><option value="משרה מלאה">משרה מלאה</option><option value="משרה חלקית">משרה חלקית</option><option value="פרילנס">פרילנס</option>
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מחלקה</label><input type="text" value={form.department ?? ''} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <RichTextEditor label="תיאור משרה" value={form.description as unknown[] ?? null} onChange={(v) => setForm((p) => ({ ...p, description: v }))} />
          <RichTextEditor label="דרישות" value={form.requirements as unknown[] ?? null} onChange={(v) => setForm((p) => ({ ...p, requirements: v }))} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">מספר משרה</label><input type="text" value={form.jobNumber ?? ''} onChange={(e) => setForm((p) => ({ ...p, jobNumber: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">אזור</label><input type="text" value={form.region ?? ''} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מקום עבודה</label><input type="text" value={form.workplace ?? ''} onChange={(e) => setForm((p) => ({ ...p, workplace: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">אימייל ליצירת קשר</label><input type="email" value={form.contactEmail ?? ''} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-700">חדשה</label>
            <button onClick={() => setForm((p) => ({ ...p, isNew: !p.isNew }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isNew ? 'bg-wdi-secondary' : 'bg-gray-300'}`} type="button" style={{ direction: 'ltr' }}><span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.isNew ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-700">פעילה</label>
            <button onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive ? 'bg-wdi-primary' : 'bg-gray-300'}`} type="button" style={{ direction: 'ltr' }}><span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סדר</label><input type="number" value={form.order ?? 0} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        </div>
      </SlidePanel>
      <ConfirmDialog open={!!delConfirm} title="מחיקת משרה" message="פעולה זו תמחק את הרשומה לצמיתות. לא ניתן לבטל." confirmLabel="מחק" variant="danger" onConfirm={() => delConfirm && handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} />
    </div>
  );
}
