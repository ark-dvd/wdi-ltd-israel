'use client';

/**
 * About Page singleton — DOC-030 §11.2
 * Page title, subtitle, company description (RT), values, stats, CTA.
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';
import RichTextEditor from '../../RichTextEditor';

interface Stat { _key?: string; label: string; value: string }
interface Value { _key?: string; title: string; description?: unknown; icon?: string }
interface AboutPage {
  _id: string;
  pageTitle?: string; subtitle?: string;
  companyDescription?: unknown[];
  visionTitle?: string; visionContent?: unknown[];
  vision?: string; storyContent?: unknown[];
  valuesTitle?: string; pressTitle?: string;
  ctaTitle?: string; ctaSubtitle?: string; ctaButtonText?: string; ctaButtonLink?: string;
  stats?: Stat[]; values?: Value[]; updatedAt: string;
}

function genKey() { return Math.random().toString(36).slice(2, 10); }
const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary';

export function AboutPageTab() {
  const [data, setData] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<AboutPage>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const r = await apiGet<AboutPage>('/api/admin/about-page');
      setData(r.data); setForm(r.data); setDirty(false);
    } catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const r = await execute(async () => apiPut<AboutPage>('/api/admin/about-page', { ...form, updatedAt: data?.updatedAt }));
    if (r) {
      const d = (r as { data: AboutPage }).data;
      setData(d); setForm(d); setDirty(false);
      addToast('עמוד אודות נשמר', 'success');
    }
  };

  const set = (key: string, val: unknown) => { setForm(p => ({ ...p, [key]: val })); setDirty(true); };

  // Stats
  const addStat = () => set('stats', [...(form.stats || []), { _key: genKey(), label: '', value: '' }]);
  const updateStat = (idx: number, field: string, val: string) => {
    const arr = [...(form.stats || [])]; arr[idx] = { ...arr[idx], [field]: val } as Stat; set('stats', arr);
  };
  const removeStat = (idx: number) => set('stats', (form.stats || []).filter((_, i) => i !== idx));

  // Values
  const addValue = () => set('values', [...(form.values || []), { _key: genKey(), title: '', description: '', icon: '' }]);
  const updateValue = (idx: number, field: string, val: unknown) => {
    const arr = [...(form.values || [])]; arr[idx] = { ...arr[idx], [field]: val } as Value; set('values', arr);
  };
  const removeValue = (idx: number) => set('values', (form.values || []).filter((_, i) => i !== idx));

  if (loading) return <div className="p-8 text-center text-gray-500">טוען עמוד אודות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">עמוד אודות</h1>
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
            <input type="text" value={form.pageTitle ?? ''} onChange={e => set('pageTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת</label>
            <input type="text" value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} className={inputCls} /></div>
        </div>

        {/* Vision Section — FIRST content section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">החזון שלנו</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
            <input type="text" value={form.visionTitle ?? ''} onChange={e => set('visionTitle', e.target.value)} className={inputCls} /></div>
          <RichTextEditor label="תוכן החזון" value={form.visionContent as unknown[] ?? null} onChange={v => set('visionContent', v)} rows={5} />
        </div>

        {/* Company Description (RT) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">תיאור החברה</h2>
          <RichTextEditor label="" value={form.companyDescription as unknown[] ?? form.storyContent as unknown[] ?? null} onChange={v => set('companyDescription', v)} rows={8} />
        </div>

        {/* Section Titles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">כותרות סקשנים</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת ערכים</label>
            <input type="text" value={form.valuesTitle ?? ''} onChange={e => set('valuesTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת כתבו עלינו</label>
            <input type="text" value={form.pressTitle ?? ''} onChange={e => set('pressTitle', e.target.value)} className={inputCls} /></div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">קריאה לפעולה (CTA)</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת CTA</label>
            <input type="text" value={form.ctaTitle ?? ''} onChange={e => set('ctaTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת CTA</label>
            <input type="text" value={form.ctaSubtitle ?? ''} onChange={e => set('ctaSubtitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור</label>
            <input type="text" value={form.ctaButtonText ?? ''} onChange={e => set('ctaButtonText', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">קישור כפתור</label>
            <input type="text" value={form.ctaButtonLink ?? ''} onChange={e => set('ctaButtonLink', e.target.value)} className={inputCls} dir="ltr" /></div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">נתונים מספריים</h2>
            <button onClick={addStat} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף</button>
          </div>
          {(form.stats || []).map((s, i) => (
            <div key={s._key || i} className="flex items-center gap-2">
              <input type="text" value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="תיאור" className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <input type="text" value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="ערך" className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <button onClick={() => removeStat(i)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">ערכים</h2>
            <button onClick={addValue} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף</button>
          </div>
          {(form.values || []).map((v, i) => (
            <div key={v._key || i} className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input type="text" value={v.title} onChange={e => updateValue(i, 'title', e.target.value)} placeholder="כותרת" className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
                <input type="text" value={v.icon ?? ''} onChange={e => updateValue(i, 'icon', e.target.value)} placeholder="אייקון (fas fa-...)" className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm" dir="ltr" />
                <button onClick={() => removeValue(i)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
              </div>
              <textarea value={typeof v.description === 'string' ? v.description : ''} onChange={e => updateValue(i, 'description', e.target.value)} placeholder="תיאור" rows={2} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
