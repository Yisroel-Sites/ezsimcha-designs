const L = require('./_lib');

// Prices in cents. Change here (or with Vercel env vars) to update what customers pay.
const PRICE = {
  image: { premium: +process.env.PRICE_IMAGE_PREMIUM || 499, pro: +process.env.PRICE_IMAGE_PRO || 899 },
  video: { premium: +process.env.PRICE_VIDEO_PREMIUM || 999, pro: +process.env.PRICE_VIDEO_PRO || 1199 }
};
const NAMES = { premium: 'Premium', pro: 'Premium Pro' };
const RANK = { free: 0, premium: 1, pro: 2 };
const ARTTIER = require('./_arttier.json'); // full-size art that only paid designs use -> the tier it needs
const crypto = require('crypto');
const hmac = s => crypto.createHmac('sha256', process.env.SESSION_SECRET || 'local-dev-secret').update(s).digest('base64url');
function signCredit(o) { const p = Buffer.from(JSON.stringify(o)).toString('base64url'); return p + '.' + hmac('credit|' + p); }
function readCredit(t) {
  const [p, sig] = String(t || '').split('.');
  if (!p || !sig) return null;
  const a = Buffer.from(hmac('credit|' + p)), b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()); } catch (e) { return null; }
}
function grant(path) { const exp = Date.now() + 10 * 60e3; return exp + '.' + hmac('art|' + path + '|' + exp); }
const VALID_MS = 48 * 3600e3; // a paid download stays usable for 48 hours (in case the video needs redoing)

async function stripe(path, method, form) {
  const r = await fetch('https://api.stripe.com/v1/' + path, {
    method, headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form ? new URLSearchParams(form).toString() : undefined
  });
  const j = await r.json();
  if (!r.ok) { const e = new Error((j.error && j.error.message) || 'stripe'); e.stripe = 1; throw e; }
  return j;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
  const b = await L.body(req);
  const uid = L.readToken(req);
  const configured = !!process.env.STRIPE_SECRET_KEY;
  try {
    if (b.op === 'status') {
      const founder = !!(uid && (await L.getJ('db/members/' + uid + '.json')));
      return L.send(res, 200, { configured, founder, prices: PRICE });
    }
    if (!configured && b.op === 'use') { const art = (Array.isArray(b.art) ? b.art : []).map(String).filter(p => ARTTIER[p]).slice(0, 6); return L.send(res, 200, { ok: 1, paid: 1, grants: Object.fromEntries(art.map(p => [p, grant(p)])) }); }
    if (!configured) return L.send(res, 503, { error: 'not_configured' });

    if (b.op === 'checkout') {
      const kind = b.kind === 'video' ? 'video' : 'image', tier = b.tier === 'pro' ? 'pro' : 'premium';
      if (!(await L.rateLimit('pay:' + L.ip(req), 30, 3600e3))) return L.send(res, 429, { error: 'rate_limited' });
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const origin = (host && /^[a-z0-9.-]+(:\d+)?$/i.test(host) ? 'https://' + host : 'https://invitely-com.vercel.app');
      const s = await stripe('checkout/sessions', 'POST', {
        mode: 'payment',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': String(PRICE[kind][tier]),
        'line_items[0][price_data][product_data][name]': `Invitely ${NAMES[tier]} ${kind === 'video' ? 'video' : 'picture'} download`,
        'metadata[kind]': kind, 'metadata[tier]': tier, 'metadata[uid]': uid || '',
        success_url: origin + '/?paid={CHECKOUT_SESSION_ID}',
        cancel_url: origin + '/?paycancel=1'
      });
      return L.send(res, 200, { url: s.url });
    }

    if (b.op === 'verify') {
      const sid = String(b.sid || '');
      if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(sid)) return L.send(res, 400, { error: 'bad_id' });
      const s = await stripe('checkout/sessions/' + sid, 'GET');
      if (s.payment_status !== 'paid') return L.send(res, 402, { error: 'not_paid' });
      const c = L.sha(sid).slice(0, 32), key = 'pay/' + c + '.json';
      let rec = await L.getJ(key);
      if (!rec) { rec = { first: Date.now(), kind: s.metadata.kind, tier: s.metadata.tier, used: 0, uses: s.metadata.kind === 'video' ? 3 : 2 }; await L.putJ(key, rec); }
      if (Date.now() - rec.first > VALID_MS) return L.send(res, 410, { error: 'expired' });
      return L.send(res, 200, { ok: 1, kind: rec.kind, tier: rec.tier, left: rec.uses - (rec.used || 0), credit: signCredit({ c, k: rec.kind, t: rec.tier, e: rec.first + VALID_MS }) });
    }

    // Every Premium or Pro download asks here first. Counts one use and returns passes for the full-size art.
    if (b.op === 'use') {
      const kind = b.kind === 'video' ? 'video' : 'image';
      const art = (Array.isArray(b.art) ? b.art : []).map(String).filter(p => ARTTIER[p]).slice(0, 6);
      const need = Math.max(RANK[b.tier] || 0, ...art.map(p => RANK[ARTTIER[p]]));
      const grants = () => Object.fromEntries(art.map(p => [p, grant(p)]));
      if (!need) return L.send(res, 200, { ok: 1, paid: 0, grants: {} });
      if (uid && (await L.getJ('db/members/' + uid + '.json'))) return L.send(res, 200, { ok: 1, paid: 1, founder: 1, grants: grants() });
      const cr = readCredit(b.credit);
      if (!cr) return L.send(res, 402, { error: 'need_pay', need: need === 2 ? 'pro' : 'premium' });
      if (cr.e < Date.now()) return L.send(res, 410, { error: 'expired' });
      if (!(cr.k === kind || cr.k === 'video')) return L.send(res, 402, { error: 'need_pay', need: need === 2 ? 'pro' : 'premium' });
      if ((RANK[cr.t] || 0) < need) return L.send(res, 402, { error: 'need_pay', need: 'pro' });
      const key = 'pay/' + cr.c + '.json', rec = await L.getJ(key);
      if (!rec) return L.send(res, 402, { error: 'need_pay' });
      if ((rec.used || 0) >= rec.uses) return L.send(res, 402, { error: 'used_up', need: need === 2 ? 'pro' : 'premium' });
      rec.used = (rec.used || 0) + 1; await L.putJ(key, rec);
      return L.send(res, 200, { ok: 1, paid: 1, left: rec.uses - rec.used, grants: grants() });
    }
    return L.send(res, 400, { error: 'bad_op' });
  } catch (e) {
    return L.send(res, e.stripe ? 502 : 500, { error: e.stripe ? 'stripe_failed' : 'server' });
  }
};
