/* Invitely color themes. Pick one with the 🎨 button. The choice is remembered on this device. */
(function () {
  const mix = (a, b, f) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - f) + parseInt(b.substr(i, 2), 16) * f).toString(16).padStart(2, '0')).join('');
  const lum = h => [1, 3, 5].reduce((s, i, k) => s + parseInt(h.substr(i, 2), 16) * [.2126, .7152, .0722][k], 0) / 255;
  const mk = (id, name, note, brand, ac, deep) => {
    if (lum(deep) > .8) deep = mix(brand, '#000000', .45);
    return { id, name, note, bg: '#FFFFFF', paper: '#FFFFFF', ink: mix(brand, '#111111', .75), muted: '#5f6670',
      line: mix(brand, '#FFFFFF', .82), tint: mix(brand, '#FFFFFF', .92), brand, deep, ac,
      acl: mix(ac, '#FFFFFF', .45), acd: lum(ac) > .55 ? mix(ac, '#000000', .45) : mix(ac, '#000000', .2) };
  };
  const T = [
    mk('emerald', '1. Emerald & Champagne Gold', 'Luxury and exclusivity', '#064E3B', '#D4AF37', '#111111'),
    mk('midnight', '2. Midnight Blue & Silver', 'Royal and sophisticated', '#101D3A', '#AEB8C7', '#FFFFFF'),
    mk('burgundy', '3. Burgundy & Rose Gold', 'Rich and romantic', '#641E32', '#B76E79', '#171717'),
    mk('electric', '4. Black & Electric Blue', 'Modern and premium', '#111111', '#246BFD', '#000000'),
    mk('forest', '5. Forest Green & Copper', 'Distinctive and upscale', '#174734', '#B87345', '#252525'),
    mk('purple', '6. Royal Purple & Silver', 'Elegant and bold', '#512477', '#BEC3D0', '#171717'),
    mk('teal', '7. Deep Teal & Gold', 'Fresh and luxurious', '#075B62', '#D6AE48', '#FFFFFF'),
    mk('ruby', '8. Black & Ruby Red', 'Dramatic and striking', '#111111', '#A71930', '#000000'),
    mk('chocolate', '9. Chocolate & Copper', 'Warm and expensive', '#493126', '#B77A50', '#171717'),
    mk('pink', '10. Midnight Purple & Hot Pink', 'Bold and fun', '#2E1A47', '#FF2E88', '#111111')
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
    const t = T.find(x => x.id === id) || T.find(x => x.id === DEF); if (!T.find(x => x.id === id)) id = DEF; cur = t.id;
    st.textContent = css(t);
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = t.brand;
    try { localStorage.setItem('inv_theme', t.id) } catch (e) {}
    document.querySelectorAll('.thOpt').forEach(b => b.classList.toggle('on', b.dataset.id === t.id));
  }
  const DEF = 'emerald';
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
