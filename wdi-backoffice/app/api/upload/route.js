import { uploadImage, updateItem } from '@/lib/github';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const docId = formData.get('docId');
    const fieldName = formData.get('fieldName');
    const folder = formData.get('folder') || 'images';
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to GitHub
    const imagePath = await uploadImage(file, folder);

    // If docId provided, we need to update the document
    // The caller should handle this on their end since we need to know the type
    
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
