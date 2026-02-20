'use client';

/**
 * Desktop sidebar — DOC-030 §3.1
 * CRM section DEFERRED per CANONICAL-AMENDMENT-001.
 * Intake section added per AMENDMENT-001.
 */
import {
  Users, FolderOpen, Briefcase, Building, Newspaper, BriefcaseBusiness,
  Library, Play, Settings, LogOut, Info, ClipboardList, Inbox, Lightbulb, type LucideIcon,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  tab: string;
}

const INTAKE_ITEMS: NavItem[] = [
  { label: 'תיבת פניות', icon: Inbox, tab: 'intake' },
];

const CMS_ITEMS: NavItem[] = [
  { label: 'צוות', icon: Users, tab: 'team' },
  { label: 'פרויקטים', icon: FolderOpen, tab: 'projects' },
  { label: 'שירותים', icon: Briefcase, tab: 'services' },
  { label: 'לקוחות (תוכן)', icon: Building, tab: 'clients-content' },
  { label: 'כתבו עלינו', icon: Newspaper, tab: 'press' },
  { label: 'משרות', icon: BriefcaseBusiness, tab: 'jobs' },
  { label: 'מאגר מידע', icon: Library, tab: 'content-library' },
  { label: 'Hero', icon: Play, tab: 'hero' },
  { label: 'עמוד אודות', icon: Info, tab: 'about-page' },
  { label: 'עמוד חדשנות', icon: Lightbulb, tab: 'innovation-page' },
  { label: 'טופס ספקים', icon: ClipboardList, tab: 'supplier-form-settings' },
  { label: 'הגדרות אתר', icon: Settings, tab: 'site-settings' },
];

function NavSection({ title, items, activeTab, onTabChange }: {
  title: string;
  items: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <>
      <div className="px-4 mb-1">
        <span className="text-xs font-semibold text-gray-400 tracking-wider">{title}</span>
      </div>
      <ul className="space-y-0.5 px-2 mb-6">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <li key={item.tab}>
              <button
                onClick={() => onTabChange(item.tab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-wdi-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                type="button"
              >
                <Icon size={18} />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function AdminSidebar({ activeTab, onTabChange, userEmail }: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-l border-gray-200 h-screen sticky top-0" dir="rtl">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-wdi-primary">WDI מערכת ניהול</h1>
        <p className="text-xs text-gray-400 mt-1 truncate">{userEmail}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <NavSection title="פניות נכנסות" items={INTAKE_ITEMS} activeTab={activeTab} onTabChange={onTabChange} />
        <NavSection title="ניהול תוכן" items={CMS_ITEMS} activeTab={activeTab} onTabChange={onTabChange} />
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
          type="button"
        >
          <LogOut size={18} />
          <span>התנתק</span>
        </button>
      </div>
    </aside>
  );
}
