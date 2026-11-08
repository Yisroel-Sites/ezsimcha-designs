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
function loadImg(src){if(!src)return Promise.reject();if(!imgP[src])imgP[src]=new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>{delete imgP[src];rej()};i.src=src});return imgP[src]}

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
  const ax=align==='center'?x+w/2:(align==='right'||align==='end')?x+w:x;const lh=size*(sc.line_height||1.2);const lines=wrap(ctx,text,w,sc.max_lines||0);const sy=y+h/2-lines.length*lh/2+lh/2;
  lines.forEach((l,i)=>ctx.fillText(l,ax,sy+i*lh,w));ctx.restore()}
 ctx.restore()}

/* ---------- views ---------- */
const view=()=>$('#simpleView');let curCat='all',curQ='',shown=0,list=[];const PAGE=24;
const thumbIO=new IntersectionObserver(es=>es.forEach(async e=>{if(!e.isIntersecting)return;thumbIO.unobserve(e.target);const c=e.target,card=c._card;const fl=await loadFields(card.id);const v={};renderCard(c,card,fl,v,260/card.w)}),{rootMargin:'300px'});
function tile(card){const b=document.createElement('a');b.className='tpl';b.href='#card-'+card.slug;b.style.aspectRatio=card.w+'/'+card.h;b.style.background=card.bg||'#fff';const c=document.createElement('canvas');c.width=260;c.height=Math.round(260*card.h/card.w);c._card=card;thumbIO.observe(c);b.appendChild(c);
 if(card.new){const s=document.createElement('span');s.className='badge';s.textContent='New';b.appendChild(s)}return b}
function renderGallery(){const g=$('#sGrid');g.innerHTML='';const q=curQ.toLowerCase();
 list=SD.cards.filter(c=>(curCat==='all'||c.cat===curCat)&&(!q||(c.name+' '+c.slug+' '+c.cat).toLowerCase().includes(q)));
 $('#sCount').textContent=list.length+' designs';shown=0;more()}
function more(){const g=$('#sGrid');list.slice(shown,shown+PAGE).forEach(c=>g.appendChild(tile(c)));shown+=PAGE;$('#sMore').style.display=shown<list.length?'':'none'}
async function showGallery(cat){await loadSimple();curCat=cat||'all';const ch=$('#sCats');ch.innerHTML='';[{slug:'all',name:'All',n:SD.cards.length},...SD.cats].forEach(k=>{const b=document.createElement('a');b.href=k.slug==='all'?'#simple':'#simple-'+k.slug;b.className='schip'+(k.slug===curCat?' on':'');b.textContent=k.name+' · '+k.n;ch.appendChild(b)});
 $('#sGallery').style.display='';$('#sCard').style.display='none';renderGallery()}
let CUR=null;
async function showCard(slug){await loadSimple();const card=SD.cards.find(c=>c.slug===slug);if(!card){location.hash='#simple';return}
 $('#sGallery').style.display='none';$('#sCard').style.display='';$('#sName').textContent=card.name;$('#sBack').href=curCat&&curCat!=='all'?'#simple-'+curCat:'#simple';
 const fields=await loadFields(card.id);const values={};fields.forEach(f=>values[f.id]=fieldDefault(f));CUR={card,fields,values};
 const form=$('#sForm');form.innerHTML='';fields.filter(isText).sort((a,b)=>(a.display_order||0)-(b.display_order||0)).forEach((f,i)=>{const lab=document.createElement('label');lab.className='f';lab.textContent=f.field_type==='location'?'Place':/date/.test(f.field_type)?'Date':'Line '+(i+1);
  const ta=document.createElement('textarea');ta.rows=Math.min(4,Math.max(1,String(values[f.id]).split('\n').length));ta.dir='auto';ta.value=values[f.id];ta.oninput=()=>{values[f.id]=ta.value;queue()};form.appendChild(lab);form.appendChild(ta)});
 await draw();scrollTo(0,0)}
let qT=0;function queue(){clearTimeout(qT);qT=setTimeout(draw,120)}
async function draw(){if(!CUR)return;const c=$('#sCanvas');const s=Math.min(2,900/CUR.card.w);await renderCard(c,CUR.card,CUR.fields,CUR.values,s)}
async function download(){const c=document.createElement('canvas');await renderCard(c,CUR.card,CUR.fields,CUR.values,1600/CUR.card.w);c.toBlob(b=>window.offerFile(b,CUR.card.slug+'-invitation.png'),'image/png')}

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
})();
