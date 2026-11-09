/* Invitely color themes. Pick one with the 🎨 button. The choice is remembered on this device. */
(function () {
  const T = [
    { id: 'navy', name: 'Royal Navy & Gold', bg: '#FFFFFF', paper: '#FFFFFF', ink: '#14203a', muted: '#5d6475', line: '#D6DEEC', brand: '#0B3D91', deep: '#0B2A63', ac: '#C99A3A', acl: '#F0D58A', acd: '#8F6A17', tint: '#E4EBF8' },
    { id: 'emerald', name: 'Emerald & Champagne', bg: '#FFFFFF', paper: '#FFFFFF', ink: '#1b2b23', muted: '#5b6a62', line: '#CFE0D7', brand: '#1F5C45', deep: '#123A2B', ac: '#B8923A', acl: '#EBD79A', acd: '#8A6A1E', tint: '#E2EEE8' },
    { id: 'burgundy', name: 'Burgundy & Rose Gold', bg: '#FFFFFF', paper: '#FFFFFF', ink: '#34202a', muted: '#75616a', line: '#EBD3D8', brand: '#7C2D3A', deep: '#4A1822', ac: '#B9805A', acl: '#E9C6A8', acd: '#8B5A3C', tint: '#F6E4E6' },
    { id: 'plum', name: 'Plum & Gold', bg: '#FFFFFF', paper: '#FFFFFF', ink: '#2b1f36', muted: '#6d6178', line: '#E0D2EA', brand: '#5B2E7A', deep: '#3A1B50', ac: '#C99A3A', acl: '#F0D58A', acd: '#8F6A17', tint: '#EEE3F5' },
    { id: 'charcoal', name: 'Charcoal & Brass', bg: '#FFFFFF', paper: '#FFFFFF', ink: '#1f2124', muted: '#666a70', line: '#DADCDF', brand: '#2E3238', deep: '#1A1D21', ac: '#B08D57', acl: '#E3CFA3', acd: '#7F6334', tint: '#E8E6E1' },
    { id: 'sky', name: 'Sky Blue & Silver', bg: '#FFFFFF', paper: '#FFFFFF', ink: '#182a3d', muted: '#5a6b7d', line: '#D5E0EC', brand: '#2A6FB7', deep: '#1B4A7E', ac: '#8795A5', acl: '#D3DCE6', acd: '#5E6E80', tint: '#E1ECF8' }
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
.fopt.on{border-color:${t.brand};box-shadow:0 0 0 2px ${t.acl}}
/* bold look: white page, color band hero, tinted alternate sections */
html,body{overflow-x:hidden}
header.top,body.inv header.top{background:#ffffffee;border-bottom:3px solid ${t.brand}}
.hero{position:relative;isolation:isolate;padding:64px 12px 48px;color:#fff}
.hero::before{content:'';position:absolute;top:0;bottom:0;left:50%;width:100vw;transform:translateX(-50%);z-index:-1;background:radial-gradient(1200px 500px at 50% -10%,${t.brand},${t.deep} 70%)}
.hero h1{color:#fff}.hero h1 em{background:linear-gradient(135deg,${t.acl},${t.ac},${t.acl});-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p,.hero .hint{color:rgba(255,255,255,.88)}.hero a{color:#fff}
.door{background:#fff;border:0;box-shadow:0 14px 36px rgba(0,0,0,.28)}.door:hover{transform:translateY(-3px);box-shadow:0 18px 44px rgba(0,0,0,.34)}
.door span{color:${t.muted}}
#home section:nth-of-type(even){background:${t.tint}}
#home section{padding-top:44px;padding-bottom:44px}
.cat{background:#fff;border:1px solid ${t.line};box-shadow:0 4px 14px rgba(0,0,0,.06)}.cat:hover{border-color:${t.brand};box-shadow:0 10px 24px rgba(0,0,0,.12)}
.card,body.inv .card{background:#fff;box-shadow:0 6px 22px rgba(0,0,0,.07)}
.sheet{background:#fff}
.tier{background:#fff}
.schip{background:#fff}
body.inv .catHead h2,body.inv #sName{color:${t.brand}}
footer{background:${t.deep};color:rgba(255,255,255,.8);border-top:0;margin-top:0}footer a{color:#fff}`;
  }
  const st = document.createElement('style'); st.id = 'themeCss'; document.head.appendChild(st);
  function apply(id) {
    const t = T.find(x => x.id === id) || T.find(x => x.id === DEF); cur = t.id;
    st.textContent = css(t);
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = t.brand;
    try { localStorage.setItem('inv_theme', t.id) } catch (e) {}
    document.querySelectorAll('.thOpt').forEach(b => b.classList.toggle('on', b.dataset.id === t.id));
  }
  const DEF = 'navy';
  let cur = DEF, saved = null; try { saved = new URLSearchParams(location.search).get('theme') || localStorage.getItem('inv_theme') } catch (e) {}
  apply(saved || DEF);

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
      const dots = [t.brand, t.deep, t.ac, t.tint];
      o.innerHTML = '<span class="thDots">' + dots.map(c => `<i style="background:${c}"></i>`).join('') + '</span><span>' + t.name + (t.note ? '<small>' + t.note + '</small>' : '') + '</span>';
      o.onclick = () => apply(t.id); p.appendChild(o);
    });
    b.onclick = () => p.classList.toggle('on');
    document.body.appendChild(p); document.body.appendChild(b);
    apply(cur);
  });
})();
