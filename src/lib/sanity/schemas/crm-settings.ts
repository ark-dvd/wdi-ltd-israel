/**
 * CrmSettings (CRM Entity — Singleton) — DOC-020 §3.5
 * INV-035: Only one record may exist. Deletion is prohibited.
 */

export const CRM_SETTINGS_ID = 'crmSettings';

export const DEFAULT_PIPELINE_STAGES = [
  { key: 'new', label: 'ליד חדש', color: '#ef4444' },
  { key: 'contacted', label: 'נוצר קשר', color: '#8b5cf6' },
  { key: 'qualified', label: 'מתאים', color: '#3b82f6' },
  { key: 'proposal_sent', label: 'הצעה נשלחה', color: '#f59e0b' },
  { key: 'won', label: 'נסגר בהצלחה', color: '#10b981' },
  { key: 'lost', label: 'לא רלוונטי', color: '#6b7280' },
] as const;

export const DEFAULT_ENGAGEMENT_STATUSES = [
  { key: 'new', label: 'חדש', color: '#f59e0b' },
  { key: 'in_progress', label: 'בביצוע', color: '#3b82f6' },
  { key: 'review', label: 'בבדיקה', color: '#8b5cf6' },
  { key: 'delivered', label: 'נמסר', color: '#10b981' },
  { key: 'completed', label: 'הושלם', color: '#059669' },
  { key: 'paused', label: 'מושהה', color: '#ef4444' },
  { key: 'cancelled', label: 'בוטל', color: '#111827' },
] as const;

export const DEFAULT_SERVICE_TYPES = [
  'ניהול פרויקטים',
  'פיקוח',
  'ייעוץ הנדסי',
  'ייצוג מזמין',
  'PMO',
  'בקרת איכות',
  'בקרת מסמכים',
  'רישוי והיתרים',
] as const;

export const DEFAULT_LEAD_SOURCES = [
  'טופס אתר',
  'שיחת טלפון',
  'הפניה',
  'לינקדאין',
  'אחר',
] as const;

const stageFields = [
  { name: 'key', title: 'מפתח', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
  { name: 'label', title: 'תווית', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
  { name: 'color', title: 'צבע', type: 'string' as const, validation: (Rule: { required: () => unknown }) => Rule.required() },
];

export const crmSettingsSchema = {
  name: 'crmSettings',
  title: 'הגדרות CRM',
  type: 'document' as const,
  fields: [
    {
      name: 'pipelineStages',
      title: 'שלבי Pipeline',
      type: 'array' as const,
      of: [{ type: 'object' as const, fields: stageFields }],
    },
    {
      name: 'engagementStatuses',
      title: 'סטטוסי התקשרות',
      type: 'array' as const,
      of: [{ type: 'object' as const, fields: stageFields }],
    },
    { name: 'serviceTypes', title: 'סוגי שירות', type: 'array' as const, of: [{ type: 'string' as const }] },
    { name: 'leadSources', title: 'מקורות לידים', type: 'array' as const, of: [{ type: 'string' as const }] },
    { name: 'defaultPriority', title: 'עדיפות ברירת מחדל', type: 'string' as const, initialValue: 'medium' },
    { name: 'currency', title: 'מטבע', type: 'string' as const, initialValue: '₪' },
    { name: 'engagementLabel', title: 'תווית התקשרות', type: 'string' as const, initialValue: 'התקשרות' },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
