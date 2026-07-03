import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentEvents, subscribeToEventStream } from './eventFeedService';

describe('eventFeedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn();
    global.EventSource = vi.fn(() => ({
      close: vi.fn(),
      onmessage: null,
      onerror: null,
      onopen: null,
    }));
  });

  it('carga eventos recientes', async () => {
    const events = [
      {
        type: 'package-created',
        timestamp: '2026-07-02T15:00:00.000Z',
        packageId: 'pkg-1',
      },
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue(events),
    });

    await expect(getRecentEvents()).resolves.toEqual(events);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/events/recent'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  });

  it('lanza error si falla la carga de eventos recientes', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn(),
    });

    await expect(getRecentEvents()).rejects.toThrow(/no se pudieron cargar/i);
  });

  it('lanza error si el backend no responde JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('text/html'),
      },
      json: vi.fn(),
    });

    await expect(getRecentEvents()).rejects.toThrow(/no respondió JSON/i);
  });

  it('se suscribe al stream SSE', () => {
    const onMessage = vi.fn();
    const onError = vi.fn();

    const eventSource = subscribeToEventStream({
      onMessage,
      onError,
    });

    expect(global.EventSource).toHaveBeenCalledWith(expect.stringContaining('/events/stream'));

    eventSource.onmessage({
      data: JSON.stringify({
        type: 'package-created',
        timestamp: '2026-07-02T15:00:00.000Z',
      }),
    });

    expect(onMessage).toHaveBeenCalledWith({
      type: 'package-created',
      timestamp: '2026-07-02T15:00:00.000Z',
    });
  });

  it('notifica error si llega un evento inválido', () => {
    const onMessage = vi.fn();
    const onError = vi.fn();

    const eventSource = subscribeToEventStream({
      onMessage,
      onError,
    });

    eventSource.onmessage({
      data: 'invalid-json',
    });

    expect(onMessage).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
