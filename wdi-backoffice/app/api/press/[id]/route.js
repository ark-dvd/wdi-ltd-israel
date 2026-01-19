import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const item = await fetchOne('press', id);
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(item);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const result = await updateItem('press', id, data);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('press', id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
