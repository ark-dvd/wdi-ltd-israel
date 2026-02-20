/**
 * Project (Content Entity) — DOC-020 §3.7
 * Completed/ongoing project with detail page.
 * INV-013: sector must be from defined enum.
 * INV-030/032: slug must be unique.
 */

export const PROJECT_SECTOR = {
  security: 'בטחוני',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  infrastructure: 'תשתיות',
  residential: 'מגורים',
  public: 'ציבורי',
} as const;

export type ProjectSector = keyof typeof PROJECT_SECTOR;

export const projectSchema = {
  name: 'project',
  title: 'פרויקט',
  type: 'document' as const,
  fields: [
    { name: 'title', title: 'שם פרויקט', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug' as const,
      options: { source: 'title' },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    { name: 'client', title: 'מזמין', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'sector',
      title: 'ענף',
      type: 'string' as const,
      options: { list: Object.entries(PROJECT_SECTOR).map(([value, title]) => ({ title, value })) },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'description',
      title: 'תיאור',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    { name: 'scope', title: 'היקף', type: 'array' as const, of: [{ type: 'string' as const }] },
    { name: 'location', title: 'מיקום', type: 'string' as const },
    {
      name: 'images',
      title: 'תמונות',
      type: 'array' as const,
      of: [{ type: 'image' as const, options: { hotspot: true } }],
    },
    { name: 'featuredImage', title: 'תמונה ראשית', type: 'image' as const, options: { hotspot: true } },
    { name: 'isFeatured', title: 'מוצג בדף הבית', type: 'boolean' as const, initialValue: false },
    { name: 'startDate', title: 'תאריך התחלה', type: 'date' as const },
    { name: 'completedAt', title: 'תאריך סיום', type: 'date' as const },
    { name: 'order', title: 'סדר', type: 'number' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
