'use client';

/**
 * Admin Shell — DOC-030 §3
 * Tab router with sidebar, mobile nav.
 * CRM tabs DEFERRED per CANONICAL-AMENDMENT-001.
 * Intake tab added per AMENDMENT-001.
 */
import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { MobileNav } from './MobileNav';
import { ToastProvider } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';

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
import { AboutPageTab } from './tabs/cms/AboutPageTab';
import { InnovationPageTab } from './tabs/cms/InnovationPageTab';
import { SupplierFormSettingsTab } from './tabs/cms/SupplierFormSettingsTab';
import { ServicesPageTab } from './tabs/cms/ServicesPageTab';
import { ProjectsPageTab } from './tabs/cms/ProjectsPageTab';
import { TeamPageTab } from './tabs/cms/TeamPageTab';
import { ClientsPageTab } from './tabs/cms/ClientsPageTab';
import { PressPageTab } from './tabs/cms/PressPageTab';
import { JobsPageTab } from './tabs/cms/JobsPageTab';
import { ContentLibraryPageTab } from './tabs/cms/ContentLibraryPageTab';
import { ContactPageTab } from './tabs/cms/ContactPageTab';

// Intake tab (AMENDMENT-001)
import { IntakeTab } from './tabs/cms/IntakeTab';

const DEFAULT_TAB = 'team';

const TAB_MAP: Record<string, React.ComponentType> = {
  // Intake (AMENDMENT-001)
  intake: IntakeTab,
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
  'about-page': AboutPageTab,
  'innovation-page': InnovationPageTab,
  'supplier-form-settings': SupplierFormSettingsTab,
  'services-page': ServicesPageTab,
  'projects-page': ProjectsPageTab,
  'team-page': TeamPageTab,
  'clients-page': ClientsPageTab,
  'press-page': PressPageTab,
  'jobs-page': JobsPageTab,
  'content-library-page': ContentLibraryPageTab,
  'contact-page': ContactPageTab,
};

function AdminContent({ userEmail }: { userEmail: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') ?? DEFAULT_TAB;

  const handleTabChange = useCallback(
    (t: string) => {
      router.push(`/admin?tab=${t}`);
    },
    [router],
  );

  const TabComponent = TAB_MAP[tab] ?? TAB_MAP[DEFAULT_TAB] ?? TeamTab;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab={tab}
        onTabChange={handleTabChange}
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
