/** TeamPage singleton — DOC-070 §3.5 */

export const TEAM_PAGE_ID = 'teamPage';

export const teamPageSchema = {
  name: 'teamPage',
  title: 'עמוד צוות',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
    { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
    { name: 'ctaButtonText', title: 'טקסט כפתור CTA', type: 'string' as const },
    { name: 'ctaButtonLink', title: 'קישור כפתור CTA', type: 'string' as const },
    {
      name: 'categoryLabels',
      title: 'תוויות קטגוריות',
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
