'use client';

/**
 * ClientsCrmTab — DOC-030 §5
 * CRM Clients management: list, detail panel, status transitions,
 * archive/restore, edit/create, activity timeline, bulk operations.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, RefreshCw, Archive, RotateCcw, ArrowLeftRight, MessageSquarePlus,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiList, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useToast } from '../../Toast';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer, FieldError } from '../../ErrorRenderer';
import { ConfirmDialog } from '../../ConfirmDialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ClientStatus = 'active' | 'completed' | 'inactive' | 'archived';
type PreferredContact = 'טלפון' | 'אימייל' | 'הודעה';

interface ActivityEntry {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  performedBy?: string;
  metadata?: Record<string, unknown>;
}

interface Engagement {
  _id: string;
  title?: string;
  status?: string;
  value?: number;
  createdAt?: string;
}

interface ClientCrm {
  _id: string;
  name: string;
  email: string;
  status: ClientStatus;
  company?: string;
  phone?: string;
  address?: string;
  preferredContact?: PreferredContact;
  notes?: string;
  updatedAt: string;
  createdAt?: string;
  sourceLead?: { _id: string; name: string; status: string } | null;
  engagementCount?: number;
  totalEngagementValue?: number;
  activities?: ActivityEntry[];
  engagements?: Engagement[];
}

type StatusFilter = 'all' | ClientStatus;
type BulkAction = 'archive' | 'status_change';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'פעיל',
  completed: 'הושלם',
  inactive: 'לא פעיל',
  archived: 'בארכיון',
};

const STATUS_COLORS: Record<ClientStatus, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  inactive: 'bg-gray-100 text-gray-500',
  archived: 'bg-amber-100 text-amber-700',
};

// Allowed transitions per source status
const TRANSITIONS: Record<ClientStatus, ClientStatus[]> = {
  active: ['completed', 'inactive'],
  completed: ['inactive'],
  inactive: ['active'],
  archived: [],
};

const TRANSITION_LABELS: Record<ClientStatus, string> = {
  active: 'הפוך לפעיל',
  completed: 'סמן כהושלם',
  inactive: 'הפוך ללא פעיל',
  archived: 'בארכיון',
};

const STATUS_FILTERS: [StatusFilter, string][] = [
  ['all', 'הכל'],
  ['active', 'פעיל'],
  ['completed', 'הושלם'],
  ['inactive', 'לא פעיל'],
  ['archived', 'בארכיון'],
];

const PREFERRED_CONTACT_OPTIONS: PreferredContact[] = ['טלפון', 'אימייל', 'הודעה'];

const INPUT_CLS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary outline-none transition';

const emptyForm = (): Partial<ClientCrm> => ({
  name: '',
  email: '',
  company: '',
  phone: '',
  address: '',
  preferredContact: undefined,
  notes: '',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientsCrmTab() {
  // List state
  const [items, setItems] = useState<ClientCrm[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Detail panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState<ClientCrm | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<ErrorEnvelope | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);

  // Edit form state
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [form, setForm] = useState<Partial<ClientCrm>>(emptyForm());

  // Manual activity note
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Confirm dialogs
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
  const [transitionConfirm, setTransitionConfirm] = useState<{
    id: string;
    targetStatus: ClientStatus;
    updatedAt: string;
  } | null>(null);

  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>('archive');
  const [bulkTargetStatus, setBulkTargetStatus] = useState<ClientStatus>('completed');
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const { error: mutErr, isLocked, execute, reset: resetMut } = useRequestLifecycle();
  const { addToast } = useToast();

  // ---------------------------------------------------------------------------
  // Fetch list
  // ---------------------------------------------------------------------------

  const fetchList = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const url =
        statusFilter === 'all'
          ? '/api/admin/clients-crm'
          : `/api/admin/clients-crm?status=${statusFilter}`;
      const res = await apiList<ClientCrm>(url);
      setItems(res.data);
      setTotal(res.total);
    } catch (e) {
      setFetchErr(e as ErrorEnvelope);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ---------------------------------------------------------------------------
  // Fetch detail
  // ---------------------------------------------------------------------------

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailErr(null);
    try {
      const res = await apiGet<ClientCrm>(`/api/admin/clients-crm/${id}`);
      setSelected(res.data);
    } catch (e) {
      setDetailErr(e as ErrorEnvelope);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Panel open helpers
  // ---------------------------------------------------------------------------

  const openDetail = (item: ClientCrm) => {
    setCreateMode(false);
    setEditMode(false);
    setForm(emptyForm());
    setNoteText('');
    resetMut();
    setDetailErr(null);
    setEngagements([]);
    setPanelOpen(true);
    fetchDetail(item._id);
  };

  const openCreate = () => {
    setSelected(null);
    setCreateMode(true);
    setEditMode(false);
    setForm(emptyForm());
    resetMut();
    setDetailErr(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelected(null);
    setCreateMode(false);
    setEditMode(false);
    resetMut();
    setDetailErr(null);
    setNoteText('');
  };

  const enterEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      email: selected.email,
      company: selected.company ?? '',
      phone: selected.phone ?? '',
      address: selected.address ?? '',
      preferredContact: selected.preferredContact,
      notes: '',
    });
    setEditMode(true);
    resetMut();
  };

  const cancelEdit = () => {
    setEditMode(false);
    resetMut();
  };

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  const setField = <K extends keyof ClientCrm>(k: K, v: ClientCrm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  const handleCreate = async () => {
    const res = await execute(() =>
      apiPost<ClientCrm>('/api/admin/clients-crm', form),
    );
    if (res) {
      const created = (res as { data: ClientCrm }).data;
      setItems((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      closePanel();
      addToast('לקוח נוצר בהצלחה', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Edit / Save
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    if (!selected) return;
    const res = await execute(() =>
      apiPut<ClientCrm>(`/api/admin/clients-crm/${selected._id}`, {
        ...form,
        updatedAt: selected.updatedAt,
      }),
    );
    if (res) {
      const updated = (res as { data: ClientCrm }).data;
      setItems((prev) =>
        prev.map((i) => (i._id === selected._id ? { ...i, ...updated } : i)),
      );
      setSelected(updated);
      setEditMode(false);
      addToast('לקוח עודכן בהצלחה', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Status transition
  // ---------------------------------------------------------------------------

  const handleTransition = async () => {
    if (!transitionConfirm) return;
    const { id, targetStatus, updatedAt } = transitionConfirm;
    const res = await execute(() =>
      apiPost<ClientCrm>(`/api/admin/clients-crm/${id}/transition`, {
        targetStatus,
        updatedAt,
      }),
    );
    if (res) {
      const updated = (res as { data: ClientCrm }).data;
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, ...updated } : i)),
      );
      if (selected?._id === id) {
        setSelected(updated);
      }
      setTransitionConfirm(null);
      addToast(`סטטוס שונה ל${STATUS_LABELS[targetStatus]}`, 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Archive
  // ---------------------------------------------------------------------------

  const handleArchive = async () => {
    if (!archiveConfirm) return;
    const item = items.find((i) => i._id === archiveConfirm) ?? selected;
    if (!item) return;
    const res = await execute(() =>
      apiPost<ClientCrm>(`/api/admin/clients-crm/${item._id}/archive`, {
        updatedAt: item.updatedAt,
      }),
    );
    if (res) {
      const updated = (res as { data: ClientCrm }).data;
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, ...updated } : i)),
      );
      if (selected?._id === item._id) setSelected(updated);
      setArchiveConfirm(null);
      addToast('לקוח הועבר לארכיון', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Restore
  // ---------------------------------------------------------------------------

  const handleRestore = async () => {
    if (!restoreConfirm) return;
    const item = items.find((i) => i._id === restoreConfirm) ?? selected;
    if (!item) return;
    const res = await execute(() =>
      apiPost<ClientCrm>(`/api/admin/clients-crm/${item._id}/restore`, {
        updatedAt: item.updatedAt,
      }),
    );
    if (res) {
      const updated = (res as { data: ClientCrm }).data;
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, ...updated } : i)),
      );
      if (selected?._id === item._id) setSelected(updated);
      setRestoreConfirm(null);
      addToast('לקוח שוחזר מארכיון', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Manual note / activity log
  // ---------------------------------------------------------------------------

  const handleAddNote = async () => {
    if (!selected || !noteText.trim()) return;
    setNoteLoading(true);
    try {
      const res = await apiPut<ClientCrm>(
        `/api/admin/clients-crm/${selected._id}`,
        { notes: noteText.trim(), updatedAt: selected.updatedAt },
      );
      const updated = (res as { data: ClientCrm }).data;
      setSelected((prev) => (prev ? { ...prev, ...updated } : prev));
      setItems((prev) =>
        prev.map((i) => (i._id === selected._id ? { ...i, ...updated } : i)),
      );
      setNoteText('');
      addToast('הערה נוספה בהצלחה', 'success');
      // Refresh activities
      fetchDetail(selected._id);
    } catch (e) {
      addToast((e as ErrorEnvelope).message ?? 'שגיאה בהוספת הערה', 'error');
    } finally {
      setNoteLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Bulk operations
  // ---------------------------------------------------------------------------

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i._id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulk = async () => {
    const ids = Array.from(selectedIds);
    const concurrencyTokens: Record<string, string> = {};
    for (const id of ids) {
      const item = items.find((i) => i._id === id);
      if (item) concurrencyTokens[id] = item.updatedAt;
    }

    const body: Record<string, unknown> = {
      action: bulkAction,
      ids,
      concurrencyTokens,
    };
    if (bulkAction === 'status_change') {
      body.targetStatus = bulkTargetStatus;
    }

    const res = await execute(() =>
      apiPost<{ affected: number }>('/api/admin/clients-crm/bulk', body),
    );
    if (res) {
      setBulkConfirm(false);
      setSelectedIds(new Set());
      addToast(
        `פעולה בוצעה על ${(res as { data: { affected: number } }).data.affected} לקוחות`,
        'success',
      );
      fetchList();
    }
  };

  // ---------------------------------------------------------------------------
  // Computed helpers for detail panel
  // ---------------------------------------------------------------------------

  const allowedTransitions: ClientStatus[] =
    selected ? TRANSITIONS[selected.status] : [];

  // ---------------------------------------------------------------------------
  // Render: loading / error state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500" dir="rtl">
        טוען נתוני לקוחות...
      </div>
    );
  }

  if (fetchErr) {
    return (
      <div className="p-8" dir="rtl">
        <ErrorRenderer error={fetchErr} onReload={fetchList} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">לקוחות CRM</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} לקוחות סה&quot;כ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchList}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            type="button"
            title="רענן"
            aria-label="רענן"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition"
            type="button"
          >
            <Plus size={16} />
            לקוח חדש
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === key
                ? 'bg-wdi-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 rounded-lg border border-wdi-primary/30 bg-wdi-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-gray-700">
            {selectedIds.size} נבחרו
          </span>
          <div className="flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as BulkAction)}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary outline-none"
            >
              <option value="archive">העבר לארכיון</option>
              <option value="status_change">שינוי סטטוס</option>
            </select>
            {bulkAction === 'status_change' && (
              <select
                value={bulkTargetStatus}
                onChange={(e) =>
                  setBulkTargetStatus(e.target.value as ClientStatus)
                }
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary outline-none"
              >
                {(['active', 'completed', 'inactive'] as ClientStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ),
                )}
              </select>
            )}
            <button
              onClick={() => setBulkConfirm(true)}
              disabled={isLocked}
              type="button"
              className="rounded-lg bg-wdi-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
            >
              בצע
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            type="button"
            className="mr-auto text-xs text-gray-500 hover:text-gray-700"
          >
            בטל בחירה
          </button>
        </div>
      )}

      {/* Table */}
      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-16">אין לקוחות להצגה</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-right w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === items.length && items.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-right">שם</th>
                <th className="px-4 py-3 text-right">אימייל</th>
                <th className="px-4 py-3 text-right">חברה</th>
                <th className="px-4 py-3 text-right">סטטוס</th>
                <th className="px-4 py-3 text-right">עדכון אחרון</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => openDetail(item)}
                >
                  <td
                    className="px-4 py-3 w-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item._id)}
                      onChange={() => toggleSelectItem(item._id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap" dir="ltr">
                    {item.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.company ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(item.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Detail / Create SlidePanel                                          */}
      {/* ------------------------------------------------------------------ */}
      <SlidePanel
        open={panelOpen}
        title={
          createMode
            ? 'לקוח חדש'
            : editMode
            ? 'עריכת לקוח'
            : selected?.name ?? 'פרטי לקוח'
        }
        onClose={closePanel}
        wide
        footer={
          createMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={isLocked}
                type="button"
                className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
              >
                {isLocked ? 'שומר...' : 'צור לקוח'}
              </button>
              <button
                onClick={closePanel}
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                ביטול
              </button>
            </div>
          ) : editMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isLocked}
                type="button"
                className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
              >
                {isLocked ? 'שומר...' : 'שמור שינויים'}
              </button>
              <button
                onClick={cancelEdit}
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                ביטול
              </button>
            </div>
          ) : selected ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={enterEdit}
                type="button"
                className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition"
              >
                עריכה
              </button>

              {/* Status transition buttons */}
              {allowedTransitions.map((target) => (
                <button
                  key={target}
                  onClick={() =>
                    setTransitionConfirm({
                      id: selected._id,
                      targetStatus: target,
                      updatedAt: selected.updatedAt,
                    })
                  }
                  disabled={isLocked}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <ArrowLeftRight size={14} />
                  {TRANSITION_LABELS[target]}
                </button>
              ))}

              {/* Archive / Restore */}
              {selected.status !== 'archived' && (
                <button
                  onClick={() => setArchiveConfirm(selected._id)}
                  disabled={isLocked}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition disabled:opacity-50"
                >
                  <Archive size={14} />
                  העבר לארכיון
                </button>
              )}
              {selected.status === 'archived' && (
                <button
                  onClick={() => setRestoreConfirm(selected._id)}
                  disabled={isLocked}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  שחזר מארכיון
                </button>
              )}
            </div>
          ) : null
        }
      >
        <ErrorRenderer
          error={mutErr}
          onReload={selected ? () => fetchDetail(selected._id) : undefined}
          onDismiss={resetMut}
        />

        {/* ---- Create form ---- */}
        {createMode && (
          <ClientForm
            form={form}
            setField={setField}
            fieldErrors={mutErr?.fieldErrors}
          />
        )}

        {/* ---- Detail / Edit ---- */}
        {!createMode && (
          <>
            {detailLoading && (
              <div className="py-8 text-center text-gray-500">
                טוען פרטי לקוח...
              </div>
            )}
            {detailErr && (
              <ErrorRenderer
                error={detailErr}
                onReload={
                  selected ? () => fetchDetail(selected._id) : undefined
                }
              />
            )}
            {selected && !detailLoading && (
              <>
                {editMode ? (
                  <ClientForm
                    form={form}
                    setField={setField}
                    fieldErrors={mutErr?.fieldErrors}
                  />
                ) : (
                  <ClientDetailView client={selected} />
                )}

                {/* ---- Linked Engagements ---- */}
                {!editMode && (
                  <LinkedEngagements
                    clientId={selected._id}
                    engagementCount={selected.engagementCount ?? 0}
                    totalValue={selected.totalEngagementValue ?? 0}
                  />
                )}

                {/* ---- Activity Timeline ---- */}
                {!editMode && (
                  <div className="mt-8">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MessageSquarePlus size={16} className="text-wdi-primary" />
                      ציר פעילות
                    </h3>

                    {/* Manual note input */}
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="הוסף הערה ידנית..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddNote();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={noteLoading || !noteText.trim()}
                        type="button"
                        className="rounded-lg bg-wdi-primary px-3 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
                      >
                        {noteLoading ? '...' : 'הוסף'}
                      </button>
                    </div>

                    <ActivityTimeline
                      activities={selected.activities ?? []}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </SlidePanel>

      {/* ---- Confirm dialogs ---- */}
      <ConfirmDialog
        open={!!transitionConfirm}
        title="שינוי סטטוס"
        message={
          transitionConfirm
            ? `האם לשנות את הסטטוס ל"${STATUS_LABELS[transitionConfirm.targetStatus]}"?`
            : ''
        }
        confirmLabel="אישור שינוי"
        onConfirm={handleTransition}
        onCancel={() => setTransitionConfirm(null)}
      />

      <ConfirmDialog
        open={!!archiveConfirm}
        title="העברה לארכיון"
        message="לקוח זה יועבר לארכיון. ניתן לשחזר בכל עת."
        confirmLabel="העבר לארכיון"
        variant="danger"
        onConfirm={handleArchive}
        onCancel={() => setArchiveConfirm(null)}
      />

      <ConfirmDialog
        open={!!restoreConfirm}
        title="שחזור מארכיון"
        message="לקוח זה ישוחזר מהארכיון לסטטוס פעיל."
        confirmLabel="שחזר"
        onConfirm={handleRestore}
        onCancel={() => setRestoreConfirm(null)}
      />

      <ConfirmDialog
        open={bulkConfirm}
        title="פעולה מרוכזת"
        message={
          bulkAction === 'archive'
            ? `להעביר ${selectedIds.size} לקוחות לארכיון?`
            : `לשנות סטטוס ${selectedIds.size} לקוחות ל"${STATUS_LABELS[bulkTargetStatus]}"?`
        }
        confirmLabel="בצע"
        variant={bulkAction === 'archive' ? 'danger' : 'default'}
        onConfirm={handleBulk}
        onCancel={() => setBulkConfirm(false)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ClientFormProps {
  form: Partial<ClientCrm>;
  setField: <K extends keyof ClientCrm>(k: K, v: ClientCrm[K]) => void;
  fieldErrors?: Record<string, string>;
}

function ClientForm({ form, setField, fieldErrors }: ClientFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          שם מלא <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name ?? ''}
          onChange={(e) => setField('name', e.target.value)}
          className={INPUT_CLS}
        />
        <FieldError error={fieldErrors?.name} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          אימייל <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={form.email ?? ''}
          onChange={(e) => setField('email', e.target.value)}
          className={INPUT_CLS}
          dir="ltr"
        />
        <FieldError error={fieldErrors?.email} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          חברה
        </label>
        <input
          type="text"
          value={form.company ?? ''}
          onChange={(e) => setField('company', e.target.value)}
          className={INPUT_CLS}
        />
        <FieldError error={fieldErrors?.company} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          טלפון
        </label>
        <input
          type="tel"
          value={form.phone ?? ''}
          onChange={(e) => setField('phone', e.target.value)}
          className={INPUT_CLS}
          dir="ltr"
        />
        <FieldError error={fieldErrors?.phone} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          כתובת
        </label>
        <input
          type="text"
          value={form.address ?? ''}
          onChange={(e) => setField('address', e.target.value)}
          className={INPUT_CLS}
        />
        <FieldError error={fieldErrors?.address} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          אמצעי תקשורת מועדף
        </label>
        <select
          value={form.preferredContact ?? ''}
          onChange={(e) =>
            setField(
              'preferredContact',
              (e.target.value as PreferredContact) || undefined,
            )
          }
          className={INPUT_CLS}
        >
          <option value="">בחר...</option>
          {PREFERRED_CONTACT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <FieldError error={fieldErrors?.preferredContact} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          הערות
          <span className="text-xs text-gray-400 mr-1">(מצטברות — לא ניתן למחוק)</span>
        </label>
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setField('notes', e.target.value)}
          rows={4}
          placeholder="הוסף הערה חדשה..."
          className={INPUT_CLS}
        />
        <FieldError error={fieldErrors?.notes} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ClientDetailView({ client }: { client: ClientCrm }) {
  const rows: [string, React.ReactNode][] = [
    ['סטטוס', <StatusBadge key="s" status={client.status} />],
    ['אימייל', <span key="e" dir="ltr" className="text-gray-700">{client.email}</span>],
    ['חברה', client.company ?? '—'],
    ['טלפון', client.phone ? <span key="p" dir="ltr">{client.phone}</span> : '—'],
    ['כתובת', client.address ?? '—'],
    ['אמצעי תקשורת מועדף', client.preferredContact ?? '—'],
    ['ليד מקורי', client.sourceLead ? `${client.sourceLead.name} (${client.sourceLead.status})` : '—'],
    ['נוצר בתאריך', formatDate(client.createdAt)],
    ['עודכן לאחרונה', formatDate(client.updatedAt)],
  ];

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[160px_1fr] gap-2 items-start">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-800">{value}</dd>
          </div>
        ))}
      </dl>

      {client.notes && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">הערות</p>
          <pre className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 font-sans">
            {client.notes}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

interface LinkedEngagementsProps {
  clientId: string;
  engagementCount: number;
  totalValue: number;
}

function LinkedEngagements({
  clientId,
  engagementCount,
  totalValue,
}: LinkedEngagementsProps) {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fetched = useRef(false);

  const load = useCallback(async () => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    try {
      const res = await apiList<Engagement>(
        `/api/admin/engagements?clientId=${clientId}`,
      );
      setEngagements(res.data);
    } catch {
      // silent — count still visible
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetched.current = false;
    setEngagements([]);
    setExpanded(false);
  }, [clientId]);

  const toggle = () => {
    setExpanded((v) => !v);
    if (!expanded) load();
  };

  return (
    <div className="mt-6">
      <button
        onClick={toggle}
        type="button"
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-wdi-primary transition"
      >
        <span>
          עסקאות מקושרות{' '}
          <span className="text-gray-400 font-normal">({engagementCount})</span>
        </span>
        {totalValue > 0 && (
          <span className="text-xs text-gray-400 font-normal">
            | סה&quot;כ {totalValue.toLocaleString('he-IL')} ₪
          </span>
        )}
        <span className="text-wdi-primary">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3">
          {loading && (
            <p className="text-sm text-gray-500">טוען עסקאות...</p>
          )}
          {!loading && engagements.length === 0 && (
            <p className="text-sm text-gray-400">אין עסקאות מקושרות</p>
          )}
          {!loading && engagements.length > 0 && (
            <ul className="space-y-2">
              {engagements.map((eng) => (
                <li
                  key={eng._id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800">
                    {eng.title ?? eng._id}
                  </span>
                  <div className="flex items-center gap-3 text-gray-500">
                    {eng.status && (
                      <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                        {eng.status}
                      </span>
                    )}
                    {eng.value != null && (
                      <span>{eng.value.toLocaleString('he-IL')} ₪</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ActivityTimeline({ activities }: { activities: ActivityEntry[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        אין פעילויות רשומות
      </p>
    );
  }

  return (
    <ol className="relative border-r border-gray-200 mr-3 space-y-4">
      {activities.map((act) => (
        <li key={act._id} className="mr-6">
          <span className="absolute -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-wdi-primary ring-4 ring-white" />
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-800">
              {act.description}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-400">
              <time>{formatDate(act.createdAt)}</time>
              {act.performedBy && <span>{act.performedBy}</span>}
              <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono">
                {act.type}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
