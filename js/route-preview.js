import {landmarks} from './landmarks.js';
import {stationEntrance} from './station-entrance.js';
import {stationExits} from '../data/station-exits.js';
import {daylightSky,surfaceTexture} from './daylight.js';
import {makeActor, MODES} from './explore.js';

export function previewPage(data,route){
 const names=new Map(data.pois.map(p=>[p.poiId,p.name]));
 return `<section class="wrap page-body"><h1>3D 路線探索</h1><label>選擇路線 <select id="preview-route">${data.routes.map(r=>`<option value="${r.variantId}" ${r===route?'selected':''}>${r.name}</option>`).join('')}</select></label><h2>${route.name}</h2><p>${route.display.journey} · ${route.display.description}</p><p>場景供路線預覽，實際通行請依現場指示。騎乘與無障礙條件請在出發前確認。</p><button class="btn dark" id="preview-start">開始探索</button> <a href="#/run/${route.variantId}">查看路線與資源</a><section id="preview-controls" hidden><div class="run-actions"><label>移動方式 <select id="preview-mode">${Object.entries(MODES).map(([id,m])=>`<option value="${id}">${m.name}</option>`).join('')}</select></label><select aria-label="探索方式" id="preview-travel"><option>路線導覽</option><option>自由探索</option></select><button id="preview-camera">切換至第三人稱</button><button id="preview-pause">暫停</button><button id="preview-reset">回到起點</button></div><div id="preview-stage" tabindex="0" aria-label="可用方向鍵移動的路線場景"><canvas id="preview-mini" width="150" height="110" aria-label="路徑與面向"></canvas></div><div class="run-actions" aria-label="移動控制">${['←','↑','↓','→'].map((t,i)=>`<button class="btn outline" data-move="${['a','w','s','d'][i]}">${t}</button>`).join('')}</div><output id="preview-position"></output><small> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a></small></section><h2>沿途經過</h2><p>${route.stopIds.map(id=>names.get(id)).join(' → ')}</p><a href="#/explore/walk">十站連續步行</a> · <a href="#/explore/activity">港灣踩線活動體驗</a></section>`;
}

export function mountPreview(data,route){
 const el=id=>document.getElementById(id);
 el('preview-route').onchange=e=>location.hash='/explore/run/'+e.target.value;
 let cleanup=()=>{};
 el('preview-start').onclick=async e=>{
  if(e.currentTarget.disabled)return;
  const button=e.currentTarget;button.disabled=true;let mappedSurroundings;try{({mappedSurroundings}=await import('./preview-surroundings.js'));}catch{button.disabled=false;button.textContent='重新載入場景';return;}if(!button.isConnected)return;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:false});}catch{e.target.textContent='裝置無法開啟 3D，可查看路線與資源';return;}
  button.hidden=true;el('preview-controls').hidden=false;
  const stage=el('preview-stage'),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1,.12,320);
  stage.prepend(renderer.domElement);stage.focus();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMappingExposure=.85;const skyDome=daylightSky(scene);skyDome.scale.multiplyScalar(.45);const sky=0xcadfe6;scene.background=new THREE.Color(sky);scene.fog=new THREE.Fog(sky,100,280);
  scene.add(new THREE.HemisphereLight(0xfffbef,0x879188,1.2));const sun=new THREE.DirectionalLight(0xffedcc,.9);sun.position.set(-30,60,25);scene.add(sun);
  const raw=route.geometry.flatMap(g=>g.coordinates),[lat,lon]=raw[0];
  const project=([y,x])=>new THREE.Vector3((x-lon)*111320*Math.cos(lat*Math.PI/180),0,(lat-y)*111320);
  const points=[],lengths=[];let total=0;
  for(const pair of raw){const point=project(pair),last=points.at(-1),length=last?point.distanceTo(last):0;if(last&&length<.05)continue;total+=length;points.push(point);lengths.push(total);}
  const stops=[...new Set(route.stopIds)].map(id=>{const p=data.pois.find(p=>p.poiId===id);return {id,name:p.name,point:p.coordinates&&project(p.coordinates)};}).filter(p=>p.point);
  const nearest=p=>stops.reduce((a,b)=>a.point.distanceToSquared(p)<b.point.distanceToSquared(p)?a:b);
  const box=new THREE.BoxGeometry(),ball=new THREE.SphereGeometry(1,9,7),ring=new THREE.TorusGeometry(1,.06,6,28),materials=new Map();
  const mapped=mappedSurroundings(project,scene,points);
  const treeTexture=surfaceTexture('tree.png');const canopy=new THREE.SpriteMaterial({map:treeTexture,transparent:true,depthWrite:false,alphaTest:.15});
  const chunks=new Map(), stationModels=new THREE.Group();scene.add(stationModels);
  if(route.variantId==='harbor-108')for(const exit of stationExits){
   const point=project([exit.lat,exit.lon]),bearing=exit.front*Math.PI/180;
   stationEntrance(stationModels,{...exit,center:[point.x-Math.sin(bearing)*(exit.length/2+4),point.z+Math.cos(bearing)*(exit.length/2+4)]});
  }
  const pavement=surfaceTexture('concrete_pavement_02.jpg'),grass=surfaceTexture('aerial_grass_rock.jpg');
  for(const [colors,texture,repeat] of [[[0xafa9a2,0xb7a98f],pavement,3],[[0xadb99f],grass,90]]){
   texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeat,repeat);
   for(const color of colors)materials.set(color,new THREE.MeshLambertMaterial({map:texture,color}));
  }
  function part(group,shape,color,x,y,z,w,h,d,angle=0){if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color}));const mesh=new THREE.Mesh(shape,materials.get(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.y=angle;group.add(mesh);return mesh;}
  function build(index){
   const group=new THREE.Group();scene.add(group);chunks.set(index,group);
   for(let i=index*16;i<Math.min(points.length-1,(index+1)*16);i++){
    const a=points[i],b=points[i+1],mid=a.clone().lerp(b,.5),dir=b.clone().sub(a).normalize(),angle=Math.atan2(dir.x,dir.z),len=lengths[i+1]-lengths[i],site=nearest(mid);
    const park=['heart','vision','central','love','hedong','starlight'].includes(site.id);
    part(group,box,park?0xb7a98f:0xafa9a2,mid.x,0,mid.z,6,.18,len+.4,angle);
    for(let n=0;n<len;n+=22){const t=(n+.5)/Math.max(1,len),p=a.clone().lerp(b,Math.min(1,t)),side=(i%2?1:-1)*10,x=p.x+dir.z*side,z=p.z-dir.x*side;
     if(park){const tree=new THREE.Sprite(canopy);tree.scale.set(6,7,1);tree.position.set(x,3.5,z);group.add(tree);}
     
    }
   }
  }
  const fixed=new THREE.Group();scene.add(fixed);
  const harborAnchors=[];
  for(const [id,slot] of [['hamasen',1],['music',19]]){
   const stop=stops.find(s=>s.id===id);if(!stop)continue;
   let best=1;for(let i=2;i<points.length;i++)if(points[i].distanceToSquared(stop.point)<points[best].distanceToSquared(stop.point))best=i;
   harborAnchors[slot]=stop.point;harborAnchors[slot-1]=stop.point.clone().sub(points[best].clone().sub(points[best-1]));
  }
  if(harborAnchors.length){const models=new THREE.Group();landmarks(models,harborAnchors);const lamp=models.getObjectByName('sun');models.remove(lamp,lamp.target);stationModels.add(models);}
  
  for(const s of stops){const {x,z}=s.point;
   if(s.id==='heart'){
    
    for(let i=0;i<8;i++){part(fixed,box,0xc4ae92,x-26+i*4,0,z-29,4,1.2,6);}
   }
   if(s.id==='hedong'||s.id==='vision'){for(let i=-45;i<50;i+=4)part(fixed,box,0x558078,x+2,.6,z+i,.12,1.2,.12);}
   if(s.id==='greatbridge'){
    part(fixed,box,0xbfc9c4,x+24,2,z,60,1.2,5);part(fixed,box,0xe9e4d6,x+24,11,z,1.2,20,1.2);
    for(const side of [-1,1])for(let i=1;i<=4;i++){const span=side*i*6,h=16;part(fixed,box,0xece8d9,x+24+span/2,10,z,.14,Math.hypot(span,h),.14).rotation.z=Math.atan2(span,h);}
   }
   if(['vision','heart','bridge'].includes(s.id)){part(fixed,box,0xa4a6a1,x+18,2,z,28,1,7);part(fixed,ring,0xf2eee0,x+18,2,z,14,8,1);}
   if(s.id==='central'){part(fixed,ball,0xf8f7ea,x+20,5,z,15,1.3,8);for(const side of [-1,1])part(fixed,box,0xefbd52,x+20+side*8,2.5,z,1,5,1);}
   if(s.id==='library'){for(let i=0;i<8;i++)part(fixed,box,i%2?0x9ab39b:0xc5ccc0,x+26,2+i*2,z,24,1.8,23);}
   if(['coral','terminal','exhibition'].includes(s.id))for(let i=0;i<5;i++)part(fixed,ball,0xf1f0e4,x+24,2+i%3,z+i*4,10,4+i%3,5);
  }
  const ground=part(scene,box,0xadb99f,0,-.6,0,600,.8,600);
  let mode='run',actor=makeActor(mode),distance=0,offset=0,yaw=0,third=false,paused=false,frame,last=0,phase=0,index=0;scene.add(actor);
  function releaseActor(){actor.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});scene.remove(actor);}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controller=new AbortController(),opt={signal:controller.signal},keys=new Set();
  el('preview-mode').onchange=e=>{releaseActor();mode=e.target.value;actor=makeActor(mode);scene.add(actor);};
  el('preview-camera').onclick=e=>{third=!third;e.target.textContent=third?'切換至第一人稱':'切換至第三人稱';};
  const pause=on=>{paused=on;keys.clear();el('preview-pause').textContent=on?'繼續':'暫停';};
  el('preview-pause').onclick=()=>pause(!paused);el('preview-reset').onclick=()=>{distance=offset=yaw=index=phase=0;previous=null;pause(false);};
  window.addEventListener('blur',()=>pause(true),opt);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);},opt);
  const aliases={ArrowUp:'w',ArrowDown:'s',ArrowLeft:'a',ArrowRight:'d'};
  stage.addEventListener('keydown',e=>{const k=aliases[e.key]||e.key.toLowerCase();if(['w','a','s','d'].includes(k)){e.preventDefault();keys.add(k);}},opt);
  window.addEventListener('keyup',e=>keys.delete(aliases[e.key]||e.key.toLowerCase()),opt);
  document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.move);};b.onlostpointercapture=()=>keys.delete(b.dataset.move);});
  const mini=el('preview-mini').getContext('2d'),bounds=new THREE.Box3().setFromPoints(points),scale=Math.min(136/(bounds.max.x-bounds.min.x||1),96/(bounds.max.z-bounds.min.z||1));
  const flat=p=>[7+(p.x-bounds.min.x)*scale,7+(p.z-bounds.min.z)*scale];
  const ray=new THREE.Raycaster();
  function obstruction(from,to){
   const delta=to.clone().sub(from),length=delta.length();if(length<.001)return false;
   ray.set(from,delta.normalize());ray.far=length+.25;
   return ray.intersectObjects([mapped.buildings,stationModels,fixed],true)[0];
  }
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();pause(true);el('preview-position').textContent='場景顯示中斷，請重新整理或查看路線資訊。';},opt);
  let previous=null;
  const size=()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();};const observer=new ResizeObserver(size);observer.observe(stage);size();
  function tick(now){frame=requestAnimationFrame(tick);const dt=paused?0:Math.min(.06,(now-last)/1000);last=now;if(paused)return;
   const before={distance,offset,index};const move=(Number(keys.has('w'))-Number(keys.has('s')))*MODES[mode].speed*dt,turn=Number(keys.has('d'))-Number(keys.has('a'));
   if(el('preview-travel').selectedIndex===1)yaw+=turn*dt*MODES[mode].turn;else{yaw=0;offset+=turn*dt*2;}
   distance=Math.max(0,Math.min(total,distance+move*Math.cos(yaw)));offset=Math.max(-2.1,Math.min(2.1,offset+move*Math.sin(yaw)));phase+=move;
   while(index<points.length-2&&lengths[index+1]<distance)index++;while(index>0&&lengths[index]>distance)index--;
   const chunk=Math.floor(index/16);for(const [i,g] of chunks)if(Math.abs(i-chunk)>2){scene.remove(g);chunks.delete(i);}for(let i=Math.max(0,chunk-2);i<=Math.min(Math.floor((points.length-2)/16),chunk+2);i++)if(!chunks.has(i))build(i);
   const a=points[index],b=points[index+1],p=a.clone().lerp(b,(distance-lengths[index])/(lengths[index+1]-lengths[index])),dir=b.clone().sub(a).normalize();p.x-=dir.z*offset;p.z+=dir.x*offset;
   if(previous&&el('preview-travel').selectedIndex===1&&obstruction(previous.clone().setY(.9),p.clone().setY(.9))){
    distance=before.distance;offset=before.offset;index=before.index;p.copy(previous);
   }
   previous=p.clone();
   dir.applyAxisAngle(new THREE.Vector3(0,1,0),-yaw);actor.position.copy(p);actor.rotation.y=Math.atan2(-dir.x,-dir.z);actor.visible=third;
   const body=actor.userData.person||actor;for(const [parts,sign] of [[body.userData.arms,1],[body.userData.legs,-1]])parts?.forEach((part,i)=>part.rotation.x=Math.sin(phase*2+i*Math.PI)*(reduced?.12:.32)*sign);actor.userData.wheels?.forEach(w=>w.rotation.x=phase);
   camera.position.copy(p).addScaledVector(dir,third?-3.2:0);camera.position.y=third?2.8:MODES[mode].eye;const target=p.clone().addScaledVector(dir,6);target.y=1.35;if(third){const eye=p.clone().setY(1.55),hit=obstruction(eye,camera.position);if(hit)camera.position.lerpVectors(eye,camera.position,Math.max(0,(hit.distance-.25)/eye.distanceTo(camera.position)));}
   camera.lookAt(target);mapped.update(p);skyDome.position.copy(p);ground.position.x=p.x;ground.position.z=p.z;
   mini.clearRect(0,0,150,110);mini.beginPath();points.forEach((v,i)=>mini[i?'lineTo':'moveTo'](...flat(v)));mini.strokeStyle='#0b5857';mini.stroke();mini.save();mini.translate(...flat(p));mini.rotate(Math.atan2(dir.z,dir.x));mini.beginPath();mini.moveTo(6,0);mini.lineTo(-4,-4);mini.lineTo(-4,4);mini.fillStyle='#b44d19';mini.fill();mini.restore();
   el('preview-position').textContent=nearest(p).name+'附近 · '+(distance>=total?100:Math.floor(distance/total*100))+'%';renderer.render(scene,camera);
  }
  tick(performance.now());cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();controller.abort();releaseActor();canopy.dispose();treeTexture.dispose();skyDome.geometry.dispose();skyDome.material.dispose();mapped.dispose();stationModels.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});pavement.dispose();grass.dispose();box.dispose();ring.dispose();ball.dispose();materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();};
 };
 return ()=>cleanup();
}
