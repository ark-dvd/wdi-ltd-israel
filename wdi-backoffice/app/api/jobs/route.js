import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const jobs = await fetchAll('jobs');
    return Response.json(jobs);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.title) {
      return Response.json({ error: 'שם המשרה הוא שדה חובה' }, { status: 400 });
    }
    const result = await createItem('jobs', data);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
