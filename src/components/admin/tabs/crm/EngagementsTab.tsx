'use client';

/**
 * Engagements Tab — DOC-030 §6
 * Full engagement lifecycle management with status transitions and activity timeline.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, RefreshCw, ChevronDown, X, Tag, Clock, MessageSquare, Trash2,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, type ErrorEnvelope } from '@/lib/api/client';
import { validateDelete } from '@/lib/admin/delete-contract';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EngagementStatus =
  | 'new' | 'in_progress' | 'review' | 'delivered'
  | 'completed' | 'paused' | 'cancelled';

interface Engagement {
  _id: string;
  title: string;
  client: string;
  engagementType?: string;
  value?: number;
  status: EngagementStatus;
  estimatedDuration?: string;
  scope?: string[];
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  description?: string;
  internalNotes?: string;
  isActive?: boolean;
  updatedAt: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  performedBy?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<EngagementStatus, string> = {
  new: 'חדש',
  in_progress: 'בביצוע',
  review: 'בבדיקה',
  delivered: 'נמסר',
  completed: 'הושלם',
  paused: 'מושהה',
  cancelled: 'בוטל',
};

const STATUS_TRANSITIONS: Record<EngagementStatus, EngagementStatus[]> = {
  new: ['in_progress', 'paused', 'cancelled'],
  in_progress: ['review', 'delivered', 'paused', 'cancelled'],
  review: ['in_progress', 'delivered', 'paused', 'cancelled'],
  delivered: ['completed', 'in_progress', 'cancelled'],
  paused: ['new', 'in_progress', 'cancelled'],
  completed: [],
  cancelled: [],
};

const STATUS_BADGE: Record<EngagementStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  review: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

const ENGAGEMENT_TYPES = [
  'פיתוח אתר', 'עיצוב גרפי', 'שיווק דיגיטלי', 'ייעוץ', 'פרויקט בינוי',
  'תשתיות', 'אינטגרציה', 'אחר',
];

const ALL_STATUSES: EngagementStatus[] = [
  'new', 'in_progress', 'review', 'delivered', 'completed', 'paused', 'cancelled',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeHebrew(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);
  if (diffMin < 1)  return 'עכשיו';
  if (diffMin === 1) return 'לפני דקה';
  if (diffMin < 60)  return `לפני ${diffMin} דקות`;
  if (diffHr  === 1) return 'לפני שעה';
  if (diffHr  < 24)  return `לפני ${diffHr} שעות`;
  if (diffDay === 1) return 'לפני יום';
  return `לפני ${diffDay} ימים`;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('he-IL');
}

function formatValue(v?: number): string {
  if (v == null) return '—';
  return `₪${v.toLocaleString('he-IL')}`;
}

const emptyForm = (): Partial<Engagement> => ({
  title: '', client: '', engagementType: '', value: undefined,
  status: 'new', estimatedDuration: '', scope: [],
  startDate: '', expectedEndDate: '', actualEndDate: '',
  description: '', internalNotes: '',
});

// ---------------------------------------------------------------------------
// Tag Input component
// ---------------------------------------------------------------------------

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

function TagInput({ tags, onChange, placeholder = 'הוסף תג...' }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) {
      onChange([...tags, v]);
    }
    setInput('');
  };

  const removeTag = (t: string) => onChange(tags.filter((x) => x !== t));

  return (
    <div className="rounded-lg border border-gray-300 px-3 py-2 flex flex-wrap gap-1.5 min-h-[40px] focus-within:border-wdi-primary focus-within:ring-1 focus-within:ring-wdi-primary">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 bg-wdi-primary/10 text-wdi-primary text-xs rounded-full px-2 py-0.5">
          {t}
          <button type="button" onClick={() => removeTag(t)} className="hover:text-wdi-primary-dark">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function EngagementsTab() {
  const router = useRouter();

  const [items, setItems]         = useState<Engagement[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchErr, setFetchErr]   = useState<ErrorEnvelope | null>(null);
  const [statusFilter, setStatusFilter] = useState<EngagementStatus | 'all'>('all');
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer               = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<Partial<Engagement>>(emptyForm());
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  // Activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actPanelOpen, setActPanelOpen] = useState(false);
  const [actNote, setActNote]     = useState('');
  const actLifecycle              = useRequestLifecycle();

  // Transition
  const [transitionTarget, setTransitionTarget] = useState<EngagementStatus | null>(null);

  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchItems = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const r = await apiGet<Engagement[]>('/api/admin/engagements');
      setItems(r.data);
    } catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // 300ms debounce on search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const fetchActivities = useCallback(async (id: string) => {
    try {
      const r = await apiGet<Activity[]>(`/api/admin/engagements/${id}/activities`);
      setActivities(r.data);
    } catch { setActivities([]); }
  }, []);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filtered = items.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (!i.title.toLowerCase().includes(q) && !i.client.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // ---------------------------------------------------------------------------
  // Panel open/close
  // ---------------------------------------------------------------------------

  const openCreate = () => {
    setEditId(null); setForm(emptyForm()); setActivities([]);
    setTransitionTarget(null); reset(); setPanelOpen(true);
  };

  const openEdit = (eng: Engagement) => {
    setEditId(eng._id); setForm({ ...eng }); setTransitionTarget(null);
    reset(); setPanelOpen(true);
    fetchActivities(eng._id);
  };

  const sf = <K extends keyof Engagement>(k: K, v: Engagement[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    const r = await execute(async () => {
      if (editId) return apiPut<Engagement>(`/api/admin/engagements/${editId}`, { ...form, updatedAt: form.updatedAt });
      return apiPost<Engagement>('/api/admin/engagements', form);
    });
    if (r) {
      const d = (r as { data: Engagement }).data;
      setItems((p) => editId ? p.map((i) => i._id === editId ? d : i) : [...p, d]);
      setPanelOpen(false);
      addToast(editId ? 'התקשרות עודכנה' : 'התקשרות נוצרה', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i._id === id);
    const blocked = validateDelete(item);
    if (blocked) { addToast(blocked, 'error'); setDelConfirm(null); return; }
    setDelConfirm(null);
    const r = await execute(() => apiDelete(`/api/admin/engagements/${id}`, { updatedAt: item!.updatedAt }));
    if (r) {
      setItems((p) => p.filter((i) => i._id !== id));
      setPanelOpen(false);
      addToast('התקשרות נמחקה', 'success');
    }
  };

  const handleTransition = async (toStatus: EngagementStatus) => {
    if (!editId) return;
    const r = await execute(() =>
      apiPost<Engagement>(`/api/admin/engagements/${editId}/transition`, { status: toStatus, updatedAt: form.updatedAt })
    );
    if (r) {
      const d = (r as { data: Engagement }).data;
      setItems((p) => p.map((i) => i._id === editId ? d : i));
      setForm({ ...d }); setTransitionTarget(null);
      addToast(`סטטוס שונה ל-${STATUS_LABELS[toStatus]}`, 'success');
      fetchActivities(editId);
    }
  };

  const handleLogActivity = async () => {
    if (!editId || !actNote.trim()) return;
    const r = await actLifecycle.execute(() =>
      apiPost<Activity>(`/api/admin/engagements/${editId}/activities`, { description: actNote, type: 'note' })
    );
    if (r) {
      const d = (r as { data: Activity }).data;
      setActivities((p) => [d, ...p]);
      setActNote(''); setActPanelOpen(false);
      addToast('פעילות נרשמה', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) return <div className="p-8 text-center text-gray-500">טוען התקשרויות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchItems} /></div>;

  const currentStatus = (form.status ?? 'new') as EngagementStatus;
  const availableTransitions = editId ? STATUS_TRANSITIONS[currentStatus] : [];
  const isTerminal = availableTransitions.length === 0 && editId != null;

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">התקשרויות</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-gray-600" type="button" title="רענן">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition"
            type="button"
          >
            <Plus size={16} />
            התקשרות חדשה +
          </button>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === 'all' ? 'bg-wdi-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          type="button"
        >
          הכל
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-wdi-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            type="button"
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        <div className="flex-1 min-w-[220px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי כותרת..."
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setDebouncedSearch(''); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">אין התקשרויות</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((eng) => (
            <button
              key={eng._id}
              onClick={() => openEdit(eng)}
              className="w-full bg-white rounded-lg border border-gray-200 p-4 text-right hover:border-wdi-primary/30 hover:shadow-wdi-sm transition flex items-center justify-between gap-4"
              type="button"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">{eng.title}</p>
                <p className="text-sm text-gray-500 truncate">{eng.client}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {eng.engagementType && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {eng.engagementType}
                  </span>
                )}
                <span className="text-sm font-medium text-gray-700">{formatValue(eng.value)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[eng.status]}`}>
                  {STATUS_LABELS[eng.status]}
                </span>
                {eng.startDate && (
                  <span className="text-xs text-gray-400">{formatDate(eng.startDate)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* SlidePanel */}
      <SlidePanel
        open={panelOpen}
        title={editId ? 'עריכת התקשרות' : 'התקשרות חדשה'}
        onClose={() => setPanelOpen(false)}
        wide
        footer={
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={isLocked}
              className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
              type="button"
            >
              {isLocked ? 'שומר...' : 'שמור'}
            </button>
            {editId && !isTerminal && (
              <div className="relative">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setTransitionTarget(transitionTarget ? null : availableTransitions[0]!)}
                  className="flex items-center gap-1 rounded-lg border border-wdi-primary/40 px-3 py-2 text-sm font-medium text-wdi-primary hover:bg-wdi-primary/5 transition disabled:opacity-50"
                >
                  שנה סטטוס <ChevronDown size={14} />
                </button>
                {transitionTarget !== null && (
                  <div className="absolute bottom-full mb-1 right-0 bg-white border border-gray-200 rounded-lg shadow-wdi-lg overflow-hidden z-10 min-w-[140px]">
                    {availableTransitions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleTransition(s)}
                        className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 transition"
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ml-2 ${STATUS_BADGE[s].split(' ')[0]}`} />
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {editId && (
              <button
                onClick={() => setActPanelOpen(true)}
                disabled={isLocked}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                type="button"
              >
                <MessageSquare size={14} />
                תיעוד פעילות
              </button>
            )}
            {editId && (
              <button
                onClick={() => setDelConfirm(editId)}
                disabled={isLocked}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                type="button"
              >
                מחק
              </button>
            )}
          </div>
        }
      >
        <ErrorRenderer error={mutErr} onReload={fetchItems} onDismiss={reset} />

        <div className="space-y-4">
          {/* Status badge (read-only display) */}
          {editId && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">סטטוס נוכחי:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[currentStatus]}`}>
                {STATUS_LABELS[currentStatus]}
              </span>
              {isTerminal && (
                <span className="text-xs text-gray-400">(מצב סופי)</span>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
            <input
              type="text"
              value={form.title ?? ''}
              onChange={(e) => sf('title', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
            />
            <FieldError error={mutErr?.fieldErrors?.title} />
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">לקוח *</label>
            <input
              type="text"
              value={form.client ?? ''}
              onChange={(e) => sf('client', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
            />
            <FieldError error={mutErr?.fieldErrors?.client} />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג התקשרות</label>
              <select
                value={form.engagementType ?? ''}
                onChange={(e) => sf('engagementType', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
              >
                <option value="">בחר סוג</option>
                {ENGAGEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ערך (₪)</label>
              <input
                type="number"
                min="0"
                value={form.value ?? ''}
                onChange={(e) => sf('value', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
                placeholder="0"
              />
            </div>
          </div>

          {/* Status (new only) + estimatedDuration */}
          <div className="grid grid-cols-2 gap-4">
            {!editId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                <select
                  value={form.status ?? 'new'}
                  onChange={(e) => sf('status', e.target.value as EngagementStatus)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
                >
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">משך משוער</label>
              <input
                type="text"
                value={form.estimatedDuration ?? ''}
                onChange={(e) => sf('estimatedDuration', e.target.value)}
                placeholder="למשל: 3 חודשים"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
              />
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Tag size={14} /> היקף (תגיות)
            </label>
            <TagInput
              tags={form.scope ?? []}
              onChange={(tags) => sf('scope', tags)}
              placeholder="הוסף תג ולחץ Enter..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך התחלה</label>
              <input
                type="date"
                value={form.startDate ?? ''}
                onChange={(e) => sf('startDate', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך סיום צפוי</label>
              <input
                type="date"
                value={form.expectedEndDate ?? ''}
                onChange={(e) => sf('expectedEndDate', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תאריך סיום בפועל</label>
            <input
              type="date"
              value={form.actualEndDate ?? ''}
              onChange={(e) => sf('actualEndDate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => sf('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
            />
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות פנימיות</label>
            <textarea
              value={form.internalNotes ?? ''}
              onChange={(e) => sf('internalNotes', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
            />
          </div>

          {/* Log activity inline form */}
          {actPanelOpen && editId && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">תיעוד פעילות</h4>
              <ErrorRenderer error={actLifecycle.error} onDismiss={actLifecycle.reset} />
              <textarea
                value={actNote}
                onChange={(e) => setActNote(e.target.value)}
                rows={2}
                placeholder="תאר את הפעילות..."
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLogActivity}
                  disabled={actLifecycle.isLocked || !actNote.trim()}
                  className="rounded bg-wdi-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
                  type="button"
                >
                  {actLifecycle.isLocked ? 'שומר...' : 'שמור'}
                </button>
                <button
                  onClick={() => { setActPanelOpen(false); setActNote(''); }}
                  className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-white"
                  type="button"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* Activity timeline */}
          {editId && activities.length > 0 && (
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <Clock size={14} /> ציר זמן פעילות
              </h3>
              <ul className="space-y-2">
                {activities.map((act) => (
                  <li key={act._id} className="flex gap-3 text-sm">
                    <div className="mt-1 w-2 h-2 rounded-full bg-wdi-primary/40 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-800">{act.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {act.performedBy && <span>{act.performedBy} · </span>}
                        {relativeHebrew(act.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SlidePanel>

      <ConfirmDialog
        open={!!delConfirm}
        title="מחיקת התקשרות"
        message="פעולה זו תמחק את ההתקשרות לצמיתות. לא ניתן לבטל."
        confirmLabel="מחק"
        variant="danger"
        onConfirm={() => delConfirm && handleDelete(delConfirm)}
        onCancel={() => setDelConfirm(null)}
      />
    </div>
  );
}
