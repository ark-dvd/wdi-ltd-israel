/**
 * Lead (CRM Entity) — DOC-020 §3.1
 * Inbound inquiry from prospective client.
 */

export const LEAD_STATUS = {
  new: 'חדש',
  contacted: 'נוצר קשר',
  qualified: 'מתאים',
  proposal_sent: 'הצעה נשלחה',
  won: 'נסגר בהצלחה',
  lost: 'לא רלוונטי',
  archived: 'בארכיון',
} as const;

export type LeadStatus = keyof typeof LEAD_STATUS;

export const LEAD_PRIORITY = {
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
} as const;

export type LeadPriority = keyof typeof LEAD_PRIORITY;

/** INV-005: Valid status transitions — DOC-020 §3.1 */
export const LEAD_TRANSITIONS: Record<LeadStatus, readonly LeadStatus[]> = {
  new: ['contacted', 'lost', 'archived'],
  contacted: ['qualified', 'lost', 'archived'],
  qualified: ['proposal_sent', 'lost', 'archived'],
  proposal_sent: ['won', 'lost', 'archived'],
  won: ['archived'],
  lost: ['archived'],
  archived: [],
} as const;

export const leadSchema = {
  name: 'lead',
  title: 'ליד',
  type: 'document' as const,
  fields: [
    { name: 'name', title: 'שם', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'email', title: 'אימייל', type: 'string' as const, validation: (Rule: { required: () => { (): unknown; email: () => unknown } }) => Rule.required() },
    { name: 'message', title: 'הודעה', type: 'text' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'source', title: 'מקור', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'status',
      title: 'סטטוס',
      type: 'string' as const,
      options: { list: Object.entries(LEAD_STATUS).map(([value, title]) => ({ title, value })) },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
      initialValue: 'new',
    },
    {
      name: 'priority',
      title: 'עדיפות',
      type: 'string' as const,
      options: { list: Object.entries(LEAD_PRIORITY).map(([value, title]) => ({ title, value })) },
      initialValue: 'medium',
    },
    { name: 'company', title: 'חברה', type: 'string' as const },
    { name: 'phone', title: 'טלפון', type: 'string' as const },
    { name: 'servicesInterested', title: 'שירותים מבוקשים', type: 'array' as const, of: [{ type: 'string' as const }] },
    { name: 'notes', title: 'הערות', type: 'text' as const },
    { name: 'description', title: 'תיאור פרויקט', type: 'text' as const },
    { name: 'estimatedValue', title: 'ערך משוער', type: 'number' as const, initialValue: 0 },
    { name: 'referredBy', title: 'הופנה ע"י', type: 'string' as const },
    { name: 'convertedToClientId', title: 'הומר ללקוח', type: 'string' as const, readOnly: true },
    { name: 'convertedAt', title: 'תאריך המרה', type: 'datetime' as const, readOnly: true },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
