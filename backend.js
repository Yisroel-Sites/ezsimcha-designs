/* Invitely client for the /api backend: login, reviews/founders storage, saved designs and AI mode. */
(function () {
  const J = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}), credentials: 'same-origin' })
    .then(async r => { let j = {}; try { j = await r.json() } catch (e) {} if (!r.ok) { const e = new Error(j.error || 'http'); e.code = j.error || ('http_' + r.status); throw e } return j });
  let meP = null;
  const me = () => meP || (meP = J('/api/auth', { op: 'me' }).then(r => r.user || null).catch(() => null));
  const avatar = n => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><rect width="44" height="44" fill="#0B3D91"/><text x="22" y="29" font-size="20" font-family="Georgia,serif" fill="#fff" text-anchor="middle">${String(n || '?').trim().charAt(0).toUpperCase().replace(/[<>&]/g, '')}</text></svg>`);

  const user = {
    id: async () => (await me())?.id || null,
    me: async () => { const u = await me(); return u ? { id: u.id, name: u.name, email: u.email, avatarUrl: avatar(u.name) } : null },
    profiles: async uids => { try { return (await J('/api/auth', { op: 'profiles', uids })).profiles } catch (e) { return {} } },
    signup: (name, email, password) => J('/api/auth', { op: 'signup', name, email, password }),
    login: (email, password) => J('/api/auth', { op: 'login', email, password }),
    logout: () => J('/api/auth', { op: 'logout' }),
    deleteAccount: () => J('/api/auth', { op: 'deleteAccount' })
  };

  const listeners = {};
  const snap = docs => ({ size: docs.length, docs: docs.map(d => ({ id: d.id, data: () => d.data })) });
  const poll = async col => { const r = await J('/api/db', { op: 'list', col }); return snap(r.docs) };
  const refresh = col => (listeners[col] || []).forEach(l => l());
  function collection(col) {
    return {
      get: () => poll(col),
      doc: id => docRef(col + '/' + id),
      onSnapshot(cb, err) {
        let alive = true;
        const run = () => poll(col).then(s => alive && cb(s), e => alive && err && err(e));
        (listeners[col] = listeners[col] || []).push(run);
        run();
        const t = setInterval(() => { if (!document.hidden) run() }, 30000);
        return () => { alive = false; clearInterval(t); listeners[col] = listeners[col].filter(x => x !== run) };
      }
    };
  }
  function docRef(path) {
    const i = path.lastIndexOf('/'), col = path.slice(0, i), id = path.slice(i + 1);
    return {
      get: async () => { const r = await J('/api/db', { op: 'get', col, id }); return { exists: !!r.data, data: () => r.data } },
      set: async data => { await J('/api/db', { op: 'set', col, id, data }); refresh(col) },
      delete: async () => { await J('/api/db', { op: 'delete', col, id }); refresh(col) }
    };
  }
  const db = { collection, doc: docRef };
  const sample = { json: async prompt => { const r = await J('/api/ai', { prompt }); return r.json } };

  // Show AI mode only when the server has an AI key; otherwise hide it everywhere.
  fetch('/api/status').then(r => r.json()).then(j => { if (j.ai) { document.documentElement.classList.add('ai-on'); window.renderFAQ && renderFAQ() } }).catch(() => {});

  window.INV = { use: async name => name === 'user' ? user : name === 'db' ? db : name === 'sample' ? sample : null, user };
})();
