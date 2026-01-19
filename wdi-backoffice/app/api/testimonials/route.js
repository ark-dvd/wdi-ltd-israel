import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const testimonials = await fetchAll('testimonials');
    return Response.json(testimonials);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.text) {
      return Response.json({ error: 'שם וציטוט הם שדות חובה' }, { status: 400 });
    }
    const result = await createItem('testimonials', data);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
