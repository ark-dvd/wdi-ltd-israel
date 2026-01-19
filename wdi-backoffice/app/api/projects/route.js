import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const projects = await fetchAll('projects');
    return Response.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validation
    if (!data.title || !data.client) {
      return Response.json({ error: 'שם פרויקט ולקוח הם שדות חובה' }, { status: 400 });
    }
    
    const result = await createItem('projects', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating project:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
