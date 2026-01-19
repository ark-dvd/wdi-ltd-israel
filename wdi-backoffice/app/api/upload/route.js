import { uploadImage } from '@/lib/github';

// Allowed folders for upload
const ALLOWED_FOLDERS = ['images', 'images/team', 'images/projects', 'images/clients', 'images/press'];

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Max file size: 5MB
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'images';
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate folder
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return Response.json({ error: `Folder "${folder}" is not allowed` }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: `File type "${file.type}" is not allowed. Use JPG, PNG, GIF, or WebP.` }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return Response.json({ error: `File size exceeds 5MB limit` }, { status: 400 });
    }

    // Upload to GitHub
    const imagePath = await uploadImage(file, folder);

    return Response.json({
      success: true,
      image: imagePath,
      path: imagePath,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
