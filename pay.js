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
  const getCredit = () => { try { return JSON.parse(localStorage.getItem('inv_credit') || 'null') } catch (e) { return null } };
  const setCredit = c => { try { c ? localStorage.setItem('inv_credit', JSON.stringify(c)) : localStorage.removeItem('inv_credit') } catch (e) {} };

  function modal(html) {
    let m = document.getElementById('mPay');
    if (!m) { m = document.createElement('div'); m.className = 'modal'; m.id = 'mPay'; m.style.zIndex = 90; document.body.appendChild(m); m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) m.classList.remove('on') }) }
    m.innerHTML = '<div class="sheet" style="max-width:440px;text-align:center"><h3><span></span><button class="x" type="button" data-x aria-label="Close">×</button></h3>' + html + '</div>';
    m.classList.add('on'); return m;
  }

  async function gate(kind, run) {
    const lvl = level();
    if (lvl === 'free') return run();
    const st = await status();
    if (!st.configured || st.founder) return run();
    const cr = getCredit();
    if (cr && cr.kind === kind && RANK[cr.tier] >= RANK[lvl] && cr.uses > 0 && Date.now() - cr.at < 47 * 3600e3) {
      cr.uses--; setCredit(cr.uses > 0 ? cr : null); return run();
    }
    const price = st.prices[kind][lvl];
    const m = modal(`<div style="font-size:40px;line-height:1">${lvl === 'pro' ? '💎' : '👑'}</div>
      <h3 style="justify-content:center;margin:8px 0 4px">${NAME[lvl]} design</h3>
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
        setCredit({ sid, kind: v.kind, tier: v.tier, uses: v.kind === 'video' ? 3 : 2, at: Date.now() });
        if (v.kind === 'video') { (window.toast || alert)('Payment received! Tap Create video.'); $('#eVideo').click() }
        else { (window.toast || alert)('Payment received! Your download is starting.'); setTimeout(() => $('#eDown').click(), 600) }
      } catch (e) { (window.toast || alert)('We could not confirm the payment. If you were charged, contact us.') }
    })();
  });
  document.addEventListener('click', e => { if (e.target.closest('#auIn,#auUp,#acOut,#joinBtn')) setTimeout(() => { ST = null }, 1500) });
})();
