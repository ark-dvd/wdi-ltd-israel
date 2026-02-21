/**
 * Shared delete pre-validation contract for all admin CRUD entities.
 *
 * Rule: active records CANNOT be deleted — the user must deactivate
 * (toggle isActive off) and SAVE before deleting.
 *
 * This mirrors the server-side guard and prevents unnecessary round-trips.
 * The server is the source of truth; this is a UX convenience layer.
 */

/**
 * Validates whether a record can be deleted.
 * Returns a Hebrew error message if blocked, or null if OK to proceed.
 */
export function validateDelete(item: { isActive?: boolean } | undefined): string | null {
  if (!item) return 'הרשומה לא נמצאה';
  if (item.isActive) {
    return 'לא ניתן למחוק רשומה פעילה. יש לכבות את הרשומה ולשמור תחילה.';
  }
  return null;
}
