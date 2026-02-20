/**
 * InnovationPage (Content Entity — Singleton)
 * Stores dynamic content for the Innovation page.
 */

export const INNOVATION_PAGE_ID = 'innovationPage';

export const innovationPageSchema = {
  name: 'innovationPage',
  title: 'עמוד חדשנות',
  type: 'document' as const,
  fields: [
    { name: 'headline', title: 'כותרת ראשית', type: 'string' as const },
    { name: 'introduction', title: 'פסקת מבוא', type: 'text' as const },
    {
      name: 'sections',
      title: 'מקטעי חדשנות',
      type: 'array' as const,
      of: [
        {
          type: 'object' as const,
          fields: [
            {
              name: 'title',
              title: 'כותרת',
              type: 'string' as const,
              validation: (Rule: { required: () => unknown }) => Rule.required(),
            },
            { name: 'subtitle', title: 'כותרת משנה', type: 'string' as const },
            { name: 'description', title: 'תיאור', type: 'text' as const },
            {
              name: 'features',
              title: 'תכונות',
              type: 'array' as const,
              of: [{ type: 'string' as const }],
            },
          ],
        },
      ],
    },
    { name: 'visionTitle', title: 'כותרת חזון', type: 'string' as const },
    { name: 'visionText', title: 'טקסט חזון', type: 'text' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
