/**
 * IntakeSubmission — CANONICAL-AMENDMENT-001
 * Replaces CRM lead intake for v1.0.
 * Unified intake for general inquiries, job applications, and supplier registrations.
 */

// ─── Enums ───────────────────────────────────────────────────

export const SUBMISSION_TYPE = {
  general: 'פנייה כללית',
  job_application: 'מועמדות למשרה',
  supplier_application: 'הרשמת ספק',
} as const;

export type SubmissionType = keyof typeof SUBMISSION_TYPE;

export const CONTACT_STATUS = {
  not_contacted: 'טרם נוצר קשר',
  contacted: 'נוצר קשר',
} as const;

export type ContactStatus = keyof typeof CONTACT_STATUS;

export const RELEVANCE = {
  not_assessed: 'טרם הוערך',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
} as const;

export type Relevance = keyof typeof RELEVANCE;

export const OUTCOME_GENERAL = {
  pending: 'ממתין',
  converted_to_client: 'הומר ללקוח',
  not_converted: 'לא הומר',
} as const;

export const OUTCOME_JOB = {
  pending: 'ממתין',
  rejected: 'נדחה',
  in_process: 'בתהליך',
  hired: 'גויס',
} as const;

export const OUTCOME_SUPPLIER = {
  pending: 'ממתין',
  rejected: 'נדחה',
  in_review: 'בבדיקה',
  added_to_database: 'נוסף למאגר',
} as const;

export type OutcomeGeneral = keyof typeof OUTCOME_GENERAL;
export type OutcomeJob = keyof typeof OUTCOME_JOB;
export type OutcomeSupplier = keyof typeof OUTCOME_SUPPLIER;

export const SOURCE = {
  website_form: 'טופס אתר',
  manual: 'הזנה ידנית',
} as const;

export type Source = keyof typeof SOURCE;

// ─── Helpers for outcome validation ──────────────────────────

export const OUTCOME_BY_TYPE: Record<SubmissionType, Record<string, string>> = {
  general: OUTCOME_GENERAL,
  job_application: OUTCOME_JOB,
  supplier_application: OUTCOME_SUPPLIER,
};

export function isValidOutcome(submissionType: string, outcome: string): boolean {
  const allowed = OUTCOME_BY_TYPE[submissionType as SubmissionType];
  return allowed ? outcome in allowed : false;
}

// ─── Sanity Schema ───────────────────────────────────────────

export const intakeSubmissionSchema = {
  name: 'intakeSubmission',
  title: 'פנייה נכנסת',
  type: 'document' as const,
  fields: [
    {
      name: 'submissionType',
      title: 'סוג פנייה',
      type: 'string' as const,
      options: {
        list: Object.entries(SUBMISSION_TYPE).map(([value, title]) => ({ title, value })),
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'submittedAt',
      title: 'תאריך הגשה',
      type: 'datetime' as const,
      readOnly: true,
    },
    {
      name: 'source',
      title: 'מקור',
      type: 'string' as const,
      options: {
        list: Object.entries(SOURCE).map(([value, title]) => ({ title, value })),
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    // ─── Contact info ────────────────────────────────────────
    {
      name: 'contactName',
      title: 'שם איש קשר',
      type: 'string' as const,
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'contactEmail',
      title: 'אימייל',
      type: 'string' as const,
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'contactPhone',
      title: 'טלפון',
      type: 'string' as const,
    },
    {
      name: 'organization',
      title: 'ארגון / חברה',
      type: 'string' as const,
    },
    // ─── General inquiry fields ──────────────────────────────
    {
      name: 'subject',
      title: 'נושא',
      type: 'string' as const,
    },
    {
      name: 'message',
      title: 'הודעה',
      type: 'text' as const,
    },
    // ─── Job application fields ──────────────────────────────
    {
      name: 'cvFileUrl',
      title: 'קובץ קו"ח',
      type: 'string' as const,
    },
    {
      name: 'positionAppliedFor',
      title: 'תפקיד מבוקש',
      type: 'string' as const,
    },
    // ─── Supplier application fields ─────────────────────────
    {
      name: 'supplierCategory',
      title: 'תחום התמחות ספק',
      type: 'string' as const,
    },
    {
      name: 'supplierExperience',
      title: 'ניסיון ספק',
      type: 'text' as const,
    },
    // ─── Triage fields ───────────────────────────────────────
    {
      name: 'contactStatus',
      title: 'סטטוס קשר',
      type: 'string' as const,
      options: {
        list: Object.entries(CONTACT_STATUS).map(([value, title]) => ({ title, value })),
      },
      initialValue: 'not_contacted',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'relevance',
      title: 'רלוונטיות',
      type: 'string' as const,
      options: {
        list: Object.entries(RELEVANCE).map(([value, title]) => ({ title, value })),
      },
      initialValue: 'not_assessed',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'outcome',
      title: 'תוצאה',
      type: 'string' as const,
      initialValue: 'pending',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'internalNotes',
      title: 'הערות פנימיות',
      type: 'text' as const,
    },
    // ─── Audit trail (append-only) ───────────────────────────
    {
      name: 'auditTrail',
      title: 'היסטוריית שינויים',
      type: 'array' as const,
      readOnly: true,
      of: [
        {
          type: 'object' as const,
          fields: [
            { name: 'timestamp', title: 'זמן', type: 'datetime' as const },
            { name: 'operatorEmail', title: 'מבצע', type: 'string' as const },
            { name: 'field', title: 'שדה', type: 'string' as const },
            { name: 'previousValue', title: 'ערך קודם', type: 'string' as const },
            { name: 'newValue', title: 'ערך חדש', type: 'string' as const },
          ],
        },
      ],
    },
  ],
};
