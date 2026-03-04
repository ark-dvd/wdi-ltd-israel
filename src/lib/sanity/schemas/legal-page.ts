/**
 * LegalPage (Content Entity — Document) — DOC-000 §9
 * Stores legal pages: terms, privacy, accessibility.
 * Each document identified by `pageType` field.
 */

export const LEGAL_PAGE_TYPES = {
  terms: 'תנאי שימוש',
  privacy: 'מדיניות פרטיות',
  accessibility: 'הצהרת נגישות',
} as const;

export type LegalPageType = keyof typeof LEGAL_PAGE_TYPES;

export const legalPageSchema = {
  name: 'legalPage',
  title: 'עמודים משפטיים',
  type: 'document' as const,
  fields: [
    {
      name: 'pageType',
      title: 'סוג עמוד',
      type: 'string' as const,
      options: {
        list: [
          { title: 'תנאי שימוש', value: 'terms' },
          { title: 'מדיניות פרטיות', value: 'privacy' },
          { title: 'הצהרת נגישות', value: 'accessibility' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title',
      title: 'כותרת',
      type: 'string' as const,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'lastUpdated',
      title: 'עודכן לאחרונה',
      type: 'date' as const,
    },
    {
      name: 'content',
      title: 'תוכן',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'pageType' },
  },
};
