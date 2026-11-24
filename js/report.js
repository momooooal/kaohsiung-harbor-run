import {manageSceneSectors} from './scene-sectors.js';
import {sceneColliders} from './scene-collision.js';
import {sceneTrack,nodes} from './route-model.js';
import {project,canMove,switchTravel,movementKey,observations,eligibleObservation,disposeObject} from './ride-logic.js';
import {addHarborDistricts} from './districts.js';
import {streetMaterials} from './street.js';
import {places,landmarks} from './landmarks.js';
import {makeActor,MODES} from './explore.js';
export function clampMovement(progress, lateral, total){
  return [Math.max(0,Math.min(total,progress)), Math.max(-3,Math.min(3,lateral))];
}
export function ride(short=false,onFailure=()=>{}){
 const stage=document.querySelector('#game-stage'),hint=document.querySelector('#game-hint');
 const points=sceneTrack(short).map(([x,z])=>new THREE.Vector3(x*2,0,z*2));
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true})}catch{throw new Error('裝置無法建立 WebGL。請重試或開啟地圖、文字導覽。')}
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMappingExposure=.92;stage.prepend(renderer.domElement);renderer.domElement.tabIndex=0;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1,.1,800);
 scene.background=new THREE.Color(0xaed9de);scene.fog=new THREE.FogExp2(0xaed9de,.003);
 const geo=new THREE.BoxGeometry(),materials=new Map();
 function block(x,y,z,w,h,d,color,angle=0){if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color}));const obj=new THREE.Mesh(geo,materials.get(color));obj.position.set(x,y,z);obj.scale.set(w,h,d);obj.rotation.y=angle;scene.add(obj)}
 scene.add(new THREE.HemisphereLight(0xfff7e8,0x81745e,.76));block(650,-1,240,1800,1,700,0x88bab0);
 const lengths=[0];let total=0;
 points.slice(1).forEach((b,i)=>{const a=points[i],dx=b.x-a.x,dz=b.z-a.z,len=a.distanceTo(b),angle=Math.atan2(dx,dz);total+=len;lengths.push(total);block((a.x+b.x)/2,0,(a.z+b.z)/2,8,.15,len+.7,(i<2||i>=40)?0xb8ac92:(i<7||i>=36)?0xaaaca0:(i<16||i===31)?0xa68260:0xc6c3b8,angle);})
 const guide=document.createElement('details');
 guide.className='section-card ride-guide';
 const title=document.createElement('summary');title.textContent='沿途地標與建模依據';guide.append(title);
 for(const place of places){
   const paragraph=document.createElement('p');
   paragraph.textContent=place.name+'｜'+place.detail+'。 ';
   if(place.source){const a=document.createElement('a');a.href=place.source;a.textContent='高雄旅遊網地標介紹';a.target='_blank';a.rel='noopener';paragraph.append(a)}
   else paragraph.append('依當天踩線經過的路段設計。');
   guide.append(paragraph);
 }
 for(const [description,label,url] of [
   ['哈瑪星的舊站、保存股道與紅色景觀路橋取自鐵道文化園區特色。','高雄旅遊網｜哈瑪星鐵道文化園區','https://khh.travel/zh-tw/attractions/detail/206/'],
   ['天空雲台保留紅拱結構，橋上的淺色遮陽棚也是這段的觀察線索。','高雄市政府｜天空雲台','https://takao.kcg.gov.tw/article/2070'],
   ['回程以大義街路口的地面輕軌站及側式月台呈現街廓。車輛位置為示意。','高雄捷運｜C12 駁二大義','https://www.krtc.com.tw/KLRT/station_info?n=C12'],
   ['車頭的弧形擋風玻璃、棚架支柱與草軌參考停靠照片；列車配色為示意。','C12 月台與車頭現場照片','https://ihappyday.tw/blog/post/kaohsiung-2'],
   ['倉庫模型以灰色外牆、局部露磚和高窗開口呈現大義區沿街尺度。','大義倉庫街廓照片','https://www.mobile01.com/topicdetail.php?f=204&t=5691456'],
   ['線軸桌、高腳凳與樹下磚鋪面參考倉庫中庭照片；街角配置為場景示意。','大義倉庫中庭現場照片','https://th.trip.com/moments/detail/kaohsiung-756-119795647/'],
   ['路旁的成排倉庫與廊道呼應大義區 C8、C9 倉庫空間。','駁二藝術特區｜大義倉庫廊道','https://pier2.org/activity/info/1096/']
 ]){
   const p=document.createElement('p'),link=document.createElement('a');
   link.href=url;link.textContent=label;link.target='_blank';link.rel='noopener';
   p.append(description,' ',link);guide.append(p);
 }
 const scale=document.createElement('p');scale.textContent='環境光景、樹形與鋪面採用通用實拍素材；實地位置請參考高雄旅遊網。全程依活動路線示意描繪。沿途建物的比例、朝向、植栽與路旁位置為導覽構圖。';guide.append(scale);const real=document.createElement('a');real.href='https://khh.travel/zh-tw/attractions/immersive-experience/';real.target='_blank';real.rel='noopener';real.className='link-arrow';real.textContent='高雄旅遊網｜現地環景導覽 ↗';const film=document.createElement('a');film.href='#/explore/film';film.className='btn dark';film.textContent='觀看港灣實拍步行影像';const actions=document.createElement('div');actions.className='bay-actions ride-actions';actions.append(film,real);stage.closest('.game-shell').before(actions);
 stage.closest('.game-shell').after(guide);
 const sky=streetMaterials(scene,materials,points);landmarks(scene,points);addHarborDistricts(scene,points);const obstacles=sceneColliders(scene);const sun=scene.getObjectByName("sun");scene.traverse(o=>{if(o.isMesh && !o.material?.transparent && o.material?.fog!==false && o.geometry.type!=="SphereGeometry"){o.receiveShadow=true;o.castShadow=Boolean(o.customDepthMaterial)||o.geometry.type!=="PlaneGeometry"}});
 const sectors=manageSceneSectors(scene);
 let mode='run',actor=makeActor(mode),s=0,offset=0,yaw=0,first=true,paused=false,last=0,frame,low=true;scene.add(actor);
 const keys=new Set(), select=document.querySelector('#mobility-mode'),button=id=>document.getElementById(id);
 const toolbar=document.createElement('div');toolbar.className='game-top ride-toolbar';
 toolbar.innerHTML='<label>探索方式 <select id="travel"><option value="guided">路線導覽</option><option value="free">自由探索</option></select></label><label>快速移動至 <select id="destination"><option value="-1">回起點（快速移動）</option></select></label>';
 stage.closest('.game-shell').prepend(toolbar);const help=document.querySelector('.game-help');help.textContent='路線導覽依所選路段前進。自由探索可在已建模步道內自行轉向與移動。拖曳畫面可環顧，WASD、方向鍵或觸控鍵可移動，按 E 或「觀察」看向附近地標：第一人稱留在原地，第三人稱可看全景。再按一次恢復視線，按前進即可繼續。';
 const destination=toolbar.querySelector('#destination'),travel=toolbar.querySelector('#travel');
 const destinations=nodes.filter(n=>n.trackIndex<points.length).map(n=>({...n,index:n.trackIndex,detail:'依報告節點，造景位置為示意'}));

 destinations.forEach((p,i)=>destination.add(new Option(p.name+'周邊',String(i))));
 if(short)destination.options[0].text='去程練習';
 let lo=0,hi=total,free=false,heading=0,freePos=new THREE.Vector3(),pitch=0,drag=null;
 function relocate(){const place=destinations[Number(destination.value)];lo=place?Math.max(0,lengths[place.index]-55):0;hi=place?Math.min(total,lengths[place.index]+55):total;s=place?lengths[place.index]:0;lo=0;hi=total;offset=yaw=pitch=0;setViewing(false);paused=false;keys.clear();button('pause-toggle').textContent='暫停';
 let i=0;while(i+2<points.length&&lengths[i+1]<s)i++;const a=points[i],b=points[i+1];freePos.copy(a).lerp(b,(s-lengths[i])/(lengths[i+1]-lengths[i]));heading=Math.atan2(b.x-a.x,b.z-a.z)}
 destination.onchange=relocate;travel.onchange=()=>{const h=actor.rotation.y-Math.PI;const p=switchTravel(actor.position,h,points,s);s=p.progress;offset=p.offset;yaw=p.yaw;heading=h;freePos.copy(actor.position);free=travel.value==='free';lo=0;hi=total;keys.clear()};
 renderer.domElement.style.touchAction='none';
 renderer.domElement.onpointerdown=e=>{renderer.domElement.focus();setViewing(false);drag=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId)};
 renderer.domElement.onpointermove=e=>{if(!drag)return;const delta=(e.clientX-drag[0])*.006;if(free)heading-=delta;else yaw-=delta;pitch=Math.max(-.85,Math.min(.85,pitch+(e.clientY-drag[1])*.005));drag=[e.clientX,e.clientY]};
 renderer.domElement.onlostpointercapture=()=>drag=null;renderer.domElement.onblur=()=>keys.clear();renderer.domElement.onpointercancel=()=>{drag=null;keys.clear()};
 button('camera-toggle').textContent='第一人稱';
 select.onchange=()=>{scene.remove(actor);disposeObject(actor);mode=select.value;actor=makeActor(mode);scene.add(actor);button('mode-description').textContent=MODES[mode].text};
 button('camera-toggle').onclick=e=>{setViewing(false);first=!first;e.target.textContent=first?'第一人稱':'第三人稱'};
 button('pause-toggle').onclick=e=>{paused=!paused;e.target.textContent=paused?'繼續':'暫停'};
 button('reset-game').onclick=()=>{destination.value='-1';completed.clear();updateMissions();relocate()};
 button('quality-toggle').onclick=e=>{low=!low;renderer.shadowMap.enabled=!low;renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,2));e.target.textContent=low?'省電畫質':'標準畫質'};
 const bindings={w:'forward',s:'back',a:'left',d:'right',ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'};
 function press(e){if(e.key==='Escape'){clearInput();card.hidden=true;setViewing(false);return}const key=movementKey(e.key);if(e.target!==renderer.domElement||!key)return;e.preventDefault();setViewing(false);keys.add(key)}
 function release(e){keys.delete(movementKey(e.key))}
 document.addEventListener('keydown',press);document.addEventListener('keyup',release);
 let viewing=false;
 function setViewing(active){
   viewing=active;
   const control=button('touch-interact');
   control.textContent=active?'返回視線':'觀察';
   control.setAttribute('aria-pressed',String(active));
 }
 setViewing(false);
 const completed=new Set(),card=document.createElement('section');card.className='observation';card.hidden=true;card.setAttribute('role','dialog');card.setAttribute('aria-label','觀察紀錄');stage.append(card);
 const available=observations.filter(o=>o.index<points.length);function updateMissions(){const list=button('mission-list');list.replaceChildren();for(const o of available){const li=document.createElement('li'),b=document.createElement('button');b.textContent=(completed.has(o.id)?'✓ 已閱讀 · ':'○ 待觀察 · ')+o.title;b.onclick=()=>{if(completed.has(o.id)||eligibleObservation(o,actor.position,points))openObservation(o);else hint.textContent='請先沿路到達該節點，再按觀察。快速移動本身不會完成任務。'};li.append(b);list.append(li)}}
 function openObservation(o){keys.clear();card.replaceChildren();const h=document.createElement('h3'),p=document.createElement('p'),close=document.createElement('button');h.textContent=o.title;p.textContent=o.text;close.textContent='讀完並關閉';close.className='btn dark';close.onclick=()=>{completed.add(o.id);updateMissions();card.hidden=true;renderer.domElement.focus()};card.append(h,p,close);card.hidden=false;close.focus()}
 updateMissions();
 const observe=()=>{const near=available.find(o=>eligibleObservation(o,actor.position,points));if(near)openObservation(near);else {setViewing(!viewing);hint.textContent='靠近小地圖的觀察節點後可閱讀紀錄。'}keys.clear()};button('touch-interact').onclick=observe;
 renderer.domElement.onkeydown=e=>{if(!e.repeat && e.key.toLowerCase()==='e')observe()};
 stage.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{setViewing(false);b.setPointerCapture(e.pointerId);keys.add(b.dataset.move)};b.onlostpointercapture=()=>keys.delete(b.dataset.move);b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.move)});
 const resize=new ResizeObserver(()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix()});resize.observe(stage);
 const mini=button('game-dot').parentElement;mini.innerHTML='';const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');const xs=points.map(p=>p.x),zs=points.map(p=>p.z);svg.setAttribute('viewBox',`${Math.min(...xs)-25} ${Math.min(...zs)-25} ${Math.max(...xs)-Math.min(...xs)+50} ${Math.max(...zs)-Math.min(...zs)+50}`);const line=document.createElementNS(ns,'polyline');line.setAttribute('points',points.map(p=>p.x+','+p.z).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','#fff');line.setAttribute('stroke-width','5');svg.append(line);for(const n of available){const c=document.createElementNS(ns,'circle');c.setAttribute('cx',points[n.index].x);c.setAttribute('cy',points[n.index].z);c.setAttribute('r','9');c.setAttribute('data-node',n.id);const t=document.createElementNS(ns,'title');t.textContent=n.title;c.append(t);svg.append(c)}const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','9');dot.setAttribute('fill','#ff7733');const direction=document.createElementNS(ns,'path');direction.setAttribute('d','M 0 20 L -7 6 L 7 6 Z');direction.setAttribute('fill','#ff7733');svg.append(dot,direction);mini.append(svg);
 let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const motion=document.createElement('button');motion.textContent=reduced?'降低動態：開':'降低動態：關';motion.onclick=()=>{reduced=!reduced;motion.textContent=reduced?'降低動態：開':'降低動態：關'};toolbar.append(motion);
 function clearInput(){keys.clear();drag=null}function visibility(){clearInput();if(document.hidden){paused=true;button('pause-toggle').textContent='繼續'}}window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',visibility);
 function lost(e){e.preventDefault();clearInput();paused=true;cancelAnimationFrame(frame);onFailure(new Error('WebGL 內容已中斷，可重試重新建立場景。'))}function restored(){onFailure(new Error('WebGL 已恢復，請按重試重新開始。'))}renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
 function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;const speed=(+keys.has('forward')-keys.has('back'))*MODES[mode].speed*3;
 if(!paused && !card.hidden)keys.clear();
 if(!paused && free){heading+=(+keys.has("left")-keys.has("right"))*dt*MODES[mode].turn;const x=freePos.x+Math.sin(heading)*speed*dt,z=freePos.z+Math.cos(heading)*speed*dt;const legal=canMove({x,z},points,obstacles,mode==='bike'?.7:.45);if(legal){freePos.set(x,0,z);s=project(freePos,points,s).progress}}else if(!paused){yaw+=(+keys.has('left')-keys.has('right'))*dt*MODES[mode].turn;const [nextS,nextOffset]=clampMovement(s+Math.cos(yaw)*speed*dt,offset+Math.sin(yaw)*speed*dt,total);let ix=0;while(ix+2<points.length&&lengths[ix+1]<nextS)ix++;const aa=points[ix],bb=points[ix+1],ang=Math.atan2(bb.x-aa.x,bb.z-aa.z),pp=aa.clone().lerp(bb,(nextS-lengths[ix])/(lengths[ix+1]-lengths[ix]));pp.x+=Math.cos(ang)*nextOffset;pp.z-=Math.sin(ang)*nextOffset;if(canMove(pp,points,obstacles,mode==='bike'?.7:.45)){s=Math.max(lo,Math.min(hi,nextS));offset=nextOffset}}
 const swing=paused||!speed||reduced?0:Math.sin(now*.006);if(!paused){
      if(actor.userData.legs)actor.userData.legs.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*(mode==='run'?.65:mode==='cane'?.26:.38));
      if(actor.userData.arms)actor.userData.arms.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*(mode==='run'?.55:mode==='wheelchair'?.32:.28));
      if(actor.userData.wheels)actor.userData.wheels.forEach(w=>w.rotation.x-=speed*dt*2);
      if(actor.userData.person?.userData.legs)actor.userData.person.userData.legs.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*.25);
      if(actor.userData.cane)actor.userData.cane.rotation.x=swing*.14;
}
 let i=0;while(i+2<points.length&&lengths[i+1]<s)i++;
 const a=points[i],b=points[i+1],angle=Math.atan2(b.x-a.x,b.z-a.z),pos=a.clone().lerp(b,(s-lengths[i])/(lengths[i+1]-lengths[i]));pos.x+=Math.cos(angle)*offset;pos.z-=Math.sin(angle)*offset;if(free)pos.copy(freePos);actor.position.copy(pos);actor.rotation.y=(free?heading:angle+yaw)+Math.PI;actor.visible=!first;
 const dx=Math.sin(free?heading:angle+yaw),dz=Math.cos(free?heading:angle+yaw);camera.position.set(pos.x-dx*(first?0:4),first?MODES[mode].eye:3,pos.z-dz*(first?0:4));if(!first&&!canMove(camera.position,points,obstacles,.2)){camera.position.set(pos.x-dx,pos.y+2.4,pos.z-dz)}camera.lookAt(pos.x+dx*6,(first?MODES[mode].eye:1)+6*Math.tan(pitch),pos.z+dz*6);button('game-state').textContent=free?'自由探索':destination.selectedOptions[0].text+' · '+Math.floor((s-lo)/(hi-lo)*100)+'%';dot.setAttribute('cx',pos.x);dot.setAttribute('cy',pos.z);direction.setAttribute('transform',`translate(${pos.x} ${pos.z}) rotate(${-(free?heading:angle+yaw)*180/Math.PI})`);const near=destinations.reduce((best,p)=>points[p.index].distanceToSquared(pos)<points[best.index].distanceToSquared(pos)?p:best);
 if(viewing){const anchor=points[near.index],forward=anchor.clone().sub(points[Math.max(0,near.index-1)]).normalize(),side=new THREE.Vector3(forward.z,0,-forward.x);
 const target=anchor.clone().addScaledVector(side,near.index===14?24:13);if(near.index===35)target.addScaledVector(forward,24);target.y=near.index===19?10:near.index===35?1.2:4;
 if(!first){camera.position.copy(target).addScaledVector(forward,-32).addScaledVector(side,-25);camera.position.y=11}
 camera.lookAt(target);actor.visible=false}
 hint.textContent=near.name+'｜'+near.detail+'（3D 示意・通用港景）'+(available.find(o=>!completed.has(o.id))?' · 下一個觀察：'+available.find(o=>!completed.has(o.id)).title:' · 四項觀察已閱讀');sun.position.set(pos.x-36,pos.y+48,pos.z-19);sun.target.position.copy(pos);sectors.update(pos);sky.update(camera);renderer.render(scene,camera);frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick);
 return ()=>{clearInput();window.removeEventListener('blur',clearInput);document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);card.remove();cancelAnimationFrame(frame);resize.disconnect();document.removeEventListener('keydown',press);document.removeEventListener('keyup',release);disposeObject(scene);sky.dispose();renderer.dispose()};
}















