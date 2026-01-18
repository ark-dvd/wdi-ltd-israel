import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const jobs = await fetchAll('jobs');
    return Response.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createItem('jobs', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
