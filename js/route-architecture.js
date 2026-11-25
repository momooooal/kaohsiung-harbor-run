// Building outlines and terrain data are documented in DATA-SOURCES.md.
// All facade and roof sections are visual interpretations in local east/south metres.
import relief from '../data/walking-relief.js';
import {streetShells} from './walking-corridors.js';
import {mappedTransit} from './transit-street.js';

function addRelief(scene) {
  const positions = [], indices = [], w = relief.rows[0].length;
  relief.rows.forEach((row, j) => row.forEach((height, i) => {
    // Taper the lowland mask down to street level at the base of the ridge.
    const blend=Math.max(0,Math.min(1,(height-12)/18));
    positions.push(relief.x + i * relief.step, Math.max(0, height - 6)*blend*blend*(3-2*blend), relief.z + j * relief.step);
    if (i && j && Math.max(height, row[i-1], relief.rows[j-1][i], relief.rows[j-1][i-1]) > 12) {
      const k = j*w + i;
      indices.push(k-w-1, k-1, k, k-w-1, k, k-w);
    }
  }));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices); geo.computeVertexNormals();
  // Draw a distant horizon in the sky pass. Preserve real azimuth and apparent
  // elevation without reducing the street camera's near-depth precision.
  const mat = new THREE.ShaderMaterial({side:THREE.DoubleSide,
    vertexShader:`varying vec3 tint;varying vec3 land;void main(){
      land=position;
      vec4 eye=modelViewMatrix*vec4(position,1.);
      float haze=smoothstep(300.,6200.,length(eye.xyz));
      float light=.5+.5*dot(normal,normalize(vec3(-.55,.7,.4)));
      tint=mix(vec3(.21,.34,.27)*(.38+.84*light),vec3(.70,.79,.79),.20+.61*haze);
      gl_Position=projectionMatrix*eye;gl_Position.z=(.99984+.00015*haze)*gl_Position.w;}`,
    fragmentShader:`varying vec3 tint;varying vec3 land;void main(){
      vec2 g=floor(land.xz*.17);float grove=fract(sin(dot(g,vec2(73.7,61.9)))*2388.);
      gl_FragColor=vec4(tint*(.93+.1*grove),1.);}`});
  const mesh = new THREE.Mesh(geo,mat);
  mesh.frustumCulled=false; mesh.renderOrder=-1; scene.add(mesh);
}

function pathIndex(legs) {
  const grid = new Map(), size=64;
  for (const leg of legs) leg.path.slice(1).forEach((b,i) => {
    const a=leg.path[i], dx=b[0]-a[0], dz=b[1]-a[1], l2=dx*dx+dz*dz;
    if(!l2) return;
    const segment={a,dx,dz,l2};
    for(let x=Math.floor((Math.min(a[0],b[0])-50)/size);x<=Math.floor((Math.max(a[0],b[0])+50)/size);x++)
      for(let z=Math.floor((Math.min(a[1],b[1])-50)/size);z<=Math.floor((Math.max(a[1],b[1])+50)/size);z++) {
        const key=x+','+z;
        if(!grid.has(key))grid.set(key,[]);grid.get(key).push(segment);
      }
  });
  return (x,z) => {
    let dist=Infinity, vx=0, vz=0;
    for(const {a,dx,dz,l2} of grid.get(Math.floor(x/size)+','+Math.floor(z/size))||[]) {
      const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2));
      const u=a[0]+dx*t-x,v=a[1]+dz*t-z,d=Math.hypot(u,v);
      if(d<dist){dist=d;vx=u;vz=v}
    }
    return {dist,vx,vz};
  };
}

export function addRouteArchitecture(scene, buildings, legs, profiles) {
  addRelief(scene);
  const chunks=new Map(), nearest=pathIndex(legs), unit=new THREE.BoxGeometry();
  const dummy=new THREE.Object3D(), color=new THREE.Color(), chunkSize=128;
  const material=new THREE.MeshStandardMaterial({roughness:.82});
  function part(x,y,z,w,h,d,yaw,ink,tilt=0) {
    const cx=Math.floor(x/chunkSize),cz=Math.floor(z/chunkSize),key=cx+','+cz;
    if(!chunks.has(key))chunks.set(key,{cx,cz,parts:[]});
    dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,tilt,'YXZ');dummy.scale.set(w,h,d);dummy.updateMatrix();
    chunks.get(key).parts.push([dummy.matrix.clone(),ink]);
  }
  function frame(a,b,points){
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    if(len<3.4)return null;
    const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
    const signed=points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p[0]*q[1]-p[1]*q[0]},0);
    const sign=signed>=0?1:-1,nx=sign*dz/len,nz=-sign*dx/len;
    const path=nearest(x,z);
    const yaw=-Math.atan2(dz,dx);
    return {len,path,faces:path.vx*nx+path.vz*nz>-.1,
      box(s,out,y,w,h,d,ink,tilt=0){
        part(x+dx/len*s+nx*out,y,z+dz/len*s+nz*out,w,h,d,yaw,ink,tilt);
      }};
  }
  const trims=[0x8e7465,0x949086,0x7a887e,0xa47d66,0x8d8e85];
  for(const [height,p,tag] of buildings){
    const [x,z]=p[0],kind=tag||profiles.get(p[0].join());
    if(kind==='rail-museum'){
      const cx=p.reduce((sum,q)=>sum+q[0]/p.length,0),cz=p.reduce((sum,q)=>sum+q[1]/p.length,0);
      const dx=p[2][0]-p[1][0],dz=p[2][1]-p[1][1],length=Math.hypot(dx,dz),a=Math.atan2(dx,dz);
      const width=Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1]);
      const piece=(u,y,v,w,h,d,color)=>part(cx+Math.cos(a)*u+Math.sin(a)*v,y,cz-Math.sin(a)*u+Math.cos(a)*v,w,h,d,a,color);
      piece(0,1.83,0,width,3.66,length,0xd7ceb5);
      for(const side of [-1,1])for(let f=-length*.41;f<length*.46;f+=3.14){
        piece(side*(width/2+.035),1.72,f,.10,2.04,1.55,0x52665d);
        piece(side*(width/2+.11),1.78,f,.11,.095,1.56,0xc9c4af);
        piece(side*(width/2+.11),1.78,f,.11,1.96,.07,0xc9c4af);
        piece(side*(width/2+.10),.66,f,.21,.11,1.76,0xa9a18e);
      }
      // A single-storey hipped station roof, separate from the MRT canopy.
      for(let i=0;i<22;i++){
        const t=i/22;piece(0,3.62+t*1.76,0,(width+1.48)*(1-t),.14,length+1.56-t*width,i%3===0?0x686a5f:0x72766b);
      }
      continue;
    }
    if(streetShells.has(p[0].join()))continue;
    if(tag==='hall'){exhibitionHall(scene,p,part);continue}
    if(kind==='hall')continue;
    if(kind==='shelter'||kind==='station-entry'){
      const corners=p.map(([x,z])=>new THREE.Vector2(x,z));
      const roof=new THREE.ShapeGeometry(new THREE.Shape(corners));
      roof.rotateX(Math.PI/2);roof.translate(0,height,0);
      const mesh=new THREE.Mesh(roof,new THREE.MeshStandardMaterial({color:0x8b9993,side:THREE.DoubleSide}));
      mesh.castShadow=true;scene.add(mesh);
      const step=kind==='shelter'?1:2;
      for(let i=0;i<p.length;i++){
        const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dz=b[1]-a[1];
        part((a[0]+b[0])/2,height-.11,(a[1]+b[1])/2,Math.hypot(dx,dz),.22,.15,-Math.atan2(dz,dx),0x697872);
        if(i%step===0)part(a[0],height*.5,a[1],.15,height,.15,0,0x9ca6a1);
      }
      continue;
    }
    if(kind==='terminal'||(x>-2085&&x<-1935&&z>-1115&&z<-1040)||
       (x===2017&&z===1360)||Math.hypot(x+1505,z+1288)<5)continue;
    const lodge=height===8&&Math.hypot(x-1980,z-716)<76;
    const warehouse=kind==='warehouse', seed=Math.abs(x*37+z*19);
    const edges=p.map((a,i)=>frame(a,p[(i+1)%p.length],p)).filter(e=>e?.faces&&e.path.dist<46)
      .sort((a,b)=>a.path.dist-b.path.dist).slice(0,warehouse||lodge?5:2);
    for(const {len,box,path} of edges){
      const trim=trims[seed%trims.length],depth=Math.min(1.7,Math.max(.16,path.dist-.95));
      if(warehouse||lodge){
        const h=lodge?3.45:height, bays=Math.max(1,Math.round(len/(lodge?3.6:6))), bay=len/bays;
        box(0,.22,h-.16,len+.24,.31,.56,lodge?0x514e46:0x85857b);
        for(let k=0;k<bays;k++){
          const s=(k+.5)*bay-len/2, coffee=p[0][0]===-480;
          const w=bay*(coffee?.83:lodge?.61:.69),base=lodge?.72:.25,top=lodge?2.36:3.48;
          box(s,.058,(base+top)/2,w,top-base,.12,lodge?0x364241:0x303a38);
          box(s,.14,base,w+.10,.13,.32,lodge?0x54483c:0x8f8273);
          for(const t of [-.5,0,.5])box(s+w*t,.13,(base+top)/2,.09,top-base,.16,lodge?0x72553c:0x48514c);
          box(s,.16,top,w+.28,.24,.37,lodge?0x6d5341:0xa79c88);
          if(coffee){
            box(s,.18,1.04,w*.89,.15,.43,0x936a43);
            for(const t of [-.27,.27]){box(s+t*w,.42,.57,.48,.13,.43,0xa87c51);box(s+t*w,.42,.28,.12,.55,.13,0x433f37)}
            box(s,.13,2.63,w,.08,.12,0x58645d);
          }
        }
        continue;
      }
      const bays=Math.max(1,Math.min(8,Math.round(len/4.4))), span=len/bays;
      const arcade=height<22&&path.dist>2.8&&len>6;
      if(arcade){
        box(0,depth*.5,3.12,len,.22,depth,0xa69d8d);
        box(0,depth-.08,3.03,len,.25,.19,trim);
      }
      for(let k=0;k<bays;k++){
        const s=(k+.5)*span-len*.5,w=Math.min(span*.81,6);
        if(arcade){
          box(s-span*.43,depth-.22,1.49,.23,2.98,.3,trim);
          box(s,.07,1.3,w,2.55,.13,seed%4===1?0x65716c:0x414c4d);
          if(seed%4===1)for(let r=0;r<7;r++)box(s,.17,.45+r*.31,w,.04,.07,0x87928a);
          else box(s,.17,1.24,.09,2.43,.09,0xafada0);
          if((seed+k)%4===0){
            // Projecting fabric valance across a single bay, with a clear
            // alley between adjoining shop houses. No invented shop names.
            const shade=[0x7c8f88,0xaf8873,0xae997f][(seed+k)%3];
            box(s,depth+.31,2.91,w+.18,.10,.85,shade);
            box(s,depth+.71,2.78,w+.18,.23,.08,shade);
          }
        }
        const levels=Math.min(4,Math.floor((height-.9)/3.2));
        for(let floor=1;floor<=levels;floor++){
          const y=3.2*floor+.3;
          box(s,depth*.17,y,w,.18,depth*.5+.16,0xb7b1a2);
          if((floor+seed)%3!==0&&height<30){
            box(s,depth*.32,y+.58,w,.08,.08,trim);
            for(const t of [-.45,0,.45])box(s+t*w,depth*.32,y+.32,.055,.55,.055,trim);
          }
          if(floor===1&&height<23&&k%3===seed%3){
            box(s-w*.27,.31,y+.77,.76,.49,.45,0xadab9f);
            for(let l=0;l<4;l++)box(s-w*.27,.543,y+.62+l*.088,.6,.027,.024,0x727b74);
          }
        }
      }
    }
  }
  const showTransit=mappedTransit(scene,part);

  const meshes=[];
  for(const chunk of chunks.values()){
    const mesh=new THREE.InstancedMesh(unit,material,chunk.parts.length);
    chunk.parts.forEach(([matrix,ink],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,color.setHex(ink).convertSRGBToLinear())});
    mesh.castShadow=mesh.receiveShadow=true; mesh.frustumCulled=false; mesh.visible=false;scene.add(mesh);
    meshes.push([mesh,(chunk.cx+.5)*chunkSize,(chunk.cz+.5)*chunkSize]);
  }
  let lastX=Infinity,lastZ=Infinity;
  return (x,z)=>{
    if(Math.abs(x-lastX)+Math.abs(z-lastZ)<10)return;
    lastX=x;lastZ=z;
    showTransit(x,z);
    for(const [mesh,cx,cz] of meshes)mesh.visible=Math.hypot(cx-x,cz-z)<235;
  };
}

// Section the actual hall outline perpendicular to its long side. Each section
// forms a glazed base and a folded, overhanging metal envelope.
function exhibitionHall(scene,points,part){
  let origin=points[0],edge=points[1],length=0;
  points.forEach((a,i)=>{const b=points[(i+1)%points.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len>length){origin=a;edge=b;length=len}});
  const ux=(edge[0]-origin[0])/length,uz=(edge[1]-origin[1])/length;
  const local=points.map(([x,z])=>[(x-origin[0])*ux+(z-origin[1])*uz,-(x-origin[0])*uz+(z-origin[1])*ux]);
  const min=Math.min(...local.map(p=>p[0])),max=Math.max(...local.map(p=>p[0]));
  const pos=[],colors=[],color=new THREE.Color();
  const point=(u,v,y)=>[origin[0]+ux*u-uz*v,y,origin[1]+uz*u+ux*v];
  function triangle(a,b,c,ink){pos.push(...a,...b,...c);color.setHex(ink).convertSRGBToLinear();for(let i=0;i<3;i++)colors.push(color.r,color.g,color.b)}
  function section(u){
    const hits=[];
    local.forEach((a,i)=>{const b=local[(i+1)%local.length];if((a[0]<=u)!==(b[0]<=u))hits.push(a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]))});
    const a=Math.min(...hits),b=Math.max(...hits),phase=(u-min)/(max-min),eave=15+3.5*Math.sin(phase*Math.PI*2-.7);
    return [[a,0],[a,5.2],[a-1.4,7],[a-2,eave],[a+(b-a)*.24,eave+6],[a+(b-a)*.53,eave+8],[b-(b-a)*.2,eave+5],[b+1.8,eave],[b+1.3,7],[b,5.2],[b,0]].map(([v,y])=>point(u,v,y));
  }
  const yaw=-Math.atan2(uz,ux), facadeLength=length;
  // The photographed landward side has a recessed loading level and rows of
  // triangular steel braces below the overhanging metal cladding.
  function bayBox(u,v,y,w,h,d,ink,tilt=0){
    const [x,,z]=point(u,v,y);part(x,y,z,w,h,d,yaw,ink,tilt);
  }
  for(let u=3;u<facadeLength-2;u+=5.4){
    bayBox(u,.16,2.27,5.16,4.44,.22,0x807d70);
    for(let s=0;s<12;s++)bayBox(u,.31,.38+s*.32,5.06,.062,.10,0x5c6058);
    bayBox(u+2.64,.18,2.52,.23,5.04,.30,0x89928b);
    bayBox(u,.85,5.27,5.42,.15,.18,0x717e7c);
    bayBox(u,1.12,5.93,5.64,.13,.16,0xb5bdb6,.24);
    bayBox(u,1.11,5.93,5.64,.11,.17,0xa6ada8,-.24);
  }
  let prev;
  for(let i=0;i<=52;i++){
    const u=min+.005+(max-min-.01)*i/52,seg=section(u);
    if(prev)for(let j=0;j<seg.length-1;j++){
      const glass=j===0||j===9;
      const inks=glass?[0x4a5d61,0x52666a]:j===1||j===8?[0x5b6360,0x838d88]:[0xb8c0be,0xa3aeab,0xc7cdca,0xaab5b2];
      triangle(prev[j],seg[j],prev[j+1],inks[(i+j)%inks.length]);
      triangle(prev[j+1],seg[j],seg[j+1],inks[(i+j+1)%inks.length]);
    }
    if(i===0||i===52)for(let j=1;j<seg.length-1;j++)triangle(seg[0],seg[j],seg[j+1],0x788789);
    prev=seg;
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.62,metalness:.12}));
  mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);
}
