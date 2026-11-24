import {frontage} from './frontages.js';
import {friendlyPlaces} from '../data/friendly-places.js';

// Standalone interpretive streets. Coordinates identify the business, not the model footprint.
export function cityStreet(record) {
  const [name,address,type]=record, scene=new THREE.Scene();
  scene.background=new THREE.Color(0xbad7df);
  scene.fog=new THREE.FogExp2(0xd6ddd5,.022);
  scene.add(new THREE.HemisphereLight(0xfff6dd,0x93968f,1.35));
  const sun=new THREE.DirectionalLight(0xffedc9,1.4);
  sun.position.set(-9,12,7);scene.add(sun);
  const materials=new Map(), cube=new THREE.BoxGeometry();
  function mesh(geometry,x,y,z,color){
    if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.72}));
    const m=new THREE.Mesh(geometry,materials.get(color));m.position.set(x,y,z);scene.add(m);return m;
  }
  function box(x,y,z,w,h,d,color){const m=mesh(cube,x,y,z,color);m.scale.set(w,h,d);return m}
  box(0,-.23,0,160,.3,100,0x676c6b);
  box(0,-.08,4,100,.16,13,0xc4bdb0);
  for(let x=-42;x<=42;x+=2)box(x,.008,4,.022,.016,13,0xa59f96);
  for(let x=-42;x<=42;x+=7)box(x,-.067,15,3,.03,.13,0xf0e0aa);
  frontage(type,{box,mesh});
  return {scene,description:address+'｜依街景與照片建模，尺度及周邊為示意',dispose(){const geometries=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry)});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}};
}
export const cityPlaces=friendlyPlaces.filter(p=>p[2]!=='harbor');
