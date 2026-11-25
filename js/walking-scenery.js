import env from '../data/walking-environment.js';
import precincts from '../data/station-surroundings.js';
import {stationExits,exitPoint} from '../data/station-exits.js';
import {daylightSky,surfaceTexture} from './daylight.js';
import {stationApproach} from './station-entrance.js';

// Public way geometry is in the same east/south metre grid as walking-legs.
// Heights, tree spacing, street furnishings and materials are interpretive.
export function walkingScenery(scene,{polygon,ribbon,tint},withSky=true){
  const textures=[],shapes=[],plants=[],shrubs=[],dummy=new THREE.Object3D();
  function texture(file){
    const map=surfaceTexture(file);
    textures.push(map);map.encoding=THREE.sRGBEncoding;map.anisotropy=4;return map;
  }
  function box(x,y,z,w,h,d,rot,color,roll=0){
    dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.order='YXZ';dummy.rotation.set(0,rot,roll);
    dummy.updateMatrix();shapes.push([dummy.matrix.clone(),color]);
  }
  function tree(x,z,h){plants.push([x,z,h])}
  function trace(line,visit){
    for(let i=1;i<line.length;i++){
      const [x,z]=line[i-1],[ex,ez]=line[i],dx=ex-x,dz=ez-z,l=Math.hypot(dx,dz);
      if(l>.1)visit(x,z,dx/l,dz/l,l);
    }
  }
  const colors={green:0x739151,parking:0x84847e,plaza:0xb8ac96,water:0x508e97};
  for(const [kind,points] of env.areas.concat(precincts.areas))polygon(points,kind==='water'?.012:.02,tint(colors[kind]));
  for(const [kind,recorded,line] of precincts.edges){
    const h=recorded||({hedge:.83,fence:1.43,wall:1.48,retaining_wall:.65,quay:.30,kerb:.13}[kind]??1.02);
    trace(line,(x,z,dx,dz,length)=>{
      const a=Math.atan2(dx,dz),cx=x+dx*length/2,cz=z+dz*length/2;
      if(['railing','guard_rail','fence'].includes(kind)){
        for(const y of [.38*h,.93*h])box(cx,y,cz,.09,.085,length,a,0x929990);
        for(let f=0;f<length;f+=2.4)box(x+dx*f,h/2,z+dz*f,.085,h,.085,a,0x7d827a);
      }else if(kind==='hedge'){
        for(let f=.6;f<length;f+=1.14)shrubs.push([x+dx*f,h*.55,z+dz*f,.65,h,1.30,a,0x5a7347]);
      }else if(kind==='boardwalk'){
        ribbon([x,z],[x+dx*length,z+dz*length],2.6,.082,tint(0xa9906f));
      }else box(cx,h/2,cz,kind==='quay'?.55:.22,h,length+.03,a,kind==='quay'?0x92968c:0xaaa79b);
    });
  }
  // Forecourt paving, planting and street edges are composed from the exit
  // photographs, on the real side of the boulevard. Keep the runner's path open.
  for(const exit of stationExits){
    const half=exit.width/2,len=exit.length/2,a=Math.PI-exit.front*Math.PI/180;
    const p=(r,f)=>exitPoint(exit,r,f);
    const item=(r,f,y,w,h,d,c)=>{const [x,z]=p(r,f);box(x,y,z,w,h,d,a,c)};
    const quad=(r0,r1,f0,f1,y,c)=>polygon([p(r0,f0),p(r1,f0),p(r1,f1),p(r0,f1)],y,tint(c));
    quad(-half-4.6,half+4.6,-len-2,len+3,.086,0xa99e90);
    // Connect to the kerb where the access apron opens out from the stairs.
    const approach=stationApproach(exit);
    ribbon(approach.start,approach.end,exit.code==='O1'?6.2:5.2,.088,tint(0xafa99d));
    const planting=exit.code==='R7'?6.6:exit.code==='R6'?7.4:4.8;
    for(const s of [-1,1]){
      quad(s*(half+1.5),s*(half+planting+2),-len-2,len+.5,.075,0xb0a69a);
      for(const f of [-len-2,-len*.16]){
        const [x,z]=p(s*(half+planting),f);tree(x,z,exit.code==='O1'?5.1:6.4);
        item(s*(half+planting),f,.16,1.8,.25,2.3,0x92877a);
        shrubs.push([x,.42,z,1.34,.65,1.77,a,0x647b47]);
      }
    }
    if(exit.id==='R6-1'||exit.id==='R6-3'){
      const verge=exit.number===1?-1:1;
      for(let f=-len-8;f>=-len-67;f-=9.4){
        const r=verge*(half+4.65),[x,z]=p(r,f);
        tree(x,z,6.9+.7*Math.sin(f));item(r,f,.16,1.84,.27,2.7,0x8e8778);
        shrubs.push([x,.49,z,1.67,.82,2.33,a,0x587545]);
      }
      if(exit.number===3){
        // Scooter parking runs lengthwise behind the low clipped hedge.
        for(let n=0;n<14;n++){
          const r=verge*(half+2.6),f=-len-4.4-n*1.35,body=[0x57626b,0xa7aba1,0x535757,0x905c53][n%4];
          item(r,f,.48,1.38,.4,.49,body);item(r+.20,f,.73,.72,.15,.46,0x383d3a);
          item(r-.50,f,.69,.24,.59,.47,body);item(r-.53,f,.99,.13,.09,.59,0x404941);
          for(const k of [-.57,.56])item(r+k,f,.22,.39,.43,.17,0x3d403d);
        }
      }
      for(const side of [-1,1]){
        item(side*(half+2.2),-1,.22,1.0,.39,len*1.65,0x787767);
        for(let f=-len+1;f< len-1;f+=1.1){const [x,z]=p(side*(half+2.2),f);shrubs.push([x,.61,z,.92,.7,1.5,a,0x718347])}
      }
    }
    if(exit.id==='R7-2'||exit.id==='R7-4'){
      const pool=exit.number===2,side=1,r=side*(half+14);
      // Pool frontage and the covered school gate are visible behind their
      // respective exits across the sidewalk. Dimensions are interpretive.
      item(r,-1,2.12,5.2,4.24,19,pool?0xbfa98a:0xc3bead);
      item(r-side*2.65,-1,3.70,.6,.48,20,pool?0x547281:0x8caa99);
      for(let f=-8;f<=8;f+=3){
        item(r-side*2.64,f,2.16,.18,1.62,2.55,0x5e7877);
        item(r-side*3.1,f,1.66,.18,3.33,.18,pool?0xa59a79:0x8aac91);
      }
      if(!pool){
        for(const f of [-6.5,-2,2.5,7]){
          item(r-4,f,1.69,.20,3.38,.21,0x85a597);
          item(r-4,f,3.49,1.95,.21,4.56,0xa6b8a7);
        }
      }
    }
    if(exit.code==='R7'){
      // The school, pool and park stretch beyond the short glass canopies.
      const roadSide=(exit.number===1||exit.number===3)?1:-1;
      for(const f of [-len-9,-len-22,-len-36,-len-50]){
        const r=roadSide*(half+3.5),[x,z]=p(r,f);tree(x,z,6.8+.7*Math.cos(f));
        shrubs.push([x,.42,z,1.52,.65,1.62,a,0x627f4b]);
      }
    }
  }
  for(const [x,z] of env.trees)tree(x,z,5.7);
  for(const line of env.rows){
    let next=0;
    trace(line,(x,z,dx,dz,l)=>{while(next<l){tree(x+dx*next,z+dz*next,5.4+.8*Math.cos(x+next));next+=7.4}next-=l});
  }
  for(const rail of env.rails){
    trace(rail,(x,z,dx,dz,l)=>{
      for(const sign of [-1,1]){
        const X=x+sign*dz*.71,Z=z-sign*dx*.71;
        ribbon([X,Z],[X+dx*l,Z+dz*l],.12,.069,tint(0x646561));
      }
    });
  }
  for(const line of env.crossings){
    trace(line,(x,z,dx,dz,l)=>{
      for(let t=.6;t<l-.25;t+=1.25){
        const X=x+dx*t,Z=z+dz*t;
        ribbon([X,Z],[X+dx*.53,Z+dz*.53],2.6,.078,tint(0xece8d6));
      }
    });
  }
  for(const [kind,[x,z]] of env.fixtures){
    if(kind==='lamp'){box(x,3,z,.12,6,.12,0,0x808b89);box(x+.47,6,z,1.05,.13,.3,0,0xbdc4bb)}
    else{box(x,.47,z,1.6,.12,.48,0,0x8e7058);for(const d of [-.6,.6])box(x+d,.23,z,.1,.46,.42,0,0x626660)}
  }
  // Views checked looking along the actual route; offsets describe the foreground
  // seen from that reference, not verified public amenities or traffic rules.
  function viewpoint(lat,lon,bearing){
    const bx=(lon-120.29)*102820,bz=(22.61-lat)*110750,a=bearing*Math.PI/180;
    const dx=Math.sin(a),dz=-Math.cos(a),yaw=Math.atan2(dx,dz);
    const pos=(right,ahead)=>[bx-dz*right+dx*ahead,bz+dx*right+dz*ahead];
    return {
      tree(r,f,h){tree(...pos(r,f),h)},
      shrub(r,f,y,w,h,d,c){const [x,z]=pos(r,f);shrubs.push([x,y,z,w,h,d,yaw,c])},
      part(r,f,y,w,h,d,color,roll=0){const [x,z]=pos(r,f);box(x,y,z,w,h,d,yaw,color,roll)},
      lane(r,f,length,width,color,y=.075){ribbon(pos(r,f),pos(r,f+length),width,y,tint(color))}
    };
  }
  const park=viewpoint(22.60360,120.30938,249);
  park.lane(-9,-24,65,14,0x879456,.029);
  for(const f of [-15,-4,7,19,29]){
    park.tree(5.4,f,5.8+Math.sin(f));
    for(const r of [4.08,4.28,4.48])park.part(r,f,.49,.15,.11,1.67,0x876c52);
    for(const d of [-.58,.58])park.part(4.28,f+d,.24,.5,.47,.11,0x555952);
    park.part(4.58,f,.78,.10,.30,1.67,0x8c7356);
  }
  park.tree(-7,26,8.2);
  // The park's broad lawn is punctuated by detached workers' houses and
  // low verandas, in contrast to the warehouse arcade at the next stop.
  for(const f of [-12,3,18]){park.part(-6.8,f,.13,3.7,.24,1.35,0xc4b8a2);park.shrub(-7.1,f+2,.69,1.4,.85,2,0x65764c)}
  const warehouse=viewpoint(22.61803,120.28551,115);
  warehouse.lane(0,-17,63,7,0xaf735d);
  warehouse.part(5.8,7,.79,.46,1.58,48,0x8e9184);
  for(let f=-15;f<32;f+=3.3)warehouse.part(5.8,f,1.83,.07,.62,.07,0x64736b);
  warehouse.part(5.8,7,2.1,.075,.075,48,0x64736b);
  for(let f=-15;f<31;f+=2.15){
    warehouse.part(5.55,f,.82,.025,1.54,.026,0x797d75);
    warehouse.part(5.54,f+1,1.1,.025,.062,.062,0x686e65);
  }
  const kai=viewpoint(22.59710,120.31539,324);
  kai.part(-4.5,16,.23,1.62,.46,64,0xa3907d);
  kai.part(-4.5,16,.79,1.35,1.04,64,0x587147);
  for(let f=-15;f<47;f+=1.16){
    const offset=.13*Math.sin(f*1.63);
    kai.shrub(-4.45+offset,f,1.12+offset,.84,.56,1.13,Math.cos(f)>0?0x607c45:0x6b844b);
  }
  for(let f=-46;f<132;f+=28){
    kai.part(-4.75,f,5.4,.19,10.8,.19,0xaeb7b2);
    kai.part(-3.7,f,10.27,2.4,.14,.19,0xaab3b2,-.12);
    kai.part(-2.68,f,10.1,.78,.21,.40,0xc4c8bd);
    kai.part(-5.37,f,10.7,1.69,.22,.47,0xd6d7c9,.22);
  }
  for(let f=-22;f<80;f+=13){kai.tree(-5.2,f,5);kai.lane(3.2,f,4,.12,0xe1decc)}
  const bay=viewpoint(22.59743,120.30893,343);
  for(let i=0;i<22;i++){
    const x=1.5+1.8*Math.sin(i*.095);
    bay.lane(x,i-9,1.15,2.6,0xa65340,.082);
    bay.lane(x-1.15,i-9,1.15,.07,0xf0e9d5,.084);
  }
  // The outward normal of the mapped entrance edge points to the exterior footway.
  const canopyYaw=Math.atan2(-8,-24),mx=1936,mz=1394.4;
  box(mx,4.4,mz+1.6,29,1.1,3.9,canopyYaw,0x16669c);
  for(let s=-13;s<=13;s+=2){
    const x=mx+s*.947,z=mz-s*.317;
    box(x-.12,2.05,z-.34,1.92,3.62,.17,canopyYaw,s%4===1?0x526e77:0x739098);
    box(x+.8,2.05,z-.64,.09,3.70,.20,canopyYaw,0x34464d);
    box(x+.52,3.83,z+1.59,.20,.08,.20,canopyYaw,0xe3ddc4);
  }
  for(const offset of [-7,7]){
    const x=mx+offset*.947,z=mz+2-offset*.317;
    for(const d of [-.9,.9])box(x+d*.947,1.93,z-d*.317,.24,4.25,.28,canopyYaw,0xe1e1d6,d*.43);
  }
  const hall=viewpoint(22.60730,120.29887,70);
  for(let f=-16;f<68;f+=10){hall.tree(3.9,f,5.4);hall.shrub(4.3,f,.38,.73,.46,1.15,0x677e45)}
  hall.lane(-4.5,-22,86,5,0x92918a);
  for(let f=-17;f<56;f+=4.1){hall.part(-5.2,f,.45,.21,.90,.21,0xb1bab4);hall.part(-5.2,f,.77,.23,.07,.23,0x646d66)}
  const pier=viewpoint(22.61817,120.28518,294);
  for(let f=-10;f<40;f+=6){pier.part(-4.8,f,.65,.88,1.3,5.6,0x8a705e);pier.part(-4.8,f,1.35,.87,.25,5.6,0x884e57)}
  for(let f=-12;f<=27;f+=3.5){
    pier.part(-5.8,f,.13,.14,.23,3.46,0x69655c);pier.part(-7.15,f,.13,.14,.23,3.46,0x69655c);
    for(const off of [0,1.14,2.29])pier.part(-6.47,f+off,.079,1.93,.12,.20,0x796d5a);
  }
  const tunnel=viewpoint(22.62398,120.26998,124);
  tunnel.lane(-4,-14,50,2.1,0xa7755c);
  for(let f=-9;f<28;f+=6){tunnel.part(-5.8,f,3.12,2.2,.24,5.92,0xb5a08b);tunnel.part(-5,f,1.54,.21,3.08,.23,0xaaa394)}
  tunnel.tree(-3.7,18,5.6);
  // East mouth of the mapped tunnel. The stop is at the street outside.
  const portal=env.portals[0];
  if(portal?.length>1){
    const [[x,z],[x2,z2]]=portal, bearing=Math.atan2(x2-x,z2-z);
    const portalPoint=(u,y,v,w,h,d,color,roll=0)=>box(x+Math.cos(bearing)*u+Math.sin(bearing)*v,y,z-Math.sin(bearing)*u+Math.cos(bearing)*v,w,h,d,bearing,color,roll);
    for(const sign of [-1,1])portalPoint(sign*3.5,1.28,1.2,.68,2.56,3.6,0x8b8c7e);
    for(let i=0;i<16;i++){
      const a=(i+.5)*Math.PI/16;
      portalPoint(Math.cos(a)*3.49,2.48+Math.sin(a)*2.79,1.2,.76,.59,3.6,0xb5b0a2,a-Math.PI/2);
    }
    // Return the soffit and stone jambs into the hillside so the east portal
    // has real depth from the street. The walk ends outside the tunnel.
    for(const s of [-1,1])portalPoint(s*3.32,1.31,8.8,.34,2.65,15.2,0x676a5f);
    for(let i=0;i<16;i++){const a=(i+.5)*Math.PI/16;
      portalPoint(Math.cos(a)*3.38,2.49+Math.sin(a)*2.70,8.6,.69,.31,15.5,0x747669,a-Math.PI/2);
    }
    for(const f of [3.7,7.8,11.9])portalPoint(0,4.99,f,.94,.09,.27,0xd8d1af);
    portalPoint(0,2.52,16,6.58,5.14,.15,0x343d36);
  }

  // Mid-leg checks: the planted separator on Xinguang, boulevard trees on
  // Shidai, and the waterside rail on Binhai are visible well before a stop.
  const xinguang=viewpoint(22.611246,120.301341,71.1);
  xinguang.lane(3.1,-30,95,2.15,0x70815c,.073);
  for(let f=-25;f<66;f+=10){xinguang.tree(3.2,f,7.4);xinguang.part(3.2,f+3,.3,1.4,.6,3.3,0x5c7843)}
  const shidai=viewpoint(22.598023,120.312173,249.7);
  for(let f=-36;f<94;f+=12){shidai.tree(7.1,f,6.8);shidai.tree(-9.2,f+2,5.8)}
  const grove=viewpoint(22.60326466,120.30415238,249.91);
  for(let f=-50;f<100;f+=7.2){
    grove.tree(3.3+.5*Math.sin(f*.4),f,7.5+1.1*Math.sin(f));
    grove.tree(8.6,f+3.4,6.2+.9*Math.cos(f));
    for(let k=0;k<4;k++)grove.shrub(2.64,f+k*1.67,.50,.64,.52,1.12,0x657e46);
  }
  const quay=viewpoint(22.621655,120.269916,5.3);
  quay.lane(-5.3,-16,56,2.3,0xb6816e,.075);
  for(let f=-16;f<40;f+=3.5)quay.part(-6.4,f,.62,.095,1.24,.095,0xc6ccbf);
  quay.part(-6.4,12,1.18,.09,.09,56,0xc6ccbf);
  quay.part(-6.4,12,.65,.07,.07,56,0xb7beb3);

  const boxes=new THREE.InstancedMesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({roughness:.9}),shapes.length);
  shapes.forEach(([matrix,color],i)=>{boxes.setMatrixAt(i,matrix);boxes.setColorAt(i,tint(color))});boxes.frustumCulled=false;scene.add(boxes);
  const shrubShape=new THREE.IcosahedronGeometry(1,2),vertices=shrubShape.attributes.position,leafColors=[];
  for(let i=0;i<vertices.count;i++){
    const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
    const n=Math.sin(x*31.1+y*29.6+z*18.1),scale=.96+.12*n;
    vertices.setXYZ(i,x*scale,y*scale,z*scale);
    const light=.78+.11*y+.09*n;leafColors.push(light,light,light*.96);
  }
  shrubShape.setAttribute('color',new THREE.Float32BufferAttribute(leafColors,3));shrubShape.computeVertexNormals();
  const thickets=new THREE.InstancedMesh(shrubShape,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}),shrubs.length);
  shrubs.forEach(([x,y,z,w,h,d,yaw,ink],i)=>{
    dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(w,h,d);dummy.updateMatrix();
    thickets.setMatrixAt(i,dummy.matrix);thickets.setColorAt(i,tint(ink));
  });thickets.frustumCulled=false;scene.add(thickets);
  const foliage=texture('tree.png');
  const trees=new THREE.InstancedMesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial({map:foliage,color:0xd3d8bd,alphaTest:.33,side:THREE.DoubleSide}),plants.length*2);
  const shadeCanvas=document.createElement('canvas');shadeCanvas.width=shadeCanvas.height=64;
  const ctx=shadeCanvas.getContext('2d'),g=ctx.createRadialGradient(32,32,1,32,32,31);
  g.addColorStop(0,'rgba(40,48,27,.5)');g.addColorStop(1,'rgba(40,48,27,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  const shade=new THREE.CanvasTexture(shadeCanvas);textures.push(shade);
  const shadows=new THREE.InstancedMesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false}),plants.length);
  plants.forEach(([x,z,h],i)=>{
    dummy.scale.set(h*.86,h,1);dummy.position.set(x,h/2,z);
    for(let k=0;k<2;k++){dummy.rotation.set(0,i*.33+k*Math.PI/2,0);dummy.updateMatrix();trees.setMatrixAt(i*2+k,dummy.matrix)}
    dummy.rotation.set(-Math.PI/2,0,-.45);dummy.position.set(x+1,.102,z+1.1);dummy.scale.set(h*.95,h*1.32,1);dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix);
  });trees.frustumCulled=shadows.frustumCulled=false;scene.add(trees,shadows);
  const asphalt=texture('asphalt_02.jpg'),brick=texture('herringbone_pavement.jpg');
  const masonry=texture('brick_wall_001.jpg'),lawn=texture('aerial_grass_rock.jpg');
  for(const t of [asphalt,brick,masonry,lawn])t.wrapS=t.wrapT=THREE.RepeatWrapping;
  const sky=withSky?daylightSky(scene):null;
  return {asphalt,brick,masonry,lawn,setCenter(x,z){sky?.position.set(x,0,z)},dispose(){textures.forEach(t=>t.dispose())}};
}
