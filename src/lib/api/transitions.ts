/**
 * Status transition matrices — DOC-040 §5.1–5.3
 */

// ─── Lead Transition Matrix (§5.1) ─────────────────────────
export const LEAD_TRANSITIONS: Record<string, string[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['proposal_sent', 'lost'],
  proposal_sent: ['won', 'lost'],
  won: [],      // archive or convert only
  lost: [],     // archive only
  archived: [], // restore only (handled separately)
};

// ─── Client CRM Transition Matrix (§5.2) ───────────────────
export const CLIENT_TRANSITIONS: Record<string, string[]> = {
  active: ['completed', 'inactive'],
  completed: ['inactive'],
  inactive: ['active'],
  archived: [], // restore only
};

// ─── Engagement Transition Matrix (§5.3) ────────────────────
export const ENGAGEMENT_TRANSITIONS: Record<string, string[]> = {
  new: ['in_progress', 'paused', 'cancelled'],
  in_progress: ['review', 'delivered', 'paused', 'cancelled'],
  review: ['in_progress', 'delivered', 'paused', 'cancelled'],
  delivered: ['completed', 'in_progress', 'cancelled'],
  paused: ['new', 'in_progress', 'cancelled'],
  completed: [],  // terminal
  cancelled: [],  // terminal
};

/**
 * Check if a transition is allowed for the given matrix.
 */
export function isTransitionAllowed(
  matrix: Record<string, string[]>,
  from: string,
  to: string,
): boolean {
  const allowed = matrix[from];
  if (!allowed) return false;
  return allowed.includes(to);
}
