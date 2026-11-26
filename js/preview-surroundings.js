import {whaleHalls,marinaWater,guoyanTowers} from '../data/exhibition-quay.js';
import {citySkyline} from './city-skyline.js';
import {shihjiaTowerKey} from './shihjia-alignment.js';
import {surfaceTexture} from './daylight.js';
import {streetFrontages} from './street-frontages.js';
import streets from '../data/route-streets.js';
import {streetGround} from './street-ground.js';
import survey from '../data/preview-landmarks.js';
import river from '../data/preview-river.js';
import context from '../data/preview-context.js';
import blocks from '../data/walking-blocks.js';

// The walking survey stores east/south metres around this geographic origin.
export function mappedSurroundings(project,scene,points,city){
 const origin=project([22.61,120.29]);
 const east=project([22.61,120.29+1/102820]).x-origin.x;
 const south=project([22.61-1/110750,120.29]).z-origin.z;
 const group=new THREE.Group();scene.add(group);
 const materials=[0xa89e8b,0xc7b8a9,0xc8c5b4,0x347d82,0x787d7b,0x739558,0x878c89].map((color,i)=>{
   const Surface=i===3?THREE.MeshBasicMaterial:THREE.MeshLambertMaterial;
   return new Surface({color:new THREE.Color(color).convertSRGBToLinear(),side:THREE.DoubleSide});
 });
 const grass=surfaceTexture('aerial_grass_rock.jpg');grass.wrapS=grass.wrapT=THREE.RepeatWrapping;grass.repeat.set(.19,.19);materials[5].map=grass;materials[5].color.setHex(0xc4ccac).convertSRGBToLinear();
 // Vary the water with the viewing angle and metre-scale ripples. It is drawn
 // only inside the mapped water polygons, underneath decks and quay walls.
 materials[3].onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 waterSite;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwaterSite=(modelMatrix*vec4(position,1.)).xyz;');
   shader.fragmentShader='varying vec3 waterSite;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     vec2 uv=waterSite.xz;float distanceToEye=distance(waterSite,cameraPosition);
     float atten=1.-smoothstep(8.,145.,distanceToEye);
     float ripple=.5+.5*sin(uv.x*2.7+uv.y*5.4+2.4*sin(uv.x*.62-uv.y*.83)+sin(uv.y*2.1));
     float grazing=pow(1.-abs(normalize(cameraPosition-waterSite).y),4.);
     diffuseColor.rgb=mix(vec3(.027,.083,.106),vec3(.145,.245,.29),.22+.73*grazing);
     diffuseColor.rgb+=vec3(.11,.14,.15)*(pow(ripple,6.)-.20)*atten;
   `);
 };
 const parking=surfaceTexture('asphalt_02.jpg');parking.wrapS=parking.wrapT=THREE.RepeatWrapping;parking.repeat.set(.18,.18);materials[6].map=parking;
 const skyline=citySkyline(scene,points);
 const facade=document.createElement('canvas');facade.width=128;facade.height=96;
 const ink=facade.getContext('2d');ink.fillStyle='#d9d2bf';ink.fillRect(0,0,128,96);ink.fillStyle='#a8a598';ink.fillRect(0,84,128,10);
 for(const x of [12,70]){ink.fillStyle='#736f66';ink.fillRect(x,23,40,47);ink.fillStyle='#718b92';ink.fillRect(x+3,26,34,39);ink.fillStyle='#b6c3c2';ink.fillRect(x+18,26,3,39);ink.fillRect(x-2,69,44,3);}
 const windows=new THREE.CanvasTexture(facade);windows.wrapS=windows.wrapT=THREE.RepeatWrapping;windows.repeat.set(1/7,1/3.4);windows.encoding=THREE.sRGBEncoding;
 const walls=new THREE.MeshLambertMaterial({map:windows});
 const covered=new Set(city?city.footprints:[]);
 covered.add(shihjiaTowerKey);
 // The same two 173 m towers occur in rounded and sub-metre street layers.
 // Keep only the skyline geometry at every viewing distance.
 for(const key of [...guoyanTowers,'349,-993'])covered.add(key);
 for(const ring of whaleHalls)covered.add(ring[0].map(Math.round).join());
 for(const {line} of Object.values(survey.features))covered.add(line[0].map(Math.round).join());
 const extra=[...streets.buildings,...context.buildings,...survey.buildings].filter(([,ring])=>{
   const key=ring[0].map(Math.round).join();if(covered.has(key))return false;covered.add(key);return true;
 });
 const sites=[...(city?[]:blocks.buildings),...extra].map(([height,ring],i)=>({height,ring,style:i%3}));
 for(const ring of [...(city?[]:blocks.water),...context.water,...river.outer])sites.push({height:0,ring,style:3});
 // Join the more detailed quay outline to the coarser harbour polygon on its wet side.
 sites.push({height:0,style:3,ring:marinaWater});
 for(const ring of [...context.green,...survey.green])sites.push({height:0,ring,style:5});
 const roads=streetGround(scene,points);
 const frontages=streetFrontages(group,points);
 for(const [kind,ring] of streets.areas)sites.push({height:0,ring,style:kind==='water'?3:kind==='green'?5:6});
 for(const [width,line] of [...(city?[]:blocks.roads),...context.roads,...survey.roads]){
  const left=[],right=[];for(let i=0;i<line.length;i++){const prev=line[Math.max(0,i-1)],next=line[Math.min(line.length-1,i+1)],dx=next[0]-prev[0],dz=next[1]-prev[1],k=width/(2*(Math.hypot(dx,dz)||1)),[x,z]=line[i];left.push([x-dz*k,z+dx*k]);right.push([x+dz*k,z-dx*k]);}
  sites.push({height:0,style:4,ring:left.concat(right.reverse())});
 }
 function mesh(site){
  const shape=new THREE.Shape(site.ring.map(([x,z])=>new THREE.Vector2(x*east,-z*south)));
  const geometry=site.height?new THREE.ExtrudeGeometry(shape,{depth:site.height,bevelEnabled:false}):new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI/2);const object=new THREE.Mesh(geometry,site.height?[materials[site.style],walls]:materials[site.style]);object.position.copy(origin);
  // Use the mapped water above the legacy harbour fill (.012), below
  // crossings, the quay deck and bridge surfaces.
  object.position.y=site.height?0:site.style===3?.024:site.style===6?.027:site.style===5?.022:-.09;
  group.add(object);return object;
 }
 for(const site of sites){site.bounds=new THREE.Box2().setFromPoints(site.ring.map(([x,z])=>new THREE.Vector2(origin.x+x*east,origin.z+z*south)));}
 // Doorways and covered pedestrian passages may lie inside a footprint.
 // Omit obstructing extrusions along the playable corridor.
 const corridor=[];
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],count=Math.max(1,Math.ceil(a.distanceTo(b)/3));for(let j=0;j<count;j++){const v=a.clone().lerp(b,j/count);corridor.push(new THREE.Vector2(v.x,v.z));}}
 for(let i=sites.length-1;i>=0;i--){const site=sites[i];if(!site.height)continue;
  const inside=corridor.some(point=>{
    if(site.bounds.distanceToPoint(point)>4.4)return false;
    const x=(point.x-origin.x)/east,z=(point.y-origin.z)/south;
    if(inRing(x,z,site.ring))return true;
    // A rotated building may span the entire street in its bounding box.
    // Test the actual walls, with clearance between three-metre samples.
    return site.ring.some(([ax,az],j,ring)=>{
      const [bx,bz]=ring[(j+1)%ring.length],dx=bx-ax,dz=bz-az;
      const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
      return Math.hypot(x-ax-t*dx,z-az-t*dz)<4.4;
    });
  });
  if(inside)sites.splice(i,1);
 }
 const wet=sites.filter(s=>s.style===3);
 function inRing(px,pz,ring){
   let inside=false;
   for(let i=0,j=ring.length-1;i<ring.length;j=i++){
     const [x,z]=ring[i],[xx,zz]=ring[j];
     if((z>pz)!==(zz>pz)&&px<(xx-x)*(pz-z)/(zz-z)+x)inside=!inside;
   }
   return inside;
 }
 let last=new THREE.Vector2(Infinity,Infinity);
 return {
  update(position){skyline.update(position);roads.update(position);frontages.update(position);const point=new THREE.Vector2(position.x,position.z);if(last.distanceTo(point)<48)return;last=point;
   for(const site of sites){const near=site.bounds.distanceToPoint(point)<280;if(near&&!site.object)site.object=mesh(site);if(!near&&site.object){group.remove(site.object);site.object.geometry.dispose();site.object=null;}} },
  leavesBank(from,to){
    const p=new THREE.Vector2(to.x,to.z);
    // Deck footprints and the mapped boardwalk are traversable above water.
    if(['visionDeck','boaiDeck','cityBridge','swingDeck'].some(k=>inRing(to.x,to.z,survey.features[k].line)))return false;
    return wet.some(s=>s.bounds.containsPoint(p)&&inRing(to.x,to.z,s.ring)&&!inRing(from.x,from.z,s.ring));
  },
  buildings:group,
  dispose(){skyline.dispose();parking.dispose();grass.dispose();roads.dispose();frontages.dispose();group.children.forEach(o=>o.geometry.dispose());windows.dispose();walls.dispose();materials.forEach(m=>m.dispose());scene.remove(group);}
 };
}
