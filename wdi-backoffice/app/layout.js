import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'WDI Back Office',
  description: 'מערכת ניהול תוכן WDI',
};

const navItems = [
  { href: '/hero', label: 'עמוד ראשי', icon: '🎬' },
  { href: '/team', label: 'צוות', icon: '👥' },
  { href: '/projects', label: 'פרויקטים', icon: '🏗️' },
  { href: '/services', label: 'שירותים', icon: '⚙️' },
  { href: '/clients', label: 'לקוחות', icon: '🤝' },
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
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-wdi-blue min-h-screen fixed right-0 top-0">
            <div className="p-6">
              <Link href="/" className="block">
                <h1 className="text-2xl font-bold text-white">WDI</h1>
                <p className="text-wdi-gold text-sm mt-1">Back Office</p>
              </Link>
            </div>
            
            <nav className="mt-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-6 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="absolute bottom-0 right-0 left-0 p-6 border-t border-white/10">
              <a
                href="https://wdi.co.il"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
              >
                <span>🌐</span>
                <span>צפה באתר</span>
              </a>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 mr-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
