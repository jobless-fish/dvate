const $=s=>document.querySelector(s),film=$('#film'),stage=$('main'),curtain=$('#curtain'),artwork=$('#artwork'),start=$('#start'),play=$('#play'),sound=$('#sound'),seek=$('#seek'),clock=$('#clock'),status=$('#status'),loader=$('#loader'),buffering=$('#buffering');
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},format=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
let phase='loading',ready=false,objectURL=null,attempt=0;
function setPhase(p){phase=p;stage.dataset.state=p}
function progress(p,label){const n=Math.round(clamp(p)*100);$('#bean-level').setAttribute('y',136*(1-p));$('#bean-level').setAttribute('height',136*p);$('#load-progress').textContent=label||`${n}%`}
function waitForDecode(){return new Promise((resolve,reject)=>{const clean=()=>{film.removeEventListener('canplay',ok);film.removeEventListener('error',fail)},ok=()=>{if(film.readyState>=3&&Number.isFinite(film.duration)&&film.duration>0){clean();resolve()}},fail=()=>{clean();reject(new Error('decode'))};film.addEventListener('canplay',ok);film.addEventListener('error',fail);ok()})}
async function loadFilm(){const run=++attempt;ready=false;setPhase('loading');document.body.classList.add('loading');loader.classList.remove('done');start.hidden=true;progress(0);$('#load-message').textContent='커피 한 잔을 준비하는 중';try{const response=await fetch('assets/film-v2.mp4');if(!response.ok)throw new Error('download');const total=Number(response.headers.get('content-length'));const chunks=[];let loaded=0;if(response.body){const reader=response.body.getReader();while(true){const {done,value}=await reader.read();if(done)break;if(run!==attempt){reader.cancel();return}chunks.push(value);loaded+=value.byteLength;progress(total?Math.min(.95,loaded/total*.95):.1,total?null:`${(loaded/1048576).toFixed(1)} MB`)}}else{chunks.push(await response.arrayBuffer())}if(run!==attempt)return;progress(.97);$('#load-message').textContent='필름을 준비하고 있습니다';if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(new Blob(chunks,{type:'video/mp4'}));film.src=objectURL;const decoded=waitForDecode();film.load();await decoded;if(run!==attempt)return;ready=true;progress(1);$('#load-message').textContent='준비되었습니다';await new Promise(r=>setTimeout(r,450));loader.classList.add('done');document.body.classList.remove('loading');await begin()}catch{if(run!==attempt)return;$('#load-message').textContent='영상을 불러오지 못했습니다';$('#load-progress').textContent='다시 시도해 주세요';start.textContent='다시 불러오기 ↗';start.hidden=false;start.onclick=loadFilm}}
async function begin(){if(!ready)return;film.pause();film.currentTime=0;setPhase('intro');start.hidden=true;status.textContent='';try{await film.play()}catch{start.textContent='필름 시작하기 ↗';start.hidden=false;start.onclick=begin;status.textContent='클릭하여 필름을 시작하세요'}syncPlay()}
function render(){
 const w=innerWidth,h=innerHeight,small=w<701,scroll=ease(scrollY/Math.min(360,h*.35)),mix=(a,b,p)=>a+(b-a)*p;
 document.body.classList.toggle('scrolled',scrollY>12);$('#nav-paper').style.opacity=scroll;
 if(ready){const t=film.currentTime,d=film.duration;if(Number.isFinite(d)&&d>0){
 const opening=ease((t-.65)/3.4),closing=ease((t-(d-4))/4),out=phase==='ended'?0:opening*(1-closing);
 curtain.style.opacity=1-out;document.body.classList.toggle('dark-header',out<.6);
 const logoRatio=477/1421;
 const baseW=Math.min(w*.82,h*1.5),baseH=baseW*logoRatio,baseX=(w-baseW)/2,baseY=h*.43-baseH/2;
 const filmW=Math.min(w*(small?.64:.38),560),filmX=w*.03,filmY=h-(small?134:110)-filmW*logoRatio;
 const headerW=small?145:224,headerX=(w-headerW)/2,headerY=small?12:14;
 const x=mix(mix(baseX,filmX,out),headerX,scroll),y=mix(mix(baseY,filmY,out),headerY,scroll),width=mix(mix(baseW,filmW,out),headerW,scroll);
 artwork.style.transform=`translate3d(${x}px,${y}px,0) scale(${width/1421})`;
 // Use the same progress for position and color, in both directions.
 const colorProgress=out*(1-scroll);
 const ink=[37,37,31],cream=[255,240,202];
 artwork.style.backgroundColor=`rgb(${ink.map((channel,i)=>mix(channel,cream[i],colorProgress)).join(',')})`;
 $('#endnote').style.top=`${baseY+baseH+28}px`;
 if(phase!=='ended')setPhase(t<2?'intro':closing>.82?'outro':'playing');seek.value=Math.round(t/d*1000);seek.style.setProperty('--progress',`${t/d*100}%`);clock.textContent=`${format(t)} / ${format(d)}`;
 }}
 if(!reducedMotion.matches){parallaxItems.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<h){const offset=Math.max(-1,Math.min(1,(r.top+r.height/2-h/2)/(h/2+r.height/2)));el.style.setProperty('--parallax-y',`${offset*-42}px`)}})}
 updateReviews();
 requestAnimationFrame(render)
}
function syncPlay(){play.textContent=film.paused?'▶':'Ⅱ';play.setAttribute('aria-label',film.paused?'영상 재생':'영상 일시정지')}
film.addEventListener('ended',()=>{if(!ready||!film.ended||film.currentTime<film.duration-.1)return;setPhase('ended');buffering.hidden=true;status.textContent='ONCE MORE, SLOWLY.';syncPlay()});film.addEventListener('waiting',()=>{if(ready&&!film.ended)buffering.hidden=false});film.addEventListener('playing',()=>{buffering.hidden=true;syncPlay()});film.addEventListener('pause',()=>{buffering.hidden=true;syncPlay()});film.addEventListener('canplay',()=>buffering.hidden=true);film.addEventListener('error',()=>{if(ready){status.textContent='영상을 불러오지 못했습니다';start.hidden=false;start.textContent='다시 불러오기 ↗';start.onclick=loadFilm}});
$('#replay').onclick=begin;start.onclick=begin;play.onclick=()=>{if(!ready)return;if(phase==='ended')begin();else if(film.paused)film.play().catch(()=>{start.hidden=false;start.onclick=()=>film.play()});else film.pause()};sound.onclick=()=>{film.muted=!film.muted;sound.innerHTML=`SOUND ${film.muted?'OFF':'ON'} <span>↗</span>`;sound.setAttribute('aria-label',film.muted?'소리 켜기':'소리 끄기');sound.setAttribute('aria-pressed',String(!film.muted))};seek.oninput=()=>{if(!ready)return;setPhase('playing');film.currentTime=seek.value/1000*film.duration;status.textContent=''};document.addEventListener('visibilitychange',()=>{if(document.hidden&&ready)film.pause()});const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const parallaxItems=[...document.querySelectorAll('.image-spread figure img,.bakery>img')];
const revealItems=[...document.querySelectorAll('.section-label,.story h2,.story-bottom>* , .image-spread figure,.image-aside>* , .menu-heading>* , .menu-grid>div,.menu-row,.bakery>div>* , .values article,.visit h2,.visit-bottom>*')];
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible')}else if(entry.intersectionRatio===0){entry.target.classList.remove('is-visible')}}),{threshold:.12});
revealItems.forEach((el,i)=>{el.classList.add('scroll-reveal');el.style.setProperty('--reveal-delay',`${Math.min(i%3*90,180)}ms`);observer.observe(el)});
const reviewWindow=$('.review-window'),reviewGroup=$('.review-group');
let reviewPreviousY=scrollY,reviewPreviousTime=performance.now(),reviewDrag=null,reviewMoved=false,reviewPauseUntil=0,reviewVelocity=0;
function updateReviews(){
 const now=performance.now(),dt=Math.min((now-reviewPreviousTime)/1000,.05),dy=scrollY-reviewPreviousY;
 reviewPreviousTime=now;reviewPreviousY=scrollY;
 const bounds=reviewWindow.getBoundingClientRect(),span=reviewGroup.getBoundingClientRect().width;
 if(!span||bounds.bottom<0||bounds.top>innerHeight){reviewVelocity=0;return;}
 const active=reviewDrag||now<reviewPauseUntil||reviewWindow.matches(':hover')||reviewWindow.contains(document.activeElement);
 if(!reviewDrag&&!reducedMotion.matches){
  // Scroll adds an impulse; exponential damping gives frame-rate independent coasting.
  reviewVelocity=Math.max(-2200,Math.min(2200,reviewVelocity+dy*10));
  const target=active?0:22;
  reviewVelocity=target+(reviewVelocity-target)*Math.exp(-4.2*dt);
  reviewWindow.scrollLeft+=reviewVelocity*dt;
 }
 if(!reviewDrag){let next=reviewWindow.scrollLeft;if(next<span*.25)next+=span;if(next>span*2.25)next-=span;reviewWindow.scrollLeft=next;}
}
reviewWindow.addEventListener('pointerdown',event=>{
 if(event.button!==0||event.target.closest('a'))return;
 reviewPauseUntil=performance.now()+2200;reviewMoved=false;reviewVelocity=0;
 reviewDrag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,time:performance.now(),active:event.pointerType==='mouse'};
 reviewWindow.setPointerCapture(event.pointerId);
 if(reviewDrag.active)reviewWindow.classList.add('dragging');
});
reviewWindow.addEventListener('pointermove',event=>{
 if(!reviewDrag||event.pointerId!==reviewDrag.id)return;
 const now=performance.now(),totalX=event.clientX-reviewDrag.x,totalY=event.clientY-reviewDrag.y;
 if(!reviewDrag.active){if(Math.abs(totalX)<6)return;if(Math.abs(totalY)>Math.abs(totalX)){finishReviewDrag(true);return;}reviewDrag.active=true;reviewWindow.classList.add('dragging');}
 const dx=event.clientX-reviewDrag.lastX,dt=Math.max((now-reviewDrag.time)/1000,.008);
 if(Math.abs(totalX)>4)reviewMoved=true;
 reviewWindow.scrollLeft-=dx;
 const measured=Math.max(-2200,Math.min(2200,-dx/dt));reviewVelocity=reviewVelocity*.3+measured*.7;
 reviewDrag.lastX=event.clientX;reviewDrag.time=now;
});
function finishReviewDrag(cancel=false){if(!reviewDrag)return;if(cancel||performance.now()-reviewDrag.time>100||reducedMotion.matches)reviewVelocity=0;reviewDrag=null;reviewWindow.classList.remove('dragging');reviewPauseUntil=performance.now()+2200;}
reviewWindow.addEventListener('pointerup',()=>finishReviewDrag());reviewWindow.addEventListener('pointercancel',()=>finishReviewDrag(true));reviewWindow.addEventListener('lostpointercapture',()=>finishReviewDrag());
reviewWindow.addEventListener('click',event=>{if(reviewMoved){event.preventDefault();event.stopPropagation();reviewMoved=false;}},true);
reviewWindow.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)){reviewVelocity=0;reviewPauseUntil=performance.now()+2200;}},{passive:true});
render();loadFilm();

