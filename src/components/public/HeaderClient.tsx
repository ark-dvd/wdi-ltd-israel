'use client';

/**
 * Client-side header — ORIGINAL_DESIGN_SPEC §3, DOC-070 §2.1
 * Fixed transparent→white on scroll. Dual logo swap. Dropdowns on hover (desktop).
 * Mobile hamburger menu.
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ServiceLink {
  name: string;
  slug: string;
}

interface HeaderClientProps {
  serviceLinks: ServiceLink[];
}

export function HeaderClient({ serviceLinks }: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll(); // check initial
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo — dual swap */}
          <Link href="/" className="logo" onClick={closeMobile}>
            <Image
              src="/images/wdi-logo-white.png"
              alt="WDI Logo"
              width={160}
              height={50}
              className="logo-white"
              priority
            />
            <Image
              src="/images/wdi-logo.png"
              alt="WDI Logo"
              width={160}
              height={50}
              className="logo-dark"
              priority
            />
          </Link>

          {/* Desktop Navigation — DOC-070 §2.1: 6 items */}
          <nav className="nav-links" aria-label="ניווט ראשי">
            {/* 1. אודות — dropdown */}
            <div className="nav-group">
              <span className="nav-group-title">
                אודות <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', marginRight: 4 }} />
              </span>
              <div className="nav-dropdown">
                <Link href="/about">אודות החברה</Link>
                <Link href="/team">הצוות שלנו</Link>
                <Link href="/press">כתבו עלינו</Link>
                <Link href="/clients">לקוחות</Link>
              </div>
            </div>

            {/* 2. שירותים — dropdown (dynamic from CMS) */}
            <div className="nav-group">
              <span className="nav-group-title">
                שירותים <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', marginRight: 4 }} />
              </span>
              <div className="nav-dropdown">
                <Link href="/services">כל השירותים</Link>
                {serviceLinks.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`}>
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. פרויקטים — direct link */}
            <Link href="/projects">פרויקטים</Link>

            {/* 4. חדשנות וטכנולוגיה — direct link */}
            <Link href="/innovation">חדשנות וטכנולוגיה</Link>

            {/* 5. מאגר מידע — direct link */}
            <Link href="/content-library">מאגר מידע</Link>

            {/* 6. צור קשר — dropdown */}
            <div className="nav-group">
              <span className="nav-group-title">
                צור קשר <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', marginRight: 4 }} />
              </span>
              <div className="nav-dropdown">
                <Link href="/contact">השאר פרטים</Link>
                <Link href="/join-us">הצטרפות למאגר שלנו</Link>
                <Link href="/jobs">משרות</Link>
              </div>
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'סגור תפריט' : 'פתח תפריט'}
            type="button"
          >
            <i className={mobileOpen ? 'fas fa-times' : 'fas fa-bars'} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav" aria-label="תפריט נייד">
            <div className="mobile-nav-section">
              <p className="mobile-nav-heading">אודות</p>
              <Link href="/about" onClick={closeMobile}>אודות החברה</Link>
              <Link href="/team" onClick={closeMobile}>הצוות שלנו</Link>
              <Link href="/press" onClick={closeMobile}>כתבו עלינו</Link>
              <Link href="/clients" onClick={closeMobile}>לקוחות</Link>
            </div>
            <div className="mobile-nav-section">
              <p className="mobile-nav-heading">שירותים</p>
              <Link href="/services" onClick={closeMobile}>כל השירותים</Link>
              {serviceLinks.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} onClick={closeMobile}>
                  {s.name}
                </Link>
              ))}
            </div>
            <Link href="/projects" className="mobile-nav-top" onClick={closeMobile}>פרויקטים</Link>
            <Link href="/innovation" className="mobile-nav-top" onClick={closeMobile}>חדשנות וטכנולוגיה</Link>
            <Link href="/content-library" className="mobile-nav-top" onClick={closeMobile}>מאגר מידע</Link>
            <div className="mobile-nav-section">
              <p className="mobile-nav-heading">צור קשר</p>
              <Link href="/contact" onClick={closeMobile}>השאר פרטים</Link>
              <Link href="/join-us" onClick={closeMobile}>הצטרפות למאגר שלנו</Link>
              <Link href="/jobs" onClick={closeMobile}>משרות</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
