/**
 * ContentLibraryItem (Content Entity) — DOC-070 §3.11
 * Professional resource, publication, or reference material.
 * INV-P02: file is upload (type: 'file'), NOT url.
 * INV-P07: icon from icon bank.
 */
import { ICON_OPTIONS } from '../icon-bank';

export const contentLibraryItemSchema = {
  name: 'contentLibraryItem',
  title: 'פריט מאגר מידע',
  type: 'document' as const,
  fields: [
    { name: 'title', title: 'כותרת', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'description', title: 'תיאור', type: 'text' as const },
    { name: 'category', title: 'קטגוריה', type: 'string' as const },
    {
      name: 'icon',
      title: 'אייקון',
      type: 'string' as const,
      options: { list: ICON_OPTIONS },
      description: 'בחר אייקון מהבנק',
    },
    {
      name: 'file',
      title: 'קובץ (העלאה)',
      type: 'file' as const,
      description: 'העלה קובץ ישירות — PDF, DOC וכו\'',
    },
    // Keep old field for migration
    { name: 'fileUrl', title: 'קישור (ישן)', type: 'url' as const, hidden: true },
    { name: 'externalUrl', title: 'קישור חיצוני', type: 'url' as const },
    { name: 'image', title: 'תמונה', type: 'image' as const, options: { hotspot: true } },
    { name: 'order', title: 'סדר', type: 'number' as const },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
