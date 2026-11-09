/* Puts the customer's invitation onto the green card of a real filmed clip, frame by frame, with WebGL.
   The clip's own light and shadow are kept, and anything in front of the card (the envelope pocket) stays in front. */
(function () {
  const VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2((a.x+1.)*.5,(1.-a.y)*.5);gl_Position=vec4(a,0.,1.);}';
  const FS = `precision mediump float;varying vec2 v;uniform sampler2D uV,uD;uniform vec4 uR;uniform float uDH,uG,uHave;uniform vec3 uEdge;
  void main(){vec3 p=texture2D(uV,v).rgb;float mx=max(p.r,p.b);
   float k=clamp((p.g-mx-.06)/.12,0.,1.);
   vec2 uv=(v-uR.xy)/uR.zw;float ins=step(-.01,uv.x)*step(uv.x,1.01)*step(-.01,uv.y)*step(uv.y,1.01)*uHave;k*=ins;
   vec3 sp=vec3(p.r,min(p.g,mx),p.b);
   if(p.g>p.r*.85&&p.b<p.r*.72){float q=max(p.r,p.g);sp=vec3(q*1.12,q*.84,p.b*.9);}
   float m=(1.-uDH)*.5;float dv=(uv.y-m)/uDH;
   vec3 face=(dv<0.||dv>1.)?uEdge:texture2D(uD,vec2(clamp(uv.x,0.,1.),clamp(dv,0.,1.))).rgb;
   float sh=clamp(p.g/max(uG,.01),.55,1.3);
   gl_FragColor=vec4(mix(sp,face*sh,k),1.);}`;
  const S = {};
  function setup(id, w, h) {
    const C = window.REAL_CLIPS && REAL_CLIPS[id]; if (!C) return null;
    let s = S[id];
    if (!s) {
      const video = document.createElement('video');
      video.src = C.src; video.muted = true; video.playsInline = true; video.preload = 'auto'; video.crossOrigin = 'anonymous';
      video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
      s = S[id] = { C, video, mt: 0, canvas: document.createElement('canvas') };
      if (video.requestVideoFrameCallback) { const cb = (n, m) => { s.mt = m.mediaTime; video.requestVideoFrameCallback(cb) }; video.requestVideoFrameCallback(cb) }
      const gl = s.gl = s.canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
      if (!gl) return null;
      const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o };
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p); gl.useProgram(p); s.p = p;
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const tex = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t };
      s.tV = tex(); s.tD = tex();
      s.u = n => gl.getUniformLocation(p, n);
      gl.uniform1i(s.u('uV'), 0); gl.uniform1i(s.u('uD'), 1);
    }
    if (s.canvas.width !== w || s.canvas.height !== h) { s.canvas.width = w; s.canvas.height = h; s.gl.viewport(0, 0, w, h) }
    return s;
  }
  function edgeColor(img) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 20; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 16, 20);
    const d = x.getImageData(0, 0, 16, 20).data; let r = 0, g = 0, b = 0, n = 0;
    for (let y = 0; y < 20; y++) for (let X = 0; X < 16; X++) { if (y > 0 && y < 19 && X > 0 && X < 15) continue; const i = (y * 16 + X) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++ }
    return [r / n / 255, g / n / 255, b / n / 255];
  }
  window.preloadReal = id => { const s = setup(id, 720, 1280); if (s) s.video.load() };
  /* Draw one frame at time t (seconds) into ctx. Returns false while the clip is still loading. */
  window.realFrame = function (ctx, w, h, t, id, img) {
    const s = setup(id, w, h); if (!s) return false;
    const { C, video, gl } = s, end = C.dur - 0.05, want = Math.min(t, end);
    if (video.readyState < 2) { if (video.paused) video.play().catch(() => {}); ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.round(w * .045)}px Manrope,system-ui`; ctx.textAlign = 'center'; ctx.fillText('Loading…', w / 2, h / 2); return false }
    if (t >= end) { if (!video.paused) video.pause(); if (Math.abs(video.currentTime - end) > .05) video.currentTime = end }
    else { if (Math.abs(video.currentTime - want) > .25) video.currentTime = want; if (video.paused) video.play().catch(() => {}) }
    if (s.img !== img) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, s.tD); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); s.img = img; s.edge = edgeColor(img) }
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, s.tV); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    const mt = video.requestVideoFrameCallback && s.mt ? s.mt : video.currentTime;
    const fi = Math.max(0, Math.min(C.frames.length - 1, Math.round(mt * C.fps))), r = C.frames[fi];
    gl.uniform4f(s.u('uR'), ...(r || [0, 0, 1, 1])); gl.uniform1f(s.u('uHave'), r ? 1 : 0); gl.uniform1f(s.u('uG'), C.gref[fi] || .6);
    gl.uniform1f(s.u('uDH'), Math.min(1, C.aspect / (img.width / img.height))); gl.uniform3f(s.u('uEdge'), ...s.edge);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    ctx.drawImage(s.canvas, 0, 0, w, h);
    return true;
  };
  window.__realSeek0 = id => new Promise(r => { const s = S[id]; if (!s) return r(); const v = s.video; v.pause(); if (v.currentTime < .03) return r(); v.addEventListener('seeked', () => r(), { once: true }); v.currentTime = 0; setTimeout(r, 1000) });
  window.stopReal = () => { for (const k in S) { try { S[k].video.pause() } catch (e) {} } };
})();
/* Wait until the clip can play from the start, so a recording never begins on "Loading…". */
window.realReady = id => new Promise(res => {
  window.preloadReal(id);
  const c = document.createElement('canvas'); c.width = 720; c.height = 1280;
  let tries = 0;
  const tick = () => {
    const ok = window.realFrame(c.getContext('2d'), 720, 1280, 0, id, c);
    if (ok) { window.__realSeek0 && window.__realSeek0(id).then(() => res(true)); return }
    if (++tries > 150) return res(false);
    setTimeout(tick, 100);
  };
  tick();
});
