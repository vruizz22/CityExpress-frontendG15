/**
 * Lectura y validación de variables de entorno expuestas por Vite.
 * Falla rápido en arranque si faltan las requeridas.
 *
 * @typedef {Object} AppEnv
 * @property {string} apiBaseUrl
 * @property {string} auth0Domain
 * @property {string} auth0ClientId
 * @property {string} auth0Audience
 * @property {string} auth0RedirectUri
 */

const REQUIRED_KEYS = [
  'VITE_API_BASE_URL',
  'VITE_AUTH0_DOMAIN',
  'VITE_AUTH0_CLIENT_ID',
  'VITE_AUTH0_AUDIENCE',
];

function readEnv() {
  const missing = REQUIRED_KEYS.filter((k) => !import.meta.env[k]);
  if (missing.length > 0 && import.meta.env.MODE !== 'test') {
    throw new Error(
      `[config/env] Missing required env vars: ${missing.join(', ')}. ` +
        `Copy .env.example to .env.local and fill in the values.`,
    );
  }
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN ?? '',
    auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? '',
    auth0Audience: import.meta.env.VITE_AUTH0_AUDIENCE ?? '',
    auth0RedirectUri:
      import.meta.env.VITE_AUTH0_REDIRECT_URI ?? `${window.location.origin}/callback`,
  };
}

/** @type {AppEnv} */
export const env = readEnv();
