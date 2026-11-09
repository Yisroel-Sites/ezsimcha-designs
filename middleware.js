// Full-size premium art lives under /full/. It opens only with a short-lived pass signed by /api/pay.
// Same as next() from @vercel/functions: let the request continue to the static file.
const next = init => { const h = new Headers(init && init.headers); h.set('x-middleware-next', '1'); return new Response(null, { headers: h }); };

export const config = { matcher: '/full/:path*' };

const enc = new TextEncoder();
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = decodeURIComponent(url.pathname.replace(/^\/full\//, ''));
  const g = url.searchParams.get('g') || '';
  const [exp, sig] = g.split('.');
  const secret = process.env.SESSION_SECRET;
  const deny = () => new Response('Not allowed', { status: 403, headers: { 'cache-control': 'no-store' } });
  if (!secret || !exp || !sig || !/^\d+$/.test(exp) || +exp < Date.now() || +exp > Date.now() + 15 * 60e3) return deny();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const want = b64url(await crypto.subtle.sign('HMAC', key, enc.encode('art|' + path + '|' + exp)));
  if (want.length !== sig.length) return deny();
  let diff = 0; for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff) return deny();
  return next({ headers: { 'cache-control': 'private, max-age=600' } });
}
