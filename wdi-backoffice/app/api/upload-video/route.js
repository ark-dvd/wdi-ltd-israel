// Force Node.js runtime (Buffer not available in Edge)
export const runtime = 'nodejs';

import { uploadVideo } from '../../../lib/github';

// Allow larger file uploads
export const maxDuration = 60;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'File must be a video (mp4, webm, ogg)' }, { status: 400 });
    }
    
    // Validate size (25MB for video)
    if (file.size > 25 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 25MB)' }, { status: 400 });
    }

    const videoPath = await uploadVideo(file, 'videos');
    
    return Response.json({
      success: true,
      url: videoPath,
      path: videoPath,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
