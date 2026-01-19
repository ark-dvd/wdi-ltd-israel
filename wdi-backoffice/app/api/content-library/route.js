import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const items = await fetchAll('content-library');
    return Response.json(items);
  } catch (error) {
    console.error('Error fetching content library:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validation
    if (!data.title || !data.url) {
      return Response.json({ error: 'כותרת וקישור הם שדות חובה' }, { status: 400 });
    }
    
    // URL validation
    try {
      new URL(data.url);
    } catch {
      return Response.json({ error: 'כתובת URL לא תקינה' }, { status: 400 });
    }
    
    const result = await createItem('content-library', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating content library item:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
