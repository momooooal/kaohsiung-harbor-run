import context from '../data/preview-context.js';
import blocks from '../data/walking-blocks.js';

// The walking survey stores east/south metres around this geographic origin.
export function mappedSurroundings(project,scene,points){
 const origin=project([22.61,120.29]);
 const east=project([22.61,120.29+1/102820]).x-origin.x;
 const south=project([22.61-1/110750,120.29]).z-origin.z;
 const group=new THREE.Group();scene.add(group);
 const materials=[0xa89e8b,0xc7b8a9,0xc8c5b4,0x598c99,0x777e7d,0x80a078].map(color=>new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}));
 const facade=document.createElement('canvas');facade.width=128;facade.height=96;
 const ink=facade.getContext('2d');ink.fillStyle='#d9d2bf';ink.fillRect(0,0,128,96);ink.fillStyle='#a8a598';ink.fillRect(0,84,128,10);
 for(const x of [12,70]){ink.fillStyle='#736f66';ink.fillRect(x,23,40,47);ink.fillStyle='#718b92';ink.fillRect(x+3,26,34,39);ink.fillStyle='#b6c3c2';ink.fillRect(x+18,26,3,39);ink.fillRect(x-2,69,44,3);}
 const windows=new THREE.CanvasTexture(facade);windows.wrapS=windows.wrapT=THREE.RepeatWrapping;windows.repeat.set(1/7,1/3.4);windows.encoding=THREE.sRGBEncoding;
 const walls=new THREE.MeshLambertMaterial({map:windows});
 const sites=[...blocks.buildings,...context.buildings].map(([height,ring],i)=>({height,ring,style:i%3}));
 for(const ring of [...blocks.water,...context.water])sites.push({height:0,ring,style:3});
 for(const ring of context.green)sites.push({height:0,ring,style:5});
 for(const [width,line] of [...blocks.roads,...context.roads]){
  const left=[],right=[];for(let i=0;i<line.length;i++){const prev=line[Math.max(0,i-1)],next=line[Math.min(line.length-1,i+1)],dx=next[0]-prev[0],dz=next[1]-prev[1],k=width/(2*(Math.hypot(dx,dz)||1)),[x,z]=line[i];left.push([x-dz*k,z+dx*k]);right.push([x+dz*k,z-dx*k]);}
  sites.push({height:0,style:4,ring:left.concat(right.reverse())});
 }
 function mesh(site){
  const shape=new THREE.Shape(site.ring.map(([x,z])=>new THREE.Vector2(x*east,-z*south)));
  const geometry=site.height?new THREE.ExtrudeGeometry(shape,{depth:site.height,bevelEnabled:false}):new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI/2);const object=new THREE.Mesh(geometry,site.height?[materials[site.style],walls]:materials[site.style]);object.position.copy(origin);object.position.y=site.height?0:site.style===4?-.09:site.style===5?-.16:-.15;group.add(object);return object;
 }
 for(const site of sites){site.bounds=new THREE.Box2().setFromPoints(site.ring.map(([x,z])=>new THREE.Vector2(origin.x+x*east,origin.z+z*south)));}
 // Doorways and covered pedestrian passages may lie inside a footprint.
 // Omit obstructing extrusions along the playable corridor.
 const corridor=[];
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],count=Math.max(1,Math.ceil(a.distanceTo(b)/3));for(let j=0;j<count;j++){const v=a.clone().lerp(b,j/count);corridor.push(new THREE.Vector2(v.x,v.z));}}
 for(let i=sites.length-1;i>=0;i--){const site=sites[i];if(!site.height)continue;
  const inside=corridor.some(point=>site.bounds.distanceToPoint(point)<4);
  if(inside)sites.splice(i,1);
 }
 let last=new THREE.Vector2(Infinity,Infinity);
 return {
  update(position){const point=new THREE.Vector2(position.x,position.z);if(last.distanceTo(point)<48)return;last=point;
   for(const site of sites){const near=site.bounds.distanceToPoint(point)<280;if(near&&!site.object)site.object=mesh(site);if(!near&&site.object){group.remove(site.object);site.object.geometry.dispose();site.object=null;}} },
  buildings:group,
  dispose(){group.children.forEach(o=>o.geometry.dispose());windows.dispose();walls.dispose();materials.forEach(m=>m.dispose());scene.remove(group);}
 };
}
