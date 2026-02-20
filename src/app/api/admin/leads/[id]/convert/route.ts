/**
 * POST /api/admin/leads/:id/convert — Convert lead to client + engagement
 * DOC-040 §2.2, INV-006, INV-007
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError, conversionNotEligible } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { leadConvertSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const POST = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = leadConvertSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    // INV-007: Status must be "won"
    if (existing.status !== 'won') {
      return conversionNotEligible('ניתן להמיר רק לידים בסטטוס "נסגר בהצלחה"');
    }

    // INV-006: Not previously converted
    if (existing.convertedToClientId) {
      return conversionNotEligible('ליד זה כבר הומר ללקוח');
    }

    const now = new Date().toISOString();
    const clientId = `client-${Date.now()}`;
    const engagementId = `engagement-${Date.now()}`;

    const engagementTitle = parsed.data.engagementTitle ?? `${existing.name} — התקשרות`;
    const engagementType = parsed.data.engagementType ?? existing.servicesInterested?.[0];
    const engagementValue = parsed.data.engagementValue ?? existing.estimatedValue ?? 0;

    // Atomic transaction: client + engagement + lead update
    const tx = sanityWriteClient.transaction();

    tx.create({
      _id: clientId,
      _type: 'clientCrm',
      name: existing.name,
      email: existing.email,
      company: existing.company,
      phone: existing.phone,
      status: 'active',
      sourceLead: { _type: 'reference', _ref: id },
      createdAt: now,
      updatedAt: now,
    });

    tx.create({
      _id: engagementId,
      _type: 'engagement',
      title: engagementTitle,
      client: { _type: 'reference', _ref: clientId },
      engagementType,
      value: engagementValue,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    });

    tx.patch(id, (p) => p.set({
      convertedToClientId: clientId,
      convertedAt: now,
      updatedAt: now,
    }));

    // Activities
    addActivityToTransaction(tx, {
      entityType: 'lead',
      entityId: id,
      type: 'lead_converted',
      description: `ליד ${existing.name} הומר ללקוח`,
      performedBy: session.user.email,
      metadata: { newClientId: clientId },
    });

    addActivityToTransaction(tx, {
      entityType: 'client',
      entityId: clientId,
      type: 'client_created',
      description: `לקוח ${existing.name} נוצר מהמרת ליד`,
      performedBy: session.user.email,
      metadata: { source: 'lead_conversion', originLeadId: id },
    });

    addActivityToTransaction(tx, {
      entityType: 'engagement',
      entityId: engagementId,
      type: 'engagement_created',
      description: `התקשרות "${engagementTitle}" נוצרה`,
      performedBy: session.user.email,
      metadata: { source: 'lead_conversion', clientId },
    });

    await tx.commit();

    const [client, engagement] = await Promise.all([
      sanityClient.fetch(`*[_type == "clientCrm" && _id == $id][0]`, { id: clientId }),
      sanityClient.fetch(`*[_type == "engagement" && _id == $id][0]`, { id: engagementId }),
    ]);

    return successResponse({ client, engagement }, undefined, 201);
  } catch {
    return serverError();
  }
});
