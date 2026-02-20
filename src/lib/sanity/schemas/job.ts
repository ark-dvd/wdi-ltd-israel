/**
 * Job (Content Entity) — DOC-020 §3.12
 * Open position at WDI.
 */

export const jobSchema = {
  name: 'job',
  title: 'משרה',
  type: 'document' as const,
  fields: [
    { name: 'title', title: 'כותרת משרה', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'description',
      title: 'תיאור',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    {
      name: 'requirements',
      title: 'דרישות',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    { name: 'location', title: 'מיקום', type: 'string' as const },
    { name: 'type', title: 'סוג משרה', type: 'string' as const },
    { name: 'department', title: 'מחלקה', type: 'string' as const },
    { name: 'contactEmail', title: 'אימייל ליצירת קשר', type: 'string' as const },
    { name: 'order', title: 'סדר', type: 'number' as const },
    { name: 'isActive', title: 'פעילה', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
