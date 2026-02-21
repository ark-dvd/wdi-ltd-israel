/**
 * POST /api/admin/upload — Upload image or file to Sanity
 * Accepts multipart/form-data with a single file field named "file".
 * Query param ?type=file for non-image assets (e.g. video).
 * Returns { success: true, data: { _ref, url } }
 */
export const runtime = 'nodejs';
export const maxDuration = 60; // allow up to 60s for large video uploads

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, serverError } from '@/lib/api/response';
import { uploadRateLimit, getIdentifier } from '@/lib/rate-limit';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE = 40 * 1024 * 1024;  // 40 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const POST = withAuth(async (request: NextRequest, { session }) => {
  try {
    const rl = await uploadRateLimit.limit(getIdentifier(request, session.user.email));
    if (!rl.success) {
      return NextResponse.json(
        { category: 'validation', code: 'RATE_LIMITED', message: 'יותר מדי העלאות. נסה שוב בעוד דקה.', retryable: true },
        { status: 429 },
      );
    }

    const assetType = request.nextUrl.searchParams.get('type') === 'file' ? 'file' : 'image';

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return validationError('קובץ לא נמצא');
    }

    if (assetType === 'image') {
      if (file.size > MAX_IMAGE_SIZE) return validationError('גודל הקובץ חורג מ-10MB');
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return validationError('סוג קובץ לא נתמך. נתמכים: JPEG, PNG, WebP, GIF, SVG');
    } else {
      if (file.size > MAX_FILE_SIZE) return validationError('גודל הקובץ חורג מ-40MB');
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) return validationError('סוג קובץ לא נתמך. נתמכים: MP4, WebM');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file instanceof File ? file.name : 'upload';

    const asset = await sanityWriteClient.assets.upload(assetType, buffer, {
      filename: fileName,
      contentType: file.type,
    });

    return successResponse({
      _ref: asset._id,
      url: asset.url,
    });
  } catch (err) {
    console.error('[api/upload]', err);
    return serverError();
  }
});
