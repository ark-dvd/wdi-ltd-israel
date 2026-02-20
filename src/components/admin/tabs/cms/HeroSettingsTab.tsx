'use client';

/**
 * Hero Settings singleton — DOC-030 §11.9
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';
import ImageUpload from '../../ImageUpload';
import FileUpload from '../../FileUpload';

interface SanityImage { _type: 'image'; asset: { _type: 'reference'; _ref: string } }
interface SanityFile { _type: 'file'; asset: { _type: 'reference'; _ref: string } }
interface HeroSettings {
  _id: string; headline?: string; subheadline?: string;
  ctaText?: string; ctaLink?: string; cta2Text?: string; cta2Link?: string;
  backgroundImage?: SanityImage | null;
  videoUrl?: SanityFile | null; updatedAt: string;
}

export function HeroSettingsTab() {
  const [data, setData] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<HeroSettings>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const r = await apiGet<HeroSettings>('/api/admin/hero');
      setData(r.data); setForm(r.data); setDirty(false);
    } catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const r = await execute(async () => apiPut<HeroSettings>('/api/admin/hero', { ...form, updatedAt: data?.updatedAt }));
    if (r) {
      const d = (r as { data: HeroSettings }).data;
      setData(d); setForm(d); setDirty(false);
      addToast('הגדרות Hero נשמרו', 'success');
    }
  };

  const set = (key: string, val: string) => { setForm((p) => ({ ...p, [key]: val })); setDirty(true); };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען הגדרות Hero...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הגדרות Hero</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={handleSave} disabled={isLocked || !dirty} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">
            {isLocked ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <ErrorRenderer error={mutErr} onReload={fetchData} onDismiss={reset} />

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת ראשית</label>
          <input type="text" value={form.headline ?? ''} onChange={(e) => set('headline', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת משנית</label>
          <input type="text" value={form.subheadline ?? ''} onChange={(e) => set('subheadline', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור</label>
          <input type="text" value={form.ctaText ?? ''} onChange={(e) => set('ctaText', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">קישור כפתור</label>
          <input type="url" value={form.ctaLink ?? ''} onChange={(e) => set('ctaLink', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור שני</label>
          <input type="text" value={form.cta2Text ?? ''} onChange={(e) => set('cta2Text', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">קישור כפתור שני</label>
          <input type="url" value={form.cta2Link ?? ''} onChange={(e) => set('cta2Link', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
        <FileUpload label="וידאו רקע" accept="video/mp4,video/webm" description="גרור קובץ וידאו או לחץ לבחירה. MP4 מומלץ, עד 40MB." value={form.videoUrl ?? null} onChange={(v) => { setForm((p) => ({ ...p, videoUrl: v })); setDirty(true); }} />
        <ImageUpload label="תמונת רקע (גיבוי)" value={form.backgroundImage ?? null} onChange={(v) => { setForm((p) => ({ ...p, backgroundImage: v })); setDirty(true); }} />
      </div>
    </div>
  );
}
