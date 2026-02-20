/**
 * Activity generation helper — DOC-040 §6, INV-020
 * Every CRM mutation generates an Activity atomically (same transaction).
 */
import type { Transaction } from '@sanity/client';

interface ActivityInput {
  entityType: 'lead' | 'client' | 'engagement';
  entityId: string;
  type: string;
  description: string;
  performedBy: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create an Activity document within an existing Sanity transaction.
 * Returns the activity object for inclusion in the response.
 */
export function addActivityToTransaction(
  tx: Transaction,
  input: ActivityInput,
): Record<string, unknown> {
  const now = new Date().toISOString();
  const activity = {
    _type: 'activity' as const,
    entityType: input.entityType,
    entityId: input.entityId,
    type: input.type,
    description: input.description,
    performedBy: input.performedBy,
    metadata: input.metadata ?? {},
    createdAt: now,
  };
  tx.create(activity);
  return activity;
}

/**
 * Build a standalone activity document (for non-transactional creation).
 */
export function buildActivity(input: ActivityInput): Record<string, unknown> {
  return {
    _type: 'activity',
    entityType: input.entityType,
    entityId: input.entityId,
    type: input.type,
    description: input.description,
    performedBy: input.performedBy,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
}
