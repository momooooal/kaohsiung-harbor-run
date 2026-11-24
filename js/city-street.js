import {friendlyPlaces} from '../data/friendly-places.js';

// Standalone interpretive streets. Coordinates identify the business, not the model footprint.
export function cityStreet(record) {
  const [name,address,type]=record, scene=new THREE.Scene();
  scene.background=new THREE.Color(0xbad7df);
  scene.fog=new THREE.FogExp2(0xd6ddd5,.022);
  scene.add(new THREE.HemisphereLight(0xfff6dd,0x93968f,1.35));
  const sun=new THREE.DirectionalLight(0xffedc9,1.4);
  sun.position.set(-9,12,7);scene.add(sun);
  const colors={gym:0x483e39,ice:0x628e87,sports:0x225794,cycle:0x235e9c,food:0x884e40,court:0x4d7c7a,metro:0x71888f,coffee:0x735646};
  const accent=colors[type], materials=new Map(), cube=new THREE.BoxGeometry();
  function mesh(geometry,x,y,z,color){
    if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.72}));
    const m=new THREE.Mesh(geometry,materials.get(color));m.position.set(x,y,z);scene.add(m);return m;
  }
  function box(x,y,z,w,h,d,color){const m=mesh(cube,x,y,z,color);m.scale.set(w,h,d);return m}
  box(0,-.23,0,160,.3,100,0x676c6b);
  box(0,-.08,4,100,.16,13,0xc4bdb0);
  for(let x=-42;x<=42;x+=2)box(x,.008,4,.022,.016,13,0xa59f96);
  for(let x=-42;x<=42;x+=7)box(x,-.067,15,3,.03,.13,0xf0e0aa);
  for(let x=-36;x<=36;x+=9){
    const main=x===0, height=main?6:8+Math.abs(x/9)%3*2;
    box(x,height/2,-7,8.95,height,8,main?0xdcd2bc:0xc4bcb0);
    for(let j=-3;j<=3;j+=2)box(x+j,height-1.5,-2.97,1.35,1.7,.12,0x647a7c);
    box(x,3.45,-2,8.9,.23,2.4,main?accent:0xa8a69a);
    for(let j=-4;j<=4;j+=4)box(x+j,1.69,-1.1,.2,3.38,.2,0xbcb4a2);
    box(x,1.46,-2.91,8.45,2.9,.16,main?0x443f37:0x84918b);
  }
  // Open shop bay, fitted out by business type. All furnishings are illustrative.
  if(type==='metro'){
    for(let j=0;j<7;j++)box(-.5,.08+j*.11,-1.2-j*.23,3,.14,.32,0xa3a9aa);
    for(const x of [-2.2,1.2])box(x,.68,-1.8,.12,1.36,2,0x768789);
  }else if(type==='gym'){
    for(const x of [-2,0,2]){box(x,.9,-1.8,1.45,.09,.09,0xaeb5b4);for(const d of [-.56,.56])mesh(new THREE.CylinderGeometry(.34,.34,.18,16),x+d,.9,-1.8,0x343938).rotation.z=Math.PI/2;box(x,.44,-1.5,.45,.2,1,accent)}
  }else if(type==='sports'||type==='cycle'){
    for(const x of [-2.8,0,2.8]){for(const d of [-.52,.52])mesh(new THREE.TorusGeometry(.36,.045,8,20),x+d,.45,-1.5,0x313837);
    for(const d of [-.28,.28])box(x+d,.64,-1.5,.07,.8,.09,accent).rotation.z=d>0?.65:-.65;}
  }else if(type==='court'){
    box(0,2.2,-1.35,1.35,.85,.08,0xe5e4db);mesh(new THREE.TorusGeometry(.28,.034,8,20),0,1.98,-1,0xc76b40).rotation.x=Math.PI/2;
  }else{
    box(-2,.55,-1.8,2.8,1.1,.8,accent);
    for(const x of [.45,2.65]){box(x,.76,-1.25,1.25,.1,.7,0xb89670);box(x,.36,-1.25,.12,.72,.12,0x686359);for(const d of [-.45,.45])box(x+d,.28,-.63,.4,.56,.42,accent)}
    if(type==='ice')box(-2,1.35,-1.8,2.4,.54,.62,0xa9c7c7);
    if(type==='coffee')box(-2,1.36,-1.8,.85,.52,.48,0xb2b7ad);
    if(type==='food')for(const x of [-2.7,-1.8])mesh(new THREE.CylinderGeometry(.27,.2,.26,16),x,1.21,-1.8,0x555653);
  }
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#263b3e';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#fff5df';ctx.font='bold 66px sans-serif';ctx.textAlign='center';ctx.fillText(name,512,88,992);
  const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(8.3,1.04),new THREE.MeshBasicMaterial({map:texture}));sign.position.set(0,3.98,-.78);scene.add(sign);
  for(const x of [-15,12,23]){box(x,1.3,7,.32,2.6,.32,0x75634d);mesh(new THREE.IcosahedronGeometry(1.65,1),x,3.3,7,0x719778)}
  return {scene,description:address+'｜街景與陳設為導覽示意',dispose(){const geometries=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry)});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose();sign.material.dispose()}};
}
export const cityPlaces=friendlyPlaces.filter(p=>p[2]!=='harbor');
