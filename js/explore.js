export const MODES = {
  run: { name: '跑步', speed: 6.2, turn: 2.5, eye: 1.65, text: '跑步：較快的步伐與擺臂，留意鋪面和動線。' },
  walk: { name: '健走', speed: 3.2, turn: 2.6, eye: 1.62, text: '健走：平穩步伐，觀察休息與遮陽空間。' },
  bike: { name: '腳踏車', speed: 7.4, turn: 1.4, eye: 1.52, text: '腳踏車：車輪與較寬轉彎半徑。此場景不表示現地可騎乘。' },
  wheelchair: { name: '輪椅', speed: 3.5, turn: 2.1, eye: 1.22, text: '輪椅：坐姿與較低視角，觀察路緣及通行空間。' },
  cane: { name: '拐杖／輔具', speed: 2.45, turn: 2.25, eye: 1.58, text: '拐杖／輔具：較慢步伐與輔具動作，留意地面變化。' }
};
const MISSIONS = [
  { id:'rest', x:3.5, z:-15, title:'示範休息區', detail:'觀察座位周邊是否留下足夠通行空間；實地條件仍須查核。' },
  { id:'surface', x:-2.7, z:-32, title:'示範鋪面', detail:'比較不同鋪面質感。這是風格化材質，不代表現地鋪面。' },
  { id:'crossing', x:1.8, z:-49, title:'示範路口', detail:'從不同模式與視角觀察轉角和路緣；現地通行資訊待查核。' }
];
const C = { navy:0x173f54, teal:0x267f79, sand:0xd6c4a6, orange:0xe99550, skin:0xd89b72, dark:0x273b43, white:0xf6f2e8 };

function mat(color, opts={}) { return new THREE.MeshLambertMaterial({ color, ...opts }); }
function box(w,h,d,color,x=0,y=0,z=0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color)); m.position.set(x,y,z); return m; }
function sphere(r,color,x=0,y=0,z=0) { const m = new THREE.Mesh(new THREE.SphereGeometry(r,12,9),mat(color));m.position.set(x,y,z);return m; }
function cylinder(rt,rb,h,color,x=0,y=0,z=0) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,10),mat(color));m.position.set(x,y,z);return m; }
function rod(a,b,r,color) { const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av); const m=cylinder(r,r,d.length(),color); m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m; }
function wheel(r,x,y,z) { const m=new THREE.Mesh(new THREE.TorusGeometry(r,.075,6,20),mat(C.dark));m.position.set(x,y,z);m.rotation.y=Math.PI/2;return m; }

function makeHumanoid(mode) {
  const root = new THREE.Group();
  const torso = box(.54,.72,.32,mode==='run'?C.orange:mode==='cane'?0x477b77:C.white,0,1.25,0);
  const head = sphere(.24,C.skin,0,1.82,0);
  const hair = sphere(.245,C.dark,0,1.94,.02);hair.scale.y=.45;
  root.add(torso,head,hair);
  const arms=[],legs=[];
  for (const side of [-1,1]) {
    const arm=new THREE.Group();arm.position.set(side*.38,1.5,0);arm.add(box(.17,.62,.18,C.skin,0,-.3,0));root.add(arm);arms.push(arm);
    const leg=new THREE.Group();leg.position.set(side*.16,.9,0);leg.add(box(.18,.7,.22,C.dark,0,-.35,0));leg.add(box(.21,.12,.34,0x213747,0,-.71,-.07));root.add(leg);legs.push(leg);
  }
  if (mode==='cane') {
    const cane=new THREE.Group();cane.position.set(.55,1.25,-.12);cane.add(rod([0,0,0],[.2,-1.1,-.14],.035,0x8b6245));cane.add(rod([-.09,.04,0],[.05,.04,0],.045,0x8b6245));root.add(cane);root.userData.cane=cane;
  }
  root.userData.arms=arms;root.userData.legs=legs;return root;
}

function makeBike() {
  const root=new THREE.Group();const wheels=[wheel(.38,-.0,.42,-.75),wheel(.38,0,.42,.82)];root.add(...wheels);
  [[0,.42,-.75],[0,1.02,-.13],[0,.42,.82],[0,.42,-.75]].forEach((p,i,a)=>{if(i<a.length-1)root.add(rod(p,a[i+1],.045,C.teal));});
  root.add(rod([0,.42,.82],[0,.98,-.12],.045,C.teal));root.add(rod([-.35,1.1,-.8],[.35,1.1,-.8],.05,C.dark));
  root.add(box(.4,.08,.26,C.dark,0,1.08,.05));
  const person=makeHumanoid('walk');person.position.y=.52;person.scale.set(.82,.82,.82);person.rotation.x=-.22;root.add(person);
  root.userData.wheels=wheels;root.userData.person=person;return root;
}

function makeWheelchair() {
  const root=new THREE.Group();const wheels=[wheel(.43,-.68,.55,.1),wheel(.43,.68,.55,.1)];root.add(...wheels);
  root.add(box(1.14,.13,.75,C.dark,0,.69,0));root.add(box(1.12,.76,.13,C.navy,0,1.1,.38));
  root.add(rod([-.66,.83,.2],[-.66,.3,-.45],.045,C.dark),rod([.66,.83,.2],[.66,.3,-.45],.045,C.dark));
  root.add(wheel(.13,-.67,.2,-.5),wheel(.13,.67,.2,-.5));
  root.add(box(.53,.51,.3,C.teal,0,1.14,-.05),sphere(.23,C.skin,0,1.7,-.05));
  const arms=[];
  for (const side of [-1,1]) {const arm=new THREE.Group();arm.position.set(side*.38,1.38,-.04);arm.add(box(.16,.52,.16,C.skin,side*.1,-.25,0));root.add(arm);arms.push(arm);root.add(box(.2,.18,.72,C.dark,side*.22,.82,-.25));}
  root.userData.wheels=wheels;root.userData.arms=arms;return root;
}

export function makeActor(mode) { return mode==='bike'?makeBike():mode==='wheelchair'?makeWheelchair():makeHumanoid(mode); }

function makeTree(x,z,scene) { const trunk=cylinder(.13,.2,1.8,0x796145,x,.9,z);const crown=sphere(1.05,0x3b8064,x,2.25,z);crown.scale.set(1,1.3,1);scene.add(trunk,crown); }
function makeLamp(x,z,scene) {scene.add(cylinder(.055,.07,3.5,0x324e5a,x,1.75,z),sphere(.23,0xf6ddaa,x,3.55,z));}
function makeBuilding(x,z,w,h,d,color,scene) {scene.add(box(w,h,d,color,x,h/2,z));for(let y=1;y<h-1;y+=1.5)for(let dx=-w/2+.5;dx<w/2-.2;dx+=1.1)scene.add(box(.4,.65,.02,0x9bc2c2,x+dx,y,z-d/2-.015));}

export function makeWorld(scene) {
  scene.background=new THREE.Color(0x83b3bf);scene.fog=new THREE.Fog(0x83b3bf,60,150);
  scene.add(new THREE.HemisphereLight(0xe8f8ff,0x728779,.9));
  const sun=new THREE.DirectionalLight(0xffe4b6,.75);sun.position.set(-15,32,-20);scene.add(sun);
  scene.add(box(100,.15,135,0x4c8d81,0,-.15,-30));
  scene.add(box(28,.06,135,0x3d879a,-32,-.02,-30));
  scene.add(box(3,.18,135,0xb9b3a4,-10,.0,-30));
  scene.add(box(17,.12,135,C.sand,0,.02,-30));
  scene.add(box(1.1,.11,135,0xe5d4b4,-8.1,.02,-30));
  scene.add(box(1.1,.11,135,0xe5d4b4,8.1,.02,-30));
  scene.add(box(4,.13,135,0x77a18a,12,.02,-30));
  for(let z=-60;z<35;z+=9){scene.add(box(.11,.1,3,0xf0e8d5,-8.8,.11,z));makeTree(14,z,scene);if(z%18<1)makeLamp(-8.7,z+3,scene);}
  // Harbor elements: abstract ships, cranes and skyline; all are original scenery.
  for(let i=0;i<3;i++){let z=-18-i*33;scene.add(box(10,1.6,3.4,0xe9ede7,-31,.7,z),box(4,1.5,2.7,C.navy,-31,1.9,z));}
  for(let i=0;i<4;i++){const z=-15-i*24;scene.add(cylinder(.13,.17,9,0x597783,-18,4.5,z),rod([-18,8.7,z],[-27,8.7,z-2],.12,0x597783));}
  [[25,-12,6,10,5,0x315d69],[28,-34,7,14,7,0x447681],[24,-62,8,11,5,0x305564],[33,12,9,16,7,0x4d7780]].forEach(a=>makeBuilding(...a,scene));
  // Demonstration rest area, surface sample and crossing.
  scene.add(box(2.3,.15,.68,0x8d694c,5,.8,-15),box(.14,.8,.14,0x314e55,4.1,.4,-15),box(.14,.8,.14,0x314e55,5.9,.4,-15));
  scene.add(box(2.5,.025,4,0xb6b5a7,-2.8,.1,-32));
  for(let i=0;i<5;i++)scene.add(box(12,.025,.45,0xf0eee6,0,.12,-47-i*.8));
  MISSIONS.forEach((m,i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.055,7,20),mat([0xeaa359,0x56beb4,0xf0d481][i]));ring.rotation.x=-Math.PI/2;ring.position.set(m.x,.16,m.z);scene.add(ring);const beacon=cylinder(.06,.06,1.5,[0xeaa359,0x56beb4,0xf0d481][i],m.x,.85,m.z);scene.add(beacon);scene.add(sphere(.19,0xffffff,m.x,1.65,m.z));});
}

export function stepMovement(player, mode, controls, dt) {
  const {left,right,forward,back}=controls;
  player.rotation.y+=(Number(left)-Number(right))*MODES[mode].turn*dt;
  const speed=(Number(forward)-Number(back))*MODES[mode].speed;
  const nextX=Math.max(-7.5,Math.min(7.5,player.position.x+Math.sin(player.rotation.y)*speed*dt));
  const nextZ=Math.max(-59,Math.min(25,player.position.z-Math.cos(player.rotation.y)*speed*dt));
  const collides=(x,z)=>x>3.1&&x<6.9&&z>-16.2&&z<-13.8; // 示範休息座位
  if (!collides(nextX,player.position.z)) player.position.x=nextX;
  if (!collides(player.position.x,nextZ)) player.position.z=nextZ;
  return speed;
}

export function mountExplore() {
  const stage=document.getElementById('game-stage');
  if(!stage)return()=>{};
  if(!window.THREE){stage.innerHTML='<div class="game-fallback"><div><h2>此裝置無法載入 3D</h2><p>仍可閱讀文字版場域介紹與互動地圖。</p><a href="#/routes/bay">前往場域介紹</a></div></div>';return()=>{};}
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:!matchMedia('(max-width:680px)').matches,powerPreference:'low-power'});}catch(e){stage.innerHTML='<div class="game-fallback"><div><h2>此裝置不支援 WebGL 3D</h2><p>您仍可閱讀文字版場域介紹與互動地圖。</p><a href="#/routes/bay">前往場域介紹</a></div></div>';return()=>{};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(stage.clientWidth,stage.clientHeight);renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.domElement.tabIndex=0;
  renderer.domElement.setAttribute('aria-label','3D 港灣示範場景；聚焦後可使用 WASD 或方向鍵移動');
  stage.insertBefore(renderer.domElement,stage.firstChild);
  const scene=new THREE.Scene();makeWorld(scene);
  const camera=new THREE.PerspectiveCamera(68,stage.clientWidth/stage.clientHeight,.1,180);
  const player=new THREE.Group();player.position.set(0,0,14);scene.add(player);
  let actor=makeActor('run');player.add(actor);
  let mode='run',first=false,paused=false,economy=false,elapsed=0,last=performance.now(),frame=0;
  const keys=new Set(),touch=new Set(),completed=new Set();
  const state=document.getElementById('game-state'),hint=document.getElementById('game-hint'),dot=document.getElementById('game-dot'),select=document.getElementById('mobility-mode'),description=document.getElementById('mode-description');
  const pauseBtn=document.getElementById('pause-toggle'),cameraBtn=document.getElementById('camera-toggle'),qualityBtn=document.getElementById('quality-toggle');
  let nearest=null;
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
  const observer=new ResizeObserver(resize);observer.observe(stage);
  function changeMode(value){mode=value;player.remove(actor);actor=makeActor(mode);player.add(actor);select.value=mode;description.textContent=MODES[mode].text;state.textContent=`${MODES[mode].name}模式 · ${first?'第一':'第三'}人稱`;}
  function toggleCamera(){first=!first;cameraBtn.textContent=first?'第一人稱':'第三人稱';state.textContent=`${MODES[mode].name}模式 · ${first?'第一':'第三'}人稱`;}
  function reset(){player.position.set(0,0,14);player.rotation.y=0;completed.clear();document.querySelectorAll('#mission-list li').forEach(li=>{li.classList.remove('done');li.textContent=MISSIONS.find(m=>m.id===li.dataset.mission).title.replace('示範','找到示範');});hint.textContent='WASD／方向鍵移動；靠近節點按 E 觀察。';paused=false;pauseBtn.textContent='暫停';}
  function interact(){if(!nearest)return;completed.add(nearest.id);const li=document.querySelector(`#mission-list li[data-mission="${nearest.id}"]`);li.classList.add('done');li.textContent=`已完成：${nearest.title}`;hint.textContent=nearest.detail+(completed.size===MISSIONS.length?' 所有示範任務已完成！':'');}
  function keyDown(e){if(['INPUT','SELECT','BUTTON'].includes(document.activeElement?.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','e',' '].includes(k)){e.preventDefault();keys.add(k);if(k==='e')interact();if(k===' ')pauseBtn.click();}}
  function keyUp(e){keys.delete(e.key.toLowerCase());}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);
  select.addEventListener('change',()=>changeMode(select.value));cameraBtn.addEventListener('click',toggleCamera);
  pauseBtn.addEventListener('click',()=>{paused=!paused;pauseBtn.textContent=paused?'繼續':'暫停';state.textContent=paused?'已暫停':`${MODES[mode].name}模式 · ${first?'第一':'第三'}人稱`;});
  document.getElementById('reset-game').addEventListener('click',reset);
  qualityBtn.addEventListener('click',()=>{economy=!economy;renderer.setPixelRatio(economy?1:Math.min(devicePixelRatio,1.7));resize();qualityBtn.textContent=economy?'標準畫質':'省電畫質';});
  document.getElementById('touch-interact').addEventListener('click',interact);
  const touchButtons=[...document.querySelectorAll('[data-move]')];
  touchButtons.forEach(btn=>{btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);touch.add(btn.dataset.move);});btn.addEventListener('pointerup',()=>touch.delete(btn.dataset.move));btn.addEventListener('pointercancel',()=>touch.delete(btn.dataset.move));});
  let dragX=null;renderer.domElement.addEventListener('pointerdown',e=>{dragX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(dragX!==null){player.rotation.y+=(e.clientX-dragX)*.006;dragX=e.clientX;}});renderer.domElement.addEventListener('pointerup',()=>dragX=null);
  const smooth=new THREE.Vector3();let stopped=false;
  function tick(now){if(stopped)return;frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;if(!paused){
      const left=keys.has('a')||keys.has('arrowleft')||touch.has('left');const right=keys.has('d')||keys.has('arrowright')||touch.has('right');
      const forward=keys.has('w')||keys.has('arrowup')||touch.has('forward');const back=keys.has('s')||keys.has('arrowdown')||touch.has('back');
      const speed=stepMovement(player,mode,{left,right,forward,back},dt);
      if(Math.abs(speed)>.05)elapsed+=dt*(mode==='run'?9:mode==='bike'?12:mode==='cane'?3:5);
      const swing=Math.sin(elapsed)*(Math.abs(speed)>.05?1:0);
      if(actor.userData.legs)actor.userData.legs.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*(mode==='run'?.65:mode==='cane'?.26:.38));
      if(actor.userData.arms)actor.userData.arms.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*(mode==='run'?.55:mode==='wheelchair'?.32:.28));
      if(actor.userData.wheels)actor.userData.wheels.forEach(w=>w.rotation.x-=speed*dt*2);
      if(actor.userData.person?.userData.legs)actor.userData.person.userData.legs.forEach((part,i)=>part.rotation.x=(i?1:-1)*swing*.25);
      if(actor.userData.cane)actor.userData.cane.rotation.x=swing*.14;
    }
    const yaw=player.rotation.y,eye=MODES[mode].eye;
    if(first){actor.visible=false;const desired=new THREE.Vector3(player.position.x+Math.sin(yaw)*.18,eye,player.position.z-Math.cos(yaw)*.18);camera.position.lerp(desired,.24);camera.lookAt(player.position.x+Math.sin(yaw)*9,eye,player.position.z-Math.cos(yaw)*9);}else{actor.visible=true;const desired=new THREE.Vector3(player.position.x-Math.sin(yaw)*4.2,2.9,player.position.z+Math.cos(yaw)*4.7);camera.position.lerp(desired,.14);camera.lookAt(player.position.x,1.25,player.position.z-1.2);}
    nearest=MISSIONS.find(m=>Math.hypot(player.position.x-m.x,player.position.z-m.z)<3.7)||null;
    if(nearest&&!completed.has(nearest.id))hint.textContent=`靠近「${nearest.title}」：按 E 或「觀察」完成任務。`;
    dot.style.left=`${50+player.position.x/8*34}%`;dot.style.top=`${8+(player.position.z+59)/84*84}%`;
    renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(tick);
  return ()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);renderer.dispose();renderer.domElement.remove();scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>m.dispose());}});};
}
