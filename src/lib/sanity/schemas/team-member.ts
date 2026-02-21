/**
 * TeamMember (Content Entity) — DOC-070 §3.3
 * INV-017: category must be from defined enum.
 * INV-024: field name is "role" NOT "position".
 * INV-026: degrees must be structured array.
 */

export const TEAM_CATEGORY = {
  founders: 'מייסדים',
  management: 'הנהלה ואדמיניסטרציה',
  'department-heads': 'ראשי תחומים',
  'project-managers': 'מנהלי פרויקטים',
} as const;

export type TeamCategory = keyof typeof TEAM_CATEGORY;

const DEGREE_LEVELS = [
  { title: 'תואר ראשון (B.Sc / B.A)', value: 'bachelor' },
  { title: 'תואר שני (M.Sc / M.A / MBA)', value: 'master' },
  { title: 'דוקטורט (Ph.D)', value: 'phd' },
  { title: 'הנדסאי', value: 'practical-engineer' },
  { title: 'טכנאי', value: 'technician' },
  { title: 'תעודת מקצוע', value: 'certificate' },
  { title: 'אחר', value: 'other' },
];

export const teamMemberSchema = {
  name: 'teamMember',
  title: 'חבר צוות',
  type: 'document' as const,
  fields: [
    { name: 'name', title: 'שם', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'role', title: 'תפקיד', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'category',
      title: 'קטגוריה',
      type: 'string' as const,
      options: { list: Object.entries(TEAM_CATEGORY).map(([value, title]) => ({ title, value })) },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    { name: 'image', title: 'תמונה', type: 'image' as const, options: { hotspot: true } },
    {
      name: 'bio',
      title: 'רקע מקצועי',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    { name: 'qualifications', title: 'כישורים', type: 'text' as const },
    { name: 'birthYear', title: 'שנת לידה', type: 'number' as const },
    { name: 'residence', title: 'מקום מגורים', type: 'string' as const },
    {
      name: 'degrees',
      title: 'השכלה',
      type: 'array' as const,
      of: [{
        type: 'object' as const,
        fields: [
          { name: 'title', title: 'שם תואר', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
          {
            name: 'degree',
            title: 'רמת תואר',
            type: 'string' as const,
            options: { list: DEGREE_LEVELS },
            validation: (Rule: { required: () => unknown }) => Rule.required(),
          },
          { name: 'institution', title: 'מוסד', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
          { name: 'year', title: 'שנה', type: 'number' as const },
        ],
      }],
    },
    { name: 'linkedin', title: 'LinkedIn', type: 'url' as const },
    { name: 'email', title: 'אימייל', type: 'string' as const },
    { name: 'phone', title: 'טלפון', type: 'string' as const },
    { name: 'order', title: 'סדר', type: 'number' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'isActive', title: 'פעיל', type: 'boolean' as const, initialValue: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
