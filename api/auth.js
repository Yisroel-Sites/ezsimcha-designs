const L = require('./_lib');
const { crypto } = L;

const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
const pub = u => ({ id: u.id, name: u.name, email: u.email });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
  if (!L.secret()) return L.send(res, 503, { error: 'not_configured' });
  const b = await L.body(req);
  const uid = L.readToken(req);
  try {
    if (b.op === 'me') {
      if (!uid) return L.send(res, 200, { user: null });
      const u = await L.getJ('users/' + uid + '.json');
      return L.send(res, 200, { user: u ? pub(u) : null });
    }
    if (b.op === 'profiles') {
      const out = {};
      for (const id of (Array.isArray(b.uids) ? b.uids : []).slice(0, 100)) {
        const k = L.cleanId(id); if (!k) continue;
        const u = await L.getJ('users/' + k + '.json');
        if (u) out[k] = { name: u.name };
      }
      return L.send(res, 200, { profiles: out });
    }
    if (b.op === 'logout') { L.setCookie(res, ''); return L.send(res, 200, { ok: 1 }); }

    if (b.op === 'signup' || b.op === 'login') {
      if (!(await L.rateLimit('auth:' + L.ip(req), 20, 3600e3))) return L.send(res, 429, { error: 'rate_limited' });
      const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
      const pw = String(b.password || '').slice(0, 200);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return L.send(res, 400, { error: 'bad_email' });
      const ek = 'emails/' + L.sha(email) + '.json';
      if (b.op === 'signup') {
        if (pw.length < 8) return L.send(res, 400, { error: 'short_password' });
        if (await L.getJ(ek)) return L.send(res, 409, { error: 'email_taken' });
        const id = 'u' + crypto.randomBytes(9).toString('hex');
        const salt = crypto.randomBytes(16).toString('hex');
        const name = String(b.name || '').trim().slice(0, 40) || email.split('@')[0];
        const u = { id, email, name, salt, hash: hashPw(pw, salt), at: Date.now() };
        await L.putJ('users/' + id + '.json', u);
        await L.putJ(ek, { id });
        L.setCookie(res, L.makeToken(id));
        return L.send(res, 200, { user: pub(u) });
      }
      const ref = await L.getJ(ek);
      const u = ref && (await L.getJ('users/' + ref.id + '.json'));
      const bad = () => L.send(res, 401, { error: 'bad_login' });
      if (!u) return bad();
      const a = Buffer.from(hashPw(pw, u.salt), 'hex'), c = Buffer.from(u.hash, 'hex');
      if (a.length !== c.length || !crypto.timingSafeEqual(a, c)) return bad();
      L.setCookie(res, L.makeToken(u.id));
      return L.send(res, 200, { user: pub(u) });
    }

    if (b.op === 'deleteAccount') {
      if (!uid) return L.send(res, 401, { error: 'login' });
      const u = await L.getJ('users/' + uid + '.json');
      for (const p of await L.listP('db/data/users/' + uid + '/')) await L.delJ(p);
      await L.delJ('db/reviews/' + uid + '.json');
      await L.delJ('db/members/' + uid + '.json');
      if (u) await L.delJ('emails/' + L.sha(u.email) + '.json');
      await L.delJ('users/' + uid + '.json');
      L.setCookie(res, '');
      return L.send(res, 200, { ok: 1 });
    }
    return L.send(res, 400, { error: 'bad_op' });
  } catch (e) {
    return L.send(res, 500, { error: 'server' });
  }
};
