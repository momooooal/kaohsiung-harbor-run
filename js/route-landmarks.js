import {coralFrontage,terminalEnvelope} from './harbor-frontages.js';
import {waterfrontWalks} from './waterfront-walks.js';
import {libraryPlaza} from './library-plaza.js';
import {surfaceTexture} from './daylight.js';
import streets from '../data/route-streets.js';
import survey from '../data/preview-landmarks.js';

// Plans and alignments come from the named OSM ways. Elevations, finishes,
// pier spacing and architectural profiles are visual interpretations in metres.
export const restoredFootprints=new Set(Object.values(survey.features).map(({line})=>line[0].map(Math.round).join()));
export function routeLandmarks(parent,points,precinctOnly=false) {
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
  const foliage=surfaceTexture('tree.png');
  const leaves=new THREE.SpriteMaterial({map:foliage,transparent:true,alphaTest:.18,depthWrite:false});
  function tree(x,z,scale=1,width=1){
    if(!nearby.has(key(x,z)))return;
    const height=(6.6+Math.abs(Math.round(x+z))%3)*scale;
    const tree=new THREE.Sprite(leaves);tree.position.set(x,height/2,z);tree.scale.set(height*.87*width,height,1);group(x,z).add(tree);
  }
  if(!precinctOnly)populateRoute();
  function populateRoute(){
    const f=Object.fromEntries(Object.entries(survey.features).map(([k,v])=>[k,v.line]));
    function rail(a,b,h=1.06,base=.12){
      for(const y of [base+h,base+h*.52])beam(P(a,y),P(b,y),.044,0x758584);
      const n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/3.8));
      for(let i=0;i<n;i++){const p=mix(a,b,i/n);beam(P(p,base),P(p,base+h),.053,0x727f7f);}
    }
    for(const k of ['visionDeck','boaiDeck','cityBridge','swingDeck'])slab(f[k],.13,k==='swingDeck'?0xaeaaa0:0x727778);
    for(const [line,interior] of [[f.visionEast,-1],[f.visionWest,1]]){
      const [a,b]=line;
      function lane(t,side){const p=mix(a,b,t);return [p[0]+side*interior,p[1]];}
      panel(lane(.025,0),lane(.975,0),.151,.036,3.6,0xc8bfaf);
      panel(lane(.025,.98),lane(.975,.98),.177,.018,1.23,0xad7168);
      for(const side of [-1.98,1.98]){
        let last=P(lane(.025,side),.23);
        for(let i=1;i<=30;i++){
          const t=i/30,y=.23+13.9*Math.sin(t*Math.PI),p=lane(.025+.95*t,side);
          beam(last,P(p,y),.35,0xe0e1d9,.48);
          if(i%3===0&&i<30)beam(P(p,.27),P(p,y),.054,0xa1afad);
          if(side>0&&i%5===0&&i<30)beam(P(p,y-.33),P(lane(.025+.95*t,-side),y-.33),.17,0xd9dfd8);
          last=P(p,y);
        }
        for(let i=1;i<25;i++){
          const t=.025+i*.038,p=lane(t,side);
          beam(P(p,.24),P(p,1.29),.067,0xe6e4db);
          if(i>1)for(const h of [.44,.72,1.25])beam(P(lane(t-.038,side),h),P(p,h),h>1?.065:.036,0xe0e3dc);
        }
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
    // The bridge pivots at its wider lookout. Both fans terminate at one
    // mast, and the guardrails follow the curved sides of the mapped deck.
    if(nearby.has(key(...pivot))){
      const head=P(pivot,22),along=P(tail).sub(P(tip)).normalize();
      for(const side of [-1,1]){
        const across=[along.z*side,-along.x*side];
        beam(P([pivot[0]+across[0]*3.8,pivot[1]+across[1]*3.8],.13),head,.34,0xe5e8df);
        for(const end of [tip,tail])for(let i=1;i<=7;i++){
          const p=mix(pivot,end,i/7);p[0]+=across[0]*2.3;p[1]+=across[1]*2.3;
          beam(head,P(p,1.0),.044,0xbdc9ca);
        }
      }
      // The 80 m canopy rises over the central outlook and contracts into
      // two slender edge ribbons toward the approaches.
      const canopyPositions=[],indices=[],alongM=(t,side)=>[pivot[0]+along.x*t+along.z*side,pivot[1]+along.z*t-along.x*side];
      for(let i=0;i<=40;i++){
        const t=-40+2*i,crest=Math.pow(Math.cos(t*Math.PI/80),2);
        for(let j=0;j<5;j++){
          const u=j*.25,offset=(2*u-1)*(.23+4.55*crest)+3.4*Math.sin(t*Math.PI/80);
          const p=alongM(t,offset),h=1.58+4.8*crest+1.3*crest*Math.sin(Math.PI*u);
          canopyPositions.push(p[0],h,p[1]);
          if(i&&j){const n=i*5+j;indices.push(n-6,n-5,n,n-6,n,n-1);}
        }
      }
      const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(canopyPositions,3));
      shell.setIndex(indices);shell.computeVertexNormals();
      group(...pivot).add(new THREE.Mesh(shell,new THREE.MeshLambertMaterial({color:0xebe9e0,side:THREE.DoubleSide})));
      const deck=f.swingDeck;
      for(let j=1;j<deck.length;j++){
        const a=deck[j-1],b=deck[j],dx=b[0]-a[0],dz=b[1]-a[1];
        if(Math.abs(dx*along.x+dz*along.z)<.55*Math.hypot(dx,dz))continue;
        rail(a,b,1.02);panel(a,b,-.14,.50,.28,0xdde2dd);
      }
    }
    if(f.library.some(p=>nearby.has(key(...p))))libraryPlaza(f.library,{panel,beam,slab,P,mix,group,tree});
    const facade={panel,beam,slab,P,mix};
    if(f.coral.some(p=>nearby.has(key(...p))))coralFrontage(f.coral,facade);
    if(f.terminal.some(p=>nearby.has(key(...p))))terminalEnvelope(f.terminal,facade,streets.roads,points);
    for(const id of ['music','centralMrt','r13East','r13West']){
      const line=f[id];if(!line.some(p=>nearby.has(key(...p))))continue;
      const xs=line.map(p=>p[0]),min=Math.min(...xs),span=Math.max(1,Math.max(...xs)-min);
      const height=p=>{
        const t=(p[0]-min)/span;
        if(id==='music')return 9+29*Math.exp(-Math.pow((t-.18)/.16,2))+18*Math.exp(-Math.pow((t-.75)/.16,2));
        return id==='centralMrt'?5.6+4.2*Math.sin(t*Math.PI):3.6;
      };
      slab(line,0,0xedede6,height);
      for(let j=1;j<line.length;j++){
        const a=line[j-1],b=line[j],len=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.max(1,Math.ceil(len/3.4));
        for(let i=0;i<n;i++){const p=mix(a,b,i/n),q=mix(a,b,(i+1)/n),h=height(mix(p,q,.5));
          if(['centralMrt','r13East','r13West'].includes(id)){
            if(i%2===0)beam(P(p),P(q,h),.105,id==='centralMrt'?0xdeac35:0x879a93);
            panel(p,q,h-.14,.28,.32,0xd4d9d2);
          }else{
            panel(p,q,h/2,h,.18,0xd8dad9);
            panel(p,q,2.25,4,.30,0x506a72);beam(P(p,.25),P(q,4.5),.095,0xc9ceca);
            panel(p,q,h-.38,.65,.54,0xecece8);
            for(let y=5;y<h-1;y+=2.65)panel(p,q,y,.21,.38,0x657b84);
          }
        }
      }
    }
    slab(f.fountain,.10,0x638e90);
    for(const [kind,line] of survey.edges)if(kind==='railing')for(let i=1;i<line.length;i++)if(nearby.has(key(...line[i])))rail(line[i-1],line[i]);
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
      [22.6092312,120.3025234,250.4,'avenue',8,34],
      [22.6239228,120.2918809,252.1,'avenue',6.5,27],
      [22.6238832,120.2987095,153,'garden',-5,38],
      [22.6238832,120.2987095,153,'garden',9,33],
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
        }else if(kind==='garden'){
          tree(...p,.68);tree(...site(right*1.7,d+3),1.18);tree(...site(right*2.7,d+7),1.32);
          for(let j=0;j<4;j++)tree(...site(right*.75+Math.sin(j+d),d+j*1.7),.24+.055*j);
        }else tree(...p);
        if(kind==='park')tree(...site(right+2.7,d+4));
      }
    }
  }
  const releaseWalks=waterfrontWalks({nearby,key,group,panel,beam,P,tree});
  const color=new THREE.Color();
  for(const {g,shape,rows} of batches.values()){
    const mesh=new THREE.InstancedMesh(shape,material,rows.length);
    rows.forEach(([m,c],i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,color.setHex(c).convertSRGBToLinear());});mesh.frustumCulled=false;g.add(mesh);
  }
  return {update(p){for(const g of groups.values()){const [x,z]=g.userData.center;g.visible=Math.hypot(x-p.x,z-p.z)<360;}},dispose(){
    releaseWalks();
    for(const g of groups.values()){
      parent.remove(g);g.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){o.geometry.dispose();o.material.dispose();}});
    }
    foliage.dispose();leaves.dispose();box.dispose();round.dispose();material.dispose();
  }};
}
