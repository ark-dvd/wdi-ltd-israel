/**
 * Jobs / Careers page — active job listings. Server Component. DOC-060 §6.7
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveJobs } from '@/lib/data-fetchers';
import { JobPostingJsonLd } from '@/components/public/JsonLd';

export const metadata: Metadata = {
  title: 'קריירה',
  description:
    'הצטרפו לצוות WDI — משרות פתוחות בניהול פרויקטים, פיקוח הנדסי וייעוץ. גלו הזדמנויות קריירה בחברת בוטיק מובילה.',
  alternates: { canonical: '/jobs' },
};

const TYPE_LABELS: Record<string, string> = {
  'משרה מלאה': 'משרה מלאה',
  'משרה חלקית': 'משרה חלקית',
  freelance: 'פרילנס',
};

export default async function JobsPage() {
  const jobs = await getActiveJobs();

  return (
    <>
      {/* JSON-LD for each job */}
      {jobs.map((job: any) => (
        <JobPostingJsonLd key={job._id} job={job} />
      ))}

      {/* Hero */}
      <section className="bg-wdi-primary text-white py-16 lg:py-24">
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">קריירה ב-WDI</h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto">
            מחפשים את האתגר הבא? הצטרפו לצוות של אנשי מקצוע מובילים בתחום הבנייה והתשתיות
          </p>
        </div>
      </section>

      {/* Job listings */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          {jobs.length > 0 ? (
            <>
              <h2 className="text-2xl lg:text-3xl font-bold text-wdi-primary mb-8 text-center">
                משרות פתוחות
              </h2>

              <ul className="space-y-6 max-w-3xl mx-auto">
                {jobs.map((job: any) => (
                  <li key={job._id}>
                    <article className="bg-white rounded-xl shadow-wdi-md p-6 lg:p-8 hover:shadow-wdi-lg transition-shadow">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <h3 className="text-xl font-bold text-wdi-primary">
                          {job.title}
                        </h3>
                        {job.type && (
                          <span className="inline-block bg-wdi-secondary/10 text-wdi-secondary px-3 py-1 rounded-full text-sm font-medium shrink-0">
                            {TYPE_LABELS[job.type] ?? job.type}
                          </span>
                        )}
                      </div>

                      {/* Meta badges */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                        {job.department && (
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {job.location}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {job.description && (
                        <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                          {job.description}
                        </p>
                      )}

                      {/* Requirements */}
                      {job.requirements && (
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-2">
                            דרישות התפקיד:
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {job.requirements}
                          </p>
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        href="/job-application"
                        className="inline-block bg-wdi-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-wdi-primary-light transition-colors"
                      >
                        הגשת מועמדות
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="text-center py-16 max-w-xl mx-auto">
              <div className="bg-white rounded-xl shadow-wdi-md p-10">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-xl font-bold text-wdi-primary mb-3">
                  אין משרות פתוחות כרגע
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  כרגע אין משרות זמינות, אך אנחנו תמיד שמחים לשמוע מאנשי מקצוע
                  מוכשרים. שלחו קורות חיים ל-
                  <a
                    href="mailto:careers@wdi-israel.co.il"
                    className="text-wdi-primary hover:text-wdi-primary-light font-medium transition-colors"
                  >
                    careers@wdi-israel.co.il
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
