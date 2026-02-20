/**
 * PressItem (Content Entity) — DOC-020 §3.11
 * Media article or coverage piece about WDI.
 */

export const pressItemSchema = {
  name: 'pressItem',
  title: 'כתבה',
  type: 'document' as const,
  fields: [
    { name: 'title', title: 'כותרת', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'source', title: 'מקור', type: 'string' as const },
    { name: 'publishDate', title: 'תאריך פרסום', type: 'date' as const },
    { name: 'excerpt', title: 'תקציר', type: 'text' as const },
    { name: 'externalUrl', title: 'קישור', type: 'url' as const },
    { name: 'image', title: 'תמונה', type: 'image' as const, options: { hotspot: true } },
    { name: 'order', title: 'סדר', type: 'number' as const },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
