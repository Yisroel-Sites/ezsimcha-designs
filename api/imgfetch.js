// TEMPORARY helper used once to collect category photos. Removed after use.
const ALLOW = /^(https:\/\/)(unsplash\.com|images\.unsplash\.com|commons\.wikimedia\.org|upload\.wikimedia\.org)\//;
module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.searchParams.get('k') !== 'd138b2e08668a3fc') { res.statusCode = 403; return res.end('no') }
  const t = u.searchParams.get('u') || '';
  if (!ALLOW.test(t)) { res.statusCode = 400; return res.end('bad') }
  const r = await fetch(t, { headers: { 'user-agent': 'InvitelyBot/1.0 (site setup)' } });
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader('content-type', 'text/plain'); res.setHeader('cache-control', 'no-store');
  res.end(u.searchParams.get('b64') ? buf.toString('base64') : buf.toString('utf8'));
};
