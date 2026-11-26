import {mappedBuilding,mappedHeight,mappedColour} from './mapped-building.js';
import footprints from '../data/route-infill.js';

// Additional measured footprints. Storeys and storefront finishes are interpreted.
// A cell shares two draw calls. No Google imagery is used for the facade atlas.
export function streetFrontages(parent, routePoints) {
  const cells = new Map(), nearby = new Set(), size = 85;
  const cellKey = (x,z) => Math.floor(x/size)+','+Math.floor(z/size);
  for (const p of routePoints) for(let i=-3;i<=3;i++) for(let j=-3;j<=3;j++) nearby.add(cellKey(p.x+i*size,p.z+j*size));
  const atlas=document.createElement('canvas');atlas.width=256;atlas.height=256;
  const ctx=atlas.getContext('2d');
  const fill=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(x,y,w,h);};
  fill(0,0,256,256,'#e0d8c8');
  for(let x=0;x<256;x+=16){fill(x,0,1,126,'#c2b9a7');}
  for(let y=0;y<128;y+=16){fill(0,y,256,1,'#c2b9a7');}
  for(const x of [18,145]){
    fill(x,12,93,87,'#6c665c');fill(x+4,18,85,72,'#52656c');fill(x+7,21,35,28,'#95a6a8');
    fill(x+7,55,35,31,'#74898c');fill(x+46,20,35,66,'#809393');fill(x-3,99,99,6,'#a69988');
  }
  fill(0,128,256,128,'#555852');fill(12,145,224,107,'#36484c');
  for(const x of [18,84,150,210]){fill(x,155,40,85,'#687d80');fill(x+4,159,34,12,'#889a9b');fill(x+5,204,31,29,'#505e5b');}
  fill(0,128,256,16,'#ae9e86');fill(0,144,256,5,'#49443a');fill(0,149,12,107,'#bdb7a5');fill(246,149,10,107,'#9d978a');
  const texture=new THREE.CanvasTexture(atlas);texture.encoding=THREE.sRGBEncoding;texture.wrapS=THREE.RepeatWrapping;
  const walls=new THREE.MeshLambertMaterial({map:texture,vertexColors:true,side:THREE.DoubleSide});
  const solids=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const color=new THREE.Color();
  function tri(batch,a,b,c,tint,uv) {
    batch.pos.push(...a,...b,...c);color.setHex(tint).convertSRGBToLinear();
    for(let j=0;j<3;j++)batch.rgb.push(color.r,color.g,color.b);
    if(uv)batch.uv.push(...uv);
  }
  function panel(batch,a,b,low,high,tint,upper) {
    const rep=Math.max(1,Math.round(Math.hypot(a[0]-b[0],a[1]-b[1])/5));
    const t=upper ? .998 : .498,bt=upper ? .503 : .002;
    const A=[a[0],low,a[1]],B=[b[0],low,b[1]],C=[b[0],high,b[1]],D=[a[0],high,a[1]];
    tri(batch,A,B,C,tint,[0,bt,rep,bt,rep,t]);tri(batch,A,C,D,tint,[0,bt,rep,t,0,t]);
  }
  for (const ring of footprints) {
    const cx=ring.reduce((a,p)=>a+p[0],0)/ring.length,cz=ring.reduce((a,p)=>a+p[1],0)/ring.length;
    const key=cellKey(cx,cz);if(!nearby.has(key))continue;
    if(!cells.has(key))cells.set(key,{x:cx,z:cz,wall:{pos:[],rgb:[],uv:[]},roof:{pos:[],rgb:[]},objects:[]});
    const c=cells.get(key),seed=Math.abs(Math.round(cx+cz));
    const area=Math.abs(ring.reduce((s,a,i)=>{const b=ring[(i+1)%ring.length];return s+a[0]*b[1]-a[1]*b[0];},0))/2;
    const record=mappedBuilding(ring[0]);
    const estimatedFloors=area<50?2:area<270?3+seed%2:5+seed%3;
    const height=mappedHeight(record,3.8+(estimatedFloors-1)*3.1);
    const ground=Math.min(height,3.8),floors=Math.max(1,Math.round((height-ground)/3.1)+1),step=(height-ground)/Math.max(1,floors-1);
    const tint=mappedColour(record?.['building:colour'],[0xf1e8d8,0xd6cbbb,0xe1d4c8,0xd3d7cf,0xd0c0af][seed%5]);
    for(let i=0;i<ring.length;i++){
      const a=ring[i],b=ring[(i+1)%ring.length];panel(c.wall,a,b,0,ground,tint,false);
      for(let floor=1;floor<floors;floor++)panel(c.wall,a,b,ground+(floor-1)*step,ground+floor*step,tint,true);
    }
    const contour=ring.map(([x,z])=>new THREE.Vector2(x,z));
    for(const ids of THREE.ShapeUtils.triangulateShape(contour,[])){
      const [a,b,d]=ids.map(i=>[ring[i][0],height,ring[i][1]]);tri(c.roof,a,b,d,mappedColour(record?.['roof:colour'],0x9f9c8e));
    }
  }
  function mount(c){
    for(const [batch,material] of [[c.wall,walls],[c.roof,solids]]){
      if(!batch.pos.length)continue;
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(batch.pos,3));
      g.setAttribute('color',new THREE.Float32BufferAttribute(batch.rgb,3));
      if(batch.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(batch.uv,2));
      g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);parent.add(mesh);c.objects.push(mesh);
    }
  }
  function release(c){for(const o of c.objects){parent.remove(o);o.geometry.dispose();}c.objects.length=0;}
  return {update(p){for(const c of cells.values()){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<275&&!c.objects.length)mount(c);else if(d>350&&c.objects.length)release(c);}},
    dispose(){for(const c of cells.values())release(c);texture.dispose();walls.dispose();solids.dispose();}};
}

