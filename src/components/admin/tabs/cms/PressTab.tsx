'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';

interface PressItem {
  _id: string; title: string; source?: string; publishDate?: string;
  excerpt?: string; externalUrl?: string; isActive: boolean; order: number; updatedAt: string;
}
type Filter = 'all' | 'active' | 'hidden';

export function PressTab() {
  const [items, setItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PressItem>>({ title: '', source: '', publishDate: '', excerpt: '', externalUrl: '', isActive: true, order: 0 });
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try { const r = await apiGet<PressItem[]>('/api/admin/press'); setItems(r.data); }
    catch (e) { setFetchErr(e as ErrorEnvelope); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((i) => filter === 'active' ? i.isActive : filter === 'hidden' ? !i.isActive : true);
  const openCreate = () => { setEditId(null); setForm({ title: '', source: '', publishDate: '', excerpt: '', externalUrl: '', isActive: true, order: 0 }); reset(); setPanelOpen(true); };
  const openEdit = (i: PressItem) => { setEditId(i._id); setForm({ ...i }); reset(); setPanelOpen(true); };

  const handleSave = async () => {
    const r = await execute(async () => {
      if (editId) return apiPut<PressItem>(`/api/admin/press/${editId}`, { ...form, updatedAt: form.updatedAt });
      return apiPost<PressItem>('/api/admin/press', form);
    });
    if (r) { const d = (r as { data: PressItem }).data; setItems((p) => editId ? p.map((i) => i._id === editId ? d : i) : [...p, d]); setPanelOpen(false); addToast(editId ? 'כתבה עודכנה' : 'כתבה נוצרה', 'success'); }
  };
  const handleDelete = async (id: string) => {
    const item = items.find((i) => i._id === id); if (!item) return;
    const r = await execute(() => apiDelete(`/api/admin/press/${id}`, { updatedAt: item.updatedAt }));
    if (r) { setItems((p) => p.filter((i) => i._id !== id)); setPanelOpen(false); setDelConfirm(null); addToast('כתבה נמחקה', 'success'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען כתבות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchItems} /></div>;

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">כתבו עלינו</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition" type="button"><Plus size={16} />הוסף כתבה</button>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        {([['all', 'הכל'], ['active', 'פעיל'], ['hidden', 'מוסתר']] as [Filter, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === k ? 'bg-wdi-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} type="button">{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? <p className="text-gray-500 text-center py-12">אין כתבות</p> : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <button key={p._id} onClick={() => openEdit(p)} className="w-full bg-white rounded-lg border border-gray-200 p-4 text-right hover:border-wdi-primary/30 hover:shadow-wdi-sm transition flex items-center justify-between" type="button">
              <div><p className="font-semibold text-gray-900">{p.title}</p><p className="text-sm text-gray-500">{p.source} {p.publishDate && `• ${p.publishDate}`}</p></div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'פעיל' : 'מוסתר'}</span>
            </button>
          ))}
        </div>
      )}
      <SlidePanel open={panelOpen} title={editId ? 'עריכת כתבה' : 'כתבה חדשה'} onClose={() => setPanelOpen(false)} footer={
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isLocked} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">{isLocked ? 'שומר...' : 'שמור'}</button>
          {editId && <button onClick={() => setDelConfirm(editId)} disabled={isLocked} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50" type="button">מחק</button>}
        </div>
      }>
        <ErrorRenderer error={mutErr} onReload={fetchItems} onDismiss={reset} />
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label><input type="text" value={form.title ?? ''} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /><FieldError error={mutErr?.fieldErrors?.title} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מקור</label><input type="text" value={form.source ?? ''} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך פרסום</label><input type="date" value={form.publishDate ?? ''} onChange={(e) => setForm((p) => ({ ...p, publishDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תקציר</label><textarea value={form.excerpt ?? ''} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">קישור</label><input type="url" value={form.externalUrl ?? ''} onChange={(e) => setForm((p) => ({ ...p, externalUrl: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-700">פעיל</label>
            <button onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive ? 'bg-wdi-primary' : 'bg-gray-300'}`} type="button" style={{ direction: 'ltr' }}><span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סדר</label><input type="number" value={form.order ?? 0} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        </div>
      </SlidePanel>
      <ConfirmDialog open={!!delConfirm} title="מחיקת כתבה" message="פעולה זו תמחק את הרשומה לצמיתות. לא ניתן לבטל." confirmLabel="מחק" variant="danger" onConfirm={() => delConfirm && handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} />
    </div>
  );
}
