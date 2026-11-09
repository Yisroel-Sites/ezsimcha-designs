const L = require('./_lib');

// Prices in cents. Change here (or with Vercel env vars) to update what customers pay.
const PRICE = {
  image: { premium: +process.env.PRICE_IMAGE_PREMIUM || 500, pro: +process.env.PRICE_IMAGE_PRO || 1000 },
  video: { premium: +process.env.PRICE_VIDEO_PREMIUM || 1000, pro: +process.env.PRICE_VIDEO_PRO || 1500 }
};
const NAMES = { premium: 'Premium', pro: 'Premium Pro' };
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
      const key = 'pay/' + L.sha(sid).slice(0, 32) + '.json';
      let rec = await L.getJ(key);
      if (!rec) { rec = { first: Date.now(), kind: s.metadata.kind, tier: s.metadata.tier }; await L.putJ(key, rec); }
      if (Date.now() - rec.first > VALID_MS) return L.send(res, 410, { error: 'expired' });
      return L.send(res, 200, { ok: 1, kind: rec.kind, tier: rec.tier });
    }
    return L.send(res, 400, { error: 'bad_op' });
  } catch (e) {
    return L.send(res, e.stripe ? 502 : 500, { error: e.stripe ? 'stripe_failed' : 'server' });
  }
};
