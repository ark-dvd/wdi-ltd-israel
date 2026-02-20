/**
 * Projects listing page — /projects
 * Server component with sector filtering via URL search params.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveProjects } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';

const SECTOR_LABELS: Record<string, string> = {
  security: 'בטחוני',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  infrastructure: 'תשתיות',
  residential: 'מגורים',
  public: 'ציבורי',
};

const ALL_SECTORS = Object.keys(SECTOR_LABELS);

export const metadata: Metadata = {
  title: 'פרויקטים | WDI',
  description:
    'פרויקטים נבחרים של WDI — ניהול פרויקטים, פיקוח וייעוץ הנדסי במגזרים ביטחוניים, מסחריים, תעשייתיים ועוד.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector: activeSector } = await searchParams;
  const allProjects = await getActiveProjects();

  /* Filter by sector if query param is present and valid */
  const filtered =
    activeSector && ALL_SECTORS.includes(activeSector)
      ? allProjects.filter(
          (p: { sector?: string }) => p.sector === activeSector,
        )
      : allProjects;

  return (
    <section className="py-16 lg:py-24" dir="rtl">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        {/* Page heading */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-4">
            הפרויקטים שלנו
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            מבחר פרויקטים שבהם WDI מספקת שירותי ניהול, פיקוח וייעוץ הנדסי
            במגזרים מגוונים ברחבי הארץ.
          </p>
        </header>

        {/* Sector filter buttons */}
        <nav aria-label="סינון לפי מגזר" className="mb-10">
          <ul className="flex flex-wrap justify-center gap-3">
            {/* "All" button */}
            <li>
              <Link
                href="/projects"
                className={`inline-block px-5 py-2 rounded-full text-sm font-medium transition ${
                  !activeSector
                    ? 'bg-wdi-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                הכל
              </Link>
            </li>
            {ALL_SECTORS.map((sectorKey) => (
              <li key={sectorKey}>
                <Link
                  href={`/projects?sector=${sectorKey}`}
                  className={`inline-block px-5 py-2 rounded-full text-sm font-medium transition ${
                    activeSector === sectorKey
                      ? 'bg-wdi-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {SECTOR_LABELS[sectorKey]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Projects grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(
              (project: {
                _id: string;
                title: string;
                slug: string | { current: string };
                client?: string;
                sector?: string;
                featuredImage?: { asset?: { _ref?: string } };
              }) => {
                const slug =
                  typeof project.slug === 'string'
                    ? project.slug
                    : project.slug?.current;
                const imageUrl = sanityImageUrl(project.featuredImage);
                const sectorLabel = project.sector
                  ? SECTOR_LABELS[project.sector]
                  : null;

                return (
                  <article
                    key={project._id}
                    className="group rounded-2xl border border-gray-200 bg-white shadow-wdi-sm hover:shadow-wdi-lg transition-shadow duration-300 overflow-hidden"
                  >
                    <Link href={`/projects/${slug}`} className="block">
                      {/* Image */}
                      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <svg
                              className="w-12 h-12"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Sector badge */}
                        {sectorLabel && (
                          <span className="absolute top-3 start-3 bg-wdi-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                            {sectorLabel}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-lg font-bold text-wdi-primary mb-1 group-hover:text-wdi-primary-light transition">
                          {project.title}
                        </h2>
                        {project.client && (
                          <p className="text-sm text-gray-500">
                            {project.client}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            לא נמצאו פרויקטים
            {activeSector ? ` במגזר ${SECTOR_LABELS[activeSector]}` : ''}.
          </p>
        )}
      </div>
    </section>
  );
}
