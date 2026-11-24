import {panoramaDialog} from './panorama-dialog.js';
import {stops as walkStops} from '../data/shared-route.js';
import {walkingCity} from './walking-city.js';
import {walkingGuide} from './walking-guide.js';
import {cityStreet,cityPlaces} from './city-street.js';
import {addServiceStops} from './service-stops.js';
import {addHarborDistricts} from './districts.js';
import {streetMaterials} from './street.js';
import {places,landmarks} from './landmarks.js';
import {track} from './track.js';
import {makeActor,MODES} from './explore.js';
export function reportMap(route){
 if(!route?.published || route.status!=='verified' || route.kind!=='activity')return ()=>{};
 const host=document.createElement('section');host.className='wrap activity-guide';
 host.innerHTML='<header><div class="eyebrow">港灣踩線</div><h2></h2><p class="activity-meta"></p></header><p class="assembly"></p><div class="stop-list" aria-label="聚焦沿途地點"></div><div class="activity-map" aria-label="港灣踩線去回程圖"></div><p class="stop-detail" aria-live="polite"></p><h3>踩線當日的寄物與補給</h3><div class="activity-services"></div><a class="btn dark" href="#/explore">沿路線進入 3D 探索 ↗</a>';
 document.querySelector('.page-intro').after(host);
 host.querySelector('h2').textContent=route.name;
 host.querySelector('.activity-meta').textContent=route.activityDate+'　·　'+route.activityDistanceLabel;
 host.querySelector('.assembly').textContent=route.assembly;
 for(const [name,copy] of route.services){
   const card=document.createElement('article'),h=document.createElement('h4'),p=document.createElement('p');
   h.textContent=name;p.textContent=copy;card.append(h,p);host.querySelector('.activity-services').append(card);
 }
 const bounds=[[0,0],[436,650]],container=host.querySelector('.activity-map');
 const map=window.L && L.map(container,{crs:L.CRS.Simple,minZoom:-3,maxZoom:3,zoomSnap:.1,scrollWheelZoom:false});
 if(map)L.imageOverlay('assets/report-route.jpg',bounds,{alt:'哈瑪星經鹽埕、真愛碼頭至高流，沿大義返回的踩線原圖'}).addTo(map);
 else container.innerHTML='<img style="width:100%" src="assets/report-route.jpg" alt="港灣踩線去回程圖">';
 const detail=host.querySelector('.stop-detail'),list=host.querySelector('.stop-list');
 function choose(button,text){
   for(const other of list.children)other.setAttribute('aria-pressed',String(other===button));
   detail.textContent=text;
 }
 function addButton(name,action){
   const button=document.createElement('button');button.type='button';button.textContent=name;
   button.onclick=()=>action(button);list.append(button);return button;
 }
 const reset=addButton('全程',button=>{
   if(map){map.closePopup();map.fitBounds(bounds,{padding:[8,8],animate:false})}
   choose(button,'去程從哈瑪星跑向高流，回程沿大義輕軌返回。點選地點可放大查看。');
 });
 for(const [name,copy,x,y] of route.stops){
   const pos=[436-y,x],button=addButton(name,btn=>{
     choose(btn,name+'｜'+copy);
     if(map){map.setView(pos,Math.max(map.getBoundsZoom(bounds)+1,.3),{animate:false});marker.openPopup()}
   });
   const marker=map && L.circleMarker(pos,{radius:7,color:'#fff',weight:2,fillColor:'#0b665d',fillOpacity:1}).bindPopup(name).addTo(map);
   if(marker)marker.on('click',()=>choose(button,name+'｜'+copy));
 }
 reset.click();
 return ()=>map?.remove();
}
export function clampMovement(progress, lateral, total){
  return [Math.max(0,Math.min(total,progress)), Math.max(-3,Math.min(3,lateral))];
}
export function ride(short=false){
 const stage=document.querySelector('#game-stage'),hint=document.querySelector('#game-hint');
 const points=(short?track.slice(0,20):track).map(([x,z])=>new THREE.Vector3(x*2,0,z*2));
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true})}catch{hint.textContent='裝置無法啟動 WebGL，請使用場域頁的踩線全程圖。';return ()=>{}}
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMappingExposure=.92;stage.prepend(renderer.domElement);renderer.domElement.tabIndex=0;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1,.1,800);
 scene.background=new THREE.Color(0xaed9de);scene.fog=new THREE.FogExp2(0xaed9de,.003);
 const geo=new THREE.BoxGeometry(),materials=new Map();
 function block(x,y,z,w,h,d,color,angle=0){if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color}));const obj=new THREE.Mesh(geo,materials.get(color));obj.position.set(x,y,z);obj.scale.set(w,h,d);obj.rotation.y=angle;scene.add(obj)}
 scene.add(new THREE.HemisphereLight(0xfff7e8,0x81745e,.76));block(650,-1,240,1800,1,700,0x88bab0);
 const lengths=[0];let total=0;
 points.slice(1).forEach((b,i)=>{const a=points[i],dx=b.x-a.x,dz=b.z-a.z,len=a.distanceTo(b),angle=Math.atan2(dx,dz);total+=len;lengths.push(total);block((a.x+b.x)/2,0,(a.z+b.z)/2,8,.15,len+.7,(i<2||i>=40)?0xb8ac92:(i<7||i>=36)?0xaaaca0:(i<16||i===31)?0xa68260:0xc6c3b8,angle);})
 const guide=document.createElement('details');
 guide.className='section-card';
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
 const scale=document.createElement('p');scale.textContent='環境光景、樹形與鋪面採用通用實拍素材；實地位置請參考高雄旅遊網。全程依活動路線示意描繪。沿途建物的比例、朝向、植栽與路旁位置為導覽構圖。';guide.append(scale);const real=document.createElement('a');real.href='https://khh.travel/zh-tw/attractions/immersive-experience/';real.target='_blank';real.rel='noopener';real.className='link-arrow';real.textContent='高雄旅遊網｜現地環景導覽 ↗';const film=document.createElement('a');film.href='#/explore/film';film.className='btn dark';film.textContent='觀看港灣實拍步行影像';const actions=document.createElement('div');actions.className='bay-actions';actions.append(film,real);stage.closest('.game-shell').before(actions);
 stage.closest('.game-shell').after(guide);
 const sky=streetMaterials(scene,materials,points);landmarks(scene,points);addHarborDistricts(scene,points);const sun=scene.getObjectByName("sun");scene.traverse(o=>{if(o.isMesh && !o.material?.transparent && o.material?.fog!==false && o.geometry.type!=="SphereGeometry"){o.receiveShadow=true;o.castShadow=Boolean(o.customDepthMaterial)||o.geometry.type!=="PlaneGeometry"}});
 let mode='run',actor=makeActor(mode),s=0,offset=0,yaw=0,first=true,paused=false,last=0,frame,low=true;scene.add(actor);
 const keys=new Set(), select=document.querySelector('#mobility-mode'),button=id=>document.getElementById(id);
 const toolbar=document.createElement('div');toolbar.className='game-top';
 toolbar.innerHTML='<label>探索方式 <select id="travel"><option value="guided">路線導覽</option><option value="free">自由探索</option></select></label><label>選擇地點或路線 <select id="destination"><option value="-1">報告踩線全程</option></select></label>';
 stage.closest('.game-shell').prepend(toolbar);const help=document.querySelector('.game-help');help.textContent='路線導覽依所選路段前進。自由探索可在已建模步道內自行轉向與移動。拖曳畫面可環顧，WASD、方向鍵或觸控鍵可移動，按 E 或「觀察」看向附近地標：第一人稱留在原地，第三人稱可看全景。再按一次恢復視線，按前進即可繼續。';
 const destination=toolbar.querySelector('#destination'),travel=toolbar.querySelector('#travel');
 let selectedService=null;
 const services=addServiceStops(scene,points,stage.closest(".game-shell"),stop=>{
   destination.value=String(destinations.indexOf(stop));relocate();selectedService=stop;setViewing(true);
   stage.scrollIntoView({block:"center"});renderer.domElement.focus({preventScroll:true});
 });
 const destinations=[...places];
 if(points.length>35)destinations.push({index:35,name:"大義回程",detail:"倉庫廊道、樹蔭與中庭線軸桌"});
 const landmarksForHints=destinations.slice();
 destinations.push(...services);
 destinations.forEach((p,i)=>destination.add(new Option(p.name+'周邊',String(i))));
 const cityGroup=document.createElement('optgroup');cityGroup.label='全市據點・當地自由探索';
 cityPlaces.forEach((p,i)=>cityGroup.append(new Option(p[0],'city-'+i)));destination.append(cityGroup);
 destination.add(new Option('十站連續步行｜昆仲公園至哈瑪星','itinerary'));
 const sharedStops=new Map();
 cityPlaces.forEach((place,i)=>sharedStops.set(place[2],'city-'+i));
 services.forEach(stop=>sharedStops.set(stop.id,String(destinations.indexOf(stop))));
 const sharedGuide=walkingGuide(key=>{
   destination.value=sharedStops.get(key);relocate();
   if(selectedService)setViewing(true);
   stage.scrollIntoView({block:'center'});renderer.domElement.focus({preventScroll:true});
 },sharedStops,i=>{destination.value='itinerary';relocate(i);stage.scrollIntoView({block:'center'});renderer.domElement.focus({preventScroll:true})});
 stage.closest('.game-shell').before(sharedGuide);
 const panel=document.createElement('div');panel.className='section-card';panel.hidden=true;
 panel.innerHTML='<strong>沿途實景</strong><p>在 Google 街景查看目前位置與朝向。返程後可接續原本的步行進度。</p><div class="bay-actions"><a class="btn outline" target="_blank" rel="noopener">開啟目前位置的 Google 街景 ↗</a><button type="button" class="btn dark" hidden></button><button type="button" class="btn outline" hidden>回到十站步行</button></div>';
 stage.closest('.game-shell').after(panel);
 const panorama=panel.querySelector('a'),[enter,back]=panel.querySelectorAll('button');
 const realView=panoramaDialog();panel.append(realView.dialog);
 const realButton=document.createElement('button');realButton.type='button';realButton.className='btn dark';panel.querySelector('.bay-actions').prepend(realButton);
 let nearestName='',nearKey=null,resume=null;
 realButton.onclick=()=>{keys.clear();realView.open(nearestName)};
 enter.onclick=()=>{if(!local?.walk||!nearKey)return;const distance=local.distance;destination.value=sharedStops.get(nearKey);relocate();resume=distance;panel.hidden=false;back.hidden=false;realButton.hidden=true;panorama.hidden=true;enter.hidden=true;if(selectedService)setViewing(true)};
 back.onclick=()=>{const distance=resume;destination.value='itinerary';relocate();local.seek(distance)};
 let local=null;
 if(short)destination.options[0].text='去程練習';
 let lo=0,hi=total,free=false,heading=0,freePos=new THREE.Vector3(),pitch=0,drag=null;
 function relocate(start=0){
 resume=null;panel.hidden=destination.value!=='itinerary';back.hidden=true;panorama.hidden=false;enter.hidden=true;
 if(local){scene.add(actor);local.dispose();local=null}
 if(destination.value==='itinerary'){
   local=walkingCity(Number.isInteger(start)?start:0);local.scene.add(actor);
   travel.value='guided';free=false;offset=yaw=pitch=0;paused=false;keys.clear();selectedService=null;setViewing(false);button('pause-toggle').textContent='暫停';return;
 }
 if(destination.value.startsWith('city-')){
   local=cityStreet(cityPlaces[Number(destination.value.slice(5))]);local.scene.add(actor);
   travel.value='free';free=true;freePos.set(-18.235,0,8.755);heading=1.948;pitch=yaw=0;
   selectedService=null;setViewing(false);paused=false;keys.clear();button('pause-toggle').textContent='暫停';return;
 }
 const place=destinations[Number(destination.value)];lo=place?Math.max(0,lengths[place.index]-55):0;hi=place?Math.min(total,lengths[place.index]+55):total;s=place?.target?Math.max(lo,Math.min(hi,lengths[place.index]+place.along-12)):lo;selectedService=place?.target?place:null;offset=yaw=pitch=0;setViewing(false);paused=false;keys.clear();button('pause-toggle').textContent='暫停';
 let i=0;while(i+2<points.length&&lengths[i+1]<s)i++;const a=points[i],b=points[i+1];freePos.copy(a).lerp(b,(s-lengths[i])/(lengths[i+1]-lengths[i]));heading=Math.atan2(b.x-a.x,b.z-a.z)}
 destination.onchange=relocate;travel.onchange=()=>{if(local&&(local.walk||travel.value==='guided'))destination.value='-1';free=travel.value==='free';relocate()};
 renderer.domElement.style.touchAction='none';
 renderer.domElement.onpointerdown=e=>{setViewing(false);drag=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId)};
 renderer.domElement.onpointermove=e=>{if(!drag)return;const delta=(e.clientX-drag[0])*.006;if(free)heading-=delta;else yaw-=delta;pitch=Math.max(-.85,Math.min(.85,pitch+(e.clientY-drag[1])*.005));drag=[e.clientX,e.clientY]};
 renderer.domElement.onlostpointercapture=()=>drag=null;
 button('camera-toggle').textContent='第一人稱';
 select.onchange=()=>{actor.parent.remove(actor);mode=select.value;actor=makeActor(mode);(local?.scene||scene).add(actor);button('mode-description').textContent=MODES[mode].text};
 button('camera-toggle').onclick=e=>{setViewing(false);first=!first;e.target.textContent=first?'第一人稱':'第三人稱'};
 button('pause-toggle').onclick=e=>{paused=!paused;e.target.textContent=paused?'繼續':'暫停'};
 button('reset-game').onclick=relocate;
 button('quality-toggle').onclick=e=>{low=!low;renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,2));e.target.textContent=low?'省電畫質':'標準畫質'};
 const bindings={w:'forward',s:'back',a:'left',d:'right',ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'};
 function press(e){if(e.target!==renderer.domElement||!bindings[e.key])return;e.preventDefault();setViewing(false);keys.add(bindings[e.key])}
 function release(e){keys.delete(bindings[e.key])}
 document.addEventListener('keydown',press);document.addEventListener('keyup',release);
 let viewing=false;
 function setViewing(active){
   viewing=active;
   const control=button('touch-interact');
   control.textContent=active?'返回視線':'觀察';
   control.setAttribute('aria-pressed',String(active));
 }
 setViewing(false);
 const observe=()=>{setViewing(!viewing);keys.clear()};button('touch-interact').onclick=observe;
 renderer.domElement.onkeydown=e=>{if(!e.repeat && e.key.toLowerCase()==='e')observe()};
 stage.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{setViewing(false);b.setPointerCapture(e.pointerId);keys.add(b.dataset.move)};b.onlostpointercapture=()=>keys.delete(b.dataset.move)});
 const resize=new ResizeObserver(()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix()});resize.observe(stage);
 function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;const speed=(+keys.has('forward')-keys.has('back'))*MODES[mode].speed*3;
 if(!paused && free){heading+=(+keys.has("left")-keys.has("right"))*dt*MODES[mode].turn;const x=freePos.x+Math.sin(heading)*speed*dt,z=freePos.z+Math.cos(heading)*speed*dt;const legal=local?(Math.abs(x)<22&&z>.1&&z<9.5):points.slice(1).some((b,i)=>{const a=points[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<6});if(legal)freePos.set(x,0,z)}else if(!paused&&!local?.walk){yaw+=(+keys.has('left')-keys.has('right'))*dt*MODES[mode].turn;[s,offset]=clampMovement(s+Math.cos(yaw)*speed*dt,offset+Math.sin(yaw)*speed*dt,total);s=Math.max(lo,Math.min(hi,s))}
 const swing=paused||!speed?0:Math.sin(now*.006);if(!paused){
      if(actor.userData.legs)actor.userData.legs.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*(mode==='run'?.65:mode==='cane'?.26:.38));
      if(actor.userData.arms)actor.userData.arms.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*(mode==='run'?.55:mode==='wheelchair'?.32:.28));
      if(actor.userData.wheels)actor.userData.wheels.forEach(w=>w.rotation.x-=speed*dt*2);
      if(actor.userData.person?.userData.legs)actor.userData.person.userData.legs.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*.25);
      if(actor.userData.cane)actor.userData.cane.rotation.x=swing*.14;
}
 if(local?.walk){
   if(!paused)yaw+=(+keys.has('left')-keys.has('right'))*dt*MODES[mode].turn;
   const step=local.advance(paused||realView.dialog.open?0:speed*dt,freePos),angle=step.heading+yaw;
   const station=walkStops[step.nearest];nearestName=station[0];realButton.hidden=!step.near||!realView.available(nearestName);realButton.textContent='開啟'+nearestName+'附近實景';nearKey=step.near&&sharedStops.has(station[3])?station[3]:null;
   enter.hidden=!nearKey;enter.textContent='走進'+station[0]+'周邊';
   panorama.onfocus=panorama.onpointerenter=panorama.onclick=()=>{const lat=22.61-freePos.z/110750,lon=120.29+freePos.x/102820;panorama.href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+lat.toFixed(6)+','+lon.toFixed(6)+'&heading='+((180-angle*180/Math.PI+360)%360).toFixed(1)+'&pitch='+(pitch*180/Math.PI).toFixed(1)};
   if(!panorama.hasAttribute('href'))panorama.onfocus();
   actor.position.copy(freePos);actor.rotation.y=step.heading+Math.PI;actor.visible=!first;
   const dx=Math.sin(angle),dz=Math.cos(angle);
   camera.position.set(freePos.x-dx*(first?0:4),first?MODES[mode].eye:3,freePos.z-dz*(first?0:4));
   camera.lookAt(freePos.x+dx*6,(first?MODES[mode].eye:1)+6*Math.tan(pitch),freePos.z+dz*6);
   if(viewing){camera.position.set(freePos.x-dx*12,17,freePos.z-dz*12);camera.lookAt(freePos.x+dx*8,0,freePos.z+dz*8)}
   button('game-state').textContent=step.status;hint.textContent=step.hint+' · © OpenStreetMap 貢獻者';button('game-dot').parentElement.hidden=true;
   renderer.render(local.scene,camera);frame=requestAnimationFrame(tick);return;
 }
 let i=0;while(i+2<points.length&&lengths[i+1]<s)i++;
 const a=points[i],b=points[i+1],angle=Math.atan2(b.x-a.x,b.z-a.z),pos=a.clone().lerp(b,(s-lengths[i])/(lengths[i+1]-lengths[i]));pos.x+=Math.cos(angle)*offset;pos.z-=Math.sin(angle)*offset;if(free)pos.copy(freePos);actor.position.copy(pos);actor.rotation.y=(free?heading:angle+yaw)+Math.PI;actor.visible=!first;
 const dx=Math.sin(free?heading:angle+yaw),dz=Math.cos(free?heading:angle+yaw);camera.position.set(pos.x-dx*(first?0:4),first?MODES[mode].eye:3,pos.z-dz*(first?0:4));camera.lookAt(pos.x+dx*6,(first?MODES[mode].eye:1)+6*Math.tan(pitch),pos.z+dz*6);button('game-state').textContent=free?'自由探索':destination.selectedOptions[0].text+' · '+Math.floor((s-lo)/(hi-lo)*100)+'%';button('game-dot').parentElement.hidden=free;button('game-dot').style.top=(90-80*s/total)+'%';const near=landmarksForHints.reduce((best,p)=>points[p.index].distanceToSquared(pos)<points[best.index].distanceToSquared(pos)?p:best);
 const nearby=services.reduce((best,item)=>item.target.distanceToSquared(pos)<(best?best.target.distanceToSquared(pos):28*28)?item:best,null);
 const service=selectedService||nearby;
 if(local){
   hint.textContent=local.description;
   if(viewing)camera.lookAt(0,2,-2);
   button('game-state').textContent='街區自由探索';
   renderer.render(local.scene,camera);frame=requestAnimationFrame(tick);return;
 }
 if(viewing){const anchor=points[near.index],forward=anchor.clone().sub(points[near.index-1]).normalize(),side=new THREE.Vector3(forward.z,0,-forward.x);
 const target=anchor.clone().addScaledVector(side,near.index===14?-24:13);if(near.index===35)target.addScaledVector(forward,24);target.y=near.index===19?10:near.index===35?1.2:4;
 if(service)target.copy(service.target);
 if(!first){camera.position.copy(target).addScaledVector(forward,-32).addScaledVector(side,-25);camera.position.y=11}
 camera.lookAt(target);actor.visible=false}
 hint.textContent=service?service.name+'｜'+service.tag:near.name+'｜'+(near.detail||near.tag)+'（3D 示意）';sun.position.set(pos.x-36,pos.y+48,pos.z-19);sun.target.position.copy(pos);sky.update(camera);renderer.render(scene,camera);frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick);
 return ()=>{cancelAnimationFrame(frame);if(local){scene.add(actor);local.dispose()}resize.disconnect();document.removeEventListener('keydown',press);document.removeEventListener('keyup',release);scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});sky.dispose();renderer.dispose()};
}















