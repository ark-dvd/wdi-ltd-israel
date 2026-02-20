/**
 * Team page — ORIGINAL_DESIGN_SPEC §9, DOC-070 §3.3
 * PageHeader, team members grouped by category in fixed order:
 * founders → management → department-heads → project-managers
 * Square cards with hover overlay (navy 92% opacity).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamMembers } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'הצוות שלנו',
  description: 'הכירו את צוות WDI — מהנדסים, מנהלי פרויקטים ומומחים בתחום הבנייה',
  alternates: { canonical: '/team' },
};

const CATEGORY_ORDER = ['founders', 'management', 'department-heads', 'project-managers'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  founders: 'מייסדים',
  management: 'הנהלה',
  'department-heads': 'ראשי תחומים',
  'project-managers': 'מנהלי פרויקטים',
};

export default async function TeamPage() {
  const members = await getTeamMembers();

  // Group by category
  const grouped: Record<string, typeof members> = {};
  for (const m of members) {
    const cat = m.category ?? 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m);
  }

  return (
    <>
      <PageHeader title="הצוות שלנו" subtitle="אנשי המקצוע שמובילים את הפרויקטים שלכם" />

      {CATEGORY_ORDER.map((cat) => {
        const group = grouped[cat];
        if (!group || group.length === 0) return null;
        return (
          <section key={cat} className="section" id={`team-${cat}`}>
            <div className="container">
              <div className="section-header">
                <h2>{CATEGORY_LABELS[cat] ?? cat}</h2>
              </div>
              <div className="team-grid">
                {group.map((member: {
                  _id: string; name: string; role?: string; image?: { asset?: { _ref?: string } };
                  bio?: string; linkedin?: string;
                }) => {
                  const imgUrl = member.image ? sanityImageUrl(member.image) : '/images/placeholder-person.jpg';
                  return (
                    <div key={member._id} className="team-card animate-on-scroll">
                      <div className="team-card-image">
                        <Image src={imgUrl} alt={member.name} width={400} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="team-card-overlay">
                          <h4>{member.name}</h4>
                          <p className="team-card-position">{member.role}</p>
                          {member.bio && <p className="team-card-bio">{member.bio}</p>}
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
      <section className="cta-section">
        <div className="container">
          <h2>רוצים להצטרף לצוות?</h2>
          <p>אנחנו תמיד מחפשים אנשי מקצוע מצטיינים</p>
          <Link href="/jobs" className="btn btn-primary">משרות פתוחות</Link>
        </div>
      </section>
    </>
  );
}
