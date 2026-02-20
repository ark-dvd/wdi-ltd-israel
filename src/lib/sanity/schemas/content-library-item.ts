/**
 * ContentLibraryItem (Content Entity) — DOC-020 §3.13
 * Professional resource, publication, or reference material.
 */

export const contentLibraryItemSchema = {
  name: 'contentLibraryItem',
  title: 'פריט מאגר מידע',
  type: 'document' as const,
  fields: [
    { name: 'title', title: 'כותרת', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'description', title: 'תיאור', type: 'text' as const },
    { name: 'category', title: 'קטגוריה', type: 'string' as const },
    { name: 'fileUrl', title: 'קובץ', type: 'url' as const },
    { name: 'externalUrl', title: 'קישור חיצוני', type: 'url' as const },
    { name: 'image', title: 'תמונה', type: 'image' as const, options: { hotspot: true } },
    { name: 'order', title: 'סדר', type: 'number' as const },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
