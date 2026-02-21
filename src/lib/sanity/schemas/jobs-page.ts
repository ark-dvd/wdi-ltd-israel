/** JobsPage singleton — DOC-070 §3.8 */

export const JOBS_PAGE_ID = 'jobsPage';

export const jobsPageSchema = {
  name: 'jobsPage',
  title: 'עמוד משרות',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    { name: 'noJobsTitle', title: 'כותרת "אין משרות"', type: 'string' as const },
    { name: 'noJobsSubtitle', title: 'תת-כותרת "אין משרות"', type: 'string' as const },
    { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
    { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
    { name: 'ctaButtonText', title: 'טקסט כפתור CTA', type: 'string' as const },
    { name: 'ctaButtonLink', title: 'קישור כפתור CTA', type: 'string' as const },
    { name: 'applyButtonText', title: 'טקסט הגשת מועמדות', type: 'string' as const },
    { name: 'sendCvText', title: 'טקסט שליחת קו"ח', type: 'string' as const },
    {
      name: 'typeLabels',
      title: 'תוויות סוגי משרה',
      type: 'array' as const,
      of: [
        {
          type: 'object' as const,
          fields: [
            { name: 'value', title: 'מזהה', type: 'string' as const },
            { name: 'label', title: 'תווית', type: 'string' as const },
          ],
        },
      ],
    },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
