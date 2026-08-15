import { recipeLibrary } from '@/lib/mockRecipes';
import { Recipe } from '@/lib/types';

// In-memory persistent storage store during server lifecycle
let storedRecipes: Recipe[] = [...recipeLibrary];

const jsonResponse = (data: any, options: { status?: number } = {}) => {
  if (typeof Response !== 'undefined' && typeof Response.json === 'function') {
    return Response.json(data, options);
  }
  return {
    status: options.status || 200,
    json: async () => data,
  } as any;
};

export async function GET(request: { url: string }) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().trim();

  let results = storedRecipes;
  if (q) {
    results = storedRecipes.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.masterIngredients?.some(i => i.defaultName.toLowerCase().includes(q))
    );
  }

  return jsonResponse({
    success: true,
    total: results.length,
    recipes: results,
  });
}

export async function POST(request: { json: () => Promise<any> }) {
  try {
    const body = await request.json();

    if (!body.name || !body.baseYield) {
      return jsonResponse(
        { success: false, error: 'Missing required recipe fields: name and baseYield' },
        { status: 400 }
      );
    }

    const newRecipe: Recipe = {
      id: body.id || `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: body.name,
      baseYield: Number(body.baseYield) || 4,
      versionHistory: body.versionHistory || [
        { versionName: "Standard", author: 'Chef', timestamp: new Date().toISOString() },
      ],
      masterIngredients: body.masterIngredients || [],
      requiredEquipment: body.requiredEquipment || [],
      ratioGroups: body.ratioGroups || [],
      prepBlocks: body.prepBlocks || [],
      passiveBlocks: body.passiveBlocks || [],
      cookBlocks: body.cookBlocks || [],
      pairings: body.pairings || [],
      photoPool: body.photoPool || [],
    };

    storedRecipes.unshift(newRecipe);

    return jsonResponse(
      { success: true, message: 'Recipe created successfully', recipe: newRecipe },
      { status: 201 }
    );
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Invalid JSON body in request' },
      { status: 400 }
    );
  }
}
