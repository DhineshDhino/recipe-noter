import { GET, POST } from './route';

describe('Epic 20: REST API /api/recipes/[id]/comments (Story 43)', () => {
  it('GET /api/recipes/[id]/comments returns comments list for recipe', async () => {
    const mockReq = { url: 'http://localhost:3000/api/recipes/recipe_adai_001/comments' } as any;
    const response = await GET(mockReq, { params: Promise.resolve({ id: 'recipe_adai_001' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.comments.length).toBeGreaterThan(0);
    expect(data.comments[0].text).toContain('drumstick leaves');
  });

  it('POST /api/recipes/[id]/comments creates a new comment with validation', async () => {
    const mockReq = {
      json: async () => ({
        text: 'This recipe worked great on a nonstick pan too!',
        authorName: 'Chef Priya',
      }),
    } as any;

    const response = await POST(mockReq, { params: Promise.resolve({ id: 'recipe_adai_001' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.comment.text).toBe('This recipe worked great on a nonstick pan too!');
    expect(data.comment.authorName).toBe('Chef Priya');
  });

  it('POST /api/recipes/[id]/comments rejects empty text with 400', async () => {
    const mockReq = {
      json: async () => ({ text: '' }),
    } as any;

    const response = await POST(mockReq, { params: Promise.resolve({ id: 'recipe_adai_001' }) });
    expect(response.status).toBe(400);
  });
});
