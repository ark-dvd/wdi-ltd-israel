/**
 * Activity (CRM Entity — Append-Only) — DOC-020 §3.4
 * Immutable audit trail record. INV-011: never modified or deleted.
 */

export const ACTIVITY_TYPE = {
  status_change: 'שינוי סטטוס',
  note_added: 'הערה נוספה',
  lead_created: 'ליד נוצר',
  lead_converted: 'ליד הומר ללקוח',
  client_created: 'לקוח נוצר',
  lead_archived: 'ליד הועבר לארכיון',
  client_archived: 'לקוח הועבר לארכיון',
  record_restored: 'רשומה שוחזרה',
  record_updated: 'רשומה עודכנה',
  duplicate_submission: 'הגשה כפולה',
  bulk_operation: 'פעולה מרובה',
  call_logged: 'שיחה תועדה',
  email_sent: 'אימייל נשלח',
  email_received: 'אימייל התקבל',
  site_visit_scheduled: 'ביקור באתר תוכנן',
  site_visit_completed: 'ביקור באתר בוצע',
  quote_sent: 'הצעת מחיר נשלחה',
  quote_accepted: 'הצעת מחיר התקבלה',
  quote_rejected: 'הצעת מחיר נדחתה',
  custom: 'מותאם אישית',
} as const;

export type ActivityType = keyof typeof ACTIVITY_TYPE;

export const ACTIVITY_ENTITY_TYPE = {
  lead: 'ליד',
  client: 'לקוח',
  engagement: 'התקשרות',
} as const;

export type ActivityEntityType = keyof typeof ACTIVITY_ENTITY_TYPE;

export const activitySchema = {
  name: 'activity',
  title: 'פעילות',
  type: 'document' as const,
  readOnly: true,
  fields: [
    {
      name: 'entityType',
      title: 'סוג ישות',
      type: 'string' as const,
      options: { list: Object.entries(ACTIVITY_ENTITY_TYPE).map(([value, title]) => ({ title, value })) },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
      readOnly: true,
    },
    { name: 'entityId', title: 'מזהה ישות', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required(), readOnly: true },
    {
      name: 'type',
      title: 'סוג פעילות',
      type: 'string' as const,
      options: { list: Object.entries(ACTIVITY_TYPE).map(([value, title]) => ({ title, value })) },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
      readOnly: true,
    },
    { name: 'description', title: 'תיאור', type: 'text' as const, validation: (Rule: { required: () => unknown }) => Rule.required(), readOnly: true },
    { name: 'performedBy', title: 'בוצע ע"י', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required(), readOnly: true },
    { name: 'metadata', title: 'מטא-דאטה', type: 'object' as const, fields: [
      { name: 'previousStatus', title: 'סטטוס קודם', type: 'string' as const },
      { name: 'newStatus', title: 'סטטוס חדש', type: 'string' as const },
      { name: 'details', title: 'פרטים', type: 'text' as const },
    ], readOnly: true },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
