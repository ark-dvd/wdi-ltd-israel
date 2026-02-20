/**
 * Service (Content Entity) — DOC-020 §3.6
 * Professional service offering with dedicated page.
 * INV-016: slug must be unique across all Services.
 */

export const serviceSchema = {
  name: 'service',
  title: 'שירות',
  type: 'document' as const,
  fields: [
    { name: 'name', title: 'שם', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug' as const,
      options: { source: 'name' },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    { name: 'description', title: 'תיאור', type: 'text' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'tagline', title: 'תת-כותרת', type: 'string' as const },
    { name: 'icon', title: 'אייקון', type: 'string' as const },
    {
      name: 'highlights',
      title: 'נקודות מפתח',
      type: 'array' as const,
      of: [{
        type: 'object' as const,
        fields: [
          { name: 'title', title: 'כותרת', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
          { name: 'description', title: 'תיאור', type: 'text' as const },
        ],
      }],
    },
    {
      name: 'detailContent',
      title: 'תוכן מפורט',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    { name: 'image', title: 'תמונה', type: 'image' as const, options: { hotspot: true } },
    { name: 'order', title: 'סדר', type: 'number' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
