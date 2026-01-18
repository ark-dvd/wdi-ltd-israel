import { fetchAll } from '@/lib/github';

export async function GET() {
  try {
    const services = await fetchAll('services');
    return Response.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
