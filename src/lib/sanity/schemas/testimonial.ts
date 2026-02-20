/**
 * Testimonial (Content Entity) — DOC-020 §3.10
 * INV-037: projectRef is REQUIRED — every testimonial must be project-bound.
 */

export const testimonialSchema = {
  name: 'testimonial',
  title: 'המלצה',
  type: 'document' as const,
  fields: [
    { name: 'clientName', title: 'שם הממליץ', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'quote', title: 'תוכן ההמלצה', type: 'text' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'projectRef',
      title: 'פרויקט',
      type: 'reference' as const,
      to: [{ type: 'project' as const }],
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    { name: 'companyName', title: 'חברה', type: 'string' as const },
    { name: 'role', title: 'תפקיד', type: 'string' as const },
    { name: 'isFeatured', title: 'מוצג בדף הבית', type: 'boolean' as const, initialValue: false },
    { name: 'image', title: 'תמונה', type: 'image' as const, options: { hotspot: true } },
    { name: 'order', title: 'סדר', type: 'number' as const },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
