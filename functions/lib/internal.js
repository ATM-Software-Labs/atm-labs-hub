// Sesión interna de ATM: la firma la comprueba guides (/api/auth/me) con la cookie del usuario.
// Nunca se confía en el cliente: aquí solo se reenvía la cookie y se exige role internal + proveedor microsoft.
export const GUIDES_ME = 'https://guides.trujillomingorance.com/api/auth/me';
export const PANEL_ORIGIN = 'https://guides.trujillomingorance.com';

export async function internalUser(request, fetchImpl = fetch) {
  const cookie = request.headers.get('Cookie') || '';
  if (!/(?:^|;\s*)(?:ta_session|atm_session|session_token)=/.test(cookie)) return null;
  try {
    const r = await fetchImpl(GUIDES_ME, { headers: { Cookie: cookie, Accept: 'application/json' }, redirect: 'manual' });
    if (!r.ok) return null;
    const d = await r.json();
    const u = d && d.authenticated && d.user;
    if (!u || u.role !== 'internal' || u.provider !== 'microsoft') return null;
    return u;
  } catch (_) { return null; }
}

export function corsFor(request) {
  const origin = request.headers.get('Origin') || '';
  return origin === PANEL_ORIGIN
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', 'Vary': 'Origin, Cookie' }
    : { 'Vary': 'Origin, Cookie' };
}
