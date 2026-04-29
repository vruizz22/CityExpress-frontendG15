import { env } from '@/config/env';

/**
 * HTTP client basado en `fetch` nativo (Web Platform — sin dependencias).
 *
 * Responsabilidades:
 *  - Adjuntar `Authorization: Bearer <accessToken>` cuando el caller proporciona un token getter.
 *  - Normalizar errores de red a una clase `HttpError` con `status`, `body` y `message`.
 *  - Aplicar timeout via `AbortSignal` (default 15s).
 *  - Serializar JSON request/response automáticamente.
 *
 * Este módulo NO depende de Auth0 directamente. El `AuthProvider` (D1) inyecta
 * `getAccessTokenSilently` mediante un setter (`setTokenProvider`).
 *
 * @typedef {Object} RequestOptions
 * @property {string} [method]
 * @property {Record<string, string>} [headers]
 * @property {unknown} [body] JSON serializable; pasar undefined para body vacío.
 * @property {Record<string, string | number | boolean | null | undefined>} [query]
 * @property {boolean} [auth] Inyectar Bearer token (default true).
 * @property {number} [timeoutMs] Default 15000.
 * @property {AbortSignal} [signal] Permite cancelación externa además del timeout.
 */

/** Error tipado para responses no-2xx o fallos de red. */
export class HttpError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {unknown} [body]
   */
  constructor(message, status, body) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

/** @type {(() => Promise<string | null>) | null} */
let tokenProvider = null;

/**
 * Inyecta el provider de access tokens (típicamente `getAccessTokenSilently` de Auth0).
 * Se llama una vez desde el `AuthProvider` en arranque.
 *
 * @param {(() => Promise<string | null>) | null} provider
 */
export function setTokenProvider(provider) {
  tokenProvider = provider;
}

/**
 * @param {Record<string, string | number | boolean | null | undefined> | undefined} query
 */
function buildQuery(query) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Llamada HTTP genérica. Lanza `HttpError` para status >=400 o fallos de red.
 *
 * @template T
 * @param {string} path Ruta relativa al `apiBaseUrl` (puede empezar con `/`).
 * @param {RequestOptions} [options]
 * @returns {Promise<T>}
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    query,
    auth = true,
    timeoutMs = 15_000,
    signal: externalSignal,
  } = options;

  const url = new URL(path, env.apiBaseUrl).toString() + buildQuery(query);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  /** @type {Record<string, string>} */
  const finalHeaders = { Accept: 'application/json', ...headers };
  if (body !== undefined && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (auth && tokenProvider) {
    const token = await tokenProvider();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      credentials: 'omit',
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new HttpError('Request aborted (timeout or cancel)', 0);
    }
    throw new HttpError(err instanceof Error ? err.message : 'Network error', 0);
  }
  clearTimeout(timeoutId);

  const text = await response.text();
  /** @type {unknown} */
  let parsed;
  try {
    parsed = text.length > 0 ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    throw new HttpError(`HTTP ${response.status} on ${method} ${path}`, response.status, parsed);
  }

  return /** @type {T} */ (parsed);
}

export const http = {
  /** @template T @type {(p: string, o?: RequestOptions) => Promise<T>} */
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  /** @template T @type {(p: string, b?: unknown, o?: RequestOptions) => Promise<T>} */
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  /** @template T @type {(p: string, b?: unknown, o?: RequestOptions) => Promise<T>} */
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  /** @template T @type {(p: string, b?: unknown, o?: RequestOptions) => Promise<T>} */
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  /** @template T @type {(p: string, o?: RequestOptions) => Promise<T>} */
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
