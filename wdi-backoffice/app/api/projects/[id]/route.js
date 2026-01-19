import { fetchOne, updateItem, deleteItem } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const project = await fetchOne('projects', id);
    if (!project) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    if (!data.title || !data.client) {
      return Response.json({ error: 'שם פרויקט ולקוח הם שדות חובה' }, { status: 400 });
    }
    
    const result = await updateItem('projects', id, data);
    return Response.json(result);
  } catch (error) {
    console.error('Error updating project:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteItem('projects', id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
