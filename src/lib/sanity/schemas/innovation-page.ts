/**
 * InnovationPage (Content Entity — Singleton) — DOC-070 §3.10
 * INV-P01: All visible text from CMS. INV-P07: icons from icon bank.
 * Fields: pageTitle, subtitle, content (RT), image, sections (icon bank + RT + image),
 *         CTA text.
 */
import { ICON_OPTIONS } from '../icon-bank';

export const INNOVATION_PAGE_ID = 'innovationPage';

export const innovationPageSchema = {
  name: 'innovationPage',
  title: 'עמוד חדשנות',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    {
      name: 'content',
      title: 'תוכן ראשי',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    { name: 'image', title: 'תמונה ראשית', type: 'image' as const, options: { hotspot: true } },
    // Keep old fields for migration
    { name: 'headline', title: 'כותרת (ישן)', type: 'string' as const, hidden: true },
    { name: 'introduction', title: 'מבוא (ישן)', type: 'text' as const, hidden: true },
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
            {
              name: 'icon',
              title: 'אייקון',
              type: 'string' as const,
              options: { list: ICON_OPTIONS },
              description: 'בחר אייקון מהבנק',
            },
            {
              name: 'content',
              title: 'תוכן',
              type: 'array' as const,
              of: [{ type: 'block' as const }],
            },
            { name: 'image', title: 'תמונה', type: 'image' as const, options: { hotspot: true } },
          ],
        },
      ],
    },
    // CTA section
    { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
    { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
    { name: 'ctaButtonText', title: 'טקסט כפתור CTA ראשי', type: 'string' as const },
    { name: 'ctaButtonLink', title: 'קישור כפתור CTA ראשי', type: 'string' as const },
    { name: 'cta2ButtonText', title: 'טקסט כפתור CTA שני', type: 'string' as const },
    { name: 'cta2ButtonLink', title: 'קישור כפתור CTA שני', type: 'string' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
