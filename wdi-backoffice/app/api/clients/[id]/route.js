import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const item = await fetchOne('clients', id);
    if (!item) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json(item);
  } catch (error) {
    console.error('Error fetching client:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const result = await updateItem('clients', id, data);
    return Response.json(result);
  } catch (error) {
    console.error('Error updating client:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('clients', id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
