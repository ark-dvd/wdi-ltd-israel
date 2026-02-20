/**
 * Public site footer — ORIGINAL_DESIGN_SPEC §12, DOC-070 §4
 * 4-column grid: about+social, company links, services (auto-populated), contact.
 * Footer-bottom with copyright, daflash logo, duns100 badge.
 * Background: var(--gray-900) = #1a1a2e
 */
import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings, getActiveServices } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';

export async function Footer() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getActiveServices(),
  ]);

  const daflashUrl = settings?.daflashLogo ? sanityImageUrl(settings.daflashLogo) : '/images/daflash-logo.png';
  const dunsUrl = settings?.duns100Image ? sanityImageUrl(settings.duns100Image) : '/images/duns100.webp';
  const dunsLink = settings?.duns100Url ?? '#';
  const year = new Date().getFullYear();
  const copyright = settings?.copyrightText ?? `© ${year} WDI בע"מ. כל הזכויות שמורות.`;

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Logo + description + social */}
          <div className="footer-about">
            <Image
              src="/images/wdi-logo-white.png"
              alt="WDI"
              width={160}
              height={45}
              className="footer-logo"
            />
            <p>{settings?.footerText ?? 'חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי בישראל'}</p>
            <div className="social-links">
              {settings?.socialLinks?.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in" />
                </a>
              )}
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook-f" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="fab fa-youtube" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Company links */}
          <div className="footer-links">
            <h4>החברה</h4>
            <ul>
              <li><Link href="/about">אודות</Link></li>
              <li><Link href="/team">הצוות</Link></li>
              <li><Link href="/clients">לקוחות</Link></li>
              <li><Link href="/projects">פרויקטים</Link></li>
            </ul>
          </div>

          {/* Column 3: Services (auto-populated from CMS) — INV-P06 */}
          <div className="footer-links footer-services">
            <h4>שירותים</h4>
            <ul>
              {services.map((s: { _id: string; name: string; slug: string }) => (
                <li key={s._id}>
                  <Link href={`/services/${typeof s.slug === 'string' ? s.slug : ''}`}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact info with FA icons */}
          <div className="footer-contact">
            <h4>צור קשר</h4>
            {settings?.address && (
              <p>
                <i className="fas fa-map-marker-alt" />
                <span>{settings.address}</span>
              </p>
            )}
            {settings?.phone && (
              <p>
                <i className="fas fa-phone" />
                <a href={`tel:${settings.phone}`} dir="ltr" style={{ color: 'inherit' }}>{settings.phone}</a>
              </p>
            )}
            {settings?.email && (
              <p>
                <i className="fas fa-envelope" />
                <a href={`mailto:${settings.email}`} dir="ltr" style={{ color: 'inherit' }}>{settings.email}</a>
              </p>
            )}
            <div style={{ marginTop: 16 }}>
              <Link href="/contact" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                השאר פרטים
              </Link>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <p>{copyright}</p>
          <div className="footer-badges">
            {/* Daflash credit */}
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Website by</span>
            <Image
              src={daflashUrl}
              alt="daflash"
              width={80}
              height={24}
              style={{ opacity: 0.7 }}
            />
            {/* Duns 100 badge */}
            {dunsLink !== '#' ? (
              <a href={dunsLink} target="_blank" rel="noopener noreferrer">
                <Image src={dunsUrl} alt="Duns 100" width={60} height={30} style={{ opacity: 0.7 }} />
              </a>
            ) : (
              <Image src={dunsUrl} alt="Duns 100" width={60} height={30} style={{ opacity: 0.7 }} />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
