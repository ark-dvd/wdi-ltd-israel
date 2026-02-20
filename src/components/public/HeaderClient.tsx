'use client';

/**
 * Client-side header interactivity — dropdowns, mobile menu toggle.
 */
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

interface ServiceLink {
  name: string;
  slug: string;
}

interface Sector {
  key: string;
  label: string;
  count: number;
}

interface HeaderClientProps {
  serviceLinks: ServiceLink[];
  sectors: Sector[];
}

export function HeaderClient({ serviceLinks, sectors }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
      if (projectsRef.current && !projectsRef.current.contains(e.target as Node)) setProjectsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <nav className="max-w-container mx-auto px-4 lg:px-8" aria-label="ניווט ראשי">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-wdi-primary tracking-tight" onClick={closeMobile}>
            WDI
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-wdi-primary transition">אודות</Link>

            {/* Services dropdown */}
            <div ref={servicesRef} className="relative">
              <button
                onClick={() => { setServicesOpen(!servicesOpen); setProjectsOpen(false); }}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-wdi-primary transition"
                type="button"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                שירותים
                <ChevronDown size={14} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-wdi-lg border border-gray-100 py-2 z-50">
                  <Link href="/services" className="block px-4 py-2 text-sm font-semibold text-wdi-primary hover:bg-gray-50" onClick={() => setServicesOpen(false)}>
                    כל השירותים
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-wdi-primary"
                      onClick={() => setServicesOpen(false)}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Projects dropdown */}
            <div ref={projectsRef} className="relative">
              <button
                onClick={() => { setProjectsOpen(!projectsOpen); setServicesOpen(false); }}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-wdi-primary transition"
                type="button"
                aria-expanded={projectsOpen}
                aria-haspopup="true"
              >
                פרויקטים
                <ChevronDown size={14} className={`transition-transform ${projectsOpen ? 'rotate-180' : ''}`} />
              </button>
              {projectsOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-wdi-lg border border-gray-100 py-2 z-50">
                  <Link href="/projects" className="block px-4 py-2 text-sm font-semibold text-wdi-primary hover:bg-gray-50" onClick={() => setProjectsOpen(false)}>
                    כל הפרויקטים
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  {sectors.map((s) => (
                    <Link
                      key={s.key}
                      href={`/projects?sector=${s.key}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-wdi-primary"
                      onClick={() => setProjectsOpen(false)}
                    >
                      {s.label} ({s.count})
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/team" className="text-sm font-medium text-gray-700 hover:text-wdi-primary transition">הצוות</Link>
            <Link href="/clients" className="text-sm font-medium text-gray-700 hover:text-wdi-primary transition">לקוחות</Link>
            <Link href="/press" className="text-sm font-medium text-gray-700 hover:text-wdi-primary transition">כתבו עלינו</Link>
            <Link href="/jobs" className="text-sm font-medium text-gray-700 hover:text-wdi-primary transition">קריירה</Link>
            <Link
              href="/contact"
              className="rounded-lg bg-wdi-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-wdi-primary-light transition"
            >
              צור קשר
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-700"
            type="button"
            aria-label={mobileOpen ? 'סגור תפריט' : 'פתח תפריט'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-30 overflow-y-auto">
          <nav className="px-4 py-6 space-y-1" aria-label="תפריט נייד">
            <Link href="/about" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>אודות</Link>
            <Link href="/services" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>שירותים</Link>
            {serviceLinks.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="block py-2 pr-4 text-sm text-gray-600" onClick={closeMobile}>{s.name}</Link>
            ))}
            <Link href="/projects" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>פרויקטים</Link>
            <Link href="/team" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>הצוות</Link>
            <Link href="/clients" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>לקוחות</Link>
            <Link href="/press" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>כתבו עלינו</Link>
            <Link href="/jobs" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>קריירה</Link>
            <Link href="/content-library" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>מאגר מידע</Link>
            <Link href="/innovation" className="block py-3 text-base font-medium text-gray-700 border-b border-gray-100" onClick={closeMobile}>חדשנות</Link>
            <div className="pt-4">
              <Link href="/contact" className="block w-full text-center rounded-lg bg-wdi-primary px-5 py-3 text-base font-medium text-white" onClick={closeMobile}>צור קשר</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
