import {surfaceTexture} from './daylight.js';
import streets from '../data/route-streets.js';
import survey from '../data/preview-landmarks.js';

// Plans and alignments come from the named OSM ways. Elevations, finishes,
// pier spacing and architectural profiles are visual interpretations in metres.
export const restoredFootprints=new Set(Object.values(survey.features).map(({line})=>line[0].map(Math.round).join()));
export function routeLandmarks(parent,points) {
  const box=new THREE.BoxGeometry(),round=new THREE.CylinderGeometry(1,1,1,10);
  const material=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});
  const batches=new Map(),groups=new Map(),dummy=new THREE.Object3D(),axis=new THREE.Vector3(0,1,0);
  const nearby=new Set();
  const key=(x,z)=>Math.floor(x/100)+','+Math.floor(z/100);
  for(const p of points){for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++)nearby.add(key(p.x+100*dx,p.z+100*dz));}
  function group(x,z){const id=key(x,z);if(!groups.has(id)){
    const g=new THREE.Group();const [a,b]=id.split(',').map(Number);g.userData.center=[100*a+50,100*b+50];parent.add(g);groups.set(id,g);
  }return groups.get(id);}
  function put(shape,x,y,z,w,h,d,color,q){
    if(!nearby.has(key(x,z)))return;
    const g=group(x,z),id=g.id+'-'+shape.id;
    if(!batches.has(id))batches.set(id,{g,shape,rows:[]});
    dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.quaternion.copy(q);dummy.updateMatrix();
    batches.get(id).rows.push([dummy.matrix.clone(),color]);
  }
  const P=(p,y=0)=>new THREE.Vector3(p[0],y,p[1]);
  function beam(a,b,r,color,width=r){
    const d=b.clone().sub(a),length=d.length();if(length<.01)return;
    const c=a.clone().lerp(b,.5),q=new THREE.Quaternion().setFromUnitVectors(axis,d.normalize());
    put(round,c.x,c.y,c.z,r,length,width,color,q);
  }
  function panel(a,b,y,height,depth,ink){
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    put(box,(a[0]+b[0])/2,y,(a[1]+b[1])/2,depth,height,len+.03,ink,new THREE.Quaternion().setFromAxisAngle(axis,Math.atan2(dx,dz)));
  }
  function slab(line,y,ink,profile=()=>0){
    if(!line.some(p=>nearby.has(key(...p))))return;
    const points=line.slice(0,-1),tri=THREE.ShapeUtils.triangulateShape(points.map(p=>new THREE.Vector2(...p)),[]);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flatMap(p=>[p[0],y+profile(p),p[1]]),3));
    geometry.setIndex(tri.flat());geometry.computeVertexNormals();
    const roof=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color:new THREE.Color(ink).convertSRGBToLinear(),side:THREE.DoubleSide}));group(...points[0]).add(roof);
  }
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const f=Object.fromEntries(Object.entries(survey.features).map(([k,v])=>[k,v.line]));
  function rail(a,b,h=1.06,base=.12){
    for(const y of [base+h,base+h*.52])beam(P(a,y),P(b,y),.044,0x758584);
    const n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/3.8));
    for(let i=0;i<n;i++){const p=mix(a,b,i/n);beam(P(p,base),P(p,base+h),.053,0x727f7f);}
  }
  for(const k of ['visionDeck','boaiDeck','cityBridge','swingDeck'])slab(f[k],.13,k==='swingDeck'?0xaeaaa0:0x727778);
  for(const line of [f.visionEast,f.visionWest]){
    const [a,b]=line;
    let last=P(a,.22);for(let i=1;i<=24;i++){
      const t=i/24,p=mix(a,b,t),y=.22+14.5*Math.sin(t*Math.PI);
      beam(last,P(p,y),.34,0xd8dfe1);if(i%2===0&&i<24)beam(P(p,.23),P(p,y),.066,0xa4b5b9);last=P(p,y);
    }
  }
  for(const line of [f.visionDeck,f.boaiDeck,f.cityBridge]){
    for(let j=1;j<line.length;j++){
      const a=line[j-1],b=line[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>Math.min(45,Math.max(...line.map((v,i)=>Math.hypot(v[0]-line[(i+1)%line.length][0],v[1]-line[(i+1)%line.length][1])))*.85))rail(a,b);
    }
  }
  for(let i=1;i<f.heartWalk.length;i++){
    const a=f.heartWalk[i-1],b=f.heartWalk[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    panel(a,b,-.03,.32,4.5,0x927b68);
    for(const s of [-1,1]){const side=p=>[p[0]+s*2.14*dz/len,p[1]-s*2.14*dx/len];rail(side(a),side(b));}
  }
  const [tip,pivot,tail]=f.swingPath;
  for(const s of [-1,1]){
    const head=P([pivot[0]+s*1.6,pivot[1]+s*.8],22);
    beam(P([pivot[0]+s*4.2,pivot[1]+s*2.1],.13),head,.36,0xf1f1e7);
    for(const end of [tip,tail])for(let i=1;i<=7;i++)beam(head,P(mix(pivot,end,i/7),1),.048,0xc5ccca);
  }
  for(const id of ['library','terminal','music','coral','centralMrt','r13East','r13West']){
    const line=f[id];if(!line.some(p=>nearby.has(key(...p))))continue;
    const xs=line.map(p=>p[0]),min=Math.min(...xs),span=Math.max(1,Math.max(...xs)-min);
    const height=p=>{
      const t=(p[0]-min)/span;
      if(id==='terminal')return 11+20*Math.pow(1-t,2.6)+2*Math.sin(2*Math.PI*t);
      if(id==='music')return 9+29*Math.exp(-Math.pow((t-.18)/.16,2))+18*Math.exp(-Math.pow((t-.75)/.16,2));
      if(id==='coral')return 6.6+1.35*Math.cos(t*25);
      if(id==='library')return 33;
      return id==='centralMrt'?5.6+4.2*Math.sin(t*Math.PI):3.6;
    };
    slab(line,0,id==='library'?0x99a68e:0xedede6,height);
    for(let j=1;j<line.length;j++){
      const a=line[j-1],b=line[j],len=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.max(1,Math.ceil(len/3.4));
      for(let i=0;i<n;i++){const p=mix(a,b,i/n),q=mix(a,b,(i+1)/n),h=height(mix(p,q,.5));
        if(id==='library'){
          // The reading floors hang above an open ground-floor arcade.
          panel(p,q,18.8,28,.22,0x536e75);
          for(let y=5;y<33;y+=3.7)panel(p,q,y,.30,.80,0xd7dfd3);
          beam(P(p,4.9),P(p,33),.065,0xbacac6);
          if(i%3===0)beam(P(p,.12),P(p,5),.18,0x858e85);
        }else if(['centralMrt','r13East','r13West'].includes(id)){
          if(i%2===0)beam(P(p),P(q,h),.105,id==='centralMrt'?0xdeac35:0x879a93);
          panel(p,q,h-.14,.28,.32,0xd4d9d2);
        }else{
          // A covered service road passes below the terminal envelope (OSM 1151968661).
          const base=id==='terminal'?4.6:0;
          panel(p,q,(h+base)/2,h-base,.18,id==='terminal'?0x8999a1:0xd8dad9);
          panel(p,q,base+2.25,4,.30,0x506a72);beam(P(p,base+.25),P(q,base+4.5),.095,0xc9ceca);
          panel(p,q,h-.38,.65,.54,0xecece8);
          if(id==='terminal'||id==='music')for(let y=5;y<h-1;y+=2.65)panel(p,q,y,.21,.38,0x657b84);
        }
      }
    }
  }
  slab(f.fountain,.10,0x638e90);
  for(const [kind,line] of survey.edges)if(kind==='railing')for(let i=1;i<line.length;i++)if(nearby.has(key(...line[i])))rail(line[i-1],line[i]);
  const foliage=surfaceTexture('tree.png');
  const leaves=new THREE.SpriteMaterial({map:foliage,transparent:true,alphaTest:.18,depthWrite:false});
  function tree(x,z){
    if(!nearby.has(key(x,z)))return;
    const height=6.6+Math.abs(Math.round(x+z))%3;
    const tree=new THREE.Sprite(leaves);tree.position.set(x,height/2,z);tree.scale.set(height*.87,height,1);group(x,z).add(tree);
  }
  for(const [kind,p] of streets.fixtures){
    const [x,z]=p;if(!nearby.has(key(x,z)))continue;
    if(kind==='tree'){tree(x,z);continue;}
    if(kind==='lamp'||kind==='signal'){
      const top=kind==='signal'?3.8:6.3;
      beam(P(p,.12),P(p,top),.073,0x727b78);
      if(kind==='lamp')beam(P(p,top),P([x+.7,z],top+.08),.092,0xa9aaa0);
      else put(box,x,top,z,.31,.82,.22,0x38433c,new THREE.Quaternion());
    }
    // A mapped bench does not establish opening hours or access conditions.
    if(kind==='bench'){
      put(box,x,.45,z,1.5,.12,.45,0x8a7765,new THREE.Quaternion());
      for(const d of [-.52,.52])beam(P([x+d,z],.06),P([x+d,z],.43),.06,0x6f7974);
    }
  }
  for(const line of streets.rows){
    let next=0;
    for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],len=Math.hypot(a[0]-b[0],a[1]-b[1]);
      while(next<len){tree(...mix(a,b,next/len));next+=8.5;}next-=len;}
  }
  // Sampled street photographs show these short planted stretches.
  // Offsets and spacing describe the view, not individual surveyed trees.
  const plantedViews=[
    [22.5983711,120.3139651,233.8,'avenue',-8,22],
    [22.605653,120.3024683,250.8,'avenue',-10,35],
    [22.604715,120.2972713,332.1,'park',4,44],
    [22.6092312,120.3025234,250.4,'avenue',8,34],
    [22.62385,120.2901767,345.1,'river',-2.3,34],
    [22.6239228,120.2918809,252.1,'avenue',6.5,27],
    [22.6496915,120.2894705,284.8,'palm',3.8,40],
    [22.6510048,120.2987292,98.8,'palm',4.2,36]
  ];
  for(const [lat,lon,bearing,kind,right,length] of plantedViews){
    const cx=(lon-120.29)*102820,cz=(22.61-lat)*110750,a=bearing*Math.PI/180;
    if(!nearby.has(key(cx,cz)))continue;
    const site=(r,d)=>[cx+r*Math.cos(a)+d*Math.sin(a),cz+r*Math.sin(a)-d*Math.cos(a)];
    for(let d=-8;d<=length;d+=kind==='park'?6.5:9){
      const p=site(right,d);
      if(kind==='palm'){
        const crown=P(p,6.3);beam(P(p),crown,.19,0x87725b);
        for(let k=0;k<10;k++){
          const h=k*Math.PI/5+d*.19,mid=P([p[0]+Math.cos(h)*1.2,p[1]+Math.sin(h)*1.2],7.1);
          const end=P([p[0]+Math.cos(h)*2.7,p[1]+Math.sin(h)*2.7],5.8);
          beam(crown,mid,.115,0x587538,.21);beam(mid,end,.145,0x496f36,.25);
        }
      }else tree(...p);
      if(kind==='park')tree(...site(right+2.7,d+4));
    }
  }
  const color=new THREE.Color();
  for(const {g,shape,rows} of batches.values()){
    const mesh=new THREE.InstancedMesh(shape,material,rows.length);
    rows.forEach(([m,c],i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,color.setHex(c).convertSRGBToLinear());});mesh.frustumCulled=false;g.add(mesh);
  }
  return {update(p){for(const g of groups.values()){const [x,z]=g.userData.center;g.visible=Math.hypot(x-p.x,z-p.z)<360;}},dispose(){
    for(const g of groups.values())g.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){o.geometry.dispose();o.material.dispose();}});
    foliage.dispose();leaves.dispose();box.dispose();round.dispose();material.dispose();
  }};
}
