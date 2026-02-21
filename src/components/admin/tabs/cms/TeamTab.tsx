'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { PageViewToggle } from '../../PageViewToggle';
import { TeamPageTab } from './TeamPageTab';
import { apiList, apiGet, apiPost, apiPut, apiDelete, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';
import ImageUpload from '../../ImageUpload';

interface SanityImage { _type: 'image'; asset: { _type: 'reference'; _ref: string } }
interface TeamMember {
  _id: string; name: string; role: string; category: string;
  image?: SanityImage | null; bio?: string; qualifications?: string; linkedin?: string;
  email?: string; phone?: string; isActive: boolean; order: number;
  updatedAt: string;
}

const CATS: Record<string, string> = {
  founders: 'מייסדים', management: 'הנהלה ואדמיניסטרציה',
  'department-heads': 'ראשי תחומים', 'project-managers': 'מנהלי פרויקטים',
};
const CAT_ORDER = ['founders', 'management', 'department-heads', 'project-managers'];
type Filter = 'all' | 'active' | 'hidden';

const empty = (): Partial<TeamMember> => ({
  name: '', role: '', category: 'management', bio: '', qualifications: '',
  linkedin: '', email: '', phone: '', isActive: true, order: 0,
});

export function TeamTab() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<TeamMember>>(empty());
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try { const r = await apiList<TeamMember>('/api/admin/team'); setItems(r.data); }
    catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((i) =>
    filter === 'active' ? i.isActive : filter === 'hidden' ? !i.isActive : true
  );
  const grouped = CAT_ORDER.map((c) => ({
    key: c, label: CATS[c]!, members: filtered.filter((m) => m.category === c),
  })).filter((g) => g.members.length > 0);

  const openCreate = () => { setEditId(null); setForm(empty()); reset(); setPanelOpen(true); };
  const openEdit = (i: TeamMember) => { setEditId(i._id); setForm({ ...i }); reset(); setPanelOpen(true); };
  const set = <K extends keyof TeamMember>(k: K, v: TeamMember[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const r = await execute(async () => {
      if (editId) return apiPut<TeamMember>(`/api/admin/team/${editId}`, { ...form, updatedAt: form.updatedAt });
      return apiPost<TeamMember>('/api/admin/team', form);
    });
    if (r) {
      const d = (r as { data: TeamMember }).data;
      setItems((p) => editId ? p.map((i) => i._id === editId ? d : i) : [...p, d]);
      setPanelOpen(false);
      addToast(editId ? 'חבר צוות עודכן בהצלחה' : 'חבר צוות נוצר בהצלחה', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    const r = await execute(() => apiDelete(`/api/admin/team/${id}`, { updatedAt: item.updatedAt }));
    if (r) {
      setItems((p) => p.filter((i) => i._id !== id));
      setPanelOpen(false); setDelConfirm(null);
      addToast('חבר צוות נמחק', 'success');
    }
  };

  if (showPageSettings) return (
    <>
      <div className="px-6 pt-6" dir="rtl">
        <PageViewToggle showSettings onToggle={setShowPageSettings} />
      </div>
      <TeamPageTab />
    </>
  );

  if (loading) return <div className="p-8 text-center text-gray-500">טוען נתוני צוות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchItems} /></div>;

  return (
    <div className="p-6" dir="rtl">
      <PageViewToggle showSettings={false} onToggle={setShowPageSettings} />
      <div className="flex items-center justify-between mb-6 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">צוות</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-gray-600" type="button" title="רענן"><RefreshCw size={18} /></button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition" type="button">
            <Plus size={16} />הוסף חבר צוות
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {([['all', 'הכל'], ['active', 'פעיל'], ['hidden', 'מוסתר']] as [Filter, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === k ? 'bg-wdi-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} type="button">{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? <p className="text-gray-500 text-center py-12">אין חברי צוות</p> : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <div key={g.key}>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">{g.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {g.members.map((m) => (
                  <button key={m._id} onClick={() => openEdit(m)} className="bg-white rounded-lg border border-gray-200 p-4 text-right hover:border-wdi-primary/30 hover:shadow-wdi-sm transition" type="button">
                    <div className="flex items-start justify-between">
                      <div><p className="font-semibold text-gray-900">{m.name}</p><p className="text-sm text-gray-500">{m.role}</p></div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.isActive ? 'פעיל' : 'מוסתר'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <SlidePanel open={panelOpen} title={editId ? 'עריכת חבר צוות' : 'חבר צוות חדש'} onClose={() => setPanelOpen(false)} footer={
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isLocked} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">{isLocked ? 'שומר...' : 'שמור'}</button>
          {editId && <button onClick={() => setDelConfirm(editId)} disabled={isLocked} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50" type="button">מחק</button>}
        </div>
      }>
        <ErrorRenderer error={mutErr} onReload={fetchItems} onDismiss={reset} />
        <div className="space-y-4">
          <ImageUpload label="תמונה" value={form.image ?? null} onChange={(v) => { setForm((p) => ({ ...p, image: v })); }} />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">שם *</label>
            <input type="text" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" />
            <FieldError error={mutErr?.fieldErrors?.name} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תפקיד *</label>
            <input type="text" value={form.role ?? ''} onChange={(e) => set('role', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" />
            <FieldError error={mutErr?.fieldErrors?.role} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה *</label>
            <select value={form.category ?? 'management'} onChange={(e) => set('category', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary">
              {CAT_ORDER.map((c) => <option key={c} value={c}>{CATS[c]}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">רקע מקצועי</label>
            <textarea value={form.bio ?? ''} onChange={(e) => set('bio', e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כישורים</label>
            <textarea value={form.qualifications ?? ''} onChange={(e) => set('qualifications', e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input type="url" value={form.linkedin ?? ''} onChange={(e) => set('linkedin', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
              <input type="tel" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">פעיל</label>
            <button onClick={() => set('isActive', !form.isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive ? 'bg-wdi-primary' : 'bg-gray-300'}`} type="button" style={{ direction: 'ltr' }}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סדר</label>
            <input type="number" value={form.order ?? 0} onChange={(e) => set('order', parseInt(e.target.value) || 0)} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        </div>
      </SlidePanel>

      <ConfirmDialog open={!!delConfirm} title="מחיקת חבר צוות" message="פעולה זו תמחק את הרשומה לצמיתות. לא ניתן לבטל."
        confirmLabel="מחק" variant="danger" onConfirm={() => delConfirm && handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} />
    </div>
  );
}
