import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const press = await fetchAll('press');
    return Response.json(press);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.title || !data.source) {
      return Response.json({ error: 'כותרת ומקור הם שדות חובה' }, { status: 400 });
    }
    const result = await createItem('press', data);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
