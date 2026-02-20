/**
 * Public site footer — ORIGINAL_DESIGN_SPEC §12, DOC-070 §4
 * 4-column grid: about+social, company links, services (auto-populated), contact.
 * Footer-bottom with copyright, daflash logo, duns100 badge.
 * Background: var(--gray-900) = #1a1a2e
 * INV-P01: ALL text from CMS. INV-P02: ALL media from CMS.
 */
import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings, getActiveServices } from '@/lib/data-fetchers';

export async function Footer() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getActiveServices(),
  ]);

  const logoWhiteUrl = settings?.logoWhiteUrl ?? '';
  const daflashUrl = settings?.daflashLogoUrl ?? '';
  const dunsUrl = settings?.duns100ImageUrl ?? '';
  const dunsLink = settings?.duns100Url ?? '';
  const copyright = settings?.copyrightText ?? '';
  const websiteBy = settings?.websiteByText ?? '';
  const fnl = settings?.footerNavLabels;

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Logo + description + social */}
          <div className="footer-about">
            {logoWhiteUrl && (
              <Image
                src={logoWhiteUrl}
                alt={settings?.companyName ?? ''}
                width={160}
                height={45}
                className="footer-logo"
              />
            )}
            {settings?.footerText && <p>{settings.footerText}</p>}
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
            {settings?.footerCompanyLabel && <h4>{settings.footerCompanyLabel}</h4>}
            <ul>
              <li><Link href="/about">{fnl?.about ?? ''}</Link></li>
              <li><Link href="/team">{fnl?.team ?? ''}</Link></li>
              <li><Link href="/clients">{fnl?.clients ?? ''}</Link></li>
              <li><Link href="/projects">{fnl?.projects ?? ''}</Link></li>
            </ul>
          </div>

          {/* Column 3: Services (auto-populated from CMS) — two-column */}
          <div className="footer-links footer-services">
            {settings?.footerServicesLabel && <h4>{settings.footerServicesLabel}</h4>}
            <ul className="two-column">
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
            {settings?.footerContactLabel && <h4>{settings.footerContactLabel}</h4>}
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
            {settings?.footerLeaveDetailsText && (
              <div style={{ marginTop: 16 }}>
                <Link href="/contact" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                  {settings.footerLeaveDetailsText}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          {copyright && <p>{copyright}</p>}
          <div className="footer-badges">
            {websiteBy && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{websiteBy}</span>}
            {daflashUrl && (
              <Image
                src={daflashUrl}
                alt="daflash"
                width={80}
                height={24}
                style={{ opacity: 0.7 }}
              />
            )}
            {dunsUrl && (
              dunsLink ? (
                <a href={dunsLink} target="_blank" rel="noopener noreferrer">
                  <Image src={dunsUrl} alt="Duns 100" width={60} height={30} style={{ opacity: 0.7 }} />
                </a>
              ) : (
                <Image src={dunsUrl} alt="Duns 100" width={60} height={30} style={{ opacity: 0.7 }} />
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
