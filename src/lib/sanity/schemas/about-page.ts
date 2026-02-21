/**
 * AboutPage (Content Entity — Singleton) — DOC-070 §3.2
 * INV-P01: All visible text from CMS. INV-P07: icons from icon bank.
 * Fields: pageTitle, subtitle, companyDescription (RT), values (icon bank + RT),
 *         stats, CTA text, section headers.
 */
import { ICON_OPTIONS } from '../icon-bank';

export const ABOUT_PAGE_ID = 'aboutPage';

export const aboutPageSchema = {
  name: 'aboutPage',
  title: 'עמוד אודות',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    // Rich text company description — replaces old `storyContent` / `vision`
    {
      name: 'companyDescription',
      title: 'תיאור החברה (הסיפור שלנו)',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    // Vision section — displayed BEFORE values on the public about page
    { name: 'visionTitle', title: 'כותרת החזון שלנו', type: 'string' as const },
    {
      name: 'visionContent',
      title: 'תוכן החזון שלנו',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    // Keep old fields readable for migration via GROQ coalesce()
    { name: 'vision', title: 'חזון (ישן)', type: 'text' as const, hidden: true },
    { name: 'storyContent', title: 'הסיפור שלנו (ישן)', type: 'array' as const, of: [{ type: 'block' as const }], hidden: true },
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
    // Section header for values
    { name: 'valuesTitle', title: 'כותרת מקטע ערכים', type: 'string' as const },
    {
      name: 'values',
      title: 'ערכים',
      type: 'array' as const,
      of: [
        {
          type: 'object' as const,
          fields: [
            { name: 'title', title: 'כותרת', type: 'string' as const },
            {
              name: 'description',
              title: 'תיאור',
              type: 'array' as const,
              of: [{ type: 'block' as const }],
            },
            {
              name: 'icon',
              title: 'אייקון',
              type: 'string' as const,
              options: { list: ICON_OPTIONS },
              description: 'בחר אייקון מהבנק',
            },
          ],
        },
      ],
    },
    // Press section header
    { name: 'pressTitle', title: 'כותרת מקטע כתבו עלינו', type: 'string' as const },
    // CTA section
    { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
    { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
    { name: 'ctaButtonText', title: 'טקסט כפתור CTA', type: 'string' as const },
    { name: 'ctaButtonLink', title: 'קישור כפתור CTA', type: 'string' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
