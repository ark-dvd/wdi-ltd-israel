'use client';

/**
 * CRM Settings singleton — DOC-030 §9, DOC-050 §22
 * Single scrollable page with card sections. Save button fixed at top.
 * No autosave. beforeunload warning on unsaved changes.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, ChevronUp, ChevronDown, Trash2, Plus, AlertTriangle,
} from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StageItem {
  key: string;
  label: string;
  color: string;
  order: number;
}

interface CrmSettings {
  _id?: string;
  pipelineStages: StageItem[];
  engagementStatuses: StageItem[];
  serviceTypes: string[];
  leadSources: string[];
  defaultPriority: 'high' | 'medium' | 'low';
  currency: string;
  engagementLabel: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#6b7280', '#111827', '#059669',
];

const PRIORITY_LABELS: Record<string, string> = {
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
};

const PROTECTED_SOURCES = ['טופס אתר'];

const defaultSettings = (): Omit<CrmSettings, '_id' | 'updatedAt'> => ({
  pipelineStages: [],
  engagementStatuses: [],
  serviceTypes: [],
  leadSources: ['טופס אתר'],
  defaultPriority: 'medium',
  currency: '₪',
  engagementLabel: 'התקשרות',
});

// ---------------------------------------------------------------------------
// Slug generator
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\u0590-\u05ff]/g, '')
    .slice(0, 40) || `stage_${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Color picker
// ---------------------------------------------------------------------------

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-full border-2 transition ${
            value === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
          }`}
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage list editor
// ---------------------------------------------------------------------------

interface StageListProps {
  stages: StageItem[];
  onChange: (stages: StageItem[]) => void;
  addLabel?: string;
}

function StageList({ stages, onChange, addLabel = 'הוסף שלב' }: StageListProps) {
  const add = () => {
    const newLabel = 'שלב חדש';
    const newStage: StageItem = {
      key: slugify(newLabel + Date.now()),
      label: newLabel,
      color: PRESET_COLORS[stages.length % PRESET_COLORS.length]!,
      order: stages.length,
    };
    onChange([...stages, newStage]);
  };

  const remove = (idx: number) => onChange(stages.filter((_, i) => i !== idx));

  const update = (idx: number, patch: Partial<StageItem>) => {
    onChange(stages.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...stages];
    const tmp = next[idx - 1]!;
    next[idx - 1] = next[idx]!;
    next[idx] = tmp;
    onChange(next.map((s, i) => ({ ...s, order: i })));
  };

  const moveDown = (idx: number) => {
    if (idx === stages.length - 1) return;
    const next = [...stages];
    const tmp = next[idx]!;
    next[idx] = next[idx + 1]!;
    next[idx + 1] = tmp;
    onChange(next.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className="space-y-2">
      {stages.map((stage, idx) => (
        <div key={stage.key} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
          {/* Color swatch */}
          <div className="relative group">
            <div
              className="w-6 h-6 rounded-full cursor-pointer border border-gray-300 shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            {/* Preset picker on hover */}
            <div className="absolute top-8 right-0 z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg p-2 shadow-wdi-lg min-w-[160px]">
              <ColorPicker value={stage.color} onChange={(c) => update(idx, { color: c })} />
            </div>
          </div>

          {/* Label input */}
          <input
            type="text"
            value={stage.label}
            onChange={(e) => update(idx, { label: e.target.value })}
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
            placeholder="שם שלב"
          />

          {/* Key (readonly) */}
          <span
            className="text-xs text-gray-400 font-mono hidden sm:block min-w-[80px] truncate"
            title={stage.key}
          >
            {stage.key}
          </span>

          {/* Reorder */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => moveUp(idx)}
              disabled={idx === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveDown(idx)}
              disabled={idx === stages.length - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => remove(idx)}
            className="text-red-400 hover:text-red-600 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm font-medium text-wdi-primary hover:underline"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tag list editor
// ---------------------------------------------------------------------------

interface TagListProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  protectedTags?: string[];
  placeholder?: string;
}

function TagList({ tags, onChange, protectedTags = [], placeholder = 'הוסף ערך...' }: TagListProps) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };

  const remove = (t: string) => {
    if (protectedTags.includes(t)) return;
    onChange(tags.filter((x) => x !== t));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className={`inline-flex items-center gap-1 rounded-full text-sm px-3 py-1 ${
              protectedTags.includes(t)
                ? 'bg-gray-200 text-gray-600'
                : 'bg-wdi-primary/10 text-wdi-primary'
            }`}
          >
            {t}
            {!protectedTags.includes(t) && (
              <button type="button" onClick={() => remove(t)} className="hover:text-red-500">
                <Trash2 size={10} />
              </button>
            )}
            {protectedTags.includes(t) && (
              <span className="text-[10px] text-gray-500 mr-1">(מוגן)</span>
            )}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim() || tags.includes(input.trim())}
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
        >
          <Plus size={14} /> הוסף
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CrmSettingsTab() {
  const [data, setData]           = useState<CrmSettings | null>(null);
  const [loading, setLoading]     = useState(true);
  const [fetchErr, setFetchErr]   = useState<ErrorEnvelope | null>(null);
  const [form, setForm]           = useState<Omit<CrmSettings, '_id' | 'updatedAt'>>(defaultSettings());
  const [dirty, setDirty]         = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const r = await apiGet<CrmSettings>('/api/admin/crm-settings');
      setData(r.data);
      setForm({
        pipelineStages: r.data.pipelineStages ?? [],
        engagementStatuses: r.data.engagementStatuses ?? [],
        serviceTypes: r.data.serviceTypes ?? [],
        leadSources: r.data.leadSources ?? ['טופס אתר'],
        defaultPriority: r.data.defaultPriority ?? 'medium',
        currency: r.data.currency ?? '₪',
        engagementLabel: r.data.engagementLabel ?? 'התקשרות',
      });
      setDirty(false);
    } catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    const r = await execute(async () =>
      apiPut<CrmSettings>('/api/admin/crm-settings', {
        ...form,
        updatedAt: data?.updatedAt,
      })
    );
    if (r) {
      const d = (r as { data: CrmSettings }).data;
      setData(d);
      setForm({
        pipelineStages: d.pipelineStages ?? [],
        engagementStatuses: d.engagementStatuses ?? [],
        serviceTypes: d.serviceTypes ?? [],
        leadSources: d.leadSources ?? ['טופס אתר'],
        defaultPriority: d.defaultPriority ?? 'medium',
        currency: d.currency ?? '₪',
        engagementLabel: d.engagementLabel ?? 'התקשרות',
      });
      setDirty(false);
      addToast('הגדרות CRM נשמרו', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען הגדרות CRM...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6" dir="rtl">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 -mx-6 px-6 py-3 mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">הגדרות CRM</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="רענן"
          >
            <RefreshCw size={18} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLocked || !dirty}
            className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
          >
            {isLocked ? 'שומר...' : 'שמור הגדרות'}
          </button>
        </div>
      </div>

      <ErrorRenderer error={mutErr} onReload={fetchData} onDismiss={reset} />

      {/* Impact warning */}
      {dirty && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            שינויים בשלבי הצינור ובסטטוסים ייכנסו לתוקף מיידית בכל תצוגות ה-CRM.
          </p>
        </div>
      )}

      <div className="space-y-6 max-w-3xl">

        {/* ---------------------------------------------------------------- */}
        {/* 1. Pipeline Stages                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">שלבי צינור</h2>
          <p className="text-xs text-gray-500 mb-4">
            שלבים אלו משמשים כעמודות בתצוגת הצינור ומשויכים לסטטוסי הלידים.
          </p>
          <StageList
            stages={form.pipelineStages}
            onChange={(stages) => {
              setForm((p) => ({ ...p, pipelineStages: stages }));
              setDirty(true);
            }}
            addLabel="הוסף שלב"
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 2. Engagement Statuses                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">סטטוסי התקשרות</h2>
          <p className="text-xs text-gray-500 mb-4">
            סטטוסים אלו משמשים בניהול ההתקשרויות. ניתן להגדיר צבע ושם לכל סטטוס.
          </p>
          <StageList
            stages={form.engagementStatuses}
            onChange={(stages) => {
              setForm((p) => ({ ...p, engagementStatuses: stages }));
              setDirty(true);
            }}
            addLabel="הוסף סטטוס"
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 3. Service Types                                                 */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">סוגי שירות</h2>
          <p className="text-xs text-gray-500 mb-4">
            רשימת סוגי שירות הזמינים בטפסי לידים והתקשרויות.
          </p>
          <TagList
            tags={form.serviceTypes}
            onChange={(tags) => setField('serviceTypes', tags)}
            placeholder="סוג שירות חדש..."
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 4. Lead Sources                                                  */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">מקורות ליד</h2>
          <p className="text-xs text-gray-500 mb-4">
            רשימת מקורות אפשריים ללידים. &quot;טופס אתר&quot; מוגן ולא ניתן להסרה.
          </p>
          <TagList
            tags={form.leadSources}
            onChange={(tags) => {
              // ensure protected tags always present
              const merged = [...PROTECTED_SOURCES, ...tags.filter((t) => !PROTECTED_SOURCES.includes(t))];
              const withProtected = merged.filter((v, i) => merged.indexOf(v) === i);
              setField('leadSources', withProtected);
            }}
            protectedTags={PROTECTED_SOURCES}
            placeholder="מקור ליד חדש..."
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 5. Defaults                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">ברירות מחדל</h2>
          <div className="space-y-4">
            {/* Default priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות ברירת מחדל</label>
              <select
                value={form.defaultPriority}
                onChange={(e) => setField('defaultPriority', e.target.value as CrmSettings['defaultPriority'])}
                className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סמל מטבע (עד 3 תווים)</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => setField('currency', e.target.value.slice(0, 3))}
                maxLength={3}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
                dir="ltr"
              />
            </div>

            {/* Engagement label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם ישות ההתקשרות</label>
              <input
                type="text"
                value={form.engagementLabel}
                onChange={(e) => setField('engagementLabel', e.target.value)}
                placeholder="למשל: פרויקט, חוזה, עסקה..."
                className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
