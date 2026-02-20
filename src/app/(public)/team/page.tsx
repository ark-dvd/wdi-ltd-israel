/**
 * Team page — public listing of all team members grouped by category.
 * Server Component. DOC-060 §6.4
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTeamMembers } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';
import { PersonJsonLd } from '@/components/public/JsonLd';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'הצוות שלנו',
  description:
    'הכירו את הצוות המקצועי של WDI — מהנדסים, מנהלי פרויקטים ויועצים מובילים בתחום הבנייה והתשתיות בישראל.',
  alternates: { canonical: '/team' },
};

const CATEGORY_LABELS: Record<string, string> = {
  founders: 'מייסדים',
  management: 'הנהלה',
  'department-heads': 'ראשי מחלקות',
  'project-managers': 'מנהלי פרויקטים',
};

const CATEGORY_ORDER = ['founders', 'management', 'department-heads', 'project-managers'];

function groupByCategory(members: any[]) {
  const groups: Record<string, any[]> = {};
  for (const member of members) {
    const cat = member.category ?? 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(member);
  }
  return groups;
}

export default async function TeamPage() {
  const members = await getTeamMembers();
  const grouped = groupByCategory(members);

  // Build ordered list of categories present in data
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <>
      {/* JSON-LD for every team member */}
      {members.map((person: any) => (
        <PersonJsonLd key={person._id} person={person} />
      ))}

      {/* Hero */}
      <section className="bg-wdi-primary text-white py-16 lg:py-24">
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">הצוות שלנו</h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto">
            אנשי המקצוע שמובילים כל פרויקט מהחזון ועד ליישום בשטח
          </p>
        </div>
      </section>

      {/* Team grid by category */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          {orderedCategories.map((category) => (
            <div key={category} className="mb-16 last:mb-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-wdi-primary mb-8 border-b-2 border-wdi-secondary pb-3">
                {CATEGORY_LABELS[category] ?? category}
              </h2>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {(grouped[category] ?? []).map((member: any) => {
                  const imgSrc = sanityImageUrl(member.image);

                  return (
                    <li
                      key={member._id}
                      className="bg-white rounded-xl shadow-wdi-md hover:shadow-wdi-lg transition-shadow overflow-hidden flex flex-col"
                    >
                      {/* Photo */}
                      <div className="relative w-full aspect-[3/4] bg-gray-100">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={member.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-wdi-primary/30">
                            {member.name?.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-wdi-primary">
                          {member.name}
                        </h3>
                        <p className="text-sm text-wdi-secondary font-medium mt-1">
                          {member.role}
                        </p>

                        {member.bio && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-3 flex-1">
                            {member.bio}
                          </p>
                        )}

                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-wdi-primary hover:text-wdi-primary-light font-medium mt-4 transition-colors"
                            aria-label={`פרופיל LinkedIn של ${member.name}`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {members.length === 0 && (
            <p className="text-center text-gray-500 text-lg py-12">
              תוכן הצוות יעודכן בקרוב.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
