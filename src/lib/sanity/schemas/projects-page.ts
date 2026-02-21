/** ProjectsPage singleton — DOC-070 §3.4 */

export const PROJECTS_PAGE_ID = 'projectsPage';

export const projectsPageSchema = {
  name: 'projectsPage',
  title: 'עמוד פרויקטים',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
    { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
    { name: 'ctaButtonText', title: 'טקסט כפתור CTA', type: 'string' as const },
    { name: 'ctaButtonLink', title: 'קישור כפתור CTA', type: 'string' as const },
    {
      name: 'sectorLabels',
      title: 'תוויות מגזרים',
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
