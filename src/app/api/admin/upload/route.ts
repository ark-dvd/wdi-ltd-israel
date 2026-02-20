/**
 * POST /api/admin/upload — Upload image to Sanity
 * Accepts multipart/form-data with a single file field named "file".
 * Returns { success: true, data: { _ref, url } }
 */
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, serverError } from '@/lib/api/response';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return validationError('קובץ לא נמצא');
    }

    if (file.size > MAX_FILE_SIZE) {
      return validationError('גודל הקובץ חורג מ-10MB');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return validationError('סוג קובץ לא נתמך. נתמכים: JPEG, PNG, WebP, GIF, SVG');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file instanceof File ? file.name : 'upload';

    const asset = await sanityWriteClient.assets.upload('image', buffer, {
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
