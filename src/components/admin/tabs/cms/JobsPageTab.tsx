'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';

interface LabelPair { _key?: string; value: string; label: string }
function genKey() { return Math.random().toString(36).slice(2, 10); }

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary';

interface PageData {
  _id: string;
  pageTitle: string;
  subtitle: string;
  noJobsTitle: string;
  noJobsSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  applyButtonText: string;
  sendCvText: string;
  typeLabels: LabelPair[];
  updatedAt: string;
}

export function JobsPageTab() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<PageData>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try { const r = await apiGet<PageData>('/api/admin/jobs-page'); setData(r.data); setForm(r.data); setDirty(false); }
    catch (e) { setFetchErr(e as ErrorEnvelope); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const r = await execute(async () => apiPut<PageData>('/api/admin/jobs-page', { ...form, updatedAt: data?.updatedAt }));
    if (r) { const d = (r as { data: PageData }).data; setData(d); setForm(d); setDirty(false); addToast('עמוד משרות נשמר', 'success'); }
  };

  const set = (key: string, val: unknown) => { setForm(p => ({ ...p, [key]: val })); setDirty(true); };

  const addLabel = () => set('typeLabels', [...((form.typeLabels as LabelPair[]) || []), { _key: genKey(), value: '', label: '' }]);
  const updateLabel = (i: number, field: string, val: string) => {
    const arr = [...((form.typeLabels as LabelPair[]) || [])]; arr[i] = { ...arr[i], [field]: val } as LabelPair; set('typeLabels', arr);
  };
  const removeLabel = (i: number) => set('typeLabels', ((form.typeLabels as LabelPair[]) || []).filter((_, idx) => idx !== i));

  if (loading) return <div className="p-8 text-center text-gray-500">טוען עמוד משרות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">עמוד משרות</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={handleSave} disabled={isLocked || !dirty} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">
            {isLocked ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>
      <ErrorRenderer error={mutErr} onReload={fetchData} onDismiss={reset} />
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">כותרות</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת העמוד</label>
            <input type="text" value={form.pageTitle ?? ''} onChange={e => set('pageTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת כותרת</label>
            <input type="text" value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת אין משרות</label>
            <input type="text" value={form.noJobsTitle ?? ''} onChange={e => set('noJobsTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת כותרת אין משרות</label>
            <input type="text" value={form.noJobsSubtitle ?? ''} onChange={e => set('noJobsSubtitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור הגשה</label>
            <input type="text" value={form.applyButtonText ?? ''} onChange={e => set('applyButtonText', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט שליחת קו&quot;ח</label>
            <input type="text" value={form.sendCvText ?? ''} onChange={e => set('sendCvText', e.target.value)} className={inputCls} /></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">קריאה לפעולה (CTA)</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת CTA</label>
            <input type="text" value={form.ctaTitle ?? ''} onChange={e => set('ctaTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת כותרת CTA</label>
            <input type="text" value={form.ctaSubtitle ?? ''} onChange={e => set('ctaSubtitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור CTA</label>
            <input type="text" value={form.ctaButtonText ?? ''} onChange={e => set('ctaButtonText', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">קישור כפתור CTA</label>
            <input type="text" value={form.ctaButtonLink ?? ''} onChange={e => set('ctaButtonLink', e.target.value)} className={inputCls} dir="ltr" /></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">תוויות סוגי משרות</h2>
            <button onClick={addLabel} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף</button>
          </div>
          {((form.typeLabels as LabelPair[]) || []).map((s, i) => (
            <div key={s._key || i} className="flex items-center gap-2">
              <input type="text" value={s.value} onChange={e => updateLabel(i, 'value', e.target.value)} placeholder="מזהה (אנגלית)" className="w-32 rounded border border-gray-300 px-2 py-1.5 text-sm" dir="ltr" />
              <input type="text" value={s.label} onChange={e => updateLabel(i, 'label', e.target.value)} placeholder="תווית" className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <button onClick={() => removeLabel(i)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
