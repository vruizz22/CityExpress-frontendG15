import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { HttpError, setTokenProvider, request, http as httpClient } from './httpClient';

const BASE = 'http://localhost:3000';

vi.mock('@/config/env', () => ({ env: { apiBaseUrl: 'http://localhost:3000' } }));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  setTokenProvider(null);
});
afterAll(() => server.close());

// ─── HttpError ───────────────────────────────────────────────────────────────

describe('HttpError', () => {
  it('sets name, status, and body', () => {
    const err = new HttpError('bad', 400, { detail: 'x' });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('HttpError');
    expect(err.status).toBe(400);
    expect(err.body).toEqual({ detail: 'x' });
    expect(err.message).toBe('bad');
  });

  it('body is undefined when omitted', () => {
    const err = new HttpError('oops', 500);
    expect(err.body).toBeUndefined();
  });
});

// ─── setTokenProvider ─────────────────────────────────────────────────────────

describe('setTokenProvider', () => {
  it('injects Authorization header when provider returns a token', async () => {
    let capturedAuth;
    server.use(
      http.get(`${BASE}/me`, ({ request: req }) => {
        capturedAuth = req.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      }),
    );
    setTokenProvider(async () => 'test-token');
    await request('/me');
    expect(capturedAuth).toBe('Bearer test-token');
  });

  it('omits Authorization header when provider returns null', async () => {
    let capturedAuth = 'sentinel';
    server.use(
      http.get(`${BASE}/me`, ({ request: req }) => {
        capturedAuth = req.headers.get('Authorization');
        return HttpResponse.json({});
      }),
    );
    setTokenProvider(async () => null);
    await request('/me');
    expect(capturedAuth).toBeNull();
  });

  it('omits Authorization header when auth=false', async () => {
    let capturedAuth = 'sentinel';
    server.use(
      http.get(`${BASE}/me`, ({ request: req }) => {
        capturedAuth = req.headers.get('Authorization');
        return HttpResponse.json({});
      }),
    );
    setTokenProvider(async () => 'should-not-appear');
    await request('/me', { auth: false });
    expect(capturedAuth).toBeNull();
  });
});

// ─── request ─────────────────────────────────────────────────────────────────

describe('request', () => {
  it('returns parsed JSON on 2xx', async () => {
    server.use(http.get(`${BASE}/items`, () => HttpResponse.json([1, 2, 3])));
    const data = await request('/items');
    expect(data).toEqual([1, 2, 3]);
  });

  it('throws HttpError on 4xx', async () => {
    server.use(
      http.get(`${BASE}/bad`, () => HttpResponse.json({ message: 'not found' }, { status: 404 })),
    );
    await expect(request('/bad')).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
    });
  });

  it('throws HttpError on 5xx', async () => {
    server.use(http.get(`${BASE}/crash`, () => new HttpResponse(null, { status: 500 })));
    await expect(request('/crash')).rejects.toMatchObject({ status: 500 });
  });

  it('serializes query params into the URL', async () => {
    let url;
    server.use(
      http.get(`${BASE}/search`, ({ request: req }) => {
        url = req.url;
        return HttpResponse.json([]);
      }),
    );
    await request('/search', { query: { page: 2, limit: 10 } });
    expect(url).toContain('page=2');
    expect(url).toContain('limit=10');
  });

  it('skips null/undefined query values', async () => {
    let url;
    server.use(
      http.get(`${BASE}/search`, ({ request: req }) => {
        url = req.url;
        return HttpResponse.json([]);
      }),
    );
    await request('/search', { query: { page: 1, filter: null, sort: undefined } });
    expect(url).toContain('page=1');
    expect(url).not.toContain('filter');
    expect(url).not.toContain('sort');
  });

  it('sends JSON body on POST', async () => {
    let body;
    server.use(
      http.post(`${BASE}/items`, async ({ request: req }) => {
        body = await req.json();
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );
    const result = await request('/items', { method: 'POST', body: { name: 'x' } });
    expect(body).toEqual({ name: 'x' });
    expect(result).toEqual({ id: 1 });
  });

  it('handles empty response body (204)', async () => {
    server.use(http.delete(`${BASE}/items/1`, () => new HttpResponse(null, { status: 204 })));
    const result = await request('/items/1', { method: 'DELETE' });
    expect(result).toBeNull();
  });
});

// ─── http shorthand methods ───────────────────────────────────────────────────

describe('http shorthand methods', () => {
  it('http.get resolves', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({ x: 1 })));
    await expect(httpClient.get('/x')).resolves.toEqual({ x: 1 });
  });

  it('http.post resolves', async () => {
    server.use(http.post(`${BASE}/x`, () => HttpResponse.json({ ok: true })));
    await expect(httpClient.post('/x', { data: 1 })).resolves.toEqual({ ok: true });
  });

  it('http.put resolves', async () => {
    server.use(http.put(`${BASE}/x/1`, () => HttpResponse.json({ updated: true })));
    await expect(httpClient.put('/x/1', {})).resolves.toEqual({ updated: true });
  });

  it('http.patch resolves', async () => {
    server.use(http.patch(`${BASE}/x/1`, () => HttpResponse.json({ patched: true })));
    await expect(httpClient.patch('/x/1', {})).resolves.toEqual({ patched: true });
  });

  it('http.delete resolves', async () => {
    server.use(http.delete(`${BASE}/x/1`, () => new HttpResponse(null, { status: 204 })));
    await expect(httpClient.delete('/x/1')).resolves.toBeNull();
  });
});
