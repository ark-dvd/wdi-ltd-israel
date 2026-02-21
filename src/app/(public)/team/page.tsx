/**
 * Team page — ORIGINAL_DESIGN_SPEC §9, DOC-070 §3.3
 * PageHeader, team members grouped by category in fixed order:
 * founders -> management -> department-heads -> project-managers
 * Square cards with hover overlay (navy 92% opacity).
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 * Category labels from teamPage singleton or TEAM_CATEGORY fallback.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamMembers, getSiteSettings, getTeamPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';
import { sanityImageUrl } from '@/lib/sanity/image';
import { TEAM_CATEGORY } from '@/lib/sanity/schemas/team-member';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Team',
  alternates: { canonical: '/team' },
};

const CATEGORY_ORDER = ['founders', 'management', 'department-heads', 'project-managers'] as const;

export default async function TeamPage() {
  const [members, settings, page] = await Promise.all([
    getTeamMembers(),
    getSiteSettings(),
    getTeamPage(),
  ]);

  // Build category labels from page singleton, fallback to schema constants
  const categoryLabels: Record<string, string> = { ...TEAM_CATEGORY };
  if (page?.categoryLabels) {
    for (const item of page.categoryLabels) {
      if (item.value && item.label) categoryLabels[item.value] = item.label;
    }
  }

  // Group by category
  const grouped: Record<string, typeof members> = {};
  for (const m of members) {
    const cat = m.category ?? 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m);
  }

  return (
    <>
      <PageHeader title={page?.pageTitle ?? ''} subtitle={page?.subtitle ?? ''} />

      {CATEGORY_ORDER.map((cat) => {
        const group = grouped[cat];
        if (!group || group.length === 0) return null;
        return (
          <section key={cat} className="section" id={`team-${cat}`}>
            <div className="container">
              <div className="section-header">
                <h2>{categoryLabels[cat] ?? cat}</h2>
              </div>
              <div className="team-grid">
                {group.map((member: {
                  _id: string; name: string; role?: string; image?: { asset?: { _ref?: string } };
                  bio?: any; qualifications?: string; linkedin?: string;
                }) => {
                  const imgUrl = member.image ? sanityImageUrl(member.image) : '';
                  return (
                    <div key={member._id} className="team-card animate-on-scroll">
                      <div className="team-card-image">
                        {imgUrl && <Image src={imgUrl} alt={member.name} width={400} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        <div className="team-card-overlay">
                          <h4>{member.name}</h4>
                          <p className="team-card-position">{member.role}</p>
                          {member.bio && (
                            <div className="team-card-bio">
                              {typeof member.bio === 'string'
                                ? <p>{member.bio}</p>
                                : <PortableText value={member.bio} />
                              }
                            </div>
                          )}
                          {member.qualifications && (
                            <p className="team-card-qualifications">{member.qualifications}</p>
                          )}
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-card-linkedin">
                              <i className="fab fa-linkedin" /> LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                      <h4 className="team-card-name">{member.name}</h4>
                      <p className="team-card-role">{member.role}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      {(page?.ctaTitle || page?.ctaButtonText || settings?.defaultCtaTitle) && (
        <section className="cta-section">
          <div className="container">
            <h2>{page?.ctaTitle ?? settings?.defaultCtaTitle ?? ''}</h2>
            {(page?.ctaSubtitle || settings?.defaultCtaSubtitle) && <p>{page?.ctaSubtitle ?? settings?.defaultCtaSubtitle}</p>}
            <Link href="/jobs" className="btn btn-primary">
              {page?.ctaButtonText ?? settings?.defaultCtaButtonText ?? ''}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
