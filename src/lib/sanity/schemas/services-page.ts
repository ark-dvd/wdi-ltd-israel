/** ServicesPage singleton — DOC-070 §3.3 */

export const SERVICES_PAGE_ID = 'servicesPage';

export const servicesPageSchema = {
  name: 'servicesPage',
  title: 'עמוד שירותים',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    { name: 'readMoreText', title: 'טקסט "קרא עוד"', type: 'string' as const },
    { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
    { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
    { name: 'ctaButtonText', title: 'טקסט כפתור CTA', type: 'string' as const },
    { name: 'ctaButtonLink', title: 'קישור כפתור CTA', type: 'string' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
