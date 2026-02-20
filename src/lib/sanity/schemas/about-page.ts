/**
 * AboutPage (Content Entity — Singleton)
 * Stores dynamic content for the About page.
 */

export const ABOUT_PAGE_ID = 'aboutPage';

export const aboutPageSchema = {
  name: 'aboutPage',
  title: 'עמוד אודות',
  type: 'document' as const,
  fields: [
    { name: 'vision', title: 'חזון', type: 'text' as const },
    {
      name: 'storyContent',
      title: 'הסיפור שלנו',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    {
      name: 'stats',
      title: 'נתונים מספריים',
      type: 'array' as const,
      of: [
        {
          type: 'object' as const,
          fields: [
            { name: 'label', title: 'תיאור', type: 'string' as const },
            { name: 'value', title: 'ערך', type: 'string' as const },
          ],
        },
      ],
    },
    {
      name: 'values',
      title: 'ערכים',
      type: 'array' as const,
      of: [
        {
          type: 'object' as const,
          fields: [
            { name: 'title', title: 'כותרת', type: 'string' as const },
            { name: 'description', title: 'תיאור', type: 'text' as const },
            { name: 'icon', title: 'אייקון', type: 'string' as const },
          ],
        },
      ],
    },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
