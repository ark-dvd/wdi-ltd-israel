/**
 * Client CRM (CRM Entity) — DOC-020 §3.2
 * Business relationship that has progressed beyond inquiry.
 */

export const CLIENT_CRM_STATUS = {
  active: 'פעיל',
  completed: 'הושלם',
  inactive: 'לא פעיל',
  archived: 'בארכיון',
} as const;

export type ClientCrmStatus = keyof typeof CLIENT_CRM_STATUS;

/** INV-010: Valid status transitions */
export const CLIENT_CRM_TRANSITIONS: Record<ClientCrmStatus, readonly ClientCrmStatus[]> = {
  active: ['completed', 'inactive', 'archived'],
  completed: ['inactive', 'archived'],
  inactive: ['active', 'archived'],
  archived: [],
} as const;

export const PREFERRED_CONTACT = {
  phone: 'טלפון',
  email: 'אימייל',
  message: 'הודעה',
} as const;

export const clientCrmSchema = {
  name: 'clientCrm',
  title: 'לקוח CRM',
  type: 'document' as const,
  fields: [
    { name: 'name', title: 'שם', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: 'email', title: 'אימייל', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
    {
      name: 'status',
      title: 'סטטוס',
      type: 'string' as const,
      options: { list: Object.entries(CLIENT_CRM_STATUS).map(([value, title]) => ({ title, value })) },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
      initialValue: 'active',
    },
    { name: 'company', title: 'חברה', type: 'string' as const },
    { name: 'phone', title: 'טלפון', type: 'string' as const },
    { name: 'address', title: 'כתובת', type: 'string' as const },
    {
      name: 'preferredContact',
      title: 'דרך יצירת קשר מועדפת',
      type: 'string' as const,
      options: { list: Object.entries(PREFERRED_CONTACT).map(([value, title]) => ({ title, value })) },
    },
    { name: 'sourceLead', title: 'ליד מקור', type: 'reference' as const, to: [{ type: 'lead' as const }] },
    { name: 'notes', title: 'הערות', type: 'text' as const },
    { name: 'archivedAt', title: 'תאריך ארכיון', type: 'datetime' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
