const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const scene=document.querySelector('.scene');
if(scene){
 const front=scene.querySelector('.front'),back=scene.querySelector('.back');let focusTimer;
 function flip(on){clearTimeout(focusTimer);scene.classList.toggle('flipped',on);front.inert=on;back.inert=!on;front.setAttribute('aria-expanded',String(on));focusTimer=setTimeout(()=>{(on?back.querySelector('a'):front).focus({preventScroll:true})},reducedMotion.matches?0:1000)}
 front.addEventListener('click',()=>flip(true));
 back.addEventListener('click',e=>{if(!e.target.closest('a'))flip(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&scene.classList.contains('flipped'))flip(false)});
}
function shower(){
 const layer=document.createElement('div');layer.className='page-transition';layer.setAttribute('aria-hidden','true');
 const papers=[[-22,-17,0,2100],[5,11,90,2320],[32,-9,30,2150],[61,18,170,2280],[82,-21,60,2450],[-6,8,290,2200],[43,-14,350,2350]];
 const animations=[];
 for(const [x,angle,delay,duration] of papers){
  const card=document.createElement('div');card.className='falling-card';card.style.left=x+'%';layer.append(card);
  const direction=angle<0?1:-1;
  animations.push({card,frames:[
   {transform:`translate3d(0,-100vh,0) rotate(${angle}deg) rotateY(-8deg)`,offset:0},
   {transform:`translate3d(${direction*3}vw,-35vh,0) rotate(${angle-direction*9}deg) rotateY(12deg)`,offset:.32},
   {transform:`translate3d(${direction*-2}vw,35vh,0) rotate(${angle+direction*12}deg) rotateY(-10deg)`,offset:.64},
   {transform:`translate3d(${direction*5}vw,120vh,0) rotate(${angle+direction*20}deg) rotateY(6deg)`,offset:1}
  ],duration,delay});
 }
 document.body.append(layer);
 Promise.all(animations.map(({card,frames,duration,delay})=>card.animate(frames,{duration,delay,easing:'cubic-bezier(.28,.12,.62,1)',fill:'both'}).finished)).then(()=>layer.remove()).catch(()=>layer.remove());
}
try{if(sessionStorage.getItem('postcard-navigation')){sessionStorage.removeItem('postcard-navigation');if(!reducedMotion.matches)shower()}}catch{}
document.addEventListener('click',e=>{
 const link=e.target.closest('.back-menu > a:not(.portrait-stamp)');if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
 const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname||reducedMotion.matches)return;
 try{sessionStorage.setItem('postcard-navigation','1')}catch{}
});
addEventListener('pageshow',e=>{if(e.persisted)document.querySelectorAll('.page-transition').forEach(el=>el.remove())});
// A shared viewer keeps every page of the supplied work accessible.
const artViewer=document.querySelector('.art-viewer');
if(artViewer){
 let pages=[],pageIndex=0,artTitle='',opener=null;
 const picture=artViewer.querySelector('#viewer-image'),scroll=artViewer.querySelector('.viewer-scroll'),zoom=artViewer.querySelector('#viewer-zoom');
 function showPage(){const page=pages[pageIndex];picture.src=page.src;picture.alt=artTitle+' — page '+(pageIndex+1);artViewer.querySelector('#viewer-title').textContent=artTitle;artViewer.querySelector('#viewer-count').textContent=`${pageIndex+1} / ${pages.length}`;artViewer.querySelector('#viewer-prev').disabled=pageIndex===0;artViewer.querySelector('#viewer-next').disabled=pageIndex===pages.length-1;scroll.classList.remove('zoomed');zoom.textContent='Zoom in';scroll.scrollTop=0}
 document.querySelectorAll('[data-pages]').forEach(button=>button.addEventListener('click',()=>{opener=button;pages=JSON.parse(button.dataset.pages);pageIndex=0;artTitle=button.dataset.artTitle;showPage();artViewer.showModal()}));
 artViewer.querySelector('#viewer-close').addEventListener('click',()=>artViewer.close());
 artViewer.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 artViewer.querySelector('#viewer-prev').addEventListener('click',()=>{if(pageIndex>0){pageIndex--;showPage()}});
 artViewer.querySelector('#viewer-next').addEventListener('click',()=>{if(pageIndex<pages.length-1){pageIndex++;showPage()}});
 zoom.addEventListener('click',()=>{const enlarged=scroll.classList.toggle('zoomed');zoom.textContent=enlarged?'Fit page':'Zoom in'});
 artViewer.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&pageIndex<pages.length-1){e.preventDefault();pageIndex++;showPage()}if(e.key==='ArrowLeft'&&pageIndex>0){e.preventDefault();pageIndex--;showPage()}});
 artViewer.addEventListener('click',e=>{if(e.target===artViewer)artViewer.close()});
}
const dimmer=document.querySelector('.theater-toggle');
if(dimmer)dimmer.addEventListener('click',()=>{const dimmed=document.querySelector('.cinema').classList.toggle('dimmed');dimmer.setAttribute('aria-pressed',String(dimmed));dimmer.textContent=dimmed?'Lights on':'Dim the lights'});
// Each longer PDF is a physical two-page spread; short PDFs stay laid out.
document.querySelectorAll('[data-book]').forEach(book=>{
 const pages=JSON.parse(book.dataset.book),spread=book.querySelector('.book-spread'),left=book.querySelector('.book-left'),right=book.querySelector('.book-right'),prev=book.querySelector('.book-prev'),next=book.querySelector('.book-next'),status=book.querySelector('.book-status');let index=0,busy=false;
 function paint(target,n){target.replaceChildren();if(pages[n]){const im=document.createElement('img');im.src=pages[n].src;im.alt=`Magazine page ${n+1}`;target.append(im)}else{const label=document.createElement('span');label.className='book-end';label.textContent='End';target.append(label)}}
 function render(){paint(left,index);paint(right,index+1);status.textContent=`${index+1}–${Math.min(index+2,pages.length)} / ${pages.length}`;prev.disabled=index===0;next.disabled=index+2>=pages.length}
 function turn(direction){
  if(busy||index+direction*2<0||index+direction*2>=pages.length)return;
  const destination=index+direction*2;
  if(reducedMotion.matches){index=destination;render();return}
  busy=true;prev.disabled=true;next.disabled=true;
  const leaf=document.createElement('div');leaf.className='turn-leaf '+(direction>0?'forward':'backward');leaf.setAttribute('aria-hidden','true');
  const front=document.createElement('div'),back=document.createElement('div');front.className='leaf-face';back.className='leaf-face leaf-reverse';
  paint(front,direction>0?index+1:index);paint(back,direction>0?destination:destination+1);leaf.append(front,back);
  if(direction>0)paint(right,destination+1);else paint(left,destination);
  spread.append(leaf);let finished=false;function finish(){if(finished)return;finished=true;leaf.remove();index=destination;busy=false;render()}
  leaf.addEventListener('animationend',finish,{once:true});setTimeout(finish,1150);
 }
 prev.addEventListener('click',()=>turn(-1));next.addEventListener('click',()=>turn(1));
 book.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}});
 let startX=null;spread.addEventListener('pointerdown',e=>{startX=e.clientX});spread.addEventListener('pointerup',e=>{if(startX===null)return;const delta=e.clientX-startX;startX=null;if(Math.abs(delta)>45)turn(delta<0?1:-1)});spread.addEventListener('pointercancel',()=>startX=null);
 render();
});
// A small personal signature follows a mouse, without replacing its controls.
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
 const signature=document.createElement('span');signature.className='mei-cursor';signature.textContent='MEI';signature.setAttribute('aria-hidden','true');document.body.append(signature);
 let frame=0,x=0,y=0;
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;x=Math.min(e.clientX+17,innerWidth-40);y=Math.min(e.clientY+20,innerHeight-22);signature.classList.add('visible');signature.classList.toggle('over-link',!!e.target.closest('a,button'));if(!frame)frame=requestAnimationFrame(()=>{signature.style.transform=`translate3d(${x}px,${y}px,0) rotate(-8deg)`;frame=0})});
 document.documentElement.addEventListener('pointerleave',()=>signature.classList.remove('visible'));window.addEventListener('blur',()=>signature.classList.remove('visible'));
}
