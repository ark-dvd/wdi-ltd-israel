/**
 * Governed API response envelopes — DOC-040 §4.1, §8.1, §8.2
 */
import { NextResponse } from 'next/server';

// ─── Error Envelope ─────────────────────────────────────────

type ErrorCategory = 'validation' | 'conflict' | 'auth' | 'not_found' | 'server';

interface RecordError {
  id: string;
  code: string;
  message: string;
}

interface ErrorEnvelope {
  category: ErrorCategory;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  recordErrors?: RecordError[];
  retryable: boolean;
}

const STATUS_MAP: Record<ErrorCategory, number> = {
  validation: 400,
  auth: 401,
  not_found: 404,
  conflict: 409,
  server: 500,
};

export function errorResponse(
  category: ErrorCategory,
  code: string,
  message: string,
  opts?: {
    fieldErrors?: Record<string, string>;
    recordErrors?: RecordError[];
    status?: number;
  },
): NextResponse<ErrorEnvelope> {
  const retryable = category === 'server';
  const status = opts?.status ?? STATUS_MAP[category];
  const body: ErrorEnvelope = { category, code, message, retryable };
  if (opts?.fieldErrors) body.fieldErrors = opts.fieldErrors;
  if (opts?.recordErrors) body.recordErrors = opts.recordErrors;
  return NextResponse.json(body, { status });
}

// Convenience helpers
export function validationError(message: string, fieldErrors?: Record<string, string>) {
  return errorResponse('validation', 'VALIDATION_FAILED', message, { fieldErrors });
}

export function conflictError(message = 'הנתון עודכן על ידי משתמש אחר. יש לרענן ולנסות שוב.') {
  return errorResponse('conflict', 'CONFLICT_DETECTED', message);
}

export function notFoundError(message = 'הרשומה לא נמצאה') {
  return errorResponse('not_found', 'NOT_FOUND', message);
}

export function serverError(message = 'שגיאת שרת פנימית') {
  return errorResponse('server', 'SERVER_ERROR', message);
}

export function transitionForbidden(current: string, target: string) {
  return errorResponse(
    'validation',
    'TRANSITION_FORBIDDEN',
    `מעבר מסטטוס "${current}" לסטטוס "${target}" אינו מותר`,
  );
}

export function duplicateLeadError() {
  return errorResponse(
    'validation',
    'DUPLICATE_ACTIVE_LEAD',
    'ליד פעיל עם כתובת אימייל זו כבר קיים במערכת',
  );
}

export function conversionNotEligible(message: string) {
  return errorResponse('validation', 'CONVERSION_NOT_ELIGIBLE', message);
}

export function forbiddenError(message = 'אין הרשאה לביצוע פעולה זו') {
  return errorResponse('auth', 'FORBIDDEN', message, { status: 403 });
}

export function unauthorizedError(message = 'אימות נדרש') {
  return errorResponse('auth', 'UNAUTHORIZED', message);
}

// ─── Success Envelope ───────────────────────────────────────

interface SuccessEnvelope<T> {
  success: true;
  data: T;
  activity?: unknown;
}

export function successResponse<T>(data: T, activity?: unknown, status = 200) {
  const body: SuccessEnvelope<T> = { success: true, data };
  if (activity !== undefined) body.activity = activity;
  return NextResponse.json(body, { status });
}

// ─── List Envelope ──────────────────────────────────────────

interface ListEnvelope<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function listResponse<T>(data: T[], total: number, page: number, limit: number) {
  const body: ListEnvelope<T> = { data, total, page, limit };
  return NextResponse.json(body);
}

// ─── Pagination Helper ──────────────────────────────────────

export function parsePagination(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '25', 10) || 25));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
