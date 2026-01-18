import Link from 'next/link';

const sections = [
  { href: '/team', label: 'צוות', icon: '👥', count: 17, color: 'bg-blue-500' },
  { href: '/projects', label: 'פרויקטים', icon: '🏗️', count: 13, color: 'bg-green-500' },
  { href: '/services', label: 'שירותים', icon: '⚙️', count: 8, color: 'bg-purple-500' },
  { href: '/clients', label: 'לקוחות', icon: '🤝', count: 16, color: 'bg-orange-500' },
  { href: '/testimonials', label: 'המלצות', icon: '💬', count: 5, color: 'bg-pink-500' },
  { href: '/jobs', label: 'משרות', icon: '💼', count: 4, color: 'bg-cyan-500' },
  { href: '/content-library', label: 'מאגר מידע', icon: '📚', count: 6, color: 'bg-amber-500' },
];

export default function Dashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wdi-blue">שלום, WDI 👋</h1>
        <p className="text-gray-600 mt-2">ברוכים הבאים למערכת ניהול התוכן</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sections.slice(0, 4).map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-white rounded-xl p-6 shadow-sm card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{section.label}</p>
                <p className="text-3xl font-bold text-wdi-blue mt-1">{section.count}</p>
              </div>
              <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center text-2xl text-white`}>
                {section.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* All Sections */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-wdi-blue mb-6">ניהול תוכן</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-wdi-gold hover:bg-amber-50 transition-all card-hover"
            >
              <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center text-xl text-white`}>
                {section.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{section.label}</p>
                <p className="text-sm text-gray-500">{section.count} פריטים</p>
              </div>
              <span className="text-gray-400">←</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-l from-wdi-blue to-wdi-blue-light rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">פעולות מהירות</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/team/new" className="btn-gold">
            + הוסף חבר צוות
          </Link>
          <Link href="/projects/new" className="btn-gold">
            + הוסף פרויקט
          </Link>
          <Link href="/jobs/new" className="btn-gold">
            + הוסף משרה
          </Link>
        </div>
      </div>
    </div>
  );
}
