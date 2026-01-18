import { fetchOne, updateItem, createItem } from '@/lib/github';

const HERO_ID = 'hero-settings';

export async function GET() {
  try {
    const hero = await fetchOne('hero', HERO_ID);
    return Response.json(hero || {});
  } catch (error) {
    console.error('Error fetching hero:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const existing = await fetchOne('hero', HERO_ID);
    
    if (existing) {
      const result = await updateItem('hero', HERO_ID, data);
      return Response.json(result);
    } else {
      const result = await createItem('hero', { ...data, id: HERO_ID });
      return Response.json(result);
    }
  } catch (error) {
    console.error('Error saving hero:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
