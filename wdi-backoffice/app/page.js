'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const sections = [
  { key: 'team', label: 'צוות', icon: '👥', href: '/team' },
  { key: 'projects', label: 'פרויקטים', icon: '🏗️', href: '/projects' },
  { key: 'services', label: 'שירותים', icon: '⚙️', href: '/services' },
  { key: 'clients', label: 'לקוחות', icon: '🏢', href: '/clients' },
  { key: 'testimonials', label: 'המלצות', icon: '💬', href: '/testimonials' },
  { key: 'press', label: 'כתבו עלינו', icon: '📰', href: '/press' },
  { key: 'jobs', label: 'משרות', icon: '💼', href: '/jobs' },
  { key: 'content-library', label: 'מאגר מידע', icon: '📚', href: '/content-library' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const results = {};
    for (const section of sections) {
      try {
        const res = await fetch(`/api/${section.key}`);
        const data = await res.json();
        results[section.key] = Array.isArray(data) ? data.length : 0;
      } catch {
        results[section.key] = 0;
      }
    }
    setStats(results);
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wdi-blue">שלום! 👋</h1>
        <p className="text-gray-600 mt-1">ברוך הבא למערכת ניהול התוכן של WDI</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-l from-wdi-blue to-wdi-blue/80 rounded-2xl p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4">פעולות מהירות</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/team/new" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            + חבר צוות חדש
          </Link>
          <Link href="/projects/new" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            + פרויקט חדש
          </Link>
          <Link href="/jobs/new" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            + משרה חדשה
          </Link>
          <Link href="/hero" className="bg-wdi-gold hover:bg-wdi-gold/90 px-4 py-2 rounded-lg transition">
            🎬 עריכת Hero
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-xl font-bold text-gray-700 mb-4">סטטיסטיקות</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {sections.map((section) => (
          <Link
            key={section.key}
            href={section.href}
            className="bg-white rounded-xl p-5 shadow-sm card-hover border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{section.icon}</span>
              {loading ? (
                <div className="w-8 h-8 bg-gray-100 rounded animate-pulse"></div>
              ) : (
                <span className="text-2xl font-bold text-wdi-blue">{stats[section.key] || 0}</span>
              )}
            </div>
            <div className="text-gray-600 font-medium">{section.label}</div>
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-bold text-blue-800 mb-2">💡 טיפים</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• לחץ על כרטיס כדי לצפות ברשימה המלאה</li>
          <li>• השתמש בכפתור "+ הוסף" בכל עמוד כדי ליצור פריט חדש</li>
          <li>• שינויים נשמרים ישירות ל-GitHub ומתעדכנים באתר</li>
          <li>• לעריכת ה-Hero (כותרת ראשית + וידאו) - לחץ על "🎬 עריכת Hero"</li>
        </ul>
      </div>
    </div>
  );
}
