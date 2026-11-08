
(function(){
"use strict";
var W=1080,H=1350;
var PAL=[
 {n:"Navy & Gold",a:"#1F4AA8",b:"#0B1E55",g:"rad",m:"gold",c:"#FFFFFF",dark:1},
 {n:"Royal Blue",a:"#2A62F0",b:"#0E2563",g:"lin",m:"#FFFFFF",c:"#FF841A",dark:1},
 {n:"White & Blue",a:"#FFFFFF",b:"#EAF1FF",g:"lin",m:"#1B4FD8",c:"#FF841A",dark:0},
 {n:"Cream & Gold",a:"#FDF8EC",b:"#F1E3C4",g:"lin",m:"gold",c:"#0E2563",dark:0},
 {n:"Black & Gold",a:"#2B2B31",b:"#060608",g:"rad",m:"gold",c:"#FFFFFF",dark:1},
 {n:"Sky & Orange",a:"#EEF4FF",b:"#C9DBFF",g:"lin",m:"#1B4FD8",c:"#FF841A",dark:0},
 {n:"Blush & Gold",a:"#FDF1EC",b:"#F3D6CC",g:"lin",m:"gold",c:"#C27A86",dark:0},
 {n:"Sage",a:"#F3F7F0",b:"#DCE8D6",g:"lin",m:"#5E8C61",c:"#C9A44C",dark:0},
 {n:"Orange Sunset",a:"#FFC07A",b:"#FF7A1A",g:"lin",m:"#FFFFFF",c:"#0E2563",dark:1},
 {n:"Teal & Gold",a:"#14707F",b:"#08353F",g:"rad",m:"gold",c:"#FFFFFF",dark:1},
 {n:"Burgundy & Gold",a:"#7A2234",b:"#350A14",g:"rad",m:"gold",c:"#FFFFFF",dark:1},
 {n:"Lavender",a:"#F5F0FC",b:"#DED2F4",g:"lin",m:"#6A4FB3",c:"#E8A93C",dark:0},
 {n:"Mint & Navy",a:"#EDF9F4",b:"#CDEDE0",g:"lin",m:"#0E2563",c:"#FF841A",dark:0},
 {n:"Silver & Blue",a:"#F7F9FC",b:"#D9E0EC",g:"lin",m:"silver",c:"#1B4FD8",dark:0},
 {n:"Midnight & Silver",a:"#22335C",b:"#0C1326",g:"rad",m:"silver",c:"#FFFFFF",dark:1},
 {n:"Peach",a:"#FFF4EA",b:"#FFD6B8",g:"lin",m:"#E2701A",c:"#1B4FD8",dark:0},
 {n:"Clean White",a:"#FFFFFF",b:"#F4F4F4",g:"lin",m:"#2B2B2B",c:"#FF841A",dark:0},
 {n:"Turquoise",a:"#E6FAFC",b:"#B2EBF2",g:"lin",m:"#00838F",c:"#FF841A",dark:0},
 {n:"Sunny",a:"#FFFBE0",b:"#FFE58F",g:"lin",m:"#1B4FD8",c:"#FF5A5F",dark:0},
 {n:"Forest & Gold",a:"#24493A",b:"#0D2017",g:"rad",m:"gold",c:"#FFFFFF",dark:1}
];
var LAY=["Classic Frame","Ornate Frame","Arch","Tallis Stripes","Waves","Bold Split","Circles","Confetti","Pattern","Minimal","Corners","Ribbons"];
var ORN=["","Diamond","Crown","Flowers","Sparkles"];
function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function paint(ctx,col,x0,y0,x1,y1){
  if(col==="gold"||col==="silver"){ var g=ctx.createLinearGradient(x0||0,y0||0,x1||W,y1||H); var s=col==="gold"?["#A87A2E","#F6D98E","#C2913C","#F3D48A","#B5873A"]:["#8C96A8","#F2F5FA","#A9B3C4","#E8ECF3","#8F99AB"]; s.forEach(function(c,i){g.addColorStop(i/(s.length-1),c)}); return g; }
  return col;
}
function alpha(hex,a){ if(hex==="gold") hex="#D4A84F"; if(hex==="silver") hex="#B9C2D2"; var n=parseInt(hex.slice(1),16); return "rgba("+(n>>16)+","+((n>>8)&255)+","+(n&255)+","+a+")"; }
function star6(ctx,cx,cy,r,lw,fill){ /* diamond ornament */ var w=r*0.62; ctx.beginPath(); ctx.moveTo(cx,cy-r); ctx.lineTo(cx+w,cy); ctx.lineTo(cx,cy+r); ctx.lineTo(cx-w,cy); ctx.closePath(); if(fill){ctx.fill();} else {ctx.lineWidth=lw; ctx.lineJoin="round"; ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx,cy-r*0.45); ctx.lineTo(cx+w*0.45,cy); ctx.lineTo(cx,cy+r*0.45); ctx.lineTo(cx-w*0.45,cy); ctx.closePath(); ctx.fill(); } }
function star4(ctx,cx,cy,r){ ctx.beginPath(); for(var i=0;i<8;i++){ var a=i*Math.PI/4, rr=i%2?r*0.3:r; ctx.lineTo(cx+rr*Math.sin(a),cy-rr*Math.cos(a)); } ctx.closePath(); ctx.fill(); }
function crown(ctx,cx,cy,s){ var w=s,h=s*0.62; ctx.beginPath(); ctx.moveTo(cx-w/2,cy+h/2); ctx.lineTo(cx-w/2,cy-h*0.2); ctx.lineTo(cx-w*0.27,cy+h*0.08); ctx.lineTo(cx,cy-h/2); ctx.lineTo(cx+w*0.27,cy+h*0.08); ctx.lineTo(cx+w/2,cy-h*0.2); ctx.lineTo(cx+w/2,cy+h/2); ctx.closePath(); ctx.fill(); ctx.fillRect(cx-w/2,cy+h/2+6,w,s*0.1); [[-.5,-.2],[0,-.5],[.5,-.2]].forEach(function(p){ ctx.beginPath(); ctx.arc(cx+p[0]*w,cy+p[1]*h,s*0.06,0,7); ctx.fill(); }); }
function flower(ctx,cx,cy,r,petals,c1,c2,rot){ ctx.fillStyle=c1; for(var i=0;i<petals;i++){ var a=rot+i*2*Math.PI/petals; ctx.beginPath(); ctx.ellipse(cx+Math.cos(a)*r*0.5,cy+Math.sin(a)*r*0.5,r*0.5,r*0.28,a,0,7); ctx.fill(); } ctx.fillStyle=c2; ctx.beginPath(); ctx.arc(cx,cy,r*0.2,0,7); ctx.fill(); }
function leaf(ctx,x,y,L,w,a,c){ ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(L/2,-w,L,0); ctx.quadraticCurveTo(L/2,w,0,0); ctx.fill(); ctx.restore(); }
function cluster(ctx,cx,cy,s,P,R){ var lc=P.dark?"rgba(255,255,255,.35)":"rgba(80,130,95,.85)"; var lc2=P.dark?"rgba(255,255,255,.22)":"rgba(120,165,125,.85)";
  for(var i=0;i<9;i++){ var a=R()*Math.PI*2; leaf(ctx,cx,cy,s*(0.9+R()*0.6),s*0.22,a,i%2?lc:lc2); }
  var cols=[P.m==="gold"||P.m==="silver"?alpha(P.m,1):P.m,P.c,P.dark?"#FFFFFF":"#FFFFFF"];
  for(var j=0;j<5;j++){ var a2=R()*Math.PI*2, d=R()*s*0.55; var c=cols[j%3]; flower(ctx,cx+Math.cos(a2)*d,cy+Math.sin(a2)*d,s*(0.35+R()*0.2),5+((R()*3)|0),c,j%3===2?P.c:"#FFE7A8",R()*6); } }
function draw(ctx,spec){
  var P=PAL[spec.p]||PAL[0], L=spec.l|0, O=spec.o|0, R=rng(spec.l*1009+spec.p*31+spec.o*7+1);
  var g; if(P.g==="rad"){ g=ctx.createRadialGradient(W/2,H*0.42,50,W/2,H*0.5,H*0.8); } else g=ctx.createLinearGradient(0,0,W*0.3,H);
  g.addColorStop(0,P.a); g.addColorStop(1,P.b); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  var M=paint(ctx,P.m), C=P.c; ctx.strokeStyle=M; ctx.fillStyle=M; ctx.lineCap="round";
  var top=200; // ornament y
  if(L===0){ ctx.lineWidth=6; ctx.strokeRect(45,45,W-90,H-90); ctx.lineWidth=2.5; ctx.strokeRect(62,62,W-124,H-124);
    [[45,45],[W-45,45],[45,H-45],[W-45,H-45]].forEach(function(p){ ctx.beginPath(); ctx.moveTo(p[0],p[1]-22); ctx.lineTo(p[0]+22,p[1]); ctx.lineTo(p[0],p[1]+22); ctx.lineTo(p[0]-22,p[1]); ctx.closePath(); ctx.fill(); }); }
  else if(L===1){ ctx.lineWidth=16; ctx.strokeRect(40,40,W-80,H-80); ctx.lineWidth=3; ctx.strokeRect(74,74,W-148,H-148);
    [[74,74],[W-74,74],[74,H-74],[W-74,H-74]].forEach(function(p){ ctx.lineWidth=3; ctx.beginPath(); ctx.arc(p[0],p[1],38,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(p[0],p[1],14,0,7); ctx.fill(); });
    ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W/2-160,H-130); ctx.lineTo(W/2+160,H-130); ctx.stroke(); }
  else if(L===2){ var x0=110,x1=W-110,y0=110,y1=H-90,r=(x1-x0)/2; ctx.save(); ctx.fillStyle=P.dark?"rgba(255,255,255,.07)":"rgba(255,255,255,.75)"; ctx.beginPath(); ctx.moveTo(x0,y1); ctx.lineTo(x0,y0+r); ctx.arc(W/2,y0+r,r,Math.PI,0); ctx.lineTo(x1,y1); ctx.closePath(); ctx.fill(); ctx.lineWidth=6; ctx.stroke(); ctx.restore();
    ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x0+22,y1-20); ctx.lineTo(x0+22,y0+r); ctx.arc(W/2,y0+r,r-22,Math.PI,0); ctx.lineTo(x1-22,y1-20); ctx.stroke(); top=260; }
  else if(L===3){ ctx.fillStyle=M; [[70,34],[124,10],[146,10]].forEach(function(s){ ctx.fillRect(0,s[0],W,s[1]); ctx.fillRect(0,H-s[0]-s[1],W,s[1]); }); top=270; }
  else if(L===4){ function wave(y,amp,f,ph,col,bottom){ ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,bottom?H:0); for(var x=0;x<=W;x+=20) ctx.lineTo(x,y+amp*Math.sin(x/W*f*2*Math.PI+ph)); ctx.lineTo(W,bottom?H:0); ctx.closePath(); ctx.fill(); }
    var ph=R()*6; wave(H-200,30,1.2,ph,alpha(P.c,.9),1); wave(H-160,34,1,ph+1.4,alpha(P.m,.55),1); wave(H-115,24,0.8,ph+2.6,M,1); wave(150,24,1,ph+.8,alpha(P.m,.5),0); wave(110,20,1.3,ph+2,M,0); top=260; }
  else if(L===5){ ctx.fillStyle=M; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,170); ctx.lineTo(0,300); ctx.closePath(); ctx.fill(); ctx.fillStyle=C; ctx.beginPath(); ctx.moveTo(0,300); ctx.lineTo(W,170); ctx.lineTo(W,186); ctx.lineTo(0,316); ctx.closePath(); ctx.fill();
    ctx.fillStyle=M; ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(W,H); ctx.lineTo(W,H-130); ctx.lineTo(0,H-60); ctx.closePath(); ctx.fill(); top=380; }
  else if(L===6){ var cs=[[0,0,300+R()*80],[W,H,340+R()*80],[W-120,120+R()*60,60+R()*30],[140,H-180,45+R()*30]]; cs.forEach(function(c,i){ ctx.fillStyle=i%2?alpha(P.c,.85):alpha(P.m,.7); ctx.beginPath(); ctx.arc(c[0],c[1],c[2],0,7); ctx.fill(); }); top=230; }
  else if(L===7){ for(var i=0;i<130;i++){ var x=R()*W,y=R()*H; if(x>170&&x<W-170&&y>230&&y<H-200) continue; var t=R(); ctx.fillStyle=t<.5?alpha(P.m,.95):(t<.85?C:(P.dark?"#fff":"#9DBBFF")); ctx.save(); ctx.translate(x,y); ctx.rotate(R()*6);
      if(t<.4){ ctx.beginPath(); ctx.arc(0,0,6+R()*9,0,7); ctx.fill(); } else if(t<.8){ ctx.fillRect(-14,-5,28,10); } else star4(ctx,0,0,14+R()*8); ctx.restore(); } top=180; }
  else if(L===8){ ctx.fillStyle=alpha(P.m,P.dark?.13:.16); ctx.strokeStyle=alpha(P.m,P.dark?.18:.2); var k=(R()*3)|0;
    for(var yy=0;yy<H+120;yy+=110) for(var xx=((yy/110)%2?55:0);xx<W+120;xx+=110){ if(k===0) star6(ctx,xx,yy,22,3); else if(k===1){ ctx.beginPath(); ctx.arc(xx,yy,7,0,7); ctx.fill(); } else star4(ctx,xx,yy,16); }
    ctx.fillStyle=P.dark?"rgba(0,0,0,.28)":"rgba(255,255,255,.88)"; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(120,170,W-240,H-340,36); else ctx.rect(120,170,W-240,H-340); ctx.fill(); ctx.strokeStyle=M; ctx.lineWidth=4; ctx.stroke(); top=270; }
  else if(L===9){ ctx.lineWidth=3; ctx.strokeRect(70,70,W-140,H-140); ctx.fillStyle=C; [[70,70],[W-70,H-70]].forEach(function(p){ ctx.beginPath(); ctx.arc(p[0],p[1],13,0,7); ctx.fill(); }); }
  else if(L===10){ ctx.lineWidth=7; var a=150,m=60; [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(function(p){ ctx.beginPath(); ctx.moveTo(p[0],p[1]+p[3]*a); ctx.lineTo(p[0],p[1]); ctx.lineTo(p[0]+p[2]*a,p[1]); ctx.stroke(); ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(p[0]+p[2]*20,p[1]+p[3]*(a-30)); ctx.lineTo(p[0]+p[2]*20,p[1]+p[3]*20); ctx.lineTo(p[0]+p[2]*(a-30),p[1]+p[3]*20); ctx.stroke(); ctx.lineWidth=7; }); }
  else if(L===11){ ctx.fillStyle=M; ctx.fillRect(0,0,W,90); ctx.fillRect(0,H-90,W,90); ctx.fillStyle=C; ctx.fillRect(0,90,W,10); ctx.fillRect(0,H-100,W,10); ctx.strokeStyle=M; ctx.lineWidth=3; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(70,150,W-140,H-300,30); else ctx.rect(70,150,W-140,H-300); ctx.stroke(); top=250; }
  // ornament
  ctx.fillStyle=M; ctx.strokeStyle=M;
  if(O===1){ star6(ctx,W/2,top,80,9); if(L!==3&&L!==5){ ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W/2-280,top); ctx.lineTo(W/2-110,top); ctx.moveTo(W/2+110,top); ctx.lineTo(W/2+280,top); ctx.stroke(); } }
  else if(O===2){ crown(ctx,W/2,top,190); }
  else if(O===3){ var s=240; cluster(ctx,L===2?150:120,L===5?360:150,s,P,R); cluster(ctx,W-(L===2?150:120),H-150,s,P,R); }
  else if(O===4){ ctx.fillStyle=paint(ctx,P.m); star4(ctx,W/2,top,56); star4(ctx,W/2-95,top+22,26); star4(ctx,W/2+95,top+22,26); for(var q=0;q<10;q++){ var sx=R()*W, sy=R()<.5?R()*230+60:H-60-R()*200; if(sx<90||sx>W-90) continue; ctx.globalAlpha=.75; star4(ctx,sx,sy,12+R()*18); ctx.globalAlpha=1; } }
}
// catalogue with categories
var list=[];
for(var l=0;l<LAY.length;l++) for(var p=0;p<PAL.length;p++) for(var o=0;o<ORN.length;o++){
  var P=PAL[p], c=[]; var goldy=P.m==="gold"||P.m==="silver";
  if(o===1||o===2||l===3) c.push("jewish");
  if((l<=2||l===8||l===11)&&goldy) c.push("elegant");
  if(l===4||l===5||l===6||l===9||l===10) c.push("modern");
  if(o===3) c.push("floral");
  if(l===7||(o===4&&[5,8,15,17,18].indexOf(p)>=0)||l===6&&[5,8,17,18].indexOf(p)>=0) c.push("kids");
  if((o===3||o===4||l===1||l===2)&&[3,6,11,13,7].indexOf(p)>=0) c.push("wedding");
  if((l===9||l===0||l===10)&&o===0) c.push("simple");
  if(!c.length) c.push("modern");
  list.push({id:"g"+l+"-"+p+"-"+o,type:"gen",l:l,p:p,o:o,name:LAY[l]+" · "+P.n+(o?" · "+ORN[o]:""),cats:c,dark:!!P.dark,premium:(o===2||o===3)&&goldy});
}
// shuffle deterministically for a varied "All" view
var R=rng(42); for(var i=list.length-1;i>0;i--){ var j=(R()*(i+1))|0; var t=list[i]; list[i]=list[j]; list[j]=t; }
window.EZ_GEN={draw:draw,list:list,pal:PAL};
})();


