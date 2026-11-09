/* Invitely Simple mode: pick a design, fill in the blanks, download. */
(function(){
"use strict";
const $=s=>document.querySelector(s);
let SD=null,sdP=null;const fieldCache={};
function loadSimple(){if(SD)return Promise.resolve(SD);if(!sdP)sdP=fetch('simple/data.json').then(r=>r.json()).then(j=>SD=j);return sdP}
function loadFields(id){if(!fieldCache[id])fieldCache[id]=fetch('simple/fields/'+id+'.json').then(r=>r.ok?r.json():[]).catch(()=>[]);return fieldCache[id]}
const fieldDefault=f=>f.default_value||f.label||f.render_template||'';
const isText=f=>f.field_type!=='image';

/* fonts from the Invitely font registry */
const fontP={};
function loadFamily(fam){if(!SD||!SD.fonts[fam])return Promise.resolve();if(!fontP[fam])fontP[fam]=Promise.all(SD.fonts[fam].map(v=>{try{const ff=new FontFace(fam,`url(${v.u})`,{weight:String(v.w),style:v.s});return ff.load().then(f=>document.fonts.add(f)).catch(()=>{})}catch(e){return Promise.resolve()}}));return fontP[fam]}
function loadFonts(fields){return Promise.all([...new Set(fields.map(f=>(f.style_config||{}).font_family).filter(Boolean))].map(loadFamily))}

/* images */
const imgP={};
function loadImg(src){if(!src)return Promise.reject();if(src.startsWith('assets/'))src='inv/'+src;if(!imgP[src])imgP[src]=new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>{delete imgP[src];rej()};i.src=src});return imgP[src]}

function wrap(ctx,text,maxW,maxLines){const out=[];for(const raw of String(text).split('\n')){const words=raw.split(/\s+/).filter(Boolean);if(!words.length){out.push('');continue}let line='';for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}if(line)out.push(line)}
 if(maxLines>0&&out.length>maxLines){const c=out.slice(0,maxLines);c[maxLines-1]=c[maxLines-1].replace(/\s?\S*$/,'')+'…';return c}return out}
function setFont(ctx,sc){const size=sc.font_size||12;ctx.font=`${sc.font_style==='italic'?'italic ':''}${sc.font_weight||'400'} ${size}px "${sc.font_family||'Arial'}"`;try{ctx.letterSpacing=(sc.letter_spacing||0)+'px'}catch(e){}}

async function renderCard(canvas,card,fields,values,scale){
 canvas.width=Math.round(card.w*scale);canvas.height=Math.round(card.h*scale);const ctx=canvas.getContext('2d');ctx.save();ctx.scale(scale,scale);
 ctx.fillStyle=card.bg||'#fff';ctx.fillRect(0,0,card.w,card.h);
 try{const im=await loadImg(card.art);ctx.drawImage(im,0,0,card.w,card.h)}catch(e){}
 if(card.ov&&card.oc){try{const im=await loadImg(card.ov),oc=card.oc;ctx.drawImage(im,oc.x||0,oc.y||0,oc.width||card.w,oc.height||card.h)}catch(e){}}
 await loadFonts(fields);
 const ord=fields.slice().sort((a,b)=>(((a.position_config||{}).z_index||0)-((b.position_config||{}).z_index||0))||((a.display_order||0)-(b.display_order||0)));
 for(const f of ord){const sc=f.style_config||{},pc=f.position_config||{};const text=values[f.id]??fieldDefault(f);if(!text)continue;
  const x=pc.x||0,y=pc.y||0,w=pc.width||card.w,h=pc.height||(sc.font_size||12);
  ctx.save();if(pc.rotation){ctx.translate(x+w/2,y+h/2);ctx.rotate(pc.rotation*Math.PI/180);ctx.translate(-(x+w/2),-(y+h/2))}
  if(f.field_type==='image'){try{const im=await loadImg(text);const fill=sc.element&&sc.element.globalFill;if(fill){const o=document.createElement('canvas');o.width=Math.max(1,Math.round(w));o.height=Math.max(1,Math.round(h));const ox=o.getContext('2d');ox.drawImage(im,0,0,o.width,o.height);ox.globalCompositeOperation='source-in';ox.fillStyle=fill;ox.fillRect(0,0,o.width,o.height);ctx.drawImage(o,x,y,w,h)}else ctx.drawImage(im,x,y,w||im.naturalWidth,h||im.naturalHeight)}catch(e){}ctx.restore();continue}
  const size=sc.font_size||12;setFont(ctx,sc);ctx.fillStyle=sc.color||'#000';
  if(Array.isArray(sc.foil)&&sc.foil.length>=2){const g=ctx.createLinearGradient(0,y,0,y+h);sc.foil.forEach((c,i)=>g.addColorStop(i/(sc.foil.length-1),c));ctx.fillStyle=g}
  const align=sc.text_align||'center';ctx.textAlign=align;ctx.textBaseline='middle';if(sc.text_direction){try{ctx.direction=sc.text_direction}catch(e){}}
  const ax=align==='center'?x+w/2:(align==='right'||align==='end')?x+w:x;let lh=size*(sc.line_height||1.2);let lines=wrap(ctx,text,w,0);const ml=sc.max_lines||0;
  if(ml&&lines.length>ml){const room=ml*lh;let fs=size;while(fs>3&&lines.length*fs*(sc.line_height||1.2)>room){fs*=.94;setFont(ctx,{...sc,font_size:fs});lines=wrap(ctx,text,w,0)}lh=fs*(sc.line_height||1.2)}const sy=y+h/2-lines.length*lh/2+lh/2;
  lines.forEach((l,i)=>ctx.fillText(l,ax,sy+i*lh,w));ctx.restore()}
 ctx.restore()}

/* ---------- views ---------- */
const view=()=>$('#simpleView');let curCat='all',curQ='',shown=0,list=[];const PAGE=24;
const thumbIO=new IntersectionObserver(es=>es.forEach(async e=>{if(!e.isIntersecting)return;thumbIO.unobserve(e.target);const c=e.target,card=c._card;const fl=await loadFields(card.id);const v={};renderCard(c,card,fl,v,260/card.w)}),{rootMargin:'300px'});
function tile(card){const b=document.createElement('a');b.className='tpl';b.href='#card-'+card.slug;b.style.aspectRatio=card.w+'/'+card.h;b.style.background=card.bg||'#fff';const c=document.createElement('canvas');c.width=260;c.height=Math.round(260*card.h/card.w);c._card=card;thumbIO.observe(c);b.appendChild(c);
 if(card.new){const s=document.createElement('span');s.className='badge';s.textContent='New';b.appendChild(s)}return b}
function renderGallery(){const g=$('#sGrid');g.innerHTML='';const q=curQ.toLowerCase();
 list=SD.cards.filter(c=>c.a&&(curCat==='all'||c.cat===curCat)&&(!q||(c.name+' '+c.slug+' '+c.cat).toLowerCase().includes(q)));
 $('#sCount').textContent=list.length+' designs';shown=0;more()}
function more(){const g=$('#sGrid');list.slice(shown,shown+PAGE).forEach(c=>g.appendChild(tile(c)));shown+=PAGE;$('#sMore').style.display=shown<list.length?'':'none'}
async function showGallery(cat){await loadSimple();curCat=cat||'all';const ch=$('#sCats');ch.innerHTML='';[{slug:'all',name:'All',n:SD.cards.filter(c=>c.a).length},...SD.cats.map(k=>({...k,n:SD.cards.filter(c=>c.a&&c.cat===k.slug).length})).filter(k=>k.n)].forEach(k=>{const b=document.createElement('a');b.href=k.slug==='all'?'#simple':'#simple-'+k.slug;b.className='schip'+(k.slug===curCat?' on':'');b.textContent=k.name+' · '+k.n;ch.appendChild(b)});
 $('#sGallery').style.display='';$('#sCard').style.display='none';renderGallery()}
let CUR=null;
async function showCard(slug){await loadSimple();const card=SD.cards.find(c=>c.slug===slug);if(!card){location.hash='#simple';return}
 $('#sGallery').style.display='none';$('#sCard').style.display='';$('#sName').textContent=card.name;$('#sBack').href=curCat&&curCat!=='all'?'#simple-'+curCat:'#simple';
 SZ=1;$('#sZoomBox').classList.remove('zoomed');$('#sCanvas').style.width='';$('#sZoom span').textContent='100%';const fields=JSON.parse(JSON.stringify(await loadFields(card.id)));const values={};fields.forEach(f=>values[f.id]=fieldDefault(f));CUR={card,fields,values};
 const form=$('#sForm');form.innerHTML='';fields.filter(isText).sort((a,b)=>{const c=f=>{const p=f.position_config||{};return (p.y||0)+(p.height||0)/2};return c(a)-c(b)}).forEach((f,i)=>{const lab=document.createElement('label');lab.className='f';lab.textContent=f.field_type==='location'?'Place':/date/.test(f.field_type)?'Date':'Line '+(i+1);
  const ta=document.createElement('textarea');ta.rows=Math.min(4,Math.max(1,String(values[f.id]).split('\n').length));const grow=()=>{ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px'};ta.addEventListener('input',grow);requestAnimationFrame(grow);setTimeout(grow,300);ta.dir='auto';ta.value=String(values[f.id]).replace(/\+/g,'');ta.oninput=()=>{values[f.id]=ta.value;queue()};form.appendChild(lab);form.appendChild(ta);
  if(f.field_type!=='image'){const fb=document.createElement('button');fb.type='button';fb.className='fontbtn';const lbl=()=>{fb.innerHTML='<span>Aa</span> Font: <b></b> ▾';fb.querySelector('b').textContent=(f.style_config||{}).font_family||'Arial'};lbl();f._lbl=lbl;fb.onclick=()=>openFontPicker(f,ta);
   const row=document.createElement('div');row.className='frow';row.appendChild(fb);
   const sc=f.style_config=f.style_config||{};const base=sc.font_size||12;let pct=100;
   const sz=document.createElement('div');sz.className='fsize';sz.innerHTML='<button type="button" aria-label="Smaller text">A−</button><span>100%</span><button type="button" aria-label="Bigger text">A+</button>';
   const out=sz.querySelector('span');const set=v=>{pct=Math.max(50,Math.min(200,v));sc.font_size=base*pct/100;out.textContent=pct+'%';queue()};
   sz.children[0].onclick=()=>set(pct-10);sz.children[2].onclick=()=>set(pct+10);out.onclick=()=>set(100);out.title='Tap to reset';
   row.appendChild(sz);form.appendChild(row)}});
 await draw();scrollTo(0,0)}
let qT=0;function queue(){clearTimeout(qT);qT=setTimeout(draw,120)}
let SZ=1;
function setSZ(z){z=Math.max(1,Math.min(4,Math.round(z*100)/100));const box=$('#sZoomBox'),sc=$('#sScroll'),c=$('#sCanvas');const fx=(sc.scrollLeft+sc.clientWidth/2)/Math.max(1,sc.scrollWidth),fy=(sc.scrollTop+sc.clientHeight/2)/Math.max(1,sc.scrollHeight);SZ=z;$('#sZoom span').textContent=Math.round(z*100)+'%';box.classList.toggle('zoomed',z>1);c.style.width=z>1?(z*100)+'%':'';draw().then(()=>{sc.scrollLeft=fx*sc.scrollWidth-sc.clientWidth/2;sc.scrollTop=fy*sc.scrollHeight-sc.clientHeight/2})}
document.addEventListener('click',e=>{const z=e.target.closest('#sZoom');if(!z)return;const b=e.target.closest('button');if(b)setSZ(SZ*(b.dataset.z==='+'?1.25:.8));else if(e.target.tagName==='SPAN')setSZ(1)});
async function draw(){if(!CUR)return;const c=$('#sCanvas');const s=Math.min(2,900/CUR.card.w)*Math.min(2,SZ);await renderCard(c,CUR.card,CUR.fields,CUR.values,s)}
async function download(){const c=document.createElement('canvas');await renderCard(c,CUR.card,CUR.fields,CUR.values,1600/CUR.card.w);window.stampMark&&stampMark(c.getContext('2d'),c.width,c.height);c.toBlob(b=>window.offerFile(b,CUR.card.slug+'-invitation.png'),'image/png')}

/* "Edit more": hand the filled-in design to the Custom editor */
async function toCustom(){const {card,fields,values}=CUR;const s=1080/card.w,H=Math.round(card.h*s);await loadFonts(fields);const m=document.createElement('canvas').getContext('2d');const objs=[];
 const ord=fields.slice().sort((a,b)=>(((a.position_config||{}).z_index||0)-((b.position_config||{}).z_index||0)));
 for(const f of ord){const sc=f.style_config||{},pc=f.position_config||{};const text=values[f.id]??fieldDefault(f);if(!text)continue;const x=(pc.x||0)*s,y=(pc.y||0)*s,w=(pc.width||card.w)*s,h=(pc.height||(sc.font_size||12))*s;
  if(f.field_type==='image'){objs.push({t:'photo',src:text,x:x+w/2,y:y+h/2,size:w,ar:h/w,shape:'square',border:false,rot:pc.rotation||0});continue}
  setFont(m,sc);const lines=wrap(m,text,(pc.width||card.w),sc.max_lines||0);const size=(sc.font_size||12)*s;
  objs.push({t:'text',text:lines.join('\n'),x:x+w/2,y:y+h/2,size,font:sc.font_family||'Arial',color:sc.color||'#000000',fill:Array.isArray(sc.foil)?'gold':'solid',align:sc.text_align==='end'?'right':(sc.text_align||'center'),bw:w,shadow:false,outline:0,oc:'#ffffff',effect:'none',lh:sc.line_height||1.2,rot:pc.rotation||0,bold:+(sc.font_weight||400)>=600})}
 const bg=card.art?{img:card.art,fb:{custom:[card.bg||'#ffffff']}}:{custom:[card.bg||'#ffffff']};
 window.openEditor({bg,objs,h:H,tier:'free',cat:'simple',title:card.name})}

function route(){const h=location.hash.slice(1);const on=h==='simple'||h.startsWith('simple-')||h.startsWith('card-');view().classList.toggle('on',on);document.body.classList.toggle('inv',on);
 if(!on)return;document.querySelectorAll('main.view').forEach(m=>{if(m.id!=='simpleView')m.classList.remove('on')});
 if(h.startsWith('card-'))showCard(h.slice(5));else showGallery(h.startsWith('simple-')?h.slice(7):'all')}
window.addEventListener('hashchange',route);
document.addEventListener('DOMContentLoaded',()=>{$('#sMore').onclick=more;$('#sSearch').oninput=e=>{curQ=e.target.value;renderGallery()};$('#sDown').onclick=download;$('#sEdit').onclick=toCustom;route()});
if(document.readyState!=='loading'){setTimeout(()=>{$('#sMore').onclick=more;$('#sSearch').oninput=e=>{curQ=e.target.value;renderGallery()};$('#sDown').onclick=download;$('#sEdit').onclick=toCustom;route()},0)}


/* ---- font changer ---- */
(function(){const st=document.createElement('style');st.textContent=`
.frow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:-2px 0 14px}
.fsize{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:999px;background:#fff;overflow:hidden}
.fsize button{border:0;background:none;color:inherit;font:700 14px Georgia,serif;padding:7px 12px;cursor:pointer}
.fsize button:active{background:var(--line)}
.fsize span{font-size:13px;min-width:44px;text-align:center;cursor:pointer;font-variant-numeric:tabular-nums}
.fontbtn{display:block;margin:0;padding:7px 12px;border:1.5px solid var(--line);border-radius:999px;background:#fff;color:inherit;font:inherit;font-size:13px;cursor:pointer}
.fontbtn span{font-family:Georgia,serif;font-weight:700;margin-right:4px}
#mFont .sheet{max-width:560px}
#fList{display:grid;gap:8px;margin-top:6px}
#mFont #fAll{width:20px;height:20px;flex:none;margin:0}
#mFont label{justify-content:flex-start}
.fopt{display:block;width:100%;text-align:start;padding:10px 14px;border:1.5px solid var(--line);border-radius:14px;background:#fff;color:inherit;cursor:pointer}
.fopt.on{border-color:#0B3D91;box-shadow:0 0 0 2px #8FB0EA}
.fopt small{display:block;font:12px Manrope,sans-serif;color:var(--muted);margin-bottom:2px}
.fopt .pv{font-size:26px;line-height:1.3;word-break:break-word}
`;document.head.appendChild(st)})();
let fontIO=null;
function openFontPicker(f,ta){
 let m=document.getElementById('mFont');
 if(!m){m=document.createElement('div');m.className='modal';m.id='mFont';
  m.innerHTML='<div class="sheet"><h3><span>Choose a font</span><button class="x" type="button" aria-label="Close">×</button></h3><input id="fSearch" placeholder="Search fonts" style="width:100%;margin-bottom:8px"><label style="display:flex;gap:8px;align-items:center;margin:4px 0 8px;font-size:14px"><input type="checkbox" id="fAll"> Use this font for all lines</label><div id="fList"></div></div>';
  document.body.appendChild(m);m.querySelector('.x').onclick=()=>m.classList.remove('on');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('on')})}
 const list=m.querySelector('#fList'),search=m.querySelector('#fSearch'),all=m.querySelector('#fAll');all.checked=false;search.value='';
 const cur=(f.style_config||{}).font_family||'Arial';
 const sample=()=>{const t=String(ta.value||'').split('\n')[0].trim().slice(0,40);return t||'Aa בראשית'};
 const names=Object.keys(SD.fonts).sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
 const order=[cur,...names.filter(n=>n!==cur)];
 if(fontIO)fontIO.disconnect();
 fontIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){fontIO.unobserve(e.target);loadFamily(e.target.dataset.f).then(()=>{e.target.querySelector('.pv').style.fontFamily='"'+e.target.dataset.f+'"'})}}),{root:m.querySelector('.sheet'),rootMargin:'300px'});
 const apply=async fam=>{const targets=all.checked?CUR.fields.filter(x=>x.field_type!=='image'&&isText(x)):[f];targets.forEach(x=>{x.style_config=x.style_config||{};x.style_config.font_family=fam;if(x._lbl)x._lbl()});await loadFamily(fam);m.classList.remove('on');draw()};
 const render=()=>{const q=search.value.trim().toLowerCase();list.innerHTML='';fontIO.disconnect();order.filter(n=>!q||n.toLowerCase().includes(q)).forEach(n=>{const b=document.createElement('button');b.type='button';b.className='fopt'+(n===cur?' on':'');b.dataset.f=n;b.innerHTML='<small></small><div class="pv"></div>';b.querySelector('small').textContent=n+(n===cur?' (current)':'');b.querySelector('.pv').textContent=sample();b.onclick=()=>apply(n);list.appendChild(b);fontIO.observe(b)})};
 search.oninput=render;render();m.classList.add('on');m.querySelector('.sheet').scrollTop=0}
})();
