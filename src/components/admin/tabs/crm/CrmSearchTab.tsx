'use client';

/**
 * Global CRM Search — DOC-030 §10, DOC-050 §26
 * Searches across leads, clients and engagements.
 * Results grouped by entity type. 300ms debounce, min 2 chars.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, TrendingUp, Handshake, Loader2 } from 'lucide-react';
import { apiGet, type ErrorEnvelope } from '@/lib/api/client';
import { ErrorRenderer } from '../../ErrorRenderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchLead {
  _id: string;
  name: string;
  email?: string;
  status: string;
  source?: string;
  estimatedValue?: number;
  updatedAt: string;
}

interface SearchClient {
  _id: string;
  name: string;
  contactEmail?: string;
  status: string;
  industry?: string;
  updatedAt: string;
}

interface SearchEngagement {
  _id: string;
  title: string;
  client: string;
  engagementType?: string;
  status: string;
  value?: number;
  updatedAt: string;
}

interface SearchResults {
  leads: SearchLead[];
  clients: SearchClient[];
  engagements: SearchEngagement[];
}

// ---------------------------------------------------------------------------
// Label / badge maps
// ---------------------------------------------------------------------------

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'חדש',
  contacted: 'נוצר קשר',
  qualified: 'מתאים',
  proposal_sent: 'הצעה נשלחה',
  won: 'נסגר בהצלחה',
  lost: 'לא רלוונטי',
  archived: 'בארכיון',
};

const CLIENT_STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  completed: 'הושלם',
  inactive: 'לא פעיל',
  prospect: 'פוטנציאלי',
};

const ENGAGEMENT_STATUS_LABELS: Record<string, string> = {
  new: 'חדש',
  in_progress: 'בביצוע',
  review: 'בבדיקה',
  delivered: 'נמסר',
  completed: 'הושלם',
  paused: 'מושהה',
  cancelled: 'בוטל',
};

const LEAD_STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-indigo-100 text-indigo-700',
  proposal_sent: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};

const CLIENT_STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-teal-100 text-teal-700',
  inactive: 'bg-gray-100 text-gray-500',
  prospect: 'bg-sky-100 text-sky-700',
};

const ENGAGEMENT_STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  review: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatValue(v?: number, currency = '₪'): string {
  if (v == null) return '';
  return `${currency}${v.toLocaleString('he-IL')}`;
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}

function SectionHeader({ icon, label, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="font-semibold text-gray-700 text-sm">{label}</span>
      <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 font-medium">{count}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result row
// ---------------------------------------------------------------------------

interface ResultRowProps {
  onClick: () => void;
  children: React.ReactNode;
}

function ResultRow({ onClick, children }: ResultRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-right bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-wdi-primary/30 hover:shadow-wdi-sm transition flex items-center justify-between gap-3"
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CrmSearchTab() {
  const router = useRouter();

  const [query, setQuery]           = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults]       = useState<SearchResults | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<ErrorEnvelope | null>(null);
  const timer                       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Debounce query
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  // ---------------------------------------------------------------------------
  // Fetch results
  // ---------------------------------------------------------------------------

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setError(null); return; }
    setLoading(true); setError(null);
    try {
      const r = await apiGet<SearchResults>(`/api/admin/crm-search?q=${encodeURIComponent(q)}`);
      setResults(r.data);
    } catch (e) { setError(e as ErrorEnvelope); setResults(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResults(debouncedQuery); }, [debouncedQuery, fetchResults]);

  // ---------------------------------------------------------------------------
  // Clear
  // ---------------------------------------------------------------------------

  const handleClear = () => {
    setQuery(''); setDebouncedQuery(''); setResults(null); setError(null);
    inputRef.current?.focus();
  };

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const goToLead = (id: string) => router.push(`/admin?tab=leads&selected=${id}`);
  const goToClient = (id: string) => router.push(`/admin?tab=clients-crm&selected=${id}`);
  const goToEngagement = (id: string) => router.push(`/admin?tab=engagements&selected=${id}`);

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const totalResults = results
    ? results.leads.length + results.clients.length + results.engagements.length
    : 0;

  const hasResults = results !== null && totalResults > 0;
  const isEmptyResult = results !== null && totalResults === 0 && debouncedQuery.length >= 2 && !loading;

  return (
    <div className="p-6" dir="rtl">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">חיפוש CRM</h1>
        <p className="text-sm text-gray-500 mt-0.5">חפש לידים, לקוחות והתקשרויות</p>
      </div>

      {/* Search input */}
      <div className="relative max-w-xl mb-6">
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          {loading
            ? <Loader2 size={18} className="text-wdi-primary animate-spin" />
            : <Search size={18} className="text-gray-400" />
          }
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש... (מינימום 2 תווים)"
          className="w-full rounded-xl border border-gray-300 pr-10 pl-10 py-3 text-sm shadow-wdi-sm focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 outline-none transition"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="נקה חיפוש"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Hint */}
      {!query && (
        <p className="text-sm text-gray-400 text-center py-12">
          הזן לפחות 2 תווים כדי לחפש
        </p>
      )}

      {query.length === 1 && (
        <p className="text-sm text-gray-400 text-center py-12">
          הזן לפחות תו נוסף אחד...
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-xl">
          <ErrorRenderer error={error} onReload={() => fetchResults(debouncedQuery)} />
        </div>
      )}

      {/* Empty state */}
      {isEmptyResult && (
        <div className="text-center py-12">
          <Search size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            לא נמצאו תוצאות עבור &lsquo;{debouncedQuery}&rsquo;
          </p>
          <p className="text-sm text-gray-400 mt-1">נסה מונח חיפוש אחר</p>
          <button
            type="button"
            onClick={handleClear}
            className="mt-4 text-sm text-wdi-primary hover:underline"
          >
            נקה חיפוש
          </button>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="max-w-2xl space-y-6">

          {/* Summary */}
          <p className="text-sm text-gray-500">
            נמצאו <span className="font-semibold text-gray-700">{totalResults}</span> תוצאות עבור &lsquo;{debouncedQuery}&rsquo;
          </p>

          {/* Leads */}
          {results!.leads.length > 0 && (
            <section>
              <SectionHeader
                icon={<TrendingUp size={16} className="text-blue-600" />}
                label="לידים"
                count={results!.leads.length}
              />
              <div className="space-y-2">
                {results!.leads.map((lead) => (
                  <ResultRow key={lead._id} onClick={() => goToLead(lead._id)}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{lead.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {[lead.email, lead.source].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lead.estimatedValue != null && (
                        <span className="text-sm font-medium text-wdi-primary">
                          {formatValue(lead.estimatedValue)}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEAD_STATUS_BADGE[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </div>
                  </ResultRow>
                ))}
              </div>
            </section>
          )}

          {/* Clients */}
          {results!.clients.length > 0 && (
            <section>
              <SectionHeader
                icon={<Users size={16} className="text-green-600" />}
                label="לקוחות"
                count={results!.clients.length}
              />
              <div className="space-y-2">
                {results!.clients.map((client) => (
                  <ResultRow key={client._id} onClick={() => goToClient(client._id)}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{client.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {[client.contactEmail, client.industry].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CLIENT_STATUS_BADGE[client.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {CLIENT_STATUS_LABELS[client.status] ?? client.status}
                    </span>
                  </ResultRow>
                ))}
              </div>
            </section>
          )}

          {/* Engagements */}
          {results!.engagements.length > 0 && (
            <section>
              <SectionHeader
                icon={<Handshake size={16} className="text-purple-600" />}
                label="התקשרויות"
                count={results!.engagements.length}
              />
              <div className="space-y-2">
                {results!.engagements.map((eng) => (
                  <ResultRow key={eng._id} onClick={() => goToEngagement(eng._id)}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{eng.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {[eng.client, eng.engagementType].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {eng.value != null && (
                        <span className="text-sm font-medium text-wdi-primary">
                          {formatValue(eng.value)}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENGAGEMENT_STATUS_BADGE[eng.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ENGAGEMENT_STATUS_LABELS[eng.status] ?? eng.status}
                      </span>
                    </div>
                  </ResultRow>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
