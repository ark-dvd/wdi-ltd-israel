/**
 * GET /api/admin/crm-settings — Load CRM settings singleton
 * PUT /api/admin/crm-settings — Upsert CRM settings singleton
 * DOC-040 §2.7, INV-035
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, serverError } from '@/lib/api/response';
import { crmSettingsUpdateSchema } from '@/lib/validation/input-schemas';

const DEFAULTS = {
  pipelineStages: [
    { key: 'new', label: 'ליד חדש', color: '#ef4444' },
    { key: 'contacted', label: 'נוצר קשר', color: '#8b5cf6' },
    { key: 'qualified', label: 'מתאים', color: '#3b82f6' },
    { key: 'proposal_sent', label: 'הצעה נשלחה', color: '#f59e0b' },
    { key: 'won', label: 'נסגר בהצלחה', color: '#10b981' },
    { key: 'lost', label: 'לא רלוונטי', color: '#6b7280' },
  ],
  engagementStatuses: [
    { key: 'new', label: 'חדש', color: '#f59e0b' },
    { key: 'in_progress', label: 'בביצוע', color: '#3b82f6' },
    { key: 'review', label: 'בבדיקה', color: '#8b5cf6' },
    { key: 'delivered', label: 'נמסר', color: '#10b981' },
    { key: 'completed', label: 'הושלם', color: '#059669' },
    { key: 'paused', label: 'מושהה', color: '#ef4444' },
    { key: 'cancelled', label: 'בוטל', color: '#111827' },
  ],
  serviceTypes: ['ניהול פרויקטים', 'פיקוח', 'ייעוץ הנדסי', 'ייצוג מזמין', 'PMO', 'בקרת איכות', 'בקרת מסמכים', 'רישוי והיתרים'],
  leadSources: ['טופס אתר', 'שיחת טלפון', 'הפניה', 'לינקדאין', 'אחר'],
  defaultPriority: 'medium',
  currency: '₪',
  engagementLabel: 'התקשרות',
};

export const GET = withAuth(async () => {
  try {
    const doc = await sanityClient.fetch(`*[_type == "crmSettings"][0]`);
    return successResponse(doc ?? { _type: 'crmSettings', ...DEFAULTS });
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = crmSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    // Validate unique keys in pipelineStages
    if (parsed.data.pipelineStages) {
      const keys = parsed.data.pipelineStages.map((s) => s.key);
      if (new Set(keys).size !== keys.length) {
        return validationError('מפתחות שלבי Pipeline חייבים להיות ייחודיים');
      }
    }

    // Validate unique keys in engagementStatuses
    if (parsed.data.engagementStatuses) {
      const keys = parsed.data.engagementStatuses.map((s) => s.key);
      if (new Set(keys).size !== keys.length) {
        return validationError('מפתחות סטטוסי התקשרות חייבים להיות ייחודיים');
      }
    }

    // Validate no duplicate serviceTypes
    if (parsed.data.serviceTypes) {
      if (new Set(parsed.data.serviceTypes).size !== parsed.data.serviceTypes.length) {
        return validationError('סוגי שירות חייבים להיות ייחודיים');
      }
    }

    // Validate leadSources includes "טופס אתר"
    if (parsed.data.leadSources) {
      if (!parsed.data.leadSources.includes('טופס אתר')) {
        return validationError('מקורות לידים חייבים לכלול "טופס אתר"');
      }
      if (new Set(parsed.data.leadSources).size !== parsed.data.leadSources.length) {
        return validationError('מקורות לידים חייבים להיות ייחודיים');
      }
    }

    // Find existing or create new
    const existing = await sanityClient.fetch(`*[_type == "crmSettings"][0]{ _id }`);
    const now = new Date().toISOString();

    let doc;
    if (existing) {
      doc = await sanityWriteClient.patch(existing._id).set({ ...parsed.data, updatedAt: now }).commit();
    } else {
      doc = await sanityWriteClient.create({
        _type: 'crmSettings',
        ...DEFAULTS,
        ...parsed.data,
        updatedAt: now,
      });
    }

    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
