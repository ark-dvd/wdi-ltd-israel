/**
 * SiteSettings (Content Entity — Singleton) — DOC-020 §3.15
 * INV-014/025: Only one record may exist. Deletion prohibited.
 * Application must fail to start if this singleton does not exist.
 */

export const SITE_SETTINGS_ID = 'siteSettings';

export const siteSettingsSchema = {
  name: 'siteSettings',
  title: 'הגדרות אתר',
  type: 'document' as const,
  fields: [
    { name: 'companyName', title: 'שם חברה', type: 'string' as const },
    { name: 'phone', title: 'טלפון', type: 'string' as const },
    { name: 'email', title: 'אימייל', type: 'string' as const },
    { name: 'address', title: 'כתובת', type: 'text' as const },
    { name: 'footerText', title: 'תוכן תחתית', type: 'text' as const },
    {
      name: 'socialLinks',
      title: 'קישורי רשתות חברתיות',
      type: 'object' as const,
      fields: [
        { name: 'linkedin', title: 'LinkedIn', type: 'url' as const },
        { name: 'facebook', title: 'Facebook', type: 'url' as const },
        { name: 'instagram', title: 'Instagram', type: 'url' as const },
      ],
    },
    { name: 'seoTitle', title: 'כותרת SEO', type: 'string' as const },
    { name: 'seoDescription', title: 'תיאור SEO', type: 'text' as const },
    { name: 'seoKeywords', title: 'מילות מפתח', type: 'string' as const },
    { name: 'ogImage', title: 'תמונת שיתוף', type: 'image' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
