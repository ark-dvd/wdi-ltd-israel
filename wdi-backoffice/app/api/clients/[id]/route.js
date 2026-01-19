import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await fetchOne('clients', id);
    if (!client) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(client);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    if (!data.name) return Response.json({ error: 'שם הלקוח הוא שדה חובה' }, { status: 400 });
    const result = await updateItem('clients', id, data);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('clients', id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
