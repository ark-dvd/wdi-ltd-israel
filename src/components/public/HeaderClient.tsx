'use client';

/**
 * Client-side header — ORIGINAL_DESIGN_SPEC §3, DOC-070 §2.1
 * Fixed transparent->white on scroll. Dual logo swap. Dropdowns on hover (desktop).
 * Mobile hamburger menu.
 * INV-P01: ALL labels from CMS. INV-P02: logos from CMS.
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ServiceLink {
  name: string;
  slug: string;
}

interface NavLabels {
  about?: string;
  services?: string;
  projects?: string;
  innovation?: string;
  contentLibrary?: string;
  contact?: string;
  aboutCompany?: string;
  ourTeam?: string;
  pressAboutUs?: string;
  clients?: string;
  allServices?: string;
  contactForm?: string;
  supplierReg?: string;
  jobs?: string;
}

interface HeaderClientProps {
  serviceLinks: ServiceLink[];
  logoWhiteUrl: string;
  logoDarkUrl: string;
  companyName: string;
  navLabels: NavLabels;
}

export function HeaderClient({ serviceLinks, logoWhiteUrl, logoDarkUrl, companyName, navLabels }: HeaderClientProps) {
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
          {/* Logo — dual swap (from CMS) */}
          <Link href="/" className="logo" onClick={closeMobile}>
            {logoWhiteUrl && (
              <Image
                src={logoWhiteUrl}
                alt={companyName}
                width={160}
                height={50}
                className="logo-white"
                priority
              />
            )}
            {logoDarkUrl && (
              <Image
                src={logoDarkUrl}
                alt={companyName}
                width={160}
                height={50}
                className="logo-dark"
                priority
              />
            )}
          </Link>

          {/* Desktop Navigation — DOC-070 §2.1: 6 items */}
          <nav className="nav-links" aria-label="main navigation">
            {/* 1. About — dropdown */}
            <div className="nav-group">
              <span className="nav-group-title">
                {navLabels.about ?? ''} <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', marginRight: 4 }} />
              </span>
              <div className="nav-dropdown">
                <Link href="/about">{navLabels.aboutCompany ?? ''}</Link>
                <Link href="/team">{navLabels.ourTeam ?? ''}</Link>
                <Link href="/press">{navLabels.pressAboutUs ?? ''}</Link>
                <Link href="/clients">{navLabels.clients ?? ''}</Link>
              </div>
            </div>

            {/* 2. Services — dropdown (dynamic from CMS) */}
            <div className="nav-group">
              <span className="nav-group-title">
                {navLabels.services ?? ''} <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', marginRight: 4 }} />
              </span>
              <div className="nav-dropdown">
                <Link href="/services">{navLabels.allServices ?? ''}</Link>
                {serviceLinks.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`}>
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Projects — direct link */}
            <Link href="/projects">{navLabels.projects ?? ''}</Link>

            {/* 4. Innovation — direct link */}
            <Link href="/innovation">{navLabels.innovation ?? ''}</Link>

            {/* 5. Content Library — direct link */}
            <Link href="/content-library">{navLabels.contentLibrary ?? ''}</Link>

            {/* 6. Contact — dropdown */}
            <div className="nav-group">
              <span className="nav-group-title">
                {navLabels.contact ?? ''} <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', marginRight: 4 }} />
              </span>
              <div className="nav-dropdown">
                <Link href="/contact">{navLabels.contactForm ?? ''}</Link>
                <Link href="/join-us">{navLabels.supplierReg ?? ''}</Link>
                <Link href="/jobs">{navLabels.jobs ?? ''}</Link>
              </div>
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="menu"
            type="button"
          >
            <i className={mobileOpen ? 'fas fa-times' : 'fas fa-bars'} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav" aria-label="mobile navigation">
            <div className="mobile-nav-section">
              {navLabels.about && <p className="mobile-nav-heading">{navLabels.about}</p>}
              <Link href="/about" onClick={closeMobile}>{navLabels.aboutCompany ?? ''}</Link>
              <Link href="/team" onClick={closeMobile}>{navLabels.ourTeam ?? ''}</Link>
              <Link href="/press" onClick={closeMobile}>{navLabels.pressAboutUs ?? ''}</Link>
              <Link href="/clients" onClick={closeMobile}>{navLabels.clients ?? ''}</Link>
            </div>
            <div className="mobile-nav-section">
              {navLabels.services && <p className="mobile-nav-heading">{navLabels.services}</p>}
              <Link href="/services" onClick={closeMobile}>{navLabels.allServices ?? ''}</Link>
              {serviceLinks.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} onClick={closeMobile}>
                  {s.name}
                </Link>
              ))}
            </div>
            <Link href="/projects" className="mobile-nav-top" onClick={closeMobile}>{navLabels.projects ?? ''}</Link>
            <Link href="/innovation" className="mobile-nav-top" onClick={closeMobile}>{navLabels.innovation ?? ''}</Link>
            <Link href="/content-library" className="mobile-nav-top" onClick={closeMobile}>{navLabels.contentLibrary ?? ''}</Link>
            <div className="mobile-nav-section">
              {navLabels.contact && <p className="mobile-nav-heading">{navLabels.contact}</p>}
              <Link href="/contact" onClick={closeMobile}>{navLabels.contactForm ?? ''}</Link>
              <Link href="/join-us" onClick={closeMobile}>{navLabels.supplierReg ?? ''}</Link>
              <Link href="/jobs" onClick={closeMobile}>{navLabels.jobs ?? ''}</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
