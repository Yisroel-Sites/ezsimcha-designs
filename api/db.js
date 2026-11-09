const L = require('./_lib');

const MAX_MEMBERS = 30;
const colPath = c => 'db/' + c + '/';
const docPath = (c, id) => 'db/' + c + '/' + id + '.json';

// Which collections exist, who may read them, who may write them.
function parseCol(path, uid) {
  path = String(path || '').replace(/^\/+|\/+$/g, '');
  if (path === 'reviews' || path === 'members') return { col: path, pub: true };
  const m = /^data\/users\/([A-Za-z0-9_-]{1,64})$/.exec(path);
  if (m) return { col: path, owner: m[1], pub: false };
  return null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
  if (!L.secret()) return L.send(res, 503, { error: 'not_configured' });
  const b = await L.body(req);
  const uid = L.readToken(req);
  const c = parseCol(b.col, uid);
  if (!c) return L.send(res, 403, { error: 'forbidden' });
  const ownerOnly = !c.pub && c.owner !== uid;
  try {
    if (b.op === 'list') {
      if (ownerOnly) return L.send(res, 403, { error: 'forbidden' });
      const paths = await L.listP(colPath(c.col));
      const docs = [];
      for (const p of paths.slice(0, 500)) {
        const d = await L.getJ(p);
        if (d) docs.push({ id: p.slice(colPath(c.col).length).replace(/\.json$/, ''), data: d });
      }
      return L.send(res, 200, { docs });
    }

    const id = L.cleanId(b.id);
    if (!id) return L.send(res, 400, { error: 'bad_id' });

    if (b.op === 'get') {
      if (ownerOnly) return L.send(res, 403, { error: 'forbidden' });
      const d = await L.getJ(docPath(c.col, id));
      return L.send(res, 200, { data: d });
    }

    // writes need a signed-in user who owns the document
    if (!uid) return L.send(res, 401, { error: 'login' });
    if (c.pub && id !== uid) return L.send(res, 403, { error: 'forbidden' });
    if (!c.pub && c.owner !== uid) return L.send(res, 403, { error: 'forbidden' });

    if (b.op === 'delete') {
      await L.delJ(docPath(c.col, id));
      return L.send(res, 200, { ok: 1 });
    }
    if (b.op === 'set') {
      const d = b.data && typeof b.data === 'object' ? b.data : {};
      if (!(await L.rateLimit('db:' + uid, 120, 3600e3))) return L.send(res, 429, { error: 'rate_limited' });
      let rec;
      if (c.col === 'reviews') {
        const stars = Math.round(+d.stars), text = String(d.text || '').trim().slice(0, 600);
        if (!(stars >= 1 && stars <= 5) || text.length < 3) return L.send(res, 400, { error: 'invalid_argument' });
        rec = { uid, name: String(d.name || '').trim().slice(0, 40), stars, text, at: Date.now() };
      } else if (c.col === 'members') {
        const have = await L.getJ(docPath('members', uid));
        if (!have) {
          const n = (await L.listP(colPath('members'))).length;
          if (n >= MAX_MEMBERS) return L.send(res, 409, { error: 'full' });
        }
        rec = have || { uid, at: Date.now() };
      } else {
        const design = String(d.design || '');
        if (!design || design.length > 1.5e6) return L.send(res, 400, { error: 'invalid_argument' });
        if (!(await L.getJ(docPath(c.col, id)))) {
          const n = (await L.listP(colPath(c.col))).length;
          if (n >= 100) return L.send(res, 409, { error: 'too_many' });
        }
        rec = { id, cat: String(d.cat || '').slice(0, 40), at: Date.now(), design };
      }
      await L.putJ(docPath(c.col, id), rec);
      return L.send(res, 200, { ok: 1 });
    }
    return L.send(res, 400, { error: 'bad_op' });
  } catch (e) {
    return L.send(res, 500, { error: 'server' });
  }
};
