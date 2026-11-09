/* Invitely color themes. Pick one with the 🎨 button. The choice is remembered on this device. */
(function () {
  const T = [
    { id: 'current', name: 'Current look', note: 'Cream and green on Custom, ivory and navy on Simple' },
    { id: 'navy', name: 'Royal Navy & Gold', bg: '#FAF6EC', paper: '#FFFCF4', ink: '#14203a', muted: '#5d6475', line: '#E1D6C1', brand: '#0B3D91', deep: '#0B2A63', ac: '#C99A3A', acl: '#F0D58A', acd: '#8F6A17', tint: '#E4EBF8' },
    { id: 'emerald', name: 'Emerald & Champagne', bg: '#F6F2E7', paper: '#FFFDF7', ink: '#1b2b23', muted: '#5b6a62', line: '#DCD5BE', brand: '#1F5C45', deep: '#123A2B', ac: '#B8923A', acl: '#EBD79A', acd: '#8A6A1E', tint: '#E2EEE8' },
    { id: 'burgundy', name: 'Burgundy & Rose Gold', bg: '#FBF4F1', paper: '#FFFBF9', ink: '#34202a', muted: '#75616a', line: '#EBD7D2', brand: '#7C2D3A', deep: '#4A1822', ac: '#B9805A', acl: '#E9C6A8', acd: '#8B5A3C', tint: '#F6E4E6' },
    { id: 'plum', name: 'Plum & Gold', bg: '#F8F3F8', paper: '#FFFCFF', ink: '#2b1f36', muted: '#6d6178', line: '#E2D6E8', brand: '#5B2E7A', deep: '#3A1B50', ac: '#C99A3A', acl: '#F0D58A', acd: '#8F6A17', tint: '#EEE3F5' },
    { id: 'charcoal', name: 'Charcoal & Brass', bg: '#F4F1EC', paper: '#FFFFFF', ink: '#1f2124', muted: '#666a70', line: '#DDD8CF', brand: '#2E3238', deep: '#1A1D21', ac: '#B08D57', acl: '#E3CFA3', acd: '#7F6334', tint: '#E8E6E1' },
    { id: 'sky', name: 'Sky Blue & Silver', bg: '#F3F7FB', paper: '#FFFFFF', ink: '#182a3d', muted: '#5a6b7d', line: '#D5E0EC', brand: '#2A6FB7', deep: '#1B4A7E', ac: '#8795A5', acl: '#D3DCE6', acd: '#5E6E80', tint: '#E1ECF8' }
  ];
  const shade = (hex, f) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.substr(i, 2), 16) * (1 - f)).toString(16).padStart(2, '0')).join('');
  function css(t) {
    const d = shade(t.brand, .35), dg = shade(t.acd, .35);
    return `
:root,body.inv{--cream:${t.bg};--paper:${t.paper};--ink:${t.ink};--muted:${t.muted};--line:${t.line};--gold:${t.brand};--gold2:${t.acl};--navy:${t.brand};--accent:${t.brand};--logo:${t.brand}}
body,body.inv{background:${t.bg};color:${t.ink}}
header.top,body.inv header.top{background:${t.bg}ee;border-color:${t.line}}
nav.main a:hover,nav.main button:hover{background:${t.tint}}
body.inv .logo,body.inv nav.main a,body.inv nav.main button{color:${t.brand}}
.btn,body.inv .btn{background:${t.brand};color:#fff;box-shadow:0 4px 0 ${d}}
body .btn.gold{background:${t.acd};color:#fff;box-shadow:0 4px 0 ${dg}}
.btn.ghost,body.inv .btn.ghost{background:#fff;color:${t.brand};border:2px solid ${t.line};box-shadow:none}
.hero h1,h2.sec,.cat b,.cat span,body.inv .catHead h2,body.inv #sName,.door.inv-door b,.door b{color:${t.brand}}
.hero h1 em{background:linear-gradient(135deg,${t.acd},${t.ac},${t.acd});-webkit-background-clip:text;background-clip:text;color:transparent}
.door:hover,.door.inv-door:hover{border-color:${t.brand}}
.schip.on,body.inv .schip.on{background:${t.brand};border-color:${t.brand};color:#fff}
body.inv .schip{border-color:${t.line};color:${t.ink}}
body.inv .card{background:${t.paper};border-color:${t.line}}
body.inv .badge{background:${t.tint};color:${t.brand}}
.badge.pro{background:${t.deep};color:${t.acl}}
body.inv textarea,body.inv input{border-color:${t.line}}
body.inv textarea:focus,body.inv input:focus{outline:3px solid ${t.acl}}
.lang button.on,body.inv .lang button.on{background:${t.brand};color:#fff}
.cat:hover,.tpl.blank{border-color:${t.line}}
.step .n{background:${t.brand};color:${t.acl}}
.founders{background:linear-gradient(135deg,${t.brand},${t.deep})}.founders h2{color:${t.acl}}
.meter i{background:linear-gradient(90deg,${t.ac},${t.acl})}
.stars,.starpick button.on{color:${t.ac}}.starpick button{color:${t.line}}
.etop button.pri{background:${t.brand};border-color:${t.brand}}.etop button.gold{background:${t.acd};border-color:${t.acd}}
.t-green{background:linear-gradient(135deg,${t.brand},${t.deep})}.t-blue{background:linear-gradient(135deg,${t.acd},${t.ac})}.t-purple{background:linear-gradient(135deg,${t.deep},${t.brand} 60%,${t.ac})}
.fopt.on{border-color:${t.brand};box-shadow:0 0 0 2px ${t.acl}}`;
  }
  const st = document.createElement('style'); st.id = 'themeCss'; document.head.appendChild(st);
  function apply(id) {
    const t = T.find(x => x.id === id) || T[0]; cur = t.id;
    st.textContent = t.bg ? css(t) : '';
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = t.bg || '#fff0d1';
    try { localStorage.setItem('inv_theme', t.id) } catch (e) {}
    document.querySelectorAll('.thOpt').forEach(b => b.classList.toggle('on', b.dataset.id === t.id));
  }
  let cur = 'current', saved = null; try { saved = new URLSearchParams(location.search).get('theme') || localStorage.getItem('inv_theme') } catch (e) {}
  apply(saved || 'current');

  document.addEventListener('DOMContentLoaded', () => {
    const ui = document.createElement('style');
    ui.textContent = `#thBtn{position:fixed;left:14px;bottom:14px;z-index:45;border:0;border-radius:999px;padding:11px 16px;background:#fff;color:#222;font:700 14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.22);cursor:pointer}
#thPanel{position:fixed;left:14px;bottom:62px;z-index:46;width:min(330px,calc(100vw - 28px));max-height:70vh;overflow:auto;background:#fff;color:#222;border-radius:18px;box-shadow:0 14px 44px rgba(0,0,0,.3);padding:12px;display:none;font-family:system-ui,sans-serif}
#thPanel.on{display:block}#thPanel h4{margin:2px 4px 8px;font-size:15px}
.thOpt{display:flex;gap:12px;align-items:center;width:100%;text-align:start;border:2px solid #eee;border-radius:14px;padding:9px 11px;margin:0 0 8px;background:#fff;color:#222;cursor:pointer;font:600 14px system-ui,sans-serif}
.thOpt.on{border-color:#222}.thOpt small{display:block;font-weight:400;color:#777;font-size:12px}
.thDots{display:flex;flex:none}.thDots i{width:22px;height:22px;border-radius:50%;margin-inline-end:-7px;border:2px solid #fff}`;
    document.head.appendChild(ui);
    const b = document.createElement('button'); b.id = 'thBtn'; b.type = 'button'; b.textContent = '🎨 Colors';
    const p = document.createElement('div'); p.id = 'thPanel';
    p.innerHTML = '<h4>Pick a color theme</h4>';
    T.forEach(t => {
      const o = document.createElement('button'); o.type = 'button'; o.className = 'thOpt'; o.dataset.id = t.id;
      const dots = t.bg ? [t.bg, t.brand, t.ac, t.deep] : ['#fff0d1', '#2d4939', '#0B3D91', '#E7C873'];
      o.innerHTML = '<span class="thDots">' + dots.map(c => `<i style="background:${c}"></i>`).join('') + '</span><span>' + t.name + (t.note ? '<small>' + t.note + '</small>' : '') + '</span>';
      o.onclick = () => apply(t.id); p.appendChild(o);
    });
    b.onclick = () => p.classList.toggle('on');
    document.body.appendChild(p); document.body.appendChild(b);
    apply(cur);
  });
})();
