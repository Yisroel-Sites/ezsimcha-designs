const L = require('./_lib');
// Simple health check: shows which backend pieces are switched on (true/false only, no secrets).
const crypto = require('crypto');
module.exports = async (req, res) => {
  // Self-test for the art guard: a pass for a harmless test file (full/ping.txt), never for real art.
  if (/[?&]artping=1/.test(req.url || '')) { const exp = Date.now() + 5 * 60e3; return L.send(res, 200, { g: exp + '.' + crypto.createHmac('sha256', process.env.SESSION_SECRET || 'local-dev-secret').update('art|ping.txt|' + exp).digest('base64url') }); }
  let write = false;
  if (/[?&]deep=1/.test(req.url || '')) { try { await L.putJ('health.json', { t: Date.now() }); write = !!(await L.getJ('health.json')); } catch (e) {} }
  L.send(res, 200, { storage: L.useBlob(), storageWorks: write, login: !!L.secret(), ai: !!process.env.ANTHROPIC_API_KEY });
};
