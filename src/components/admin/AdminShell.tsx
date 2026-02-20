'use client';

/**
 * Admin Shell — DOC-030 §3
 * Tab router with sidebar, mobile nav, new-lead polling.
 * Renders the active tab based on ?tab= search param.
 */
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { MobileNav } from './MobileNav';
import { ToastProvider } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { apiList } from '@/lib/api/client';

// CRM tabs
import { DashboardTab } from './tabs/crm/DashboardTab';
import { LeadsTab } from './tabs/crm/LeadsTab';
import { ClientsCrmTab } from './tabs/crm/ClientsCrmTab';
import { EngagementsTab } from './tabs/crm/EngagementsTab';
import { PipelineTab } from './tabs/crm/PipelineTab';
import { CrmSettingsTab } from './tabs/crm/CrmSettingsTab';
import { CrmSearchTab } from './tabs/crm/CrmSearchTab';

// CMS tabs
import { TeamTab } from './tabs/cms/TeamTab';
import { ProjectsTab } from './tabs/cms/ProjectsTab';
import { ServicesTab } from './tabs/cms/ServicesTab';
import { ClientsContentTab } from './tabs/cms/ClientsContentTab';
import { PressTab } from './tabs/cms/PressTab';
import { JobsTab } from './tabs/cms/JobsTab';
import { ContentLibraryTab } from './tabs/cms/ContentLibraryTab';
import { HeroSettingsTab } from './tabs/cms/HeroSettingsTab';
import { SiteSettingsTab } from './tabs/cms/SiteSettingsTab';

const TAB_MAP: Record<string, React.ComponentType> = {
  // CRM
  dashboard: DashboardTab,
  leads: LeadsTab,
  'clients-crm': ClientsCrmTab,
  engagements: EngagementsTab,
  pipeline: PipelineTab,
  'crm-settings': CrmSettingsTab,
  'crm-search': CrmSearchTab,
  // CMS
  team: TeamTab,
  projects: ProjectsTab,
  services: ServicesTab,
  'clients-content': ClientsContentTab,
  press: PressTab,
  jobs: JobsTab,
  'content-library': ContentLibraryTab,
  hero: HeroSettingsTab,
  'site-settings': SiteSettingsTab,
};

function AdminContent({ userEmail }: { userEmail: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') ?? 'dashboard';
  const [newLeadCount, setNewLeadCount] = useState(0);

  const pollNewLeads = useCallback(async () => {
    try {
      const r = await apiList('/api/admin/leads?status=new&limit=1');
      setNewLeadCount(r.total);
    } catch {
      /* silent — badge is non-critical */
    }
  }, []);

  useEffect(() => {
    pollNewLeads();
    const id = setInterval(pollNewLeads, 60_000);
    return () => clearInterval(id);
  }, [pollNewLeads]);

  const handleTabChange = useCallback(
    (t: string) => {
      router.push(`/admin?tab=${t}`);
    },
    [router],
  );

  const TabComponent = TAB_MAP[tab] ?? DashboardTab;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab={tab}
        onTabChange={handleTabChange}
        newLeadCount={newLeadCount}
        userEmail={userEmail}
      />
      <main className="flex-1 min-h-screen pb-20 lg:pb-0">
        <TabComponent />
      </main>
      <MobileNav activeTab={tab} onTabChange={handleTabChange} />
    </div>
  );
}

export function AdminShell({ userEmail }: { userEmail: string }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <span className="text-gray-500">טוען...</span>
            </div>
          }
        >
          <AdminContent userEmail={userEmail} />
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}
