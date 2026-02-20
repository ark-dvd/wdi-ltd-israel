'use client';

/**
 * Projects tab with embedded Testimonial CRUD — DOC-030 §11.2, DOC-050 §19
 */
import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Star, Trash2 } from 'lucide-react';
import { apiList, apiGet, apiPost, apiPut, apiDelete, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';
import ImageUpload from '../../ImageUpload';

interface SanityImage { _type: 'image'; asset: { _type: 'reference'; _ref: string } }
interface Project {
  _id: string; title: string; slug: { current: string } | string; client: string; sector: string;
  description?: string; scope?: string[]; location?: string; featuredImage?: SanityImage | null;
  isFeatured?: boolean; startDate?: string; completedAt?: string; isActive: boolean; order: number; updatedAt: string;
}
interface Testimonial {
  _id: string; clientName: string; quote: string; companyName?: string; role?: string;
  isFeatured?: boolean; isActive: boolean; order: number; updatedAt: string;
}

const SECTORS: Record<string, string> = {
  security: 'בטחוני', commercial: 'מסחרי', industrial: 'תעשייה',
  infrastructure: 'תשתיות', residential: 'מגורים', public: 'ציבורי',
};
type Filter = 'all' | 'active' | 'hidden';

const emptyProject = (): Partial<Project> & { slug: string } => ({
  title: '', slug: '', client: '', sector: 'commercial', scope: [], location: '',
  isFeatured: false, startDate: '', completedAt: '', isActive: true, order: 0,
});

export function ProjectsTab() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProject());
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testForm, setTestForm] = useState<Partial<Testimonial>>({});
  const [testEditing, setTestEditing] = useState<string | null>(null);
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [testDelConfirm, setTestDelConfirm] = useState<string | null>(null);

  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const testLifecycle = useRequestLifecycle();
  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try { const r = await apiList<Project>('/api/admin/projects'); setItems(r.data); }
    catch (e) { setFetchErr(e as ErrorEnvelope); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const slugStr = (s: Project) => typeof s.slug === 'object' ? s.slug.current : s.slug;
  const filtered = items.filter((i) => {
    if (filter === 'active' && !i.isActive) return false;
    if (filter === 'hidden' && i.isActive) return false;
    if (sectorFilter !== 'all' && i.sector !== sectorFilter) return false;
    return true;
  });

  const fetchTestimonials = useCallback(async (projectId: string) => {
    try {
      const r = await apiGet<Testimonial[]>(`/api/admin/projects/${projectId}/testimonials`);
      setTestimonials(r.data);
    } catch { setTestimonials([]); }
  }, []);

  const openCreate = () => { setEditId(null); setForm(emptyProject()); setTestimonials([]); reset(); setPanelOpen(true); };
  const openEdit = (i: Project) => {
    setEditId(i._id); setForm({ ...i, slug: slugStr(i) } as ReturnType<typeof emptyProject>); reset(); setPanelOpen(true);
    fetchTestimonials(i._id);
  };

  const handleSave = async () => {
    const r = await execute(async () => {
      if (editId) return apiPut<Project>(`/api/admin/projects/${editId}`, { ...form, updatedAt: (form as { updatedAt?: string }).updatedAt });
      return apiPost<Project>('/api/admin/projects', form);
    });
    if (r) { const d = (r as { data: Project }).data; setItems((p) => editId ? p.map((i) => i._id === editId ? d : i) : [...p, d]); setPanelOpen(false); addToast(editId ? 'פרויקט עודכן' : 'פרויקט נוצר', 'success'); }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i._id === id); if (!item) return;
    const r = await execute(() => apiDelete(`/api/admin/projects/${id}`, { updatedAt: item.updatedAt }));
    if (r) { setItems((p) => p.filter((i) => i._id !== id)); setPanelOpen(false); setDelConfirm(null); addToast('פרויקט נמחק', 'success'); }
  };

  // Testimonial CRUD — §19
  const handleTestSave = async () => {
    if (!editId) return;
    const r = await testLifecycle.execute(async () => {
      if (testEditing) return apiPut<Testimonial>(`/api/admin/projects/${editId}/testimonials/${testEditing}`, { ...testForm, updatedAt: testForm.updatedAt });
      return apiPost<Testimonial>(`/api/admin/projects/${editId}/testimonials`, testForm);
    });
    if (r) {
      const d = (r as { data: Testimonial }).data;
      setTestimonials((p) => testEditing ? p.map((t) => t._id === testEditing ? d : t) : [...p, d]);
      setTestFormOpen(false); addToast(testEditing ? 'המלצה עודכנה' : 'המלצה נוצרה', 'success');
    }
  };

  const handleTestDelete = async (tid: string) => {
    if (!editId) return;
    const t = testimonials.find((x) => x._id === tid); if (!t) return;
    const r = await testLifecycle.execute(() => apiDelete(`/api/admin/projects/${editId}/testimonials/${tid}`, { updatedAt: t.updatedAt }));
    if (r) { setTestimonials((p) => p.filter((x) => x._id !== tid)); setTestDelConfirm(null); addToast('המלצה נמחקה', 'success'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען פרויקטים...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchItems} /></div>;

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">פרויקטים</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition" type="button"><Plus size={16} />הוסף פרויקט</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([['all', 'הכל'], ['active', 'פעיל'], ['hidden', 'מוסתר']] as [Filter, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === k ? 'bg-wdi-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} type="button">{l}</button>
        ))}
        <span className="border-l border-gray-300 mx-2" />
        <button onClick={() => setSectorFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sectorFilter === 'all' ? 'bg-wdi-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} type="button">כל הענפים</button>
        {Object.entries(SECTORS).map(([k, l]) => (
          <button key={k} onClick={() => setSectorFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sectorFilter === k ? 'bg-wdi-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} type="button">{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? <p className="text-gray-500 text-center py-12">אין פרויקטים</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <button key={p._id} onClick={() => openEdit(p)} className="bg-white rounded-lg border border-gray-200 p-4 text-right hover:border-wdi-primary/30 hover:shadow-wdi-sm transition" type="button">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-gray-900">{p.title}</p>
                {p.isFeatured && <Star size={14} className="text-wdi-secondary fill-wdi-secondary" />}
              </div>
              <p className="text-sm text-gray-500 mb-2">{p.client}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{SECTORS[p.sector] ?? p.sector}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'פעיל' : 'מוסתר'}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Project SlidePanel */}
      <SlidePanel open={panelOpen} title={editId ? 'עריכת פרויקט' : 'פרויקט חדש'} onClose={() => setPanelOpen(false)} wide footer={
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isLocked} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">{isLocked ? 'שומר...' : 'שמור'}</button>
          {editId && <button onClick={() => setDelConfirm(editId)} disabled={isLocked} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50" type="button">מחק</button>}
        </div>
      }>
        <ErrorRenderer error={mutErr} onReload={fetchItems} onDismiss={reset} />
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">שם פרויקט *</label><input type="text" value={form.title ?? ''} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /><FieldError error={mutErr?.fieldErrors?.title} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label><input type="text" value={form.slug ?? ''} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /><FieldError error={mutErr?.fieldErrors?.slug} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מזמין *</label><input type="text" value={form.client ?? ''} onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /><FieldError error={mutErr?.fieldErrors?.client} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">ענף *</label>
            <select value={form.sector ?? 'commercial'} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary">
              {Object.entries(SECTORS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label><textarea value={(form as Record<string, unknown>).description as string ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value } as typeof p))} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label><input type="text" value={form.location ?? ''} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <ImageUpload label="תמונה ראשית" value={(form as Record<string, unknown>).featuredImage as SanityImage | null ?? null} onChange={(v) => setForm((p) => ({ ...p, featuredImage: v } as typeof p))} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך התחלה</label><input type="date" value={form.startDate ?? ''} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך סיום</label><input type="date" value={form.completedAt ?? ''} onChange={(e) => setForm((p) => ({ ...p, completedAt: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          </div>
          <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-700">מוצג בדף הבית</label>
            <button onClick={() => setForm((p) => ({ ...p, isFeatured: !p.isFeatured }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isFeatured ? 'bg-wdi-secondary' : 'bg-gray-300'}`} type="button" style={{ direction: 'ltr' }}><span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-700">פעיל</label>
            <button onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive ? 'bg-wdi-primary' : 'bg-gray-300'}`} type="button" style={{ direction: 'ltr' }}><span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סדר</label><input type="number" value={form.order ?? 0} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>

          {/* Linked Testimonials — §19 */}
          {editId && (
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-800">המלצות <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 mr-1">{testimonials.length}</span></h3>
                <button onClick={() => { setTestEditing(null); setTestForm({ clientName: '', quote: '', companyName: '', role: '', isFeatured: false, isActive: true, order: 0 }); testLifecycle.reset(); setTestFormOpen(true); }}
                  className="text-sm text-wdi-primary hover:underline" type="button">הוסף המלצה</button>
              </div>
              {testimonials.length === 0 ? <p className="text-sm text-gray-400">אין המלצות לפרויקט זה</p> : (
                <div className="space-y-2">
                  {testimonials.map((t) => (
                    <div key={t._id} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => { setTestEditing(t._id); setTestForm({ ...t }); testLifecycle.reset(); setTestFormOpen(true); }}>
                        <p className="font-medium text-gray-800 text-sm">{t.clientName}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{t.quote}</p>
                        <div className="flex gap-1 mt-1">
                          {t.isFeatured && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">מוצג בדף הבית</span>}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{t.isActive ? 'פעיל' : 'לא פעיל'}</span>
                        </div>
                      </div>
                      <button onClick={() => setTestDelConfirm(t._id)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Testimonial form */}
              {testFormOpen && (
                <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{testEditing ? 'עריכת המלצה' : 'המלצה חדשה'}</h4>
                  <ErrorRenderer error={testLifecycle.error} onDismiss={testLifecycle.reset} />
                  <div className="space-y-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">שם הממליץ *</label><input type="text" value={testForm.clientName ?? ''} onChange={(e) => setTestForm((p) => ({ ...p, clientName: e.target.value }))} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">תוכן ההמלצה *</label><textarea value={testForm.quote ?? ''} onChange={(e) => setTestForm((p) => ({ ...p, quote: e.target.value }))} rows={3} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-medium text-gray-600 mb-1">חברה</label><input type="text" value={testForm.companyName ?? ''} onChange={(e) => setTestForm((p) => ({ ...p, companyName: e.target.value }))} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
                      <div><label className="block text-xs font-medium text-gray-600 mb-1">תפקיד</label><input type="text" value={testForm.role ?? ''} onChange={(e) => setTestForm((p) => ({ ...p, role: e.target.value }))} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={testForm.isFeatured ?? false} onChange={(e) => setTestForm((p) => ({ ...p, isFeatured: e.target.checked }))} />מוצג בדף הבית</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={testForm.isActive ?? true} onChange={(e) => setTestForm((p) => ({ ...p, isActive: e.target.checked }))} />פעיל</label>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleTestSave} disabled={testLifecycle.isLocked} className="rounded bg-wdi-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">{testLifecycle.isLocked ? 'שומר...' : 'שמור המלצה'}</button>
                      <button onClick={() => setTestFormOpen(false)} className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50" type="button">ביטול</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SlidePanel>

      <ConfirmDialog open={!!delConfirm} title="מחיקת פרויקט" message="פעולה זו תמחק את הרשומה לצמיתות. לא ניתן לבטל." confirmLabel="מחק" variant="danger" onConfirm={() => delConfirm && handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} />
      <ConfirmDialog open={!!testDelConfirm} title="מחיקת המלצה" message="למחוק המלצה זו?" confirmLabel="מחק" variant="danger" onConfirm={() => testDelConfirm && handleTestDelete(testDelConfirm)} onCancel={() => setTestDelConfirm(null)} />
    </div>
  );
}
