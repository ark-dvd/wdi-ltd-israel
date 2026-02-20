'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { apiList, apiPost, apiPut, apiDelete, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';
import ImageUpload from '../../ImageUpload';
import RichTextEditor from '../../RichTextEditor';

interface SanityImage { _type: 'image'; asset: { _type: 'reference'; _ref: string } }
interface Service {
  _id: string; name: string; slug: { current: string } | string; description: string;
  tagline?: string; icon?: string; image?: SanityImage | null; highlights?: { title: string; description?: string }[];
  detailContent?: unknown[]; isActive: boolean; order: number; updatedAt: string;
}
type Filter = 'all' | 'active' | 'hidden';

const empty = (): Partial<Service> & { slug: string } => ({
  name: '', slug: '', description: '', tagline: '', icon: '', highlights: [], isActive: true, order: 0,
});

export function ServicesTab() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try { const r = await apiList<Service>('/api/admin/services'); setItems(r.data); }
    catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((i) => filter === 'active' ? i.isActive : filter === 'hidden' ? !i.isActive : true);
  const slugStr = (s: Service) => typeof s.slug === 'object' ? s.slug.current : s.slug;
  const openCreate = () => { setEditId(null); setForm(empty()); reset(); setPanelOpen(true); };
  const openEdit = (i: Service) => { setEditId(i._id); setForm({ ...i, slug: slugStr(i) } as ReturnType<typeof empty>); reset(); setPanelOpen(true); };

  const handleSave = async () => {
    const r = await execute(async () => {
      if (editId) return apiPut<Service>(`/api/admin/services/${editId}`, { ...form, updatedAt: (form as { updatedAt?: string }).updatedAt });
      return apiPost<Service>('/api/admin/services', form);
    });
    if (r) {
      const d = (r as { data: Service }).data;
      setItems((p) => editId ? p.map((i) => i._id === editId ? d : i) : [...p, d]);
      setPanelOpen(false);
      addToast(editId ? 'שירות עודכן בהצלחה' : 'שירות נוצר בהצלחה', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    const r = await execute(() => apiDelete(`/api/admin/services/${id}`, { updatedAt: item.updatedAt }));
    if (r) { setItems((p) => p.filter((i) => i._id !== id)); setPanelOpen(false); setDelConfirm(null); addToast('שירות נמחק', 'success'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען שירותים...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchItems} /></div>;

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">שירותים</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition" type="button"><Plus size={16} />הוסף שירות</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {([['all', 'הכל'], ['active', 'פעיל'], ['hidden', 'מוסתר']] as [Filter, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === k ? 'bg-wdi-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} type="button">{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? <p className="text-gray-500 text-center py-12">אין שירותים</p> : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <button key={s._id} onClick={() => openEdit(s)} className="w-full bg-white rounded-lg border border-gray-200 p-4 text-right hover:border-wdi-primary/30 hover:shadow-wdi-sm transition flex items-center justify-between" type="button">
              <div><p className="font-semibold text-gray-900">{s.name}</p><p className="text-sm text-gray-500">{s.tagline}</p></div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">#{s.order}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'פעיל' : 'מוסתר'}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <SlidePanel open={panelOpen} title={editId ? 'עריכת שירות' : 'שירות חדש'} onClose={() => setPanelOpen(false)} wide footer={
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isLocked} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">{isLocked ? 'שומר...' : 'שמור'}</button>
          {editId && <button onClick={() => setDelConfirm(editId)} disabled={isLocked} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50" type="button">מחק</button>}
        </div>
      }>
        <ErrorRenderer error={mutErr} onReload={fetchItems} onDismiss={reset} />
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">שם *</label><input type="text" value={form.name ?? ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /><FieldError error={mutErr?.fieldErrors?.name} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label><input type="text" value={form.slug ?? ''} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /><FieldError error={mutErr?.fieldErrors?.slug} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת</label><input type="text" value={form.tagline ?? ''} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תיאור *</label><textarea value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /><FieldError error={mutErr?.fieldErrors?.description} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">אייקון</label><input type="text" value={form.icon ?? ''} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <ImageUpload label="תמונה" value={(form as Record<string, unknown>).image as SanityImage | null ?? null} onChange={(v) => setForm((p) => ({ ...p, image: v } as typeof p))} />
          <RichTextEditor label="תוכן מפורט" value={(form as Record<string, unknown>).detailContent as unknown[] ?? null} onChange={(v) => setForm((p) => ({ ...p, detailContent: v } as typeof p))} />
          <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-700">פעיל</label>
            <button onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive ? 'bg-wdi-primary' : 'bg-gray-300'}`} type="button" style={{ direction: 'ltr' }}><span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סדר *</label><input type="number" value={form.order ?? 0} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        </div>
      </SlidePanel>

      <ConfirmDialog open={!!delConfirm} title="מחיקת שירות" message="פעולה זו תמחק את הרשומה לצמיתות. לא ניתן לבטל." confirmLabel="מחק" variant="danger" onConfirm={() => delConfirm && handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} />
    </div>
  );
}
