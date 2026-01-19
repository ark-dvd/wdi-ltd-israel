import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'WDI Back Office',
  description: 'מערכת ניהול תוכן WDI',
};

const navItems = [
  { href: '/', label: 'דשבורד', icon: '📊' },
  { href: '/hero', label: 'Hero', icon: '🎬' },
  { href: '/team', label: 'צוות', icon: '👥' },
  { href: '/projects', label: 'פרויקטים', icon: '🏗️' },
  { href: '/services', label: 'שירותים', icon: '⚙️' },
  { href: '/clients', label: 'לקוחות', icon: '🏢' },
  { href: '/testimonials', label: 'המלצות', icon: '💬' },
  { href: '/press', label: 'כתבו עלינו', icon: '📰' },
  { href: '/jobs', label: 'משרות', icon: '💼' },
  { href: '/content-library', label: 'מאגר מידע', icon: '📚' },
];

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 min-h-screen" style={{ fontFamily: 'Heebo, sans-serif' }}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-wdi-blue text-white flex-shrink-0">
            <div className="p-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wdi-gold rounded-lg flex items-center justify-center text-wdi-blue font-bold text-xl">
                  W
                </div>
                <div>
                  <div className="font-bold text-lg">WDI</div>
                  <div className="text-xs text-white/60">Back Office</div>
                </div>
              </Link>
            </div>
            
            <nav className="px-4 pb-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition mb-1"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="px-4 pb-6 mt-auto">
              <div className="border-t border-white/20 pt-4">
                <a
                  href="https://wdi.co.il"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white text-sm"
                >
                  <span>🌐</span>
                  <span>צפה באתר</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
