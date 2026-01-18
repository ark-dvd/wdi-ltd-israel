import { fetchOne, updateItem } from '@/lib/github';

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
    const result = await updateItem('services', id, data);
    return Response.json(result);
  } catch (error) {
    console.error('Error updating service:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
