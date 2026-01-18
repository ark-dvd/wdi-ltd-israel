import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const testimonials = await fetchAll('testimonials');
    return Response.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createItem('testimonials', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
