import { uploadImage } from '@/lib/github';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Allow larger file uploads (50MB)
export const maxDuration = 60;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to GitHub (using same function, it works for any file)
    const videoPath = await uploadImage(file, 'videos');

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
