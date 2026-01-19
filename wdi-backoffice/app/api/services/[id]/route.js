import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const service = await fetchOne('services', id);
    if (!service) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Validation
    if (!data.title) {
      return Response.json({ error: 'שם השירות הוא שדה חובה' }, { status: 400 });
    }
    
    const result = await updateItem('services', id, data);
    return Response.json(result);
  } catch (error) {
    console.error('Error updating service:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('services', id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
