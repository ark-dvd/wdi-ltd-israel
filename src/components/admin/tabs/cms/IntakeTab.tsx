'use client';

/**
 * IntakeTab — Admin panel for intake submissions triage.
 * CANONICAL-AMENDMENT-001
 * Lists submissions, filters, click-to-triage via SlidePanel.
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiList, apiGet, apiFetch, type ErrorEnvelope, type SuccessEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { SlidePanel } from '../../SlidePanel';
import { ErrorRenderer } from '../../ErrorRenderer';
import { useToast } from '../../Toast';

// ─── Types & constants ───────────────────────────────────────

interface AuditEntry {
  timestamp: string;
  operatorEmail: string;
  field: string;
  previousValue: string;
  newValue: string;
}

interface IntakeSubmission {
  _id: string;
  submissionType: string;
  submittedAt: string;
  source: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  organization?: string;
  subject?: string;
  message?: string;
  cvFileUrl?: string;
  positionAppliedFor?: string;
  supplierCategory?: string;
  supplierExperience?: string;
  contactStatus: string;
  relevance: string;
  outcome: string;
  internalNotes?: string;
  auditTrail?: AuditEntry[];
}

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  general: 'פנייה כללית',
  job_application: 'מועמדות',
  supplier_application: 'ספק',
};

const CONTACT_STATUS_LABELS: Record<string, string> = {
  not_contacted: 'טרם נוצר קשר',
  contacted: 'נוצר קשר',
};

const RELEVANCE_LABELS: Record<string, string> = {
  not_assessed: 'טרם הוערך',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
};

const OUTCOME_OPTIONS: Record<string, { value: string; label: string }[]> = {
  general: [
    { value: 'pending', label: 'ממתין' },
    { value: 'converted_to_client', label: 'הומר ללקוח' },
    { value: 'not_converted', label: 'לא הומר' },
  ],
  job_application: [
    { value: 'pending', label: 'ממתין' },
    { value: 'rejected', label: 'נדחה' },
    { value: 'in_process', label: 'בתהליך' },
    { value: 'hired', label: 'גויס' },
  ],
  supplier_application: [
    { value: 'pending', label: 'ממתין' },
    { value: 'rejected', label: 'נדחה' },
    { value: 'in_review', label: 'בבדיקה' },
    { value: 'added_to_database', label: 'נוסף למאגר' },
  ],
};

const ALL_OUTCOME_LABELS: Record<string, string> = {
  pending: 'ממתין',
  converted_to_client: 'הומר ללקוח',
  not_converted: 'לא הומר',
  rejected: 'נדחה',
  in_process: 'בתהליך',
  hired: 'גויס',
  in_review: 'בבדיקה',
  added_to_database: 'נוסף למאגר',
};

const FIELD_LABELS: Record<string, string> = {
  contactStatus: 'סטטוס קשר',
  relevance: 'רלוונטיות',
  outcome: 'תוצאה',
  internalNotes: 'הערות פנימיות',
};

// ─── Badge helpers ───────────────────────────────────────────

function typeBadge(type: string) {
  const colors: Record<string, string> = {
    general: 'bg-blue-100 text-blue-700',
    job_application: 'bg-purple-100 text-purple-700',
    supplier_application: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[type] ?? 'bg-gray-100 text-gray-700'}`}>
      {SUBMISSION_TYPE_LABELS[type] ?? type}
    </span>
  );
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    not_contacted: 'bg-red-100 text-red-700',
    contacted: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {CONTACT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function relevanceBadge(rel: string) {
  const colors: Record<string, string> = {
    not_assessed: 'bg-gray-100 text-gray-600',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[rel] ?? 'bg-gray-100 text-gray-700'}`}>
      {RELEVANCE_LABELS[rel] ?? rel}
    </span>
  );
}

function outcomeBadge(outcome: string) {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    converted_to_client: 'bg-green-100 text-green-700',
    not_converted: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    in_process: 'bg-blue-100 text-blue-700',
    hired: 'bg-green-100 text-green-700',
    in_review: 'bg-yellow-100 text-yellow-700',
    added_to_database: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[outcome] ?? 'bg-gray-100 text-gray-700'}`}>
      {ALL_OUTCOME_LABELS[outcome] ?? outcome}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('he-IL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Component ───────────────────────────────────────────────

export function IntakeTab() {
  const [items, setItems] = useState<IntakeSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRelevance, setFilterRelevance] = useState('');

  // Detail / triage panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [detail, setDetail] = useState<IntakeSubmission | null>(null);
  const [triageForm, setTriageForm] = useState({
    contactStatus: '',
    relevance: '',
    outcome: '',
    internalNotes: '',
  });

  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  const limit = 25;

  // ─── Fetch list ──────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('contactStatus', filterStatus);
      if (filterRelevance) params.set('relevance', filterRelevance);

      const r = await apiList<IntakeSubmission>(`/api/admin/intake?${params.toString()}`);
      setItems(r.data);
      setTotal(r.total);
    } catch (e) {
      setFetchErr(e as ErrorEnvelope);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatus, filterRelevance]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ─── Open detail panel ───────────────────────────────────

  const openDetail = async (item: IntakeSubmission) => {
    reset();
    try {
      const r = await apiGet<IntakeSubmission>(`/api/admin/intake/${item._id}`);
      const doc = r.data;
      setDetail(doc);
      setTriageForm({
        contactStatus: doc.contactStatus,
        relevance: doc.relevance,
        outcome: doc.outcome,
        internalNotes: doc.internalNotes ?? '',
      });
      setPanelOpen(true);
    } catch (e) {
      addToast('שגיאה בטעינת פרטי הפנייה', 'error');
      console.error(e);
    }
  };

  // ─── Save triage ─────────────────────────────────────────

  const handleSave = async () => {
    if (!detail) return;
    const r = await execute(async () => {
      return apiFetch<IntakeSubmission>(`/api/admin/intake/${detail._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triageForm),
      });
    });
    if (r) {
      const updated = (r as SuccessEnvelope<IntakeSubmission>).data;
      setDetail(updated);
      setItems((prev) => prev.map((i) => i._id === updated._id ? { ...i, ...updated } : i));
      addToast('הפנייה עודכנה בהצלחה', 'success');
    }
  };

  // ─── Pagination ──────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ─── Render ──────────────────────────────────────────────

  if (loading && items.length === 0) {
    return <div className="p-8 text-center text-gray-500">טוען פניות...</div>;
  }
  if (fetchErr) {
    return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchItems} /></div>;
  }

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">פניות נכנסות</h1>
        <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-gray-600" type="button">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
        >
          <option value="">כל הסוגים</option>
          <option value="general">פנייה כללית</option>
          <option value="job_application">מועמדות למשרה</option>
          <option value="supplier_application">הרשמת ספק</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
        >
          <option value="">כל הסטטוסים</option>
          <option value="not_contacted">טרם נוצר קשר</option>
          <option value="contacted">נוצר קשר</option>
        </select>

        <select
          value={filterRelevance}
          onChange={(e) => { setFilterRelevance(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
        >
          <option value="">כל הרלוונטיות</option>
          <option value="not_assessed">טרם הוערך</option>
          <option value="high">גבוה</option>
          <option value="medium">בינוני</option>
          <option value="low">נמוך</option>
        </select>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-12">אין פניות</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-right">
                <th className="pb-3 pr-4 font-medium">סוג</th>
                <th className="pb-3 font-medium">שם</th>
                <th className="pb-3 font-medium">אימייל</th>
                <th className="pb-3 font-medium">תאריך</th>
                <th className="pb-3 font-medium">סטטוס קשר</th>
                <th className="pb-3 font-medium">רלוונטיות</th>
                <th className="pb-3 font-medium">תוצאה</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => openDetail(item)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="py-3 pr-4">{typeBadge(item.submissionType)}</td>
                  <td className="py-3 font-medium text-gray-900">{item.contactName}</td>
                  <td className="py-3 text-gray-600" dir="ltr">{item.contactEmail}</td>
                  <td className="py-3 text-gray-500">{formatDate(item.submittedAt)}</td>
                  <td className="py-3">{statusBadge(item.contactStatus)}</td>
                  <td className="py-3">{relevanceBadge(item.relevance)}</td>
                  <td className="py-3">{outcomeBadge(item.outcome)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
            type="button"
          >
            הקודם
          </button>
          <span className="text-sm text-gray-500">
            עמוד {page} מתוך {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
            type="button"
          >
            הבא
          </button>
        </div>
      )}

      {/* Detail / Triage SlidePanel */}
      <SlidePanel
        open={panelOpen}
        title="פרטי פנייה"
        onClose={() => setPanelOpen(false)}
        wide
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isLocked}
              className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50"
              type="button"
            >
              {isLocked ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        }
      >
        {detail && (
          <div className="space-y-6">
            <ErrorRenderer error={mutErr} onReload={fetchItems} onDismiss={reset} />

            {/* Submission details (readonly) */}
            <section>
              <h3 className="text-base font-bold text-gray-900 mb-3 border-b pb-2">פרטי הפנייה</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-500">סוג פנייה:</span>
                  <span className="mr-2">{typeBadge(detail.submissionType)}</span>
                </div>
                <div>
                  <span className="text-gray-500">מקור:</span>
                  <span className="mr-2 text-gray-900">{detail.source === 'website_form' ? 'טופס אתר' : 'ידני'}</span>
                </div>
                <div>
                  <span className="text-gray-500">שם:</span>
                  <span className="mr-2 text-gray-900 font-medium">{detail.contactName}</span>
                </div>
                <div>
                  <span className="text-gray-500">אימייל:</span>
                  <span className="mr-2 text-gray-900" dir="ltr">{detail.contactEmail}</span>
                </div>
                {detail.contactPhone && (
                  <div>
                    <span className="text-gray-500">טלפון:</span>
                    <span className="mr-2 text-gray-900" dir="ltr">{detail.contactPhone}</span>
                  </div>
                )}
                {detail.organization && (
                  <div>
                    <span className="text-gray-500">ארגון:</span>
                    <span className="mr-2 text-gray-900">{detail.organization}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-gray-500">תאריך הגשה:</span>
                  <span className="mr-2 text-gray-900">{formatDate(detail.submittedAt)}</span>
                </div>
              </div>

              {/* Type-specific fields */}
              {detail.subject && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">נושא:</span>
                  <span className="mr-2 text-gray-900">{detail.subject}</span>
                </div>
              )}
              {detail.message && (
                <div className="mt-3 text-sm">
                  <p className="text-gray-500 mb-1">הודעה:</p>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detail.message}</p>
                </div>
              )}
              {detail.positionAppliedFor && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">תפקיד מבוקש:</span>
                  <span className="mr-2 text-gray-900">{detail.positionAppliedFor}</span>
                </div>
              )}
              {detail.cvFileUrl && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">קו&quot;ח:</span>
                  <a href={detail.cvFileUrl} target="_blank" rel="noopener noreferrer" className="mr-2 text-wdi-primary underline">צפייה</a>
                </div>
              )}
              {detail.supplierCategory && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">תחום התמחות:</span>
                  <span className="mr-2 text-gray-900">{detail.supplierCategory}</span>
                </div>
              )}
              {detail.supplierExperience && (
                <div className="mt-3 text-sm">
                  <p className="text-gray-500 mb-1">ניסיון:</p>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detail.supplierExperience}</p>
                </div>
              )}
            </section>

            {/* Triage section (editable) */}
            <section>
              <h3 className="text-base font-bold text-gray-900 mb-3 border-b pb-2">מיון ומעקב</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס קשר</label>
                  <select
                    value={triageForm.contactStatus}
                    onChange={(e) => setTriageForm((p) => ({ ...p, contactStatus: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
                  >
                    <option value="not_contacted">טרם נוצר קשר</option>
                    <option value="contacted">נוצר קשר</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רלוונטיות</label>
                  <select
                    value={triageForm.relevance}
                    onChange={(e) => setTriageForm((p) => ({ ...p, relevance: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
                  >
                    <option value="not_assessed">טרם הוערך</option>
                    <option value="high">גבוה</option>
                    <option value="medium">בינוני</option>
                    <option value="low">נמוך</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תוצאה</label>
                  <select
                    value={triageForm.outcome}
                    onChange={(e) => setTriageForm((p) => ({ ...p, outcome: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary"
                  >
                    {(OUTCOME_OPTIONS[detail?.submissionType ?? 'general'] ?? OUTCOME_OPTIONS['general']!).map((opt: { value: string; label: string }) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">הערות פנימיות</label>
                  <textarea
                    value={triageForm.internalNotes}
                    onChange={(e) => setTriageForm((p) => ({ ...p, internalNotes: e.target.value }))}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary resize-y"
                    placeholder="הערות פנימיות..."
                  />
                </div>
              </div>
            </section>

            {/* Audit trail */}
            {detail.auditTrail && detail.auditTrail.length > 0 && (
              <section>
                <h3 className="text-base font-bold text-gray-900 mb-3 border-b pb-2">היסטוריית שינויים</h3>
                <div className="space-y-2">
                  {detail.auditTrail.map((entry, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          {FIELD_LABELS[entry.field] ?? entry.field}
                        </span>
                        <span className="text-gray-400 text-xs">{formatDate(entry.timestamp)}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="line-through text-red-400">{entry.previousValue || '(ריק)'}</span>
                        {' '}
                        <span className="text-green-600">{entry.newValue}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1" dir="ltr">{entry.operatorEmail}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
