import { fetchOne, updateItem, deleteItem } from '../../../../lib/github';

export async function GET(request, { params }) {
  try {
    const item = await fetchOne('content-library', params.id);
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(item);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const data = await request.json();
    const result = await updateItem('content-library', params.id, data);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteItem('content-library', params.id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
