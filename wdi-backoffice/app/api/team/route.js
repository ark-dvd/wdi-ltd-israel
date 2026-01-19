import { fetchAll, createItem } from '@/lib/github';

export async function GET() {
  try {
    const team = await fetchAll('team');
    return Response.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validation
    if (!data.name || !data.role) {
      return Response.json({ error: 'שם ותפקיד הם שדות חובה' }, { status: 400 });
    }
    
    const result = await createItem('team', data);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating team member:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
