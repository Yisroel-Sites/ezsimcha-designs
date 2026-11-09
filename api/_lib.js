// Shared helpers for the Invitely backend: storage, sessions, rate limits.
const crypto = require('crypto');

/* ---------- storage (Vercel Blob, private store). Falls back to memory when no token (local testing only) ---------- */
let blobMod;
const B = async () => blobMod || (blobMod = await import('@vercel/blob'));
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const mem = (global.__invMem = global.__invMem || new Map());

async function getJ(path) {
  if (!useBlob()) return mem.has(path) ? JSON.parse(mem.get(path)) : null;
  try {
    const { get } = await B();
    const r = await get(path, { access: 'private', useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch (e) { return null; }
}
async function putJ(path, obj) {
  if (!useBlob()) { mem.set(path, JSON.stringify(obj)); return; }
  const { put } = await B();
  await put(path, JSON.stringify(obj), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
}
async function delJ(path) {
  if (!useBlob()) { mem.delete(path); return; }
  try { const { del } = await B(); await del(path); } catch (e) {}
}
async function listP(prefix) {
  if (!useBlob()) return [...mem.keys()].filter(k => k.startsWith(prefix));
  const { list } = await B();
  const out = []; let cursor;
  do {
    const r = await list({ prefix, limit: 1000, cursor });
    r.blobs.forEach(b => out.push(b.pathname));
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

/* ---------- sessions: signed cookie ---------- */
const secret = () => process.env.SESSION_SECRET || (useBlob() ? '' : 'local-dev-secret');
const sign = s => crypto.createHmac('sha256', secret()).update(s).digest('base64url');
function makeToken(uid) {
  const exp = Date.now() + 30 * 864e5;
  const p = uid + '.' + exp;
  return p + '.' + sign(p);
}
function readToken(req) {
  if (!secret()) return null;
  const m = /(?:^|;\s*)inv_s=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return null;
  const parts = m[1].split('.');
  if (parts.length !== 3) return null;
  const p = parts[0] + '.' + parts[1];
  const a = Buffer.from(sign(p)), b = Buffer.from(parts[2]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (+parts[1] < Date.now()) return null;
  return parts[0];
}
function setCookie(res, token) {
  const base = 'inv_s=' + (token || '') + '; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=' + (token ? 30 * 86400 : 0);
  res.setHeader('Set-Cookie', base);
}

/* ---------- misc ---------- */
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const ip = req => String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'x').trim();
async function rateLimit(key, limit, windowMs) {
  const slot = Math.floor(Date.now() / windowMs);
  const path = 'rl/' + sha(key).slice(0, 24) + '-' + slot + '.json';
  const cur = (await getJ(path)) || { n: 0 };
  if (cur.n >= limit) return false;
  cur.n++;
  await putJ(path, cur);
  return true;
}
async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) { return {}; }
}
function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
const cleanId = s => /^[A-Za-z0-9_-]{1,64}$/.test(String(s)) ? String(s) : null;

module.exports = { getJ, putJ, delJ, listP, makeToken, readToken, setCookie, sha, ip, rateLimit, body, send, cleanId, secret, useBlob, crypto };
