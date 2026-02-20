'use client';

/**
 * Innovation Page singleton — DOC-030 §11.7
 * Page title, subtitle, rich content, sections with icon/content, CTA.
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';
import RichTextEditor from '../../RichTextEditor';

interface Section {
  _key?: string;
  title: string;
  icon?: string;
  description?: string;
  content?: unknown[];
}

interface InnovationPage {
  _id: string;
  pageTitle?: string; subtitle?: string;
  content?: unknown[];
  headline?: string; introduction?: string;
  ctaTitle?: string; ctaSubtitle?: string;
  ctaButtonText?: string; ctaButtonLink?: string;
  cta2ButtonText?: string; cta2ButtonLink?: string;
  sections?: Section[];
  updatedAt: string;
}

function genKey() { return Math.random().toString(36).slice(2, 10); }
const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary';

export function InnovationPageTab() {
  const [data, setData] = useState<InnovationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<InnovationPage>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const r = await apiGet<InnovationPage>('/api/admin/innovation-page');
      setData(r.data); setForm(r.data); setDirty(false);
    } catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const r = await execute(async () => apiPut<InnovationPage>('/api/admin/innovation-page', { ...form, updatedAt: data?.updatedAt }));
    if (r) {
      const d = (r as { data: InnovationPage }).data;
      setData(d); setForm(d); setDirty(false);
      addToast('עמוד חדשנות נשמר', 'success');
    }
  };

  const set = (key: string, val: unknown) => { setForm(p => ({ ...p, [key]: val })); setDirty(true); };

  // Section helpers
  const addSection = () => set('sections', [...(form.sections || []), { _key: genKey(), title: '', icon: '', description: '' }]);
  const updateSection = (idx: number, field: string, val: unknown) => {
    const sections = [...(form.sections || [])]; sections[idx] = { ...sections[idx], [field]: val } as Section; set('sections', sections);
  };
  const removeSection = (idx: number) => set('sections', (form.sections || []).filter((_, i) => i !== idx));

  if (loading) return <div className="p-8 text-center text-gray-500">טוען עמוד חדשנות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">עמוד חדשנות</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={handleSave} disabled={isLocked || !dirty} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">
            {isLocked ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <ErrorRenderer error={mutErr} onReload={fetchData} onDismiss={reset} />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">כותרת עמוד</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
            <input type="text" value={form.pageTitle ?? form.headline ?? ''} onChange={e => set('pageTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת</label>
            <input type="text" value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} className={inputCls} /></div>
        </div>

        {/* Content (RT) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">תוכן ראשי</h2>
          <RichTextEditor label="" value={form.content as unknown[] ?? null} onChange={v => set('content', v)} rows={8} />
        </div>

        {/* Sections */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">מקטעי חדשנות</h2>
            <button onClick={addSection} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף מקטע</button>
          </div>
          {(form.sections || []).map((section, idx) => (
            <div key={section._key || idx} className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">מקטע {idx + 1}</span>
                <button onClick={() => removeSection(idx)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
              </div>
              <input type="text" value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} placeholder="כותרת (חובה)" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <input type="text" value={section.icon ?? ''} onChange={e => updateSection(idx, 'icon', e.target.value)} placeholder="אייקון (fas fa-...)" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" dir="ltr" />
              <textarea value={section.description ?? ''} onChange={e => updateSection(idx, 'description', e.target.value)} placeholder="תיאור" rows={3} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">קריאה לפעולה (CTA)</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת CTA</label>
            <input type="text" value={form.ctaTitle ?? ''} onChange={e => set('ctaTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת CTA</label>
            <input type="text" value={form.ctaSubtitle ?? ''} onChange={e => set('ctaSubtitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור ראשי</label>
            <input type="text" value={form.ctaButtonText ?? ''} onChange={e => set('ctaButtonText', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">קישור כפתור ראשי</label>
            <input type="text" value={form.ctaButtonLink ?? ''} onChange={e => set('ctaButtonLink', e.target.value)} className={inputCls} dir="ltr" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור שני</label>
            <input type="text" value={form.cta2ButtonText ?? ''} onChange={e => set('cta2ButtonText', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">קישור כפתור שני</label>
            <input type="text" value={form.cta2ButtonLink ?? ''} onChange={e => set('cta2ButtonLink', e.target.value)} className={inputCls} dir="ltr" /></div>
        </div>
      </div>
    </div>
  );
}
