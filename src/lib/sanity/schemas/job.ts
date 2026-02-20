/**
 * Job (Content Entity) — DOC-070 §3.14
 * Open position at WDI.
 * INV-P01: type field is dropdown, not free text.
 */

const JOB_TYPES = [
  { title: 'משרה מלאה', value: 'full-time' },
  { title: 'חלקית', value: 'part-time' },
  { title: 'פרילנס', value: 'freelance' },
  { title: 'חוזה', value: 'contract' },
];

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
    {
      name: 'type',
      title: 'סוג משרה',
      type: 'string' as const,
      options: { list: JOB_TYPES },
    },
    { name: 'department', title: 'מחלקה', type: 'string' as const },
    { name: 'contactEmail', title: 'אימייל ליצירת קשר', type: 'string' as const },
    { name: 'order', title: 'סדר', type: 'number' as const },
    { name: 'isActive', title: 'פעילה', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
