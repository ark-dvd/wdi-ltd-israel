import { uploadImage } from '../../../lib/github';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    let folder = formData.get('folder') || 'images';
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'File must be an image' }, { status: 400 });
    }
    
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }
    
    // Sanitize folder - ensure it starts with images/
    if (!folder.startsWith('images')) {
      folder = 'images';
    }
    // Remove path traversal attempts
    folder = folder.replace(/\.\./g, '').replace(/\/+/g, '/');
    
    const imagePath = await uploadImage(file, folder);
    return Response.json({ image: imagePath });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
