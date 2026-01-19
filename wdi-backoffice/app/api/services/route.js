import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const services = await fetchAll('services');
    return Response.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validation
    if (!data.title) {
      return Response.json({ error: 'שם השירות הוא שדה חובה' }, { status: 400 });
    }
    
    const result = await createItem('services', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating service:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
