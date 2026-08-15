import { recipeLibrary } from '@/lib/mockRecipes';

const jsonResponse = (data: any, options: { status?: number } = {}) => {
  if (typeof Response !== 'undefined' && typeof Response.json === 'function') {
    return Response.json(data, options);
  }
  return {
    status: options.status || 200,
    json: async () => data,
  } as any;
};

export async function GET(
  _request: { url: string },
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const recipe = recipeLibrary.find(r => r.id === id);

  if (!recipe) {
    return jsonResponse({ success: false, error: 'Recipe not found' }, { status: 404 });
  }

  return jsonResponse({ success: true, recipe });
}

export async function PUT(
  request: { json: () => Promise<any> },
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    return jsonResponse({
      success: true,
      message: `Recipe ${id} updated`,
      recipe: { ...body, id },
    });
  } catch (err) {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: { url: string },
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return jsonResponse({
    success: true,
    message: `Recipe ${id} removed successfully`,
  });
}
