/**
 * Engagement (CRM Entity) — DOC-020 §3.3
 * Active work commitment to a client.
 */

export const ENGAGEMENT_STATUS = {
  new: 'חדש',
  in_progress: 'בביצוע',
  review: 'בבדיקה',
  delivered: 'נמסר',
  completed: 'הושלם',
  paused: 'מושהה',
  cancelled: 'בוטל',
} as const;

export type EngagementStatus = keyof typeof ENGAGEMENT_STATUS;

/** INV-022: Valid status transitions */
export const ENGAGEMENT_TRANSITIONS: Record<EngagementStatus, readonly EngagementStatus[]> = {
  new: ['in_progress', 'paused', 'cancelled'],
  in_progress: ['review', 'delivered', 'paused', 'cancelled'],
  review: ['in_progress', 'delivered', 'paused', 'cancelled'],
  delivered: ['completed', 'in_progress', 'cancelled'],
  paused: ['new', 'in_progress', 'cancelled'],
  completed: [],
  cancelled: [],
} as const;

export const engagementSchema = {
  name: 'engagement',
  title: 'התקשרות',
  type: 'document' as const,
  fields: [
    { name: 'title', title: 'כותרת', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'client',
      title: 'לקוח',
      type: 'reference' as const,
      to: [{ type: 'clientCrm' as const }],
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'status',
      title: 'סטטוס',
      type: 'string' as const,
      options: { list: Object.entries(ENGAGEMENT_STATUS).map(([value, title]) => ({ title, value })) },
      initialValue: 'new',
    },
    { name: 'engagementType', title: 'סוג התקשרות', type: 'string' as const },
    { name: 'value', title: 'ערך', type: 'number' as const, initialValue: 0 },
    { name: 'estimatedDuration', title: 'משך משוער', type: 'string' as const },
    { name: 'scope', title: 'היקף', type: 'array' as const, of: [{ type: 'string' as const }] },
    { name: 'startDate', title: 'תאריך התחלה', type: 'date' as const },
    { name: 'expectedEndDate', title: 'תאריך סיום משוער', type: 'date' as const },
    { name: 'actualEndDate', title: 'תאריך סיום בפועל', type: 'date' as const },
    { name: 'description', title: 'תיאור', type: 'text' as const },
    { name: 'internalNotes', title: 'הערות פנימיות', type: 'text' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
