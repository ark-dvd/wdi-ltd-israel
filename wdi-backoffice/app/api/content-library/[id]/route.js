import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const item = await fetchOne('content-library', id);
    if (!item) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json(item);
  } catch (error) {
    console.error('Error fetching content library item:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Validation
    if (!data.title || !data.url) {
      return Response.json({ error: 'כותרת וקישור הם שדות חובה' }, { status: 400 });
    }
    
    const result = await updateItem('content-library', id, data);
    return Response.json(result);
  } catch (error) {
    console.error('Error updating content library item:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('content-library', id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting content library item:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
