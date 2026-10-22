// /api/admin/deploys: solo sesión interna verificada por guides; el token de Cloudflare nunca sale.
import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, _resetCache } from '../functions/api/admin/deploys.js';

const G = 'https://guides.trujillomingorance.com';
let meReply = null;
let cfCalls = [];
globalThis.fetch = async (u, init = {}) => {
  const s = String(u);
  if (s === G + '/api/auth/me') {
    assert.ok(init.headers.Cookie.includes('ta_session='));
    return new Response(JSON.stringify(meReply || { authenticated: false, user: null }));
  }
  if (s.startsWith('https://api.cloudflare.com/client/v4/')) {
    cfCalls.push({ s, auth: init.headers.Authorization });
    if (s.includes('/accounts?')) return new Response(JSON.stringify({ success: true, result: [{ id: 'a'.repeat(32) }] }));
    if (s.includes('/pages/projects')) return new Response(JSON.stringify({ success: true, result: [{ name: 'rewrite-ai', latest_deployment: { created_on: '2026-10-22T11:28:13Z', latest_stage: { status: 'success' }, deployment_trigger: { metadata: { branch: 'main' } } } }] }));
    if (s.includes('/workers/scripts')) return new Response(JSON.stringify({ success: true, result: [{ id: 'invest', modified_on: '2026-10-20T22:26:17Z' }] }));
  }
  throw new Error('unexpected ' + s);
};
const env = { CF_API_TOKEN: 'test-token', CF_ACCOUNT_ID: 'YOUR_CLOUDFLARE_ACCOUNT_ID' };
const req = (cookie, origin = G) => new Request('https://labs.trujillomingorance.com/api/admin/deploys', { headers: { ...(cookie ? { Cookie: cookie } : {}), Origin: origin } });

test('sin cookie, autor normal o interno de otro proveedor → 403 sin llamar a Cloudflare', async () => {
  cfCalls = [];
  assert.equal((await onRequest({ request: req(''), env })).status, 403);
  meReply = { authenticated: true, user: { handle: 'pepe', role: 'author', provider: 'x' } };
  assert.equal((await onRequest({ request: req('ta_session=x'), env })).status, 403);
  meReply = { authenticated: true, user: { handle: 'a', role: 'internal', provider: 'google' } };
  assert.equal((await onRequest({ request: req('ta_session=x'), env })).status, 403);
  meReply = { authenticated: true, user: { handle: 'a', role: 'admin', provider: 'microsoft' } };
  assert.equal((await onRequest({ request: req('ta_session=x'), env })).status, 403);
  assert.equal(cfCalls.length, 0);
});

test('interno: despliegues de Pages y Workers, CORS solo para el panel, sin token en la respuesta', async () => {
  _resetCache(); cfCalls = [];
  meReply = { authenticated: true, user: { handle: 'alberto', role: 'internal', provider: 'microsoft', admin: true } };
  const r = await onRequest({ request: req('ta_session=x'), env });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), G);
  assert.equal(r.headers.get('Access-Control-Allow-Credentials'), 'true');
  const text = await r.text();
  assert.ok(!text.includes('test-token'));
  const d = JSON.parse(text);
  assert.equal(d.projects['pages:rewrite-ai'].status, 'success');
  assert.equal(d.projects['worker:invest'].at, '2026-10-20T22:26:17Z');
  assert.ok(cfCalls.every((c) => c.auth === 'Bearer test-token'));
  const other = await onRequest({ request: req('ta_session=x', 'https://evil.example.com'), env });
  assert.equal(other.headers.get('Access-Control-Allow-Origin'), null);
});

test('sin CF_API_TOKEN: responde not_configured', async () => {
  _resetCache();
  const r = await onRequest({ request: req('ta_session=x'), env: {} });
  assert.equal((await r.json()).error, 'not_configured');
});
