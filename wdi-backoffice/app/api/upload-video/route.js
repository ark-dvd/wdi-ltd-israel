import { uploadVideo } from '@/lib/github';

// Allowed video types
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Max file size: 25MB
const MAX_SIZE = 25 * 1024 * 1024;

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: `File type "${file.type}" is not allowed. Use MP4, WebM, or OGG.` }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return Response.json({ error: `File size exceeds 25MB limit. Please compress the video.` }, { status: 400 });
    }

    // Upload to GitHub
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
