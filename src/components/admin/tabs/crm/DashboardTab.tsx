'use client';

/**
 * CRM Dashboard Tab — DOC-030 §3.3
 * Overview stats, pipeline summary, recent leads, recent activity, quick actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Handshake, TrendingUp, Plus, ArrowLeft } from 'lucide-react';
import { apiList, apiGet, type ErrorEnvelope, type ListEnvelope } from '@/lib/api/client';
import { ErrorRenderer } from '../../ErrorRenderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Lead {
  _id: string;
  name: string;
  email?: string;
  status: string;
  source?: string;
  estimatedValue?: number;
  updatedAt: string;
}

interface Activity {
  _id: string;
  entityType?: string;
  entityId?: string;
  type: string;
  description: string;
  performedBy?: string;
  createdAt: string;
}

interface Stats {
  newLeads: number;
  activeClients: number;
  activeEngagements: number;
  pipelineValue: number;
}

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  new: 'חדש',
  contacted: 'נוצר קשר',
  qualified: 'מתאים',
  proposal_sent: 'הצעה נשלחה',
  won: 'נסגר בהצלחה',
  lost: 'לא רלוונטי',
  archived: 'בארכיון',
  active: 'פעיל',
  completed: 'הושלם',
  inactive: 'לא פעיל',
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'אתר',
  referral: 'הפניה',
  linkedin: 'לינקדאין',
  cold_outreach: 'פנייה יזומה',
  manual_entry: 'ידני',
  event: 'אירוע',
  partner: 'שותף',
};

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'new':           return 'bg-blue-100 text-blue-700';
    case 'contacted':     return 'bg-purple-100 text-purple-700';
    case 'qualified':     return 'bg-indigo-100 text-indigo-700';
    case 'proposal_sent': return 'bg-yellow-100 text-yellow-700';
    case 'won':           return 'bg-green-100 text-green-700';
    case 'lost':          return 'bg-red-100 text-red-700';
    case 'archived':      return 'bg-gray-100 text-gray-500';
    case 'active':        return 'bg-green-100 text-green-700';
    case 'completed':     return 'bg-teal-100 text-teal-700';
    case 'inactive':      return 'bg-gray-100 text-gray-500';
    default:              return 'bg-gray-100 text-gray-600';
  }
}

// ---------------------------------------------------------------------------
// Relative date in Hebrew
// ---------------------------------------------------------------------------

function relativeHebrew(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 60)  return 'עכשיו';
  if (diffMin === 1) return 'לפני דקה';
  if (diffMin < 60)  return `לפני ${diffMin} דקות`;
  if (diffHr  === 1) return 'לפני שעה';
  if (diffHr  < 24)  return `לפני ${diffHr} שעות`;
  if (diffDay === 1) return 'לפני יום';
  return `לפני ${diffDay} ימים`;
}

// ---------------------------------------------------------------------------
// Format pipeline value with ₪
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return `₪${value.toLocaleString('he-IL')}`;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

function StatCard({ label, value, icon, onClick, color }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 text-right shadow-sm hover:border-wdi-primary/40 hover:shadow-md transition-all w-full"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
        <ArrowLeft size={16} className="text-gray-300" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DashboardTab() {
  const router = useRouter();

  const [stats, setStats]               = useState<Stats | null>(null);
  const [statsError, setStatsError]     = useState<ErrorEnvelope | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [recentLeads, setRecentLeads]         = useState<Lead[]>([]);
  const [leadsError, setLeadsError]           = useState<ErrorEnvelope | null>(null);
  const [leadsLoading, setLeadsLoading]       = useState(true);

  const [activities, setActivities]             = useState<Activity[]>([]);
  const [activitiesError, setActivitiesError]   = useState<ErrorEnvelope | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // -------------------------------------------------------------------------
  // Fetch stats
  // -------------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const [newLeadsRes, clientsRes, engagementsRes, pipelineRes] = await Promise.all([
        apiList<Lead>('/api/admin/leads?status=new&limit=1'),
        apiList<{ _id: string }>('/api/admin/clients-crm?status=active&limit=1'),
        apiList<{ _id: string; status: string }>('/api/admin/engagements?status=active&limit=1'),
        apiList<Lead>('/api/admin/leads?limit=100'),
      ]);

      const pipelineValue = pipelineRes.data
        .filter((l) => l.status === 'proposal_sent' || l.status === 'qualified')
        .reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0);

      setStats({
        newLeads: newLeadsRes.total,
        activeClients: clientsRes.total,
        activeEngagements: engagementsRes.total,
        pipelineValue,
      });
    } catch (e) {
      setStatsError(e as ErrorEnvelope);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch recent leads
  // -------------------------------------------------------------------------

  const fetchRecentLeads = useCallback(async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const res = await apiList<Lead>('/api/admin/leads?limit=5');
      setRecentLeads(res.data);
    } catch (e) {
      setLeadsError(e as ErrorEnvelope);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch recent activities
  // -------------------------------------------------------------------------

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const res = await apiGet<Activity[]>('/api/admin/activities/recent?limit=5');
      setActivities(res.data);
    } catch (e) {
      setActivitiesError(e as ErrorEnvelope);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRecentLeads();
    fetchActivities();
  }, [fetchStats, fetchRecentLeads, fetchActivities]);

  // -------------------------------------------------------------------------
  // Navigation helpers
  // -------------------------------------------------------------------------

  const goTo = (tab: string) => router.push(`/admin?tab=${tab}`);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="p-6 space-y-8" dir="rtl">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">לוח בקרה CRM</h1>
        <p className="text-sm text-gray-500 mt-1">סקירה כללית של מצב הלידים, הלקוחות וההתקשרויות</p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stat Cards                                                          */}
      {/* ------------------------------------------------------------------ */}

      {statsError && (
        <ErrorRenderer error={statsError} onReload={fetchStats} />
      )}

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="לידים חדשים"
            value={stats.newLeads}
            icon={<TrendingUp size={20} className="text-blue-600" />}
            color="bg-blue-50"
            onClick={() => goTo('leads')}
          />
          <StatCard
            label="לקוחות פעילים"
            value={stats.activeClients}
            icon={<Users size={20} className="text-green-600" />}
            color="bg-green-50"
            onClick={() => goTo('clients-crm')}
          />
          <StatCard
            label="התקשרויות פעילות"
            value={stats.activeEngagements}
            icon={<Handshake size={20} className="text-purple-600" />}
            color="bg-purple-50"
            onClick={() => goTo('engagements')}
          />
          <StatCard
            label="ערך צינור"
            value={formatCurrency(stats.pipelineValue)}
            icon={<BarChart3 size={20} className="text-wdi-primary" />}
            color="bg-wdi-primary/10"
            onClick={() => goTo('pipeline')}
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Middle row: Pipeline Summary + Quick Actions                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pipeline Summary */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">סיכום צינור</h2>
            <BarChart3 size={18} className="text-gray-400" />
          </div>

          {statsLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ) : stats ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                כרגע ישנם{' '}
                <span className="font-semibold text-gray-900">{stats.newLeads}</span>{' '}
                לידים חדשים הממתינים לטיפול,{' '}
                <span className="font-semibold text-gray-900">{stats.activeClients}</span>{' '}
                לקוחות פעילים ו-
                <span className="font-semibold text-gray-900">{stats.activeEngagements}</span>{' '}
                התקשרויות פעילות.
                ערך הצינור המשוער הינו{' '}
                <span className="font-semibold text-wdi-primary">{formatCurrency(stats.pipelineValue)}</span>.
              </p>
              <button
                type="button"
                onClick={() => goTo('pipeline')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-wdi-primary hover:underline"
              >
                <ArrowLeft size={14} />
                עבור לצינור המלא
              </button>
            </div>
          ) : null}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">פעולות מהירות</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => goTo('leads')}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-wdi-primary/40 hover:bg-wdi-primary/5 transition"
            >
              <Plus size={16} className="text-wdi-primary" />
              ליד חדש
            </button>
            <button
              type="button"
              onClick={() => goTo('engagements')}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-wdi-primary/40 hover:bg-wdi-primary/5 transition"
            >
              <Plus size={16} className="text-wdi-primary" />
              התקשרות חדשה
            </button>
            <button
              type="button"
              onClick={() => goTo('pipeline')}
              className="flex w-full items-center gap-3 rounded-lg bg-wdi-primary px-4 py-3 text-sm font-medium text-white hover:bg-wdi-primary/90 transition"
            >
              <BarChart3 size={16} />
              צפה בצינור
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom row: Recent Leads + Recent Activity                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Leads */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">לידים אחרונים</h2>
            <button
              type="button"
              onClick={() => goTo('leads')}
              className="inline-flex items-center gap-1 text-xs text-wdi-primary hover:underline font-medium"
            >
              <ArrowLeft size={12} />
              הכל
            </button>
          </div>

          {leadsError && (
            <div className="p-4">
              <ErrorRenderer error={leadsError} onReload={fetchRecentLeads} />
            </div>
          )}

          {leadsLoading ? (
            <div className="divide-y divide-gray-100">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full animate-pulse w-16 mr-4" />
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">אין לידים עדיין</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentLeads.map((lead) => (
                <li key={lead._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {lead.source && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          {SOURCE_LABELS[lead.source] ?? lead.source}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{relativeHebrew(lead.updatedAt)}</span>
                    </div>
                  </div>
                  <span className={`mr-3 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass(lead.status)}`}>
                    {STATUS_LABELS[lead.status] ?? lead.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">פעילות אחרונה</h2>
          </div>

          {activitiesError && (
            <div className="p-4">
              <ErrorRenderer error={activitiesError} onReload={fetchActivities} />
            </div>
          )}

          {activitiesLoading ? (
            <div className="divide-y divide-gray-100">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="px-5 py-3.5 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">אין פעילות אחרונה</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activities.map((act) => (
                <li key={act._id} className="px-5 py-3.5 hover:bg-gray-50 transition">
                  <p className="text-sm text-gray-800 leading-snug">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {act.performedBy && (
                      <span className="text-xs text-gray-400">{act.performedBy}</span>
                    )}
                    {act.performedBy && (
                      <span className="text-gray-300 text-xs">·</span>
                    )}
                    <span className="text-xs text-gray-400">{relativeHebrew(act.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
