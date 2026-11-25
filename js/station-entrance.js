import {exitPoint} from '../data/station-exits.js';

const ink={stone:0xaaa69e, trim:0xd5d7cb, steel:0xbac5c2, base:0x524e47, glass:0x46746a, black:0x323a39};

export function stationFinishes(){
  const reflection=new THREE.TextureLoader().load('assets/surfaces/daylight-sky.jpg');
  reflection.encoding=THREE.sRGBEncoding;reflection.mapping=THREE.EquirectangularReflectionMapping;
  const glass=new THREE.MeshPhongMaterial({color:new THREE.Color(0x436d62).convertSRGBToLinear(),envMap:reflection,
    combine:THREE.MixOperation,reflectivity:.15,specular:0x293932,transparent:true,opacity:.87,depthWrite:false,shininess:72,side:THREE.DoubleSide});
  glass.addEventListener('dispose',()=>reflection.dispose());
  return {glass};
}

// All signs are attached to the building or their own street furniture.
// Artwork is drawn here. No panorama or operator artwork is used as a texture.
function graphic(width,height,draw){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  draw(canvas.getContext('2d'),width,height);
  const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;texture.anisotropy=4;
  const material=new THREE.MeshBasicMaterial({map:texture});
  material.addEventListener('dispose',()=>texture.dispose());return material;
}
function stationNameplate(exit){
  return graphic(1024,160,(c,w,h)=>{
    c.fillStyle='#ebece6';c.fillRect(0,0,w,h);c.fillStyle=exit.color;c.fillRect(0,0,154,h);
    c.textAlign='center';c.fillStyle='white';c.font='bold 76px sans-serif';c.fillText(exit.code,77,104);
    c.textAlign='left';c.fillStyle='#243539';c.font='bold 70px "Microsoft JhengHei",sans-serif';c.fillText(exit.name+'站',183,83);
    c.font='38px sans-serif';c.fillText(exit.english+' Station',186,132);
    c.fillStyle='#253644';c.fillRect(790,0,234,h);c.fillStyle='#fff';c.font='32px sans-serif';c.fillText('出口',806,69);c.font='25px sans-serif';c.fillText('EXIT',806,105);
    c.fillStyle='#ffe292';c.font='bold 116px sans-serif';c.fillText(String(exit.number),908,126);
  });
}
function streetPylon(exit){
  return graphic(160,560,(c,w,h)=>{
    c.fillStyle='#edf0ec';c.fillRect(0,0,w,h);c.fillStyle='#174d8a';c.fillRect(0,0,w,112);
    c.fillStyle='white';c.textAlign='center';c.font='bold 45px sans-serif';c.fillText('捷運',80,60);c.font='20px sans-serif';c.fillText('METRO',80,89);
    c.fillStyle=exit.color;c.fillRect(23,133,114,49);c.fillStyle='white';c.font='bold 36px sans-serif';c.fillText(exit.code,80,171);
    c.fillStyle='#28363c';c.font='bold 48px sans-serif';[...exit.name+'站'].forEach((ch,i)=>c.fillText(ch,80,244+i*53));
    c.font='24px sans-serif';c.fillText('出口 EXIT',80,449);c.fillStyle='#16487b';c.font='bold 83px sans-serif';c.fillText(exit.number,80,532);
  });
}
export function lightRailBoard(root,code,name,x,y,z,yaw=0){
  const panel=new THREE.Group();panel.position.set(x,y,z);panel.rotation.y=yaw;root.add(panel);
  const finish=graphic(640,148,(c,w,h)=>{
    c.fillStyle='#f5f4e9';c.fillRect(0,0,w,h);c.fillStyle='#297448';c.fillRect(0,0,152,h);
    c.fillStyle='white';c.textAlign='center';c.font='bold 66px sans-serif';c.fillText(code,76,95);
    c.fillStyle='#273b38';c.textAlign='left';c.font='bold 59px sans-serif';c.fillText(name,174,76);c.font='32px sans-serif';c.fillText('高雄輕軌  LIGHT RAIL',176,125);
  });
  const metal=new THREE.MeshStandardMaterial({color:0x727d78});
  const slab=new THREE.Mesh(new THREE.BoxGeometry(3.35,.80,.13),metal);panel.add(slab);
  for(const side of [-1,1]){
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.29,.75),finish);
    sign.position.z=side*.073;sign.rotation.y=side<0?Math.PI:0;panel.add(sign);
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,2.65,8),metal);leg.position.set(side*1.29,-1.53,0);panel.add(leg);
  }
}

// Clip the pavement just inside the parapets. The treads and handrails can
// then genuinely descend below street level instead of painting a staircase.
export function clipStationGround(shader,exits,position){
  const holes=exits.map(exit=>{
    const a=exit.front*Math.PI/180,c=Math.cos(a).toFixed(6),s=Math.sin(a).toFixed(6);
    const [x,z]=exit.center;const w=(Math.min(exit.width-1.18,8.5)/2).toFixed(3),l=(exit.length/2-1).toFixed(3);
    return '{vec2 p=site-vec2('+x.toFixed(1)+','+z.toFixed(1)+'); if(abs(dot(p,vec2('+c+','+s+')))<'+w+' && abs(dot(p,vec2('+s+','+(-Math.cos(a)).toFixed(6)+')))<'+l+') discard;}';
  }).join('\n');
  shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n{vec2 site='+position+';'+holes+'}');
}

export function stationEntrance(parent,exit,placed=true,finishes=stationFinishes()){
  const root=new THREE.Group(),w=exit.width,len=exit.length,front=len/2;
  if(placed){root.position.set(exit.center[0],0,exit.center[1]);root.rotation.y=Math.PI-exit.front*Math.PI/180}
  parent.add(root);
  const boxGeo=new THREE.BoxGeometry(),postGeo=new THREE.CylinderGeometry(1,1,1,12),matrices=new Map();
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  function store(geometry,color){dummy.updateMatrix();if(!matrices.has(geometry))matrices.set(geometry,[]);matrices.get(geometry).push([dummy.matrix.clone(),color])}
  function box(x,y,z,width,height,depth,color,rx=0,ry=0,rz=0){
    dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz,'YXZ');dummy.scale.set(width,height,depth);store(boxGeo,color);
  }
  function beam(a,b,r,color){
    const begin=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(begin);
    dummy.position.copy(begin).lerp(end,.5);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.scale.set(r,d.length(),r);store(postGeo,color);
  }
  function face(x,y,z,width,height,material,angle=0){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);m.position.set(x,y,z);m.rotation.y=angle;root.add(m);
  }
  function shell(rows,colour,finish){
    const positions=[];
    for(let r=1;r<rows.length;r++)for(let i=1;i<rows[r].length;i++){
      const a=rows[r-1][i-1],b=rows[r-1][i],c=rows[r][i-1],d=rows[r][i];positions.push(...a,...c,...b,...b,...c,...d);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,finish??new THREE.MeshStandardMaterial({color:new THREE.Color(colour).convertSRGBToLinear(),side:THREE.DoubleSide,roughness:.7}));m.castShadow=m.receiveShadow=true;root.add(m);
  }
  const nameplate=stationNameplate(exit),pylon=streetPylon(exit);
  const aperture=Math.min(w-1.18,8.5),mouth=front-1,height=exit.code==='O1'?.64:.32;
  // Street approaches stop outside this aperture, valid for all mobility modes.
  for(const side of [-1,1]){
    const edge=(w-aperture)/2+.38;
    box(side*(aperture/2+edge/2),height/2-.02,0,edge,height,len+1,ink.stone);
    box(side*(aperture/2+.12),-.68,0,.23,2.8,len,0x75786e);
  }
  const count=26,run=(len-2)/count;
  for(let i=0;i<count;i++){
    const top=height-i*.16,z=mouth-(i+.5)*run;
    box(0,top-.12,z,aperture,.24,run+.025,0x807e74);
    box(0,top+.012,z+run*.38,aperture,.024,.052,0xc3bba3);
  }
  box(0,-1.96,-mouth-.10,aperture,5.1,.24,0x283732);
  for(const x of [-aperture*.46,0,aperture*.46]){
    beam([x,height+1,mouth+.2],[x,height-3.04,-mouth+.2],.055,ink.steel);
    for(let i=0;i<5;i++){const z=mouth-i*(len-2)/5,y=height-i*.81;beam([x,y,z],[x,y+.94,z],.039,ink.steel)}
  }
  // A small bank of escalator sides beside the pedestrian treads.
  for(const x of [aperture*.08,aperture*.44]){
    shell([[[x,height+.70,mouth],[x,height-3.34,-mouth]],[[x,height-.02,mouth],[x,height-4.06,-mouth]]],0x698480);
    beam([x,height+.75,mouth],[x,height-3.30,-mouth],.078,ink.black);
  }
  const redLine=exit.code!=='O1',shihjia=exit.code==='R7';
  // Four shallow, widening, curved granite treads in front of the landing.
  for(let i=0;i<4;i++){
    const depth=.33*(4-i),y=height*(i+1)/4,rows=[[],[]];
    for(let j=0;j<=32;j++){
      const x=(j/32-.5)*(w+.9),bulge=exit.code==='O1'?.95*Math.sqrt(Math.max(0,1-(2*x/(w+.9))**2)):0;
      rows[0].push([x,y,mouth]);rows[1].push([x,y,front+depth+bulge]);
    }
    shell(rows,i%2?0xb4ada1:0xbfb7ab);shell([rows[1],rows[1].map(([x,v,z])=>[x,v-height/4,z])],0x88867d);
  }
  if(redLine){
    // Long green glazing under a tapered white metal shell. R7 has external
    // V-braces with round bronze joints; R6 has solid angled end plates.
    const crown=t=>1.70+2.24*t+.30*Math.sin(Math.PI*t),rows=[];
    for(let i=0;i<=12;i++){
      const t=i/12,z=-front+t*(len+1),y=crown(t);
      const profile=[[-w/2-.21,y-.43],[-w/2-.21,y],[0,y+.115],[w/2+.21,y],[w/2+.21,y-.43]];
      rows.push(profile.map(([x,h])=>[x,h,z]));
      if(i%2===0)beam([-w/2-.2,y,z],[w/2+.2,y,z],.035,0xb7bab2);
    }
    shell(rows,0xdadcd6);
    for(const side of [-1,1]){
      const x=side*(w/2-.14),outside=side*(w/2+.04),z0=-front+.38,z1=front-.44;
      const glass=[[],[]];
      for(let n=0;n<=10;n++){
        const t=n/10,z=z0+(z1-z0)*t,y=crown(t)-.45;
        glass[0].push([x,.66,z]);glass[1].push([x,y,z]);
        if(n%2===0)beam([x,.66,z],[x,y,z],.037,ink.steel);
      }
      shell(glass,ink.glass,finishes.glass);
      box(x,.47,0,.26,.63,len,ink.trim);
      for(const y of [1.06,1.48])box(x+side*.038,y,0,.07,.065,len-.7,ink.steel);
      if(shihjia){
        for(let i=0;i<=4;i++){
          const t=i/4,z=z0+(z1-z0)*t,y=i%2?crown(t)-.43:.58;
          if(i){const t0=(i-1)/4,yp=(i-1)%2?crown(t0)-.43:.58;beam([outside,yp,z0+(z1-z0)*t0],[outside,y,z],.13,ink.trim)}
          beam([outside,y,z],[outside+side*.13,y,z],.22,0xbaab84);
        }
      }else{
        for(const end of [-1,1]){
          const z=end*(front-1.1),h=crown((end+1)/2)-.5;
          shell([[[outside,.64,z-end*.86],[outside,.64,z+end*.15]],[[outside,h,z-end*.6],[outside,h,z+end*1.17]]],ink.trim);
        }
        beam([outside,.78,-front+.7],[outside,1.72,front-.70],.042,ink.steel);
      }
      for(let z=-front+1;z<front;z+=2.5)box(outside,.45,z,.10,.08,.14,ink.base);
    }
    for(const x of [-w/2+.18,w/2-.18])beam([x,height,front-.5],[x,3.72,front-.5],.092,ink.steel);
    for(let f=-front+1;f<front;f+=1.6){
      const y=crown((f+front)/len);
      box(0,y-.29,f,w-.34,.085,.10,0x88938b);
      if(f>0)for(const side of [-1,1])box(side*w*.26,y-.35,f,.08,.055,.94,0xe8dfc7);
    }
    for(const side of [-1,1])for(let z=-front+.8;z<front;z+=.74){
      box(side*(w/2-.15),.20,z,.42,.12,.70,z%1>.4?0x8f9087:0x878a82);
    }
    box(0,3.38,front-.4,w-.45,.64,.20,ink.trim);face(0,3.38,front-.29,Math.min(w-.55,4.05),.61,nameplate);
  }else{
    const old=exit.number===1,cols=w/2-.58;
    if(old){
      for(const side of [-1,1]){
        box(side*(w*.29),5.5,-2,w*.41,11,10.8,side<0?0xa69c8e:0xc1b5a4);
        for(let y=1.1;y<11;y+=1.5)box(side*w*.29,y,3.42,w*.41,.038,.04,0x918b81);
      }
    }
    const rows=[];
    for(let i=0;i<=30;i++){
      const x=(i/30-.5)*(w+2),y=old?4.65+.35*Math.sin(i/30*Math.PI*3.0):4.48+.12*Math.cos(i/30*Math.PI*2);
      rows.push([[x,y-.16,front+1.27],[x,y+.07,front+1.3],[x,y+.19,front-2.1],[x,y-.08,-front]]);
    }shell(rows,old?0xbe7b62:0xd9dcd4);
    for(const s of [-1,1]){
      box(s*cols,.60,0,.65,1.20,len-.18,0xa8a69a);
      for(let z=-front+1;z<front;z+=3.1){
        const x=s*cols;
        shell([[[x,1.13,z-1.35],[x,1.13,z+1.35]],[[x,3.97,z-1.35],[x,3.97,z+1.35]]],ink.glass,finishes.glass);
        box(x,2.15,z+1.49,.64,4.30,.34,ink.trim);box(x,3.06,z,.12,.073,2.8,ink.steel);
      }
    }
    for(const z of [-front+1,0,front-.7]){
      box(0,3.91,z,w-.45,.48,.40,ink.steel);box(0,3.64,z,w*.48,.055,.19,0xf4e8c7);
    }
    for(let x=-w/2+.42;x<w/2;x+=.73)box(x,4.19,front-.05,.046,.08,2.34,0xb8b7ab);
    box(0,3.82,front-.2,w-1,.75,.28,ink.trim);face(0,3.82,front-.045,4.6,.72,nameplate);
  }
  // Mast mounted on the paved forecourt. One side faces the approach and
  // another can be read from the street running beside the entrance.
  const px=w/2+1.15,pz=front+.55;
  box(px,2.0,pz,.72,4,.48,0xa1a8a4);box(px,3.63,pz,.74,.79,.50,0x28538a);
  face(px,2.12,pz+.257,.70,3.72,pylon);face(px,2.12,pz-.257,.70,3.72,pylon,Math.PI);
  const sideFinish=graphic(256,166,(c,sw,sh)=>{
    c.fillStyle='#30444a';c.fillRect(0,0,sw,sh);c.fillStyle='#f2f0e2';c.font='32px sans-serif';c.fillText('出口',10,71);c.fillText('EXIT',11,119);
    c.fillStyle='#ffda83';c.font='bold 123px sans-serif';c.fillText(exit.number,137,129);
  });
  for(const sign of [-1,1])face(sign*(w/2+.23),1.82,0,1.19,.78,sideFinish,sign*Math.PI/2);
  if(exit.id==='R6-1'||exit.id==='R7-3'){
    const x=exit.id==='R7-3'?3.94:w/2+2.1,z=exit.id==='R7-3'?-2.05:-front+2;
    box(x,2.27,z,2.8,4.54,3.2,ink.trim);box(x,1.10,z+1.63,1.42,2.20,.09,ink.steel);
    for(const dx of [-.34,.34])box(x+dx,1.27,z+1.69,.58,1.45,.06,ink.glass);
    box(x,3.31,z+1.55,3.22,.16,1.6,ink.trim);
  }
  for(const [geometry,parts] of matrices){
    const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({roughness:.72}),parts.length);
    parts.forEach(([matrix,colour],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new THREE.Color(colour).convertSRGBToLinear())});
    mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);
  }
  return root;
}

export function stationApproach(exit){
  // Enter from the street-facing edge of each forecourt. At O1-2 the
  // approach stays west of the Takao Railway Museum footprint.
  const side={'R6-1':1,'R6-2':1,'R6-3':-1,'R7-1':1,'R7-2':-1,'R7-3':1,'R7-4':-1}[exit.id]??0;
  const start=exit.id==='O1-2'?[-1511.2,-1300.7]:exit.id==='O1-1'?[-1696,-1346]:exitPoint(exit,side*(exit.width*.5+9.4),exit.length/2+15.2);
  const door=exitPoint(exit,0,exit.length/2-.4),bearing=exit.front*Math.PI/180;
  const setback=(start[0]-door[0])*Math.sin(bearing)-(start[1]-door[1])*Math.cos(bearing);
  const end=door.map((v,i)=>v+(start[i]-v)*3.5/setback);
  const dx=end[0]-start[0],dz=end[1]-start[1],length=Math.hypot(dx,dz);
  return {start,end,length,heading:Math.atan2(dx,dz)};
}
