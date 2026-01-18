import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const clients = await fetchAll('clients');
    return Response.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createItem('clients', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating client:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
