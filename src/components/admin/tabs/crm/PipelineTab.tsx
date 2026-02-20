'use client';

/**
 * Pipeline Kanban View — DOC-030 §7, DOC-050 §21
 * Columns driven by CrmSettings.pipelineStages. No drag-and-drop (v1).
 * RTL layout: first column on right. Horizontal scroll.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { apiGet, apiList, type ErrorEnvelope } from '@/lib/api/client';
import { ErrorRenderer } from '../../ErrorRenderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PipelineStage {
  key: string;
  label: string;
  color: string;
  order?: number;
}

interface CrmSettings {
  pipelineStages: PipelineStage[];
  updatedAt: string;
}

interface Lead {
  _id: string;
  name: string;
  status: string;
  source?: string;
  servicesInterested?: string[];
  estimatedValue?: number;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EXCLUDED_STATUSES = ['archived', 'won', 'lost'];

const SOURCE_LABELS: Record<string, string> = {
  website: 'אתר',
  referral: 'הפניה',
  linkedin: 'לינקדאין',
  cold_outreach: 'פנייה יזומה',
  manual_entry: 'ידני',
  event: 'אירוע',
  partner: 'שותף',
};

const SOURCE_BADGE: Record<string, string> = {
  website: 'bg-blue-100 text-blue-700',
  referral: 'bg-green-100 text-green-700',
  linkedin: 'bg-sky-100 text-sky-700',
  cold_outreach: 'bg-purple-100 text-purple-700',
  manual_entry: 'bg-gray-100 text-gray-600',
  event: 'bg-pink-100 text-pink-700',
  partner: 'bg-orange-100 text-orange-700',
};

function relativeHebrew(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1)   return 'עכשיו';
  if (diffMin === 1) return 'לפני דקה';
  if (diffMin < 60)  return `לפני ${diffMin} דקות`;
  if (diffHr  === 1) return 'לפני שעה';
  if (diffHr  < 24)  return `לפני ${diffHr} שעות`;
  if (diffDay === 1) return 'לפני יום';
  return `לפני ${diffDay} ימים`;
}

function formatValue(v?: number): string {
  if (v == null) return '';
  return `₪${v.toLocaleString('he-IL')}`;
}

// ---------------------------------------------------------------------------
// Lead card
// ---------------------------------------------------------------------------

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

function LeadCard({ lead, onClick }: LeadCardProps) {
  const service = lead.servicesInterested?.[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-right bg-white rounded-lg border border-gray-200 p-3 shadow-wdi-sm hover:border-wdi-primary/40 hover:shadow-wdi-md transition-all"
    >
      <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{lead.name}</p>
      {service && (
        <p className="text-xs text-gray-500 mt-0.5 truncate">{service}</p>
      )}
      <div className="flex items-center justify-between mt-2 gap-1">
        <span className="text-xs font-medium text-wdi-primary">{formatValue(lead.estimatedValue)}</span>
        <span className="text-xs text-gray-400">{relativeHebrew(lead.updatedAt)}</span>
      </div>
      {lead.source && (
        <div className="mt-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SOURCE_BADGE[lead.source] ?? 'bg-gray-100 text-gray-500'}`}>
            {SOURCE_LABELS[lead.source] ?? lead.source}
          </span>
        </div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Pipeline column
// ---------------------------------------------------------------------------

interface ColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

function PipelineColumn({ stage, leads, onLeadClick }: ColumnProps) {
  const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0);

  return (
    <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 min-w-[240px] w-[260px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        <span className="font-semibold text-gray-800 text-sm flex-1 truncate">{stage.label}</span>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full shrink-0">
          {leads.length}
        </span>
      </div>
      {totalValue > 0 && (
        <div className="px-3 py-1.5 border-b border-gray-100">
          <span className="text-xs text-gray-500">
            סה&quot;כ: <span className="font-medium text-wdi-primary">{formatValue(totalValue)}</span>
          </span>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px]">
        {leads.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">אין לידים</p>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PipelineTab() {
  const router = useRouter();

  const [settings, setSettings]     = useState<CrmSettings | null>(null);
  const [settingsErr, setSettingsErr] = useState<ErrorEnvelope | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [leads, setLeads]           = useState<Lead[]>([]);
  const [leadsErr, setLeadsErr]     = useState<ErrorEnvelope | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true); setSettingsErr(null);
    try {
      const r = await apiGet<CrmSettings>('/api/admin/crm-settings');
      setSettings(r.data);
    } catch (e) { setSettingsErr(e as ErrorEnvelope); }
    finally { setSettingsLoading(false); }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true); setLeadsErr(null);
    try {
      const r = await apiList<Lead>('/api/admin/leads?limit=100');
      setLeads(r.data);
    } catch (e) { setLeadsErr(e as ErrorEnvelope); }
    finally { setLeadsLoading(false); }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchLeads();
  }, [fetchSettings, fetchLeads]);

  const refresh = () => { fetchSettings(); fetchLeads(); };

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const visibleLeads = leads.filter((l) => !EXCLUDED_STATUSES.includes(l.status));

  const stages = settings?.pipelineStages
    ? [...settings.pipelineStages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  const leadsByStage = (stageKey: string): Lead[] =>
    visibleLeads.filter((l) => l.status === stageKey);

  const handleLeadClick = (lead: Lead) => {
    router.push(`/admin?tab=leads&selected=${lead._id}`);
  };

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  const isLoading = settingsLoading || leadsLoading;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500" dir="rtl">
        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-wdi-primary" />
        טוען נתוני צינור...
      </div>
    );
  }

  // Settings unavailable
  if (settingsErr || !settings || !settings.pipelineStages?.length) {
    return (
      <div className="p-8" dir="rtl">
        {settingsErr && <ErrorRenderer error={settingsErr} onReload={fetchSettings} />}
        {(!settingsErr) && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 max-w-lg">
            <div className="flex items-start gap-3">
              <Settings size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 mb-1">הגדרות צינור לא נמצאו</p>
                <p className="text-sm text-amber-700 mb-3">
                  לא הוגדרו שלבי צינור. יש להגדיר שלבים בהגדרות ה-CRM לפני השימוש בתצוגת הצינור.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/admin?tab=crm-settings')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-800 underline hover:text-amber-900"
                >
                  <ExternalLink size={14} />
                  עבור להגדרות CRM
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">צינור מכירות</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {visibleLeads.length} לידים פעילים
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin?tab=crm-settings')}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            title="הגדרות CRM"
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={refresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            title="רענן"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {leadsErr && (
        <div className="mb-4">
          <ErrorRenderer error={leadsErr} onReload={fetchLeads} />
        </div>
      )}

      {/* Kanban board: horizontal scroll, RTL (first column on right) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex flex-row-reverse gap-3" style={{ minWidth: `${stages.length * 268}px` }}>
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.key}
              stage={stage}
              leads={leadsByStage(stage.key)}
              onLeadClick={handleLeadClick}
            />
          ))}
        </div>
      </div>

      {stages.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-12">אין שלבי צינור מוגדרים</p>
      )}
    </div>
  );
}
