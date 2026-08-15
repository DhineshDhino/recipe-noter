import { GET, POST } from './route';

describe('Epic 7: REST API Routes (/api/recipes)', () => {
  it('GET /api/recipes returns recipe catalogue list', async () => {
    const res = await GET({ url: 'http://localhost:3000/api/recipes' });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.total).toBeGreaterThan(0);
    expect(Array.isArray(data.recipes)).toBe(true);
  });

  it('GET /api/recipes?q=adai filters matching recipes', async () => {
    const res = await GET({ url: 'http://localhost:3000/api/recipes?q=adai' });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.recipes.some((r: any) => r.name.toLowerCase().includes('adai'))).toBe(true);
  });

  it('POST /api/recipes creates a new recipe with validation', async () => {
    const newRecipePayload = {
      name: 'South Indian Sambar',
      baseYield: 4,
      prepBlocks: [],
      cookBlocks: [],
    };

    const res = await POST({
      json: async () => newRecipePayload,
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.recipe.name).toBe('South Indian Sambar');
  });

  it('POST /api/recipes rejects missing required name', async () => {
    const invalidPayload = { baseYield: 4 };
    const res = await POST({
      json: async () => invalidPayload,
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
