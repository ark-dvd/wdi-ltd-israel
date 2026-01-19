import { fetchAll, createItem } from '../../../lib/github';

export async function GET() {
  try {
    const items = await fetchAll('projects');
    return Response.json(items);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createItem('projects', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
