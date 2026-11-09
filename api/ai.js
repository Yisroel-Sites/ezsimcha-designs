const L = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return L.send(res, 503, { error: 'not_configured' });
  const b = await L.body(req);
  const prompt = String(b.prompt || '');
  // Only the site's own invitation prompt is allowed, so this can't be used as a free general AI.
  if (!prompt.startsWith('You design Jewish simcha invitations') || prompt.length > 6000) return L.send(res, 400, { error: 'bad_prompt' });
  const who = L.readToken(req) || 'ip:' + L.ip(req);
  if (!(await L.rateLimit('ai:' + who, 10, 3600e3))) return L.send(res, 429, { error: 'rate_limited' });
  if (!(await L.rateLimit('ai:all', +process.env.AI_DAILY_LIMIT || 500, 86400e3))) return L.send(res, 429, { error: 'rate_limited' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-sonnet-5-5', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] })
    });
    if (!r.ok) return L.send(res, 502, { error: 'ai_failed' });
    const j = await r.json();
    const text = (j.content || []).map(x => x.text || '').join('');
    const s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s < 0 || e < s) return L.send(res, 502, { error: 'ai_failed' });
    return L.send(res, 200, { json: JSON.parse(text.slice(s, e + 1)) });
  } catch (e) {
    return L.send(res, 502, { error: 'ai_failed' });
  }
};
