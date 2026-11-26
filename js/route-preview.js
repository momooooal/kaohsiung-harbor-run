import {stationWalkingPoint} from './shihjia-alignment.js';

import {routeActor} from './route-actor.js';
import {corridorCollisions} from './route-collision.js';
import {daylightSky,surfaceTexture} from './daylight.js';
import {MODES} from './explore.js';

export function previewPage(data,route){
 const names=new Map(data.pois.map(p=>[p.poiId,p.name]));
 return `<section class="wrap page-body"><h1>3D 路線探索</h1><label>選擇路線 <select id="preview-route">${data.routes.map(r=>`<option value="${r.variantId}" ${r===route?'selected':''}>${r.name}</option>`).join('')}</select></label><h2>${route.name}</h2><p>${route.display.journey} · ${route.display.description}</p><p>場景供路線預覽，實際通行請依現場指示。騎乘與無障礙條件請在出發前確認。</p><button class="btn dark" id="preview-start">開始探索</button> <a href="#/run/${route.variantId}">查看路線與資源</a><output id="preview-error" role="status"></output><section id="preview-controls" hidden><div class="run-actions"><label>移動方式 <select id="preview-mode">${Object.entries(MODES).map(([id,m])=>`<option value="${id}">${m.name}</option>`).join('')}</select></label><select aria-label="探索方式" id="preview-travel"><option>路線導覽</option><option>自由探索</option></select><button id="preview-camera">切換至第三人稱</button><button id="preview-pause">暫停</button><label>前往沿途地點 <select id="preview-stop"><option value="">選擇地點</option></select></label><label>陰影 <select id="preview-quality"><option value="near">近景日照</option><option value="on">細緻</option><option value="off">關閉陰影</option></select></label><label><input type="checkbox" id="preview-guides"> 顯示地面導引</label><button id="preview-reset">回到起點</button></div><div id="preview-stage" tabindex="0" aria-label="可用方向鍵移動的路線場景"><canvas id="preview-mini" width="150" height="110" aria-label="路徑與面向"></canvas></div><div class="run-actions" aria-label="移動控制">${['←','↑','↓','→'].map((t,i)=>`<button class="btn outline" data-move="${['a','w','s','d'][i]}">${t}</button>`).join('')}</div><output id="preview-position"></output><small> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a> · <a href="https://github.com/momooooal/kaohsiung-harbor-run/blob/main/DATA-SOURCES.md">場景素材署名</a></small></section><h2>沿途經過</h2><p>${route.stopIds.map(id=>names.get(id)).join(' → ')}</p><a href="#/explore/walk">十站連續步行</a> · <a href="#/explore/activity">港灣踩線活動體驗</a></section>`;
}

export function mountPreview(data,route){
 const el=id=>document.getElementById(id);
 el('preview-route').onchange=e=>location.hash='/explore/run/'+e.target.value;
 let cleanup=()=>{};
 el('preview-start').onclick=async e=>{
  if(e.currentTarget.disabled)return;
  const button=e.currentTarget;button.disabled=true;let mappedSurroundings,walkingCity,routeLandmarks,restoredFootprints,clearance;try{
    const entry=(await import('../data/preview-clearance.js')).default[route.variantId];
    if(crypto.subtle&&entry){const bytes=new TextEncoder().encode(JSON.stringify(route.geometry.map(g=>g.coordinates)));
      const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');if(entry.geometry===digest)clearance=entry.edges;}
    ({routeLandmarks,restoredFootprints}=await import('./route-landmarks.js'));({mappedSurroundings}=await import('./preview-surroundings.js'));if(route.variantId!=='heart-5')({walkingCity}=await import('./walking-city.js'));}catch{button.disabled=false;button.textContent='重新載入場景';return;}if(!button.isConnected)return;
  el('preview-error').textContent='';
  const retry=()=>{el('preview-controls').hidden=true;button.hidden=false;button.disabled=false;button.textContent='重試 3D 探索';el('preview-error').textContent='場景暫時無法顯示。';button.focus({preventScroll:true});button.scrollIntoView({block:'center'});};
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{retry();return;}
  button.hidden=true;el('preview-controls').hidden=false;
  const stage=el('preview-stage'),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1,.12,1580);
  stage.prepend(renderer.domElement);stage.focus({preventScroll:true});stage.scrollIntoView({block:'center'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMappingExposure=.85;const skyDome=daylightSky(scene);skyDome.scale.multiplyScalar(.45);const sky=0xcadfe6;scene.background=new THREE.Color(sky);scene.fog=new THREE.Fog(sky,100,280);
  scene.add(new THREE.HemisphereLight(0xfffbef,0x879188,1.02));const sun=new THREE.DirectionalLight(0xffedcc,1.22);sun.position.set(-30,60,25);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(768,768);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,far:150});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0008;
  const raw=route.geometry.flatMap(g=>g.coordinates);
  const project=([y,x])=>new THREE.Vector3((x-120.29)*102820,0,(22.61-y)*110750);
  const points=[],lengths=[];let total=0;
  const centerline=[];
  for(const pair of raw){const p=stationWalkingPoint(route.variantId,project(pair));if(!centerline.length||p.distanceTo(centerline.at(-1))>.05)centerline.push(p);}
  for(const [i,v] of centerline.entries()){
    const lane=clearance?.[i]?.map(([x,z])=>new THREE.Vector3(x,0,z))||[v];
    for(const p of lane){const length=points.length?p.distanceTo(points.at(-1)):0;if(points.length&&length<.006)continue;
      total+=length;points.push(p);lengths.push(total);}
  }
  const stops=[...new Set(route.stopIds)].map(id=>{const p=data.pois.find(p=>p.poiId===id);return {id,name:p.name,point:p.coordinates&&project(p.coordinates)};}).filter(p=>p.point);
  const nearest=p=>stops.reduce((a,b)=>a.point.distanceToSquared(p)<b.point.distanceToSquared(p)?a:b);
  const box=new THREE.BoxGeometry();
  const city=walkingCity?.(0,true,restoredFootprints);
  if(city)scene.add(city.scene);
  const mapped=mappedSurroundings(project,scene,points,city);
  const chunks=new Map();
  const grass=surfaceTexture('aerial_grass_rock.jpg');grass.wrapS=grass.wrapT=THREE.RepeatWrapping;grass.repeat.set(90,90);
  const land=new THREE.MeshLambertMaterial({map:grass,color:0xadba99});
  const guides=el('preview-guides');guides.checked=false;
  guides.onchange=()=>{for(const mesh of chunks.values())mesh.visible=guides.checked;dirty=true;};
  const guide=new THREE.MeshBasicMaterial({color:0xecc87b});
  function build(index){
    const marks=[],end=Math.min(points.length-1,(index+1)*16);
    for(let i=index*16;i<end;i++){
      const a=points[i],b=points[i+1],dir=b.clone().sub(a).normalize(),angle=Math.atan2(dir.x,dir.z);
      for(let t=Math.ceil(lengths[i]/9)*9;t<lengths[i+1];t+=9){
        const p=a.clone().addScaledVector(dir,t-lengths[i]),mark=new THREE.Object3D();
        mark.position.set(p.x,.147,p.z);mark.rotation.y=angle;mark.scale.set(.14,.012,.62);mark.updateMatrix();marks.push(mark.matrix);
      }
    }
    const mesh=new THREE.InstancedMesh(box,guide,marks.length);marks.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
    mesh.visible=guides.checked;mesh.frustumCulled=false;scene.add(mesh);chunks.set(index,mesh);
  }
  const fixed=new THREE.Group();scene.add(fixed);
  const structures=routeLandmarks(fixed,points);
  const ground=new THREE.Mesh(box,land);ground.scale.set(620,.8,620);ground.position.y=-.6;scene.add(ground);
  const collisions=corridorCollisions(points);
  if(city)collisions.add(city.scene);
  collisions.add(fixed);
  const controller=new AbortController(),opt={signal:controller.signal},keys=new Set();
  const mini=el('preview-mini').getContext('2d'),bounds=new THREE.Box3().setFromPoints(points);
  const scale=Math.min(134/(bounds.max.x-bounds.min.x||1),94/(bounds.max.z-bounds.min.z||1));
  const flat=p=>[75+(p.x-(bounds.min.x+bounds.max.x)/2)*scale,55+(p.z-(bounds.min.z+bounds.max.z)/2)*scale];
  let mode='run',avatar=routeActor(mode),distance=0,offset=0,yaw=0,third=false,paused=false;
  let last=0,frame,dirty=true,phase=0,inStride=false,look=0,pitch=0,drag=null,lastHeading=null,active=true;

  scene.add(avatar.root);
  const clamp=THREE.MathUtils.clamp;
  function sample(d){
    d=clamp(d,0,total);let lo=0,hi=points.length-1;
    while(lo+1<hi){const mid=(lo+hi)>>1;if(lengths[mid]<=d)lo=mid;else hi=mid;}
    return {index:lo,p:points[lo].clone().lerp(points[hi],(d-lengths[lo])/(lengths[hi]-lengths[lo]))};
  }
  function poseAt(d,side){
    const {index,p}=sample(d);
    const tangent=sample(d+1).p.sub(sample(d-1).p);
    if(tangent.lengthSq()<.01)tangent.subVectors(points[index+1],points[index]);
    tangent.normalize();p.x-=tangent.z*side;p.z+=tangent.x*side;
    return {index,p,tangent};
  }
  const destination=el('preview-stop');destination.length=1;
  for(const stop of stops){
    let i=0;for(let j=1;j<points.length;j++)if(points[j].distanceToSquared(stop.point)<points[i].distanceToSquared(stop.point))i=j;
    destination.add(new Option(stop.name,String(lengths[i])));
  }
  function relocate(d){distance=d;offset=yaw=look=pitch=0;lastHeading=null;keys.clear();dirty=true;}
  destination.onchange=()=>{if(destination.value!=='')relocate(Number(destination.value));destination.value='';};
  const quality=el('preview-quality');quality.value='near';
  let shadowX=Infinity,shadowZ=Infinity;
  function sunlight(){
    const detailed=quality.value==='on',span=detailed?32:23;
    renderer.shadowMap.enabled=quality.value!=='off';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate=detailed;renderer.shadowMap.needsUpdate=true;
    Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span});sun.shadow.camera.updateProjectionMatrix();
    scene.traverse(o=>{
      if(!o.isMesh||o===skyDome||o.material?.isShaderMaterial||o.material?.transparent||o.material?.isMeshBasicMaterial)return;
      o.receiveShadow=true;o.castShadow=o!==ground&&o.geometry?.type!=='PlaneGeometry';
    });
    avatar.root.traverse(o=>{if(o.isMesh)o.castShadow=detailed;});
    shadowX=shadowZ=Infinity;dirty=true;
  }
  quality.onchange=sunlight;sunlight();
  function pause(value){paused=value;keys.clear();drag=null;dirty=true;el('preview-pause').textContent=paused?'繼續':'暫停';}
  el('preview-mode').value=mode;el('preview-travel').selectedIndex=0;
  el('preview-camera').textContent='切換至第三人稱';pause(false);
  el('preview-mode').onchange=e=>{avatar.dispose();mode=e.target.value;avatar=routeActor(mode);scene.add(avatar.root);avatar.root.traverse(o=>{if(o.isMesh)o.castShadow=quality.value==='on';});dirty=true;};
  el('preview-camera').onclick=e=>{third=!third;updateLens();dirty=true;e.currentTarget.textContent=third?'切換至第一人稱':'切換至第三人稱';};
  el('preview-camera').onpointerdown=e=>{if(document.activeElement===stage)e.preventDefault();};
  el('preview-reset').onclick=()=>relocate(0);
  el('preview-pause').onclick=()=>pause(!paused);
  el('preview-travel').onchange=()=>{yaw=look=0;keys.clear();dirty=true;};
  const aliases={ArrowUp:'w',ArrowDown:'s',ArrowLeft:'a',ArrowRight:'d'};
  stage.addEventListener('keydown',e=>{
    const k=aliases[e.key]||e.key.toLowerCase();
    if(!paused&&['w','a','s','d'].includes(k)){e.preventDefault();keys.add(k);}
  },opt);
  // Menus release keyboard movement. Pointer controls retain individual captures.
  stage.addEventListener('blur',()=>keys.clear(),opt);
  window.addEventListener('keyup',e=>keys.delete(aliases[e.key]||e.key.toLowerCase()),opt);
  window.addEventListener('keydown',e=>{if(e.key==='Escape')pause(true);},opt);
  window.addEventListener('blur',()=>pause(true),opt);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);},opt);
  stage.style.touchAction='none';
  stage.addEventListener('pointerdown',e=>{if(drag)return;stage.focus({preventScroll:true});stage.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};},opt);
  stage.addEventListener('pointermove',e=>{
    if(drag?.id!==e.pointerId)return;
    look-=(e.clientX-drag.x)*.006;pitch=clamp(pitch+(e.clientY-drag.y)*.004,-.60,.55);
    drag.x=e.clientX;drag.y=e.clientY;dirty=true;
  },opt);
  stage.addEventListener('lostpointercapture',()=>{drag=null;},opt);
  el('preview-controls').addEventListener('pointercancel',()=>{keys.clear();drag=null;},opt);
  document.querySelectorAll('[data-move]').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();if(paused)return;stage.focus({preventScroll:true});b.setPointerCapture(e.pointerId);keys.add(b.dataset.move);},opt);
    b.addEventListener('lostpointercapture',()=>keys.delete(b.dataset.move),opt);
    b.addEventListener('pointerup',()=>keys.delete(b.dataset.move),opt);
  });
  const ray=new THREE.Raycaster();
  function obstruction(from,to,pad=0){
    const delta=to.clone().sub(from),length=delta.length();if(length<.00001)return Infinity;
    ray.set(from,delta.divideScalar(length));ray.far=length+pad;
    const hit=ray.intersectObjects(mapped.buildings.children,false)[0];
    return Math.min(hit?.distance??Infinity,collisions.distance(from,to,pad));
  }
  function updateLens(){
    // Keep both sides of the sidewalk in view on a portrait screen. The
    // shorter third-person lens stays unchanged so the full avatar fits.
    const portraitFov=2*Math.atan(Math.tan(Math.PI/6)/camera.aspect)*180/Math.PI;
    camera.fov=third?62:clamp(portraitFov,62,82);camera.updateProjectionMatrix();
  }
  const resize=()=>{if(!active)return;renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/(stage.clientHeight||1);updateLens();dirty=true;};
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  function tick(now){
    frame=requestAnimationFrame(tick);
    const dt=paused?0:Math.min(.06,(now-last)/1000);last=now;
    if(paused&&!dirty)return;dirty=false;
    const move=(Number(keys.has('w'))-Number(keys.has('s')))*MODES[mode].speed*dt;
    const turn=Number(keys.has('d'))-Number(keys.has('a')),free=el('preview-travel').selectedIndex===1;
    if(free)yaw+=turn*dt*MODES[mode].turn;
    const next=clamp(distance+move*Math.cos(yaw),0,total);
    const previousOffset=offset;
    const side=clamp(offset+(free?move*Math.sin(yaw):turn*dt*2),free?-3.5:-2.1,free?3.5:2.1);
    let pose=poseAt(next,side),walked=next-distance;
    if(walked||side!==offset){
      const old=poseAt(distance,offset);
      // Sweep each traversed edge, including turns inside a single frame.
      // The offline lane offsets leave space around permanent street furniture.
      const sweep=[old.p],direction=Math.sign(walked);
      if(direction){
        for(let i=direction>0?old.index+1:old.index;i>=0&&i<points.length&&direction*(next-lengths[i])>0;i+=direction){
          const fraction=clamp((lengths[i]-distance)/walked,0,1);
          sweep.push(poseAt(lengths[i],THREE.MathUtils.lerp(offset,side,fraction)).p);
        }
      }
      sweep.push(pose.p);
      let blocked=false;
      for(let i=1;i<sweep.length&&!blocked;i++){
        const a=sweep[i-1],b=sweep[i];if(a.distanceToSquared(b)<.000001)continue;
        blocked=(Math.abs(side)>.05&&mapped.leavesBank(a,b))||[.45,1.05].some(h=>Number.isFinite(obstruction(a.clone().setY(h),b.clone().setY(h))));
      }
      if(blocked){pose=old;walked=0;}else{distance=next;offset=side;}
    }
    const {index,p,tangent}=pose,chunk=Math.floor(index/16);
    for(const [i,g] of chunks)if(Math.abs(i-chunk)>2){scene.remove(g);g.dispose?.();chunks.delete(i);}
    for(let i=Math.max(0,chunk-2);i<=Math.min(Math.floor((points.length-2)/16),chunk+2);i++)if(!chunks.has(i))build(i);
    mapped.update(p);structures.update(p);city?.center(p.x,p.z);
    // Cache the near shadow map between route cells. Camera pans and paused
    // frames reuse the static street shadows without a second geometry pass.
    const sx=Math.round(p.x/5)*5,sz=Math.round(p.z/5)*5;
    if(sx!==shadowX||sz!==shadowZ){
      shadowX=sx;shadowZ=sz;sun.position.set(sx+32,48,sz-24);sun.target.position.set(sx,0,sz);
      renderer.shadowMap.needsUpdate=true;
    }
    const heading=Math.atan2(tangent.x,tangent.z)-yaw;
    if(lastHeading===null)lastHeading=heading;
    const angle=heading-lastHeading;
    lastHeading+=Math.atan2(Math.sin(angle),Math.cos(angle))*(1-Math.exp(-dt*13));
    const facing=new THREE.Vector3(Math.sin(lastHeading),0,Math.cos(lastHeading));
    avatar.root.position.copy(p);avatar.root.position.y=.14;avatar.root.rotation.y=lastHeading+Math.PI;avatar.root.visible=third;
    const step=free?Math.sign(move)*Math.hypot(walked,offset-previousOffset):walked;
    phase+=step;if(!paused)inStride=Math.abs(step)>.0001;avatar.pose(phase,inStride);
    if(!drag&&inStride&&!free)look*=Math.exp(-dt*2.2);
    const gaze=lastHeading+look,forward=new THREE.Vector3(Math.sin(gaze),0,Math.cos(gaze));
    if(third){
      const target=p.clone().setY(mode==='wheelchair'?1.12:1.32);
      const right=new THREE.Vector3(-forward.z,0,forward.x);
      camera.position.copy(target).addScaledVector(forward,-3.85).addScaledVector(right,1.65);
      camera.position.y=target.y+1.18+pitch*2;
      let hit=obstruction(target,camera.position);
      if(hit<1.65){const raised=target.clone().addScaledVector(forward,-1.55);raised.y+=2.65;const overhead=obstruction(target,raised);if(overhead>hit+.4){camera.position.copy(raised);hit=overhead;}}
      if(Number.isFinite(hit))camera.position.lerpVectors(target,camera.position,clamp((hit-.16)/target.distanceTo(camera.position),.04,1));
      camera.lookAt(target);
    }else{
      camera.position.copy(p);camera.position.y=MODES[mode].eye+.14;
      const aim=camera.position.clone().add(forward);aim.y+=Math.tan(pitch-.055);
      camera.lookAt(aim);
    }
    skyDome.position.copy(p);ground.position.x=p.x;ground.position.z=p.z;
    mini.clearRect(0,0,150,110);mini.beginPath();points.forEach((v,i)=>mini[i?'lineTo':'moveTo'](...flat(v)));mini.strokeStyle='#155a59';mini.lineWidth=1.8;mini.stroke();
    for(const stop of stops){mini.beginPath();mini.arc(...flat(stop.point),2.3,0,Math.PI*2);mini.fillStyle='#fff';mini.fill();mini.stroke();}
    mini.save();mini.translate(...flat(p));mini.rotate(Math.atan2(facing.z,facing.x));mini.beginPath();mini.moveTo(7,0);mini.lineTo(-4,-4);mini.lineTo(-4,4);mini.closePath();mini.fillStyle='#bd491c';mini.fill();mini.restore();
    el('preview-position').textContent=nearest(p).name+'附近 · '+(distance>=total?100:Math.floor(distance/total*100))+'%';
    renderer.render(scene,camera);
  }
  cleanup=()=>{if(!active)return;active=false;cancelAnimationFrame(frame);observer.disconnect();controller.abort();keys.clear();for(const mesh of chunks.values())mesh.dispose?.();chunks.clear();sun.shadow.map?.dispose();avatar.dispose();city?.dispose();skyDome.geometry.dispose();skyDome.material.dispose();mapped.dispose();structures.dispose();grass.dispose();box.dispose();guide.dispose();land.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cleanup();retry();},opt);
  tick(performance.now());
 };
 return ()=>cleanup();
}
