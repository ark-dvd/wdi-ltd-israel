'use client';

/**
 * Mobile bottom bar — DOC-030 §3.2
 * CRM items replaced with CMS items per CANONICAL-AMENDMENT-001.
 */
import { FolderOpen, Users, Inbox, Briefcase, Settings } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MOBILE_ITEMS = [
  { label: 'פניות', icon: Inbox, tab: 'intake' },
  { label: 'פרויקטים', icon: FolderOpen, tab: 'projects' },
  { label: 'צוות', icon: Users, tab: 'team' },
  { label: 'שירותים', icon: Briefcase, tab: 'services' },
  { label: 'הגדרות', icon: Settings, tab: 'site-settings' },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30" dir="rtl">
      <div className="flex justify-around items-center h-16">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${
                isActive ? 'text-wdi-primary' : 'text-gray-400'
              }`}
              type="button"
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
