/* Invitely interface translation: English -> Yiddish (yi) and Lashon Kodesh (he).
   Translates interface text anywhere on the page, including text added later by code.
   Never touches what people type, the design itself, font names or sample wording. */
(function () {
  const D = window.I18N_DICT || {};
  const PAT = window.I18N_PAT || [];
  const SKIP = 'script,style,noscript,canvas,svg,[contenteditable],.fontlist,.notr,#kbd,.stars,.rvText,#rvList p'; // whole areas left alone
  const NOTEXT = 'textarea,input'; // typed content: only their hint text (placeholder) is translated
  const ATTRS = ['placeholder', 'aria-label', 'title'];
  const lang = () => (typeof LANG !== 'undefined' ? LANG : 'en');
  function tr(t, L) {
    const k = t.replace(/\s+/g, ' ').trim();
    if (!k || !/[A-Za-z]/.test(k)) return null;
    const e = D[k];
    if (e) return L === 'yi' ? e[0] : (e[1] || e[0]);
    for (const [re, fn] of PAT) { const m = k.match(re); if (m) { const r = fn(m, L, x => tr(x, L) || x); if (r != null) return r } }
    return null;
  }
  function doText(n, L) {
    if (n.__en === undefined) { if (!/[A-Za-z]/.test(n.nodeValue)) return; n.__en = n.nodeValue }
    else if (n.nodeValue !== n.__tr) n.__en = n.nodeValue; // code changed it since
    if (L === 'en') { if (n.__tr !== undefined && n.nodeValue === n.__tr) n.nodeValue = n.__en; n.__tr = undefined; return }
    const r = tr(n.__en, L);
    if (r != null) { const lead = n.__en.match(/^\s*/)[0], tail = n.__en.match(/\s*$/)[0]; const v = lead + r + tail; if (n.nodeValue !== v) n.nodeValue = v; n.__tr = v }
  }
  function doAttrs(el, L) {
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      const key = '__en_' + a, cur = el.getAttribute(a);
      if (el[key] === undefined || cur !== el[key + 't']) el[key] = cur;
      if (L === 'en') { if (cur !== el[key]) el.setAttribute(a, el[key]); el[key + 't'] = el[key]; continue }
      const r = tr(el[key], L); const v = r != null ? r : el[key];
      if (cur !== v) el.setAttribute(a, v); el[key + 't'] = v;
    }
  }
  let busy = false;
  function apply(root) {
    const L = lang(); if (busy) return; busy = true;
    try {
      root = root || document.body;
      if (root.nodeType === 3) { if (!root.parentElement?.closest(SKIP + ',' + NOTEXT)) doText(root, L); return }
      if (root.nodeType !== 1 || root.closest?.(SKIP)) return;
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: n => n.nodeType === 1 ? (n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_ACCEPT });
      if (root.nodeType === 1) doAttrs(root, L);
      let n; while ((n = w.nextNode())) { if (n.nodeType === 3) { if (!n.parentElement.closest(NOTEXT)) doText(n, L) } else doAttrs(n, L) }
    } finally { busy = false }
  }
  window.applyI18N = () => apply(document.body);
  window.trUI = (s) => (lang() === 'en' ? s : tr(s, lang()) || s); // for toasts and alerts
  const mo = new MutationObserver(ms => {
    if (busy) return;
    if (lang() === 'en' && !document.body.__trDone) return;
    for (const m of ms) {
      if (m.type === 'characterData') apply(m.target);
      else if (m.type === 'attributes') apply(m.target);
      else m.addedNodes.forEach(x => apply(x));
    }
  });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS }); document.body.__trDone = true; apply(document.body) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
