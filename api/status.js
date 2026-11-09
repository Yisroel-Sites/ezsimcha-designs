const L = require('./_lib');
// Simple health check: shows which backend pieces are switched on (true/false only, no secrets).
module.exports = async (req, res) => {
  let write = false;
  try { await L.putJ('health.json', { t: Date.now() }); write = !!(await L.getJ('health.json')); } catch (e) {}
  L.send(res, 200, { storage: L.useBlob(), storageWorks: write, login: !!L.secret(), ai: !!process.env.ANTHROPIC_API_KEY });
};
