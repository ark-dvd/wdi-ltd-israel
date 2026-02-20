/**
 * Optimistic concurrency check — DOC-040 §3.2, INV-023
 * Every mutation on mutable entities requires updatedAt matching.
 */
import { conflictError } from './response';

/**
 * Check if the client's updatedAt matches the current document's updatedAt.
 * Returns null if match, error response if mismatch.
 */
export function checkConcurrency(clientUpdatedAt: string, documentUpdatedAt: string) {
  if (clientUpdatedAt !== documentUpdatedAt) {
    return conflictError();
  }
  return null;
}
