/* Invitely Premium: pay per download for Premium and Premium Pro designs in Custom. */
(function () {
  const RANK = { free: 0, premium: 1, pro: 2 };
  const NAME = { premium: 'Premium', pro: 'Premium Pro' };
  let ST = null;
  const post = (body) => fetch('/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body) })
    .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.error || 'http'); e.code = j.error; throw e } return j });
  const status = () => ST || (ST = post({ op: 'status' }).catch(() => ({ configured: false, founder: false })));
  const money = c => '$' + (c % 100 ? (c / 100).toFixed(2) : c / 100);
  const level = () => (typeof D !== 'undefined' && D && RANK[D.tier]) ? D.tier : 'free';
  const getCredit = () => { try { return localStorage.getItem('inv_credit2') || '' } catch (e) { return '' } };
  const setCredit = c => { try { c ? localStorage.setItem('inv_credit2', c) : localStorage.removeItem('inv_credit2'); localStorage.removeItem('inv_credit') } catch (e) {} };
  const artOf = () => (typeof D !== 'undefined' && D && D.bg && D.bg.img) ? [D.bg.img] : [];
  function loadFull(grants) {
    window.FULLART = window.FULLART || {};
    return Promise.all(Object.entries(grants || {}).map(([p, g]) => FULLART[p] ? null : new Promise(r => {
      const i = new Image(); i.onload = () => { FULLART[p] = i; r() }; i.onerror = r; i.src = '/full/' + p + '?g=' + encodeURIComponent(g);
    })));
  }
  async function paidRun(run) {
    window.PAID_RUN = true; document.getElementById('stage')?.classList.add('paidok');
    try { if (typeof draw === 'function') draw(); await run(); } finally { setTimeout(() => { window.PAID_RUN = false }, 15000) }
  }

  function modal(html) {
    let m = document.getElementById('mPay');
    if (!m) { m = document.createElement('div'); m.className = 'modal'; m.id = 'mPay'; m.style.zIndex = 90; document.body.appendChild(m); m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) m.classList.remove('on') }) }
    m.innerHTML = '<div class="sheet" style="max-width:440px;text-align:center"><h3><span></span><button class="x" type="button" data-x aria-label="Close">×</button></h3>' + html + '</div>';
    m.classList.add('on'); return m;
  }

  async function gate(kind, run) {
    const lvl = level(), art = artOf();
    if (lvl === 'free' && !art.length) { window.PAID_RUN = false; return run() }
    let r;
    try { r = await post({ op: 'use', kind, tier: lvl, art, credit: getCredit() }) }
    catch (e) {
      if (e.code === 'need_pay' || e.code === 'used_up' || e.code === 'expired') return askPay(kind, lvl === 'free' ? 'premium' : lvl, e.code);
      return (window.toast || alert)('Could not reach the server. Please check your connection and try again.');
    }
    if (!r.paid) { window.PAID_RUN = false; return run() }
    await loadFull(r.grants);
    if (r.left === 0) setCredit(null);
    return paidRun(run);
  }
  async function askPay(kind, lvl, why) {
    const st = await status();
    const price = st.prices && st.prices[kind] ? st.prices[kind][lvl] : 0;
    const note = why === 'used_up' ? '<p class="hint" style="margin:0 0 10px">Your last payment has been fully used.</p>' : '';
    const m = modal(`<h3 style="justify-content:center;margin:8px 0 4px">${NAME[lvl]} design</h3>${note}
      <p class="muted" style="margin:0 0 16px">Download this ${kind === 'video' ? 'video' : 'picture'} for <b>${money(price)}</b>. One-time payment, no account needed.</p>
      <button class="btn gold" id="payGo" style="width:100%">Pay ${money(price)} and download</button>
      <button class="btn ghost" data-x style="width:100%;margin-top:8px">Not now</button>
      <p class="hint" style="margin:12px 0 0">Secure payment by Stripe. Founding members download Premium free.</p>`);
    m.querySelector('#payGo').onclick = async e => {
      e.target.disabled = true; e.target.textContent = 'Opening secure checkout…';
      try {
        localStorage.setItem('inv_pending', JSON.stringify({ D, cat: curCat, kind, at: Date.now() }));
        const r = await post({ op: 'checkout', kind, tier: lvl });
        location.href = r.url;
      } catch (x) { e.target.disabled = false; e.target.textContent = 'Pay ' + money(price) + ' and download'; (window.toast || alert)('Could not open checkout. Please try again.') }
    };
  }

  window.addEventListener('load', () => {
    const down = $('#eDown').onclick, rec = $('#vRec').onclick;
    $('#eDown').onclick = () => gate('image', down);
    $('#vRec').onclick = () => gate('video', rec);

    const q = new URLSearchParams(location.search), sid = q.get('paid');
    if (q.has('paid') || q.has('paycancel')) history.replaceState(null, '', location.pathname + location.hash);
    let pend = null; try { pend = JSON.parse(localStorage.getItem('inv_pending') || 'null') } catch (e) {}
    if (!pend || !pend.D) return;
    if (!sid && !q.has('paycancel')) return;
    localStorage.removeItem('inv_pending');
    (async () => {
      if (pend.cat) curCat = pend.cat;
      await openEditor(pend.D);
      if (!sid) return;
      try {
        const v = await post({ op: 'verify', sid });
        setCredit(v.credit);
        if (v.kind === 'video') { (window.toast || alert)('Payment received. Tap Create video.'); $('#eVideo').click() }
        else { (window.toast || alert)('Payment received. Your download is starting.'); setTimeout(() => $('#eDown').click(), 600) }
      } catch (e) { (window.toast || alert)('We could not confirm the payment. If you were charged, contact us.') }
    })();
  });
  document.addEventListener('click', e => { if (e.target.closest('#auIn,#auUp,#acOut,#joinBtn')) setTimeout(() => { ST = null }, 1500) });
})();
