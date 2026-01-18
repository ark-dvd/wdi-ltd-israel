import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const item = await fetchOne('jobs', id);
    if (!item) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json(item);
  } catch (error) {
    console.error('Error fetching job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const result = await updateItem('jobs', id, data);
    return Response.json(result);
  } catch (error) {
    console.error('Error updating job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('jobs', id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
