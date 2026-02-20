'use client';

/**
 * CRM Leads management tab — DOC-030 §4, DOC-040 §5.1, DOC-050
 * Hebrew RTL admin panel for lead pipeline management.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Archive, RotateCcw, ArrowLeftRight,
  MessageSquarePlus, CheckCircle, Phone, Mail, Building2,
  Clock, User, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  apiGet, apiPost, apiPut, apiList,
  type ErrorEnvelope, type ListEnvelope,
} from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';

// ─── Types ───────────────────────────────────────────────────

type LeadStatus =
  | 'new' | 'contacted' | 'qualified'
  | 'proposal_sent' | 'won' | 'lost' | 'archived';

type LeadPriority = 'high' | 'medium' | 'low';

interface LeadListItem {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: string;
  priority?: LeadPriority;
  updatedAt: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  performedBy: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface LeadDetail extends LeadListItem {
  message?: string;
  company?: string;
  phone?: string;
  servicesInterested?: string[];
  notes?: string;
  description?: string;
  estimatedValue?: number;
  referredBy?: string;
  convertedToClientId?: string | null;
  convertedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  activities: Activity[];
}

interface ConvertForm {
  engagementTitle: string;
  engagementType: string;
  engagementValue: string;
}

// ─── Constants ────────────────────────────────────────────────

const STATUS_LABELS: Record<LeadStatus | string, string> = {
  new: 'חדש',
  contacted: 'נוצר קשר',
  qualified: 'מתאים',
  proposal_sent: 'הצעה נשלחה',
  won: 'נסגר בהצלחה',
  lost: 'לא רלוונטי',
  archived: 'בארכיון',
};

const STATUS_COLORS: Record<LeadStatus | string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-cyan-100 text-cyan-700',
  proposal_sent: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};

// DOC-040 §5.1 — transition matrix
const LEAD_TRANSITIONS: Record<string, string[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['proposal_sent', 'lost'],
  proposal_sent: ['won', 'lost'],
  won: [],
  lost: [],
  archived: [],
};

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
};

const PRIORITY_COLORS: Record<LeadPriority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const SOURCE_LABELS: Record<string, string> = {
  contact_form: 'טופס יצירת קשר',
  manual_entry: 'הזנה ידנית',
  referral: 'הפניה',
  website: 'אתר',
  phone: 'טלפון',
  email: 'אימייל',
};

const FILTER_STATUSES: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'הכל' },
  { key: 'new', label: 'חדש' },
  { key: 'contacted', label: 'נוצר קשר' },
  { key: 'qualified', label: 'מתאים' },
  { key: 'proposal_sent', label: 'הצעה נשלחה' },
  { key: 'won', label: 'נסגר בהצלחה' },
  { key: 'lost', label: 'לא רלוונטי' },
  { key: 'archived', label: 'בארכיון' },
];

const ACTIVITY_TYPES: Record<string, string> = {
  lead_created: 'ליד נוצר',
  status_change: 'שינוי סטטוס',
  record_updated: 'פרטים עודכנו',
  note_added: 'הערה נוספה',
  lead_archived: 'הועבר לארכיון',
  record_restored: 'שוחזר מהארכיון',
  lead_converted: 'הומר ללקוח',
  call_logged: 'שיחה נרשמה',
  email_sent: 'אימייל נשלח',
  email_received: 'אימייל התקבל',
  site_visit_scheduled: 'ביקור תוזמן',
  site_visit_completed: 'ביקור הושלם',
  quote_sent: 'הצעת מחיר נשלחה',
  quote_accepted: 'הצעת מחיר אושרה',
  quote_rejected: 'הצעת מחיר נדחתה',
  bulk_operation: 'פעולה מרוכזת',
  custom: 'הערה ידנית',
};

const MANUAL_ACTIVITY_TYPES = [
  { value: 'call_logged', label: 'שיחה' },
  { value: 'email_sent', label: 'אימייל יוצא' },
  { value: 'email_received', label: 'אימייל נכנס' },
  { value: 'site_visit_scheduled', label: 'תיזום ביקור' },
  { value: 'site_visit_completed', label: 'ביקור הושלם' },
  { value: 'quote_sent', label: 'הצעת מחיר נשלחה' },
  { value: 'quote_accepted', label: 'הצעת מחיר אושרה' },
  { value: 'quote_rejected', label: 'הצעת מחיר נדחתה' },
  { value: 'custom', label: 'הערה חופשית' },
];

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDateShort(iso: string) {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// ─── Empty form factories ─────────────────────────────────────

const emptyLead = (): Partial<LeadDetail> => ({
  name: '', email: '', message: '', company: '', phone: '',
  priority: 'medium', estimatedValue: undefined,
  referredBy: '', description: '', notes: '',
  servicesInterested: [],
});

const emptyConvertForm = (): ConvertForm => ({
  engagementTitle: '', engagementType: '', engagementValue: '',
});

// ─── Component ────────────────────────────────────────────────

export function LeadsTab() {
  // List state
  const [items, setItems] = useState<LeadListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Selection / bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkConfirm, setBulkConfirm] = useState<'archive' | 'status' | null>(null);

  // Detail panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<ErrorEnvelope | null>(null);

  // Panel mode: 'view' | 'edit' | 'create'
  const [panelMode, setPanelMode] = useState<'view' | 'edit' | 'create'>('view');
  const [form, setForm] = useState<Partial<LeadDetail>>(emptyLead());

  // Archive/restore/transition confirm dialogs
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  // Convert dialog
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertForm, setConvertForm] = useState<ConvertForm>(emptyConvertForm());

  // Activity log modal
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityType, setActivityType] = useState('call_logged');
  const [activityNotes, setActivityNotes] = useState('');
  const [activityCallDuration, setActivityCallDuration] = useState('');
  const [activityQuoteAmount, setActivityQuoteAmount] = useState('');

  const { error: mutErr, isLocked, execute, reset: resetMut } = useRequestLifecycle();
  const convertLifecycle = useRequestLifecycle();
  const activityLifecycle = useRequestLifecycle();
  const bulkLifecycle = useRequestLifecycle();
  const { addToast } = useToast();

  const LIMIT = 20;

  // ─── Fetch list ────────────────────────────────────────────

  const fetchItems = useCallback(async (p = page, sf = statusFilter) => {
    setLoading(true); setFetchErr(null);
    try {
      const params = new URLSearchParams({
        page: String(p), limit: String(LIMIT),
        sort: 'updatedAt', order: 'desc',
      });
      if (sf && sf !== 'all') params.set('status', sf);
      const r = await apiList<LeadListItem>(`/api/admin/leads?${params}`);
      setItems(r.data);
      setTotal(r.total);
      setSelected(new Set());
    } catch (e) {
      setFetchErr(e as ErrorEnvelope);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchItems(page, statusFilter); }, [fetchItems, page, statusFilter]);

  const handleFilterChange = (sf: string) => {
    setStatusFilter(sf); setPage(1); setSelected(new Set());
    fetchItems(1, sf);
  };

  // ─── Open detail panel ─────────────────────────────────────

  const openDetail = async (id: string) => {
    setPanelOpen(true); setPanelMode('view');
    setDetail(null); setDetailErr(null); setDetailLoading(true);
    resetMut();
    try {
      const r = await apiGet<LeadDetail>(`/api/admin/leads/${id}`);
      setDetail(r.data);
    } catch (e) {
      setDetailErr(e as ErrorEnvelope);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreate = () => {
    setDetail(null); setForm(emptyLead()); resetMut();
    setPanelMode('create'); setPanelOpen(true);
  };

  const openEdit = () => {
    if (!detail) return;
    setForm({ ...detail });
    resetMut();
    setPanelMode('edit');
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => {
      setDetail(null); setDetailErr(null);
      setPanelMode('view'); setForm(emptyLead());
      setArchiveConfirm(false); setRestoreConfirm(false);
      setTransitionTarget(null);
    }, 300);
  };

  // ─── Reload detail in-place (after mutations) ───────────────

  const reloadDetail = useCallback(async (id: string) => {
    try {
      const r = await apiGet<LeadDetail>(`/api/admin/leads/${id}`);
      setDetail(r.data);
      setItems((prev) => prev.map((i) =>
        i._id === id
          ? { ...i, status: r.data.status, updatedAt: r.data.updatedAt }
          : i,
      ));
    } catch { /* silent */ }
  }, []);

  // ─── Form field setter ─────────────────────────────────────

  const setField = <K extends keyof LeadDetail>(k: K, v: LeadDetail[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // ─── Save (create / edit) ──────────────────────────────────

  const handleSave = async () => {
    if (panelMode === 'create') {
      const r = await execute(() =>
        apiPost<LeadDetail>('/api/admin/leads', {
          name: form.name, email: form.email, message: form.message,
          company: form.company, phone: form.phone,
          priority: form.priority, estimatedValue: form.estimatedValue,
          referredBy: form.referredBy, description: form.description,
        }),
      );
      if (r) {
        const d = (r as { data: LeadDetail }).data;
        setItems((p) => [d, ...p]);
        setTotal((t) => t + 1);
        setPanelOpen(false);
        addToast('ליד חדש נוצר בהצלחה', 'success');
      }
    } else if (panelMode === 'edit' && detail) {
      const r = await execute(() =>
        apiPut<LeadDetail>(`/api/admin/leads/${detail._id}`, {
          updatedAt: detail.updatedAt,
          name: form.name, email: form.email,
          company: form.company, phone: form.phone,
          priority: form.priority, estimatedValue: form.estimatedValue,
          referredBy: form.referredBy, description: form.description,
          notes: form.notes,
        }),
      );
      if (r) {
        await reloadDetail(detail._id);
        setPanelMode('view');
        addToast('ליד עודכן בהצלחה', 'success');
      }
    }
  };

  // ─── Status transition ─────────────────────────────────────

  const handleTransition = async (targetStatus: string) => {
    if (!detail) return;
    const r = await execute(() =>
      apiPost<LeadDetail>(`/api/admin/leads/${detail._id}/transition`, {
        updatedAt: detail.updatedAt,
        targetStatus,
      }),
    );
    if (r) {
      await reloadDetail(detail._id);
      setTransitionTarget(null);
      addToast(`סטטוס שונה ל-${STATUS_LABELS[targetStatus] ?? targetStatus}`, 'success');
    }
  };

  // ─── Archive ───────────────────────────────────────────────

  const handleArchive = async () => {
    if (!detail) return;
    const r = await execute(() =>
      apiPost<LeadDetail>(`/api/admin/leads/${detail._id}/archive`, {
        updatedAt: detail.updatedAt,
      }),
    );
    if (r) {
      await reloadDetail(detail._id);
      setArchiveConfirm(false);
      addToast('ליד הועבר לארכיון', 'success');
    }
  };

  // ─── Restore ───────────────────────────────────────────────

  const handleRestore = async () => {
    if (!detail) return;
    const r = await execute(() =>
      apiPost<LeadDetail>(`/api/admin/leads/${detail._id}/restore`, {
        updatedAt: detail.updatedAt,
      }),
    );
    if (r) {
      await reloadDetail(detail._id);
      setRestoreConfirm(false);
      addToast('ליד שוחזר מהארכיון', 'success');
    }
  };

  // ─── Convert ───────────────────────────────────────────────

  const handleConvert = async () => {
    if (!detail) return;
    const payload: Record<string, unknown> = { updatedAt: detail.updatedAt };
    if (convertForm.engagementTitle.trim()) payload.engagementTitle = convertForm.engagementTitle.trim();
    if (convertForm.engagementType.trim()) payload.engagementType = convertForm.engagementType.trim();
    if (convertForm.engagementValue) {
      const v = parseFloat(convertForm.engagementValue);
      if (!isNaN(v)) payload.engagementValue = v;
    }
    const r = await convertLifecycle.execute(() =>
      apiPost<{ client: unknown; engagement: unknown }>(`/api/admin/leads/${detail._id}/convert`, payload),
    );
    if (r) {
      await reloadDetail(detail._id);
      setConvertOpen(false);
      setConvertForm(emptyConvertForm());
      addToast('ליד הומר ללקוח בהצלחה', 'success');
    }
  };

  // ─── Manual activity ───────────────────────────────────────

  const handleLogActivity = async () => {
    if (!detail) return;
    const payload: Record<string, unknown> = {
      entityType: 'lead',
      entityId: detail._id,
      type: activityType,
      notes: activityNotes,
    };
    if (activityType === 'call_logged' && activityCallDuration) {
      const d = parseInt(activityCallDuration);
      if (!isNaN(d)) payload.callDuration = d;
    }
    const quoteTypes = ['quote_sent', 'quote_accepted', 'quote_rejected'];
    if (quoteTypes.includes(activityType) && activityQuoteAmount) {
      const v = parseFloat(activityQuoteAmount);
      if (!isNaN(v)) payload.quoteAmount = v;
    }
    const r = await activityLifecycle.execute(() => apiPost<Activity>('/api/admin/activities', payload));
    if (r) {
      setActivityModalOpen(false);
      setActivityNotes(''); setActivityType('call_logged');
      setActivityCallDuration(''); setActivityQuoteAmount('');
      await reloadDetail(detail._id);
      addToast('פעילות נרשמה בהצלחה', 'success');
    }
  };

  // ─── Bulk operations ───────────────────────────────────────

  const buildConcurrencyTokens = () => {
    const tokens: Record<string, string> = {};
    Array.from(selected).forEach((id) => {
      const item = items.find((i) => i._id === id);
      if (item) tokens[id] = item.updatedAt;
    });
    return tokens;
  };

  const handleBulkArchive = async () => {
    const r = await bulkLifecycle.execute(() =>
      apiPost('/api/admin/leads/bulk', {
        action: 'archive',
        ids: Array.from(selected),
        concurrencyTokens: buildConcurrencyTokens(),
      }),
    );
    if (r) {
      setBulkConfirm(null); setSelected(new Set());
      addToast(`${selected.size} לידים הועברו לארכיון`, 'success');
      fetchItems(page, statusFilter);
    }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus) return;
    const r = await bulkLifecycle.execute(() =>
      apiPost('/api/admin/leads/bulk', {
        action: 'status_change',
        ids: Array.from(selected),
        concurrencyTokens: buildConcurrencyTokens(),
        targetStatus: bulkStatus,
      }),
    );
    if (r) {
      setBulkConfirm(null); setBulkStatus(''); setSelected(new Set());
      addToast(`סטטוס עודכן עבור ${(r as { data: { affected: number } }).data.affected} לידים`, 'success');
      fetchItems(page, statusFilter);
    }
  };

  // ─── Selection helpers ─────────────────────────────────────

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i._id)),
    );

  // ─── Pagination ────────────────────────────────────────────

  const totalPages = Math.ceil(total / LIMIT);

  const currentTransitions = detail ? (LEAD_TRANSITIONS[detail.status] ?? []) : [];

  // ─── Render ─────────────────────────────────────────────────

  if (loading && items.length === 0) {
    return <div className="p-8 text-center text-gray-500">טוען לידים...</div>;
  }
  if (fetchErr && items.length === 0) {
    return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={() => fetchItems(page, statusFilter)} /></div>;
  }

  const panelTitle =
    panelMode === 'create' ? 'ליד חדש'
    : panelMode === 'edit' ? 'עריכת ליד'
    : detail ? detail.name
    : 'ליד';

  return (
    <div className="p-6" dir="rtl">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">לידים</h1>
          {total > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{total} רשומות סה&quot;כ</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchItems(page, statusFilter)}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            type="button"
            title="רענן"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition"
            type="button"
          >
            <Plus size={16} />
            ליד חדש
          </button>
        </div>
      </div>

      {/* ─── Status filter tabs ─── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_STATUSES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === key
                ? 'bg-wdi-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Bulk action bar ─── */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-wdi-primary/20 bg-wdi-primary/5 px-4 py-2">
          <span className="text-sm font-medium text-wdi-primary">{selected.size} נבחרו</span>
          <div className="flex items-center gap-2 mr-auto">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">שנה סטטוס...</option>
              {(['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'] as LeadStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={() => { if (bulkStatus) setBulkConfirm('status'); }}
              disabled={!bulkStatus || bulkLifecycle.isLocked}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
              type="button"
            >
              <ArrowLeftRight size={14} />
              עדכן
            </button>
            <button
              onClick={() => setBulkConfirm('archive')}
              disabled={bulkLifecycle.isLocked}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 transition"
              type="button"
            >
              <Archive size={14} />
              העבר לארכיון
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-400 hover:text-gray-600"
              type="button"
            >
              ביטול
            </button>
          </div>
          <ErrorRenderer error={bulkLifecycle.error} onDismiss={bulkLifecycle.reset} />
        </div>
      )}

      {/* ─── List table ─── */}
      {loading && (
        <div className="text-center py-4 text-sm text-gray-400">טוען...</div>
      )}
      {!loading && items.length === 0 ? (
        <p className="text-center text-gray-500 py-12">אין לידים בסטטוס זה</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selected.size === items.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">שם</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">אימייל</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">סטטוס</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">עדיפות</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">מקור</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">עדכון אחרון</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.type === 'checkbox') return;
                    openDetail(item._id);
                  }}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(item._id)}
                      onChange={() => toggleSelect(item._id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500 dir-ltr" dir="ltr">{item.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.priority && (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}>
                        {PRIORITY_LABELS[item.priority]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {SOURCE_LABELS[item.source] ?? item.source}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {formatDateShort(item.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            עמוד {page} מתוך {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border border-gray-300 p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              type="button"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-gray-300 p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Detail / Edit / Create SlidePanel ─── */}
      <SlidePanel
        open={panelOpen}
        title={panelTitle}
        onClose={closePanel}
        wide
        footer={
          <div className="flex flex-wrap items-center gap-3">
            {/* Create / Edit save */}
            {(panelMode === 'create' || panelMode === 'edit') && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLocked}
                  className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
                  type="button"
                >
                  {isLocked ? 'שומר...' : 'שמור'}
                </button>
                <button
                  onClick={() => panelMode === 'edit' ? setPanelMode('view') : closePanel()}
                  disabled={isLocked}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  type="button"
                >
                  ביטול
                </button>
              </>
            )}

            {/* View mode actions */}
            {panelMode === 'view' && detail && (
              <>
                <button
                  onClick={openEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  type="button"
                >
                  עריכה
                </button>

                {/* Status transitions */}
                {currentTransitions.map((target) => (
                  <button
                    key={target}
                    onClick={() => setTransitionTarget(target)}
                    disabled={isLocked}
                    className="flex items-center gap-1.5 rounded-lg border border-wdi-primary/40 px-3 py-2 text-sm font-medium text-wdi-primary hover:bg-wdi-primary/5 transition disabled:opacity-50"
                    type="button"
                  >
                    <ArrowLeftRight size={14} />
                    {STATUS_LABELS[target] ?? target}
                  </button>
                ))}

                {/* Archive */}
                {detail.status !== 'archived' && (
                  <button
                    onClick={() => setArchiveConfirm(true)}
                    disabled={isLocked}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                    type="button"
                  >
                    <Archive size={14} />
                    ארכיון
                  </button>
                )}

                {/* Restore */}
                {detail.status === 'archived' && (
                  <button
                    onClick={() => setRestoreConfirm(true)}
                    disabled={isLocked}
                    className="flex items-center gap-1.5 rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                    type="button"
                  >
                    <RotateCcw size={14} />
                    שחזר
                  </button>
                )}

                {/* Convert — only when won and not yet converted */}
                {detail.status === 'won' && !detail.convertedToClientId && (
                  <button
                    onClick={() => { setConvertForm(emptyConvertForm()); setConvertOpen(true); }}
                    disabled={isLocked}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-50"
                    type="button"
                  >
                    <CheckCircle size={14} />
                    המר ללקוח
                  </button>
                )}

                {/* Log activity */}
                <button
                  onClick={() => {
                    setActivityType('call_logged'); setActivityNotes('');
                    setActivityCallDuration(''); setActivityQuoteAmount('');
                    activityLifecycle.reset(); setActivityModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                  type="button"
                >
                  <MessageSquarePlus size={14} />
                  תעד פעילות
                </button>
              </>
            )}
          </div>
        }
      >
        <ErrorRenderer error={mutErr} onReload={() => detail && reloadDetail(detail._id)} onDismiss={resetMut} />

        {/* Detail loading */}
        {detailLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw size={20} className="animate-spin ml-2" />
            טוען פרטי ליד...
          </div>
        )}

        {/* Detail error */}
        {detailErr && !detailLoading && (
          <ErrorRenderer error={detailErr} onReload={() => detail && openDetail(detail._id)} />
        )}

        {/* Create / Edit form */}
        {(panelMode === 'create' || panelMode === 'edit') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>שם *</label>
                <input
                  type="text"
                  value={form.name ?? ''}
                  onChange={(e) => setField('name', e.target.value)}
                  className={inputCls}
                />
                <FieldError error={mutErr?.fieldErrors?.name} />
              </div>
              <div>
                <label className={labelCls}>אימייל *</label>
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setField('email', e.target.value)}
                  className={inputCls}
                  dir="ltr"
                />
                <FieldError error={mutErr?.fieldErrors?.email} />
              </div>
            </div>

            <div>
              <label className={labelCls}>הודעה {panelMode === 'create' ? '*' : ''}</label>
              <textarea
                value={form.message ?? ''}
                onChange={(e) => setField('message', e.target.value)}
                rows={3}
                className={inputCls}
              />
              <FieldError error={mutErr?.fieldErrors?.message} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>חברה</label>
                <input
                  type="text"
                  value={form.company ?? ''}
                  onChange={(e) => setField('company', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>טלפון</label>
                <input
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={(e) => setField('phone', e.target.value)}
                  className={inputCls}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>עדיפות</label>
                <select
                  value={form.priority ?? 'medium'}
                  onChange={(e) => setField('priority', e.target.value as LeadPriority)}
                  className={inputCls}
                >
                  <option value="high">גבוה</option>
                  <option value="medium">בינוני</option>
                  <option value="low">נמוך</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>ערך משוער (₪)</label>
                <input
                  type="number"
                  min={0}
                  value={form.estimatedValue ?? ''}
                  onChange={(e) => setField('estimatedValue', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  className={inputCls}
                  dir="ltr"
                />
                <FieldError error={mutErr?.fieldErrors?.estimatedValue} />
              </div>
            </div>

            <div>
              <label className={labelCls}>הופנה על ידי</label>
              <input
                type="text"
                value={form.referredBy ?? ''}
                onChange={(e) => setField('referredBy', e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>תיאור</label>
              <textarea
                value={form.description ?? ''}
                onChange={(e) => setField('description', e.target.value)}
                rows={2}
                className={inputCls}
              />
            </div>

            {panelMode === 'edit' && (
              <div>
                <label className={labelCls}>הערות (יצורפו להיסטוריה)</label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={2}
                  className={inputCls}
                  placeholder="הערה תצורף לנתוני הליד..."
                />
              </div>
            )}
          </div>
        )}

        {/* View mode */}
        {panelMode === 'view' && detail && !detailLoading && (
          <div className="space-y-6">
            {/* Converted banner */}
            {detail.convertedToClientId && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <span className="text-sm text-green-800">
                  ליד זה הומר ללקוח
                  {detail.convertedAt ? ` ב-${formatDateShort(detail.convertedAt)}` : ''}
                </span>
              </div>
            )}

            {/* Status + Priority badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[detail.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[detail.status] ?? detail.status}
              </span>
              {detail.priority && (
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${PRIORITY_COLORS[detail.priority]}`}>
                  עדיפות: {PRIORITY_LABELS[detail.priority]}
                </span>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={15} className="shrink-0 text-gray-400" />
                <span dir="ltr">{detail.email}</span>
              </div>
              {detail.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={15} className="shrink-0 text-gray-400" />
                  <span dir="ltr">{detail.phone}</span>
                </div>
              )}
              {detail.company && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Building2 size={15} className="shrink-0 text-gray-400" />
                  <span>{detail.company}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={15} className="shrink-0 text-gray-400" />
                <span>נוצר: {formatDate(detail.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={15} className="shrink-0 text-gray-400" />
                <span>עודכן: {formatDate(detail.updatedAt)}</span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <DetailField label="מקור" value={SOURCE_LABELS[detail.source] ?? detail.source} />
              {detail.referredBy && <DetailField label="הופנה על ידי" value={detail.referredBy} />}
              {detail.estimatedValue !== undefined && (
                <DetailField label="ערך משוער" value={formatCurrency(detail.estimatedValue)} />
              )}
              {detail.archivedAt && (
                <DetailField label="תאריך ארכיון" value={formatDateShort(detail.archivedAt)} />
              )}
            </div>

            {/* Message */}
            {detail.message && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">הודעה ראשונית</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {detail.message}
                </p>
              </div>
            )}

            {/* Description */}
            {detail.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">תיאור</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.description}</p>
              </div>
            )}

            {/* Services interested */}
            {detail.servicesInterested && detail.servicesInterested.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">שירותים מבוקשים</p>
                <div className="flex flex-wrap gap-1">
                  {detail.servicesInterested.map((s) => (
                    <span key={s} className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {detail.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">הערות</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.notes}</p>
              </div>
            )}

            {/* ─── Activity Timeline ─── */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                היסטוריית פעילות
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 mr-2">
                  {detail.activities.length}
                </span>
              </p>
              {detail.activities.length === 0 ? (
                <p className="text-sm text-gray-400">אין פעילות רשומה עדיין</p>
              ) : (
                <ol className="relative border-r border-gray-200 pr-4 space-y-4">
                  {detail.activities.map((act) => (
                    <li key={act._id} className="relative">
                      {/* Dot */}
                      <span className="absolute -right-[1.125rem] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wdi-primary/10 ring-2 ring-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-wdi-primary" />
                      </span>
                      <div className="pr-1">
                        <p className="text-xs font-semibold text-gray-800">
                          {ACTIVITY_TYPES[act.type] ?? act.type}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5 leading-snug">{act.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            {act.performedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatDate(act.createdAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </SlidePanel>

      {/* ─── Status transition confirm ─── */}
      <ConfirmDialog
        open={!!transitionTarget}
        title="שינוי סטטוס"
        message={`לשנות סטטוס ל-${STATUS_LABELS[transitionTarget ?? ''] ?? transitionTarget}?`}
        confirmLabel="אשר"
        onConfirm={() => transitionTarget && handleTransition(transitionTarget)}
        onCancel={() => setTransitionTarget(null)}
      />

      {/* ─── Archive confirm ─── */}
      <ConfirmDialog
        open={archiveConfirm}
        title="העברה לארכיון"
        message="הליד יועבר לארכיון. ניתן לשחזרו בכל עת."
        confirmLabel="העבר לארכיון"
        onConfirm={handleArchive}
        onCancel={() => setArchiveConfirm(false)}
      />

      {/* ─── Restore confirm ─── */}
      <ConfirmDialog
        open={restoreConfirm}
        title="שחזור מהארכיון"
        message="הליד ישוחזר לסטטוס הקודם שלו."
        confirmLabel="שחזר"
        onConfirm={handleRestore}
        onCancel={() => setRestoreConfirm(false)}
      />

      {/* ─── Bulk archive confirm ─── */}
      <ConfirmDialog
        open={bulkConfirm === 'archive'}
        title="העברה לארכיון (מרוכז)"
        message={`להעביר ${selected.size} לידים לארכיון?`}
        confirmLabel="העבר לארכיון"
        variant="danger"
        onConfirm={handleBulkArchive}
        onCancel={() => setBulkConfirm(null)}
      />

      {/* ─── Bulk status change confirm ─── */}
      <ConfirmDialog
        open={bulkConfirm === 'status'}
        title="שינוי סטטוס (מרוכז)"
        message={`לשנות סטטוס של ${selected.size} לידים ל-${STATUS_LABELS[bulkStatus] ?? bulkStatus}?`}
        confirmLabel="עדכן"
        onConfirm={handleBulkStatus}
        onCancel={() => setBulkConfirm(null)}
      />

      {/* ─── Convert to client dialog ─── */}
      {convertOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" dir="rtl">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-wdi-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">המרה ללקוח</h3>
            <p className="text-sm text-gray-500 mb-5">
              ייווצרו רשומת לקוח והתקשרות חדשה. ניתן להשאיר ריק לערכי ברירת מחדל.
            </p>
            <ErrorRenderer error={convertLifecycle.error} onDismiss={convertLifecycle.reset} />
            <div className="space-y-3">
              <div>
                <label className={labelCls}>כותרת התקשרות</label>
                <input
                  type="text"
                  value={convertForm.engagementTitle}
                  onChange={(e) => setConvertForm((p) => ({ ...p, engagementTitle: e.target.value }))}
                  className={inputCls}
                  placeholder={`${detail?.name ?? ''} — התקשרות`}
                />
              </div>
              <div>
                <label className={labelCls}>סוג התקשרות</label>
                <input
                  type="text"
                  value={convertForm.engagementType}
                  onChange={(e) => setConvertForm((p) => ({ ...p, engagementType: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>ערך התקשרות (₪)</label>
                <input
                  type="number"
                  min={0}
                  value={convertForm.engagementValue}
                  onChange={(e) => setConvertForm((p) => ({ ...p, engagementValue: e.target.value }))}
                  className={inputCls}
                  dir="ltr"
                  placeholder={detail?.estimatedValue ? String(detail.estimatedValue) : '0'}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConvert}
                disabled={convertLifecycle.isLocked}
                className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                type="button"
              >
                <CheckCircle size={16} />
                {convertLifecycle.isLocked ? 'ממיר...' : 'המר ללקוח'}
              </button>
              <button
                onClick={() => { setConvertOpen(false); convertLifecycle.reset(); }}
                disabled={convertLifecycle.isLocked}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                type="button"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Manual activity log modal ─── */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" dir="rtl">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-wdi-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">תיעוד פעילות</h3>
            <ErrorRenderer error={activityLifecycle.error} onDismiss={activityLifecycle.reset} />
            <div className="space-y-4">
              <div>
                <label className={labelCls}>סוג פעילות</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className={inputCls}
                >
                  {MANUAL_ACTIVITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {activityType === 'call_logged' && (
                <div>
                  <label className={labelCls}>משך שיחה (דקות)</label>
                  <input
                    type="number"
                    min={0}
                    value={activityCallDuration}
                    onChange={(e) => setActivityCallDuration(e.target.value)}
                    className={inputCls}
                    dir="ltr"
                  />
                </div>
              )}

              {['quote_sent', 'quote_accepted', 'quote_rejected'].includes(activityType) && (
                <div>
                  <label className={labelCls}>סכום הצעת מחיר (₪)</label>
                  <input
                    type="number"
                    min={0}
                    value={activityQuoteAmount}
                    onChange={(e) => setActivityQuoteAmount(e.target.value)}
                    className={inputCls}
                    dir="ltr"
                  />
                </div>
              )}

              <div>
                <label className={labelCls}>פרטים / הערות *</label>
                <textarea
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="תיאור הפעילות..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleLogActivity}
                disabled={activityLifecycle.isLocked || !activityNotes.trim()}
                className="rounded-lg bg-wdi-primary px-4 py-2 font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
                type="button"
              >
                {activityLifecycle.isLocked ? 'שומר...' : 'תעד'}
              </button>
              <button
                onClick={() => { setActivityModalOpen(false); activityLifecycle.reset(); }}
                disabled={activityLifecycle.isLocked}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                type="button"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helper sub-component ──────────────────────────────

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
