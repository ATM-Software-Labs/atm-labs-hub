// GET /api/admin/deploys — último despliegue de cada proyecto Pages y fecha de cada Worker.
// Solo sesión interna (verificada por guides). El token de Cloudflare nunca sale del servidor.
import { internalUser, corsFor } from '../../lib/internal.js';

const CF = 'https://api.cloudflare.com/client/v4';
let cache = null;

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', ...corsFor(request) } });
}

async function cf(path, token, fetchImpl) {
  const r = await fetchImpl(CF + path, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) { const e = new Error('cf_' + r.status); e.status = r.status; throw e; }
  return d.result;
}

export async function deploys(env, fetchImpl = fetch) {
  const token = env.CF_API_TOKEN;
  if (!token) return { ok: false, error: 'not_configured' };
  if (cache && cache.until > Date.now()) return cache.data;
  let account = String(env.CF_ACCOUNT_ID || '');
  if (!/^[0-9a-f]{32}$/.test(account)) {
    const accs = await cf('/accounts?per_page=5', token, fetchImpl);
    account = accs && accs[0] && accs[0].id;
    if (!account) return { ok: false, error: 'no_account' };
  }
  const projects = {};
  const errors = [];
  try {
    for (const p of await cf(`/accounts/${account}/pages/projects?per_page=50`, token, fetchImpl)) {
      const d = p.latest_deployment || {};
      const trig = (d.deployment_trigger && d.deployment_trigger.metadata) || {};
      projects['pages:' + p.name] = { at: d.created_on || '', status: (d.latest_stage && d.latest_stage.status) || '', branch: trig.branch || '', env: d.environment || '' };
    }
  } catch (e) { errors.push('pages_' + (e.status || 'error')); }
  try {
    for (const s of await cf(`/accounts/${account}/workers/scripts`, token, fetchImpl)) {
      projects['worker:' + s.id] = { at: s.modified_on || '', status: '', branch: '' };
    }
  } catch (e) { errors.push('workers_' + (e.status || 'error')); }
  const data = { ok: true, projects, errors, at: new Date().toISOString() };
  cache = { until: Date.now() + 60000, data };
  return data;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...corsFor(request), 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '600' } });
  }
  if (request.method !== 'GET') return json(request, { error: 'method_not_allowed' }, 405);
  const user = await internalUser(request);
  if (!user) return json(request, { error: 'forbidden' }, 403);
  try {
    return json(request, await deploys(env));
  } catch (e) {
    return json(request, { ok: false, error: 'cloudflare_unavailable' }, 502);
  }
}

export function _resetCache() { cache = null; }
