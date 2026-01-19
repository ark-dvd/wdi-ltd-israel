import { uploadVideo } from '../../../lib/github';

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
      return Response.json({ error: 'Invalid video format' }, { status: 400 });
    }
    
    // Validate size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 25MB)' }, { status: 400 });
    }
    
    const videoPath = await uploadVideo(file, 'videos');
    return Response.json({ video: videoPath });
  } catch (error) {
    console.error('Upload video error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
