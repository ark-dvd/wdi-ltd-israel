import { fetchAll, fetchOne, createItem, updateItem } from '@/lib/github';

export async function GET() {
  try {
    const items = await fetchAll('hero');
    return Response.json(items);
  } catch (error) {
    console.error('Error fetching hero:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const id = data.id || 'hero-settings';
    
    // Check if exists
    const existing = await fetchOne('hero', id);
    
    if (existing) {
      // Update existing
      const result = await updateItem('hero', id, data);
      return Response.json(result);
    } else {
      // Create new
      const result = await createItem('hero', { ...data, id });
      return Response.json(result);
    }
  } catch (error) {
    console.error('Error saving hero:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
