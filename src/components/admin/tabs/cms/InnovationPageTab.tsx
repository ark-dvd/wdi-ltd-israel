'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Trash2, X } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';

interface Section {
  _key?: string;
  title: string;
  subtitle?: string;
  description?: string;
  features?: string[];
}

interface InnovationPage {
  _id: string;
  headline?: string;
  introduction?: string;
  sections?: Section[];
  visionTitle?: string;
  visionText?: string;
  updatedAt: string;
}

function genKey() { return Math.random().toString(36).slice(2, 10); }

export function InnovationPageTab() {
  const [data, setData] = useState<InnovationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<InnovationPage>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  // Feature tag input state per section
  const [featureInputs, setFeatureInputs] = useState<Record<number, string>>({});

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

  const set = (key: string, val: unknown) => { setForm((p) => ({ ...p, [key]: val })); setDirty(true); };

  // Section helpers
  const addSection = () => set('sections', [...(form.sections || []), { _key: genKey(), title: '', subtitle: '', description: '', features: [] }]);
  const updateSection = (idx: number, field: string, val: unknown) => {
    const sections = [...(form.sections || [])];
    sections[idx] = { ...sections[idx], [field]: val } as Section;
    set('sections', sections);
  };
  const removeSection = (idx: number) => set('sections', (form.sections || []).filter((_, i) => i !== idx));

  // Feature helpers (tag-style input)
  const addFeature = (sectionIdx: number) => {
    const text = (featureInputs[sectionIdx] || '').trim();
    if (!text) return;
    const sections = [...(form.sections || [])] as Section[];
    const section = { ...sections[sectionIdx] } as Section;
    section.features = [...(section.features || []), text];
    sections[sectionIdx] = section;
    set('sections', sections);
    setFeatureInputs((p) => ({ ...p, [sectionIdx]: '' }));
  };
  const removeFeature = (sectionIdx: number, featureIdx: number) => {
    const sections = [...(form.sections || [])] as Section[];
    const section = { ...sections[sectionIdx] } as Section;
    section.features = (section.features || []).filter((_, i) => i !== featureIdx);
    sections[sectionIdx] = section;
    set('sections', sections);
  };

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
        {/* Headline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">כותרת ראשית</h2>
          <input
            type="text"
            value={form.headline ?? ''}
            onChange={(e) => set('headline', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
          />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">פסקת מבוא</h2>
          <textarea
            value={form.introduction ?? ''}
            onChange={(e) => set('introduction', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
          />
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
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(idx, 'title', e.target.value)}
                placeholder="כותרת (חובה)"
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                value={section.subtitle ?? ''}
                onChange={(e) => updateSection(idx, 'subtitle', e.target.value)}
                placeholder="כותרת משנה"
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
              <textarea
                value={section.description ?? ''}
                onChange={(e) => updateSection(idx, 'description', e.target.value)}
                placeholder="תיאור"
                rows={3}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />

              {/* Features tag input */}
              <div>
                <span className="text-xs font-medium text-gray-500 mb-1 block">תכונות</span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(section.features || []).map((feature, fIdx) => (
                    <span key={fIdx} className="inline-flex items-center gap-1 bg-wdi-primary/10 text-wdi-primary text-xs px-2 py-1 rounded-full">
                      {feature}
                      <button onClick={() => removeFeature(idx, fIdx)} className="hover:text-red-600" type="button"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInputs[idx] ?? ''}
                    onChange={(e) => setFeatureInputs((p) => ({ ...p, [idx]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(idx); } }}
                    placeholder="הקלד תכונה ולחץ Enter"
                    className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <button onClick={() => addFeature(idx)} className="text-sm text-wdi-primary hover:underline" type="button">הוסף</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vision */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">חזון</h2>
          <input
            type="text"
            value={form.visionTitle ?? ''}
            onChange={(e) => set('visionTitle', e.target.value)}
            placeholder="כותרת חזון"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
          />
          <textarea
            value={form.visionText ?? ''}
            onChange={(e) => set('visionText', e.target.value)}
            placeholder="טקסט חזון"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
          />
        </div>
      </div>
    </div>
  );
}
