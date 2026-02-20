/**
 * Client Content (Content Entity) — DOC-020 §3.9
 * Client organization logo for public site display.
 * Distinct from CRM Client entity.
 */

export const clientContentSchema = {
  name: 'clientContent',
  title: 'לקוח (תוכן)',
  type: 'document' as const,
  fields: [
    { name: 'name', title: 'שם', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'logo', title: 'לוגו', type: 'image' as const, options: { hotspot: true } },
    { name: 'websiteUrl', title: 'אתר', type: 'url' as const },
    { name: 'order', title: 'סדר', type: 'number' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
