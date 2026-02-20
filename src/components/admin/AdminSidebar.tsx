'use client';

/**
 * Desktop sidebar — DOC-030 §3.1
 * CRM section first (primary), CMS section second
 */
import {
  Users, FolderOpen, Briefcase, Building, Newspaper, BriefcaseBusiness,
  Library, Play, Settings, BarChart3, UserPlus, UserCheck, Handshake,
  Columns3, SlidersHorizontal, Search, LogOut, Info, ClipboardList, type LucideIcon,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  newLeadCount: number;
  userEmail: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  tab: string;
}

const CRM_ITEMS: NavItem[] = [
  { label: 'לוח בקרה', icon: BarChart3, tab: 'dashboard' },
  { label: 'לידים', icon: UserPlus, tab: 'leads' },
  { label: 'לקוחות CRM', icon: UserCheck, tab: 'clients-crm' },
  { label: 'התקשרויות', icon: Handshake, tab: 'engagements' },
  { label: 'צינור מכירות', icon: Columns3, tab: 'pipeline' },
  { label: 'הגדרות CRM', icon: SlidersHorizontal, tab: 'crm-settings' },
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
  { label: 'טופס ספקים', icon: ClipboardList, tab: 'supplier-form-settings' },
  { label: 'הגדרות אתר', icon: Settings, tab: 'site-settings' },
];

export function AdminSidebar({ activeTab, onTabChange, newLeadCount, userEmail }: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-l border-gray-200 h-screen sticky top-0" dir="rtl">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-wdi-primary">WDI מערכת ניהול</h1>
        <p className="text-xs text-gray-400 mt-1 truncate">{userEmail}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* CRM Section */}
        <div className="px-4 mb-1">
          <span className="text-xs font-semibold text-gray-400 tracking-wider">ניהול לקוחות</span>
        </div>
        <ul className="space-y-0.5 px-2 mb-6">
          {CRM_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            const badge = item.tab === 'leads' ? newLeadCount : 0;
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
                  {badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* CMS Section */}
        <div className="px-4 mb-1">
          <span className="text-xs font-semibold text-gray-400 tracking-wider">ניהול תוכן</span>
        </div>
        <ul className="space-y-0.5 px-2">
          {CMS_ITEMS.map((item) => {
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
      </nav>

      {/* Search + Logout */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <button
          onClick={() => onTabChange('crm-search')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
          type="button"
        >
          <Search size={18} />
          <span>חיפוש CRM</span>
        </button>
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
