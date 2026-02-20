/**
 * HeroSettings (Content Entity — Singleton) — DOC-020 §3.14
 * INV-015/036: Only one record may exist. Deletion is prohibited.
 */

export const HERO_SETTINGS_ID = 'heroSettings';

export const heroSettingsSchema = {
  name: 'heroSettings',
  title: 'הגדרות Hero',
  type: 'document' as const,
  fields: [
    { name: 'headline', title: 'כותרת ראשית', type: 'string' as const },
    { name: 'subheadline', title: 'כותרת משנית', type: 'string' as const },
    { name: 'ctaText', title: 'טקסט כפתור ראשי', type: 'string' as const },
    { name: 'ctaLink', title: 'קישור כפתור ראשי', type: 'string' as const },
    { name: 'cta2Text', title: 'טקסט כפתור שני', type: 'string' as const },
    { name: 'cta2Link', title: 'קישור כפתור שני', type: 'string' as const },
    { name: 'videoUrl', title: 'וידאו רקע', type: 'file' as const, options: { accept: 'video/mp4' } },
    { name: 'backgroundImage', title: 'תמונת גיבוי', type: 'image' as const, options: { hotspot: true } },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
