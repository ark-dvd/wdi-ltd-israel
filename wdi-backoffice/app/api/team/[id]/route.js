import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const member = await fetchOne('team', id);
    if (!member) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json(member);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const result = await updateItem('team', id, data);
    return Response.json(result);
  } catch (error) {
    console.error('Error updating team member:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('team', id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
