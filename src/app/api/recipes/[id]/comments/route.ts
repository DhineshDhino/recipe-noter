import { RecipeComment } from '@/lib/types';
import { generateId } from '@/lib/id';

// In-memory mock store for comments
const recipeCommentsStore: Record<string, RecipeComment[]> = {
  recipe_adai_001: [
    {
      id: 'comm_1',
      recipeId: 'recipe_adai_001',
      authorId: 'user_ananya',
      authorName: 'Chef Ananya',
      authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
      text: 'Adding a handful of drumstick leaves (murungai keerai) at the end takes this to a whole new level!',
      timestamp: '2026-08-12T14:30:00Z',
      likes: 12,
    },
  ],
};

const jsonResponse = (data: any, status = 200) => {
  try {
    if (typeof Response !== 'undefined' && Response.json) {
      return Response.json(data, { status });
    }
  } catch (e) {
    // Fallback for non-standard test runners
  }
  return {
    status,
    json: async () => data,
  } as any;
};

/**
 * GET /api/recipes/[id]/comments
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = await context.params;
  const recipeId = params.id;
  const comments = recipeCommentsStore[recipeId] || [];

  return jsonResponse({
    success: true,
    recipeId,
    total: comments.length,
    comments,
  });
}

/**
 * POST /api/recipes/[id]/comments
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const recipeId = params.id;
    const body = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return jsonResponse({ success: false, error: 'Comment text is required' }, 400);
    }

    const newComment: RecipeComment = {
      id: generateId(),
      recipeId,
      authorId: body.authorId || 'guest',
      authorName: body.authorName || 'Fellow Cook',
      authorAvatar: body.authorAvatar,
      text: body.text.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    if (!recipeCommentsStore[recipeId]) {
      recipeCommentsStore[recipeId] = [];
    }
    recipeCommentsStore[recipeId].unshift(newComment);

    return jsonResponse({ success: true, comment: newComment }, 201);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message || 'Invalid comment payload' }, 400);
  }
}
