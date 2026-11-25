import {lightRailCar} from './light-rail-car.js';
import precincts from '../data/station-surroundings.js';
import {lightRailBoard} from './station-entrance.js';

const names={C3:'前鎮之星',C7:'軟體園區',C8:'高雄展覽館',C10:'光榮碼頭',C11:'真愛碼頭',C12:'駁二大義',C13:'駁二蓬萊',C14:'哈瑪星'};

// The same elevation profile is used in both the street network and the
// compressed harbour illustration. Only the former uses geographic placement.
export function lightRailStreet(code,root,length=39,platforms=null){
  const elevated=code==='C11',deck=elevated?6.4:.35;
  const matrices=[],dummy=new THREE.Object3D();
  function box(x,y,z,w,h,d,c,tilt=0){
    dummy.position.set(x,y,z);dummy.rotation.set(tilt,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix();matrices.push([dummy.matrix.clone(),c]);
  }
  if(elevated){
    box(0,deck-.61,0,13,.99,length+8,0x978f81);
    for(const z of [-length*.36,0,length*.36]){
      box(0,2.7,z,1.45,5.4,1.5,0xada99e);box(0,5.16,z,7.2,.65,1.65,0xb7b1a5);
    }
    for(const sign of [-1,1]){
      // Inclined access stair and its pair of silver guardrails.
      for(let i=0;i<34;i++)box(sign*4.7,(i+.5)*deck/34,-length/2-11+i*.33,2.15,deck/34+.04,.36,0xaaa69c);
      for(const side of [-1,1])box(sign*4.7+side*1.08,deck/2+.96,-length/2-5.5,.07,.075,12.8,0x9ea8a2,-.52);
    }
  }
  for(const platform of platforms??[-1,1].map(s=>({x:4.75*s,z:0,len:length}))){
    const {x,z:offset,len}=platform,s=Math.sign(x);
    box(x,deck-.13,offset,3.25,.30,len,0xaaa698);
    box(x-1.24*s,deck+.036,offset,.23,.055,len-.35,0xcbb06e);
    for(const lane of [-.74,.74])box(s*1.93+lane,elevated?deck-.24:.14,0,.10,.12,length+5,0x737c79);
    const roofHeight=elevated?3.6:3.16;
    for(let i=0;i<5;i++){
      const z=offset+(i-2)*len*.17;
      box(x+.52*s,deck+roofHeight/2,z,.18,roofHeight,.19,0x909e95);
      box(x,deck+roofHeight-.23,z,3.5,.17,.22,0x9ea99f);
      box(x,deck+roofHeight,z,3.68,.11,len*.169,0xdadbd2);
      if(elevated)box(x+1.62*s,deck+.7,z,.08,1.37,len*.17-.08,0x92a8a5);
      if(i%2===1){box(x+.32*s,deck+.45,z,1.05,.105,2.2,0x97836c);box(x+.6*s,deck+.66,z,.08,.42,2.2,0x97836c)}
    }
    lightRailBoard(root,code,names[code],x,deck+2.14,offset-len*.38);
    if(elevated)for(const z of [-length/2,length/2])box(x,deck+.92,z,3.15,.08,.10,0x84918b);
  }
  const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({roughness:.80}),matrices.length);
  matrices.forEach(([matrix,color],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new THREE.Color(color).convertSRGBToLinear())});mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);
}

export function mappedTransit(scene,putBox){
  const roots=[];
  for(const [code,platforms] of Object.entries(precincts.platforms)){
    if(platforms.length!==2)continue;
    const points=platforms.flat(),center=points.reduce(([x,z],p)=>[x+p[0]/points.length,z+p[1]/points.length],[0,0]);
    // Covariance gives the along-track axis even for the curved Love Pier deck.
    let xx=0,zz=0,xz=0;
    for(const p of points){const x=p[0]-center[0],z=p[1]-center[1];xx+=x*x;zz+=z*z;xz+=x*z}
    const theta=.5*Math.atan2(2*xz,xx-zz),u=Math.cos(theta),v=Math.sin(theta);
    const projections=points.map(p=>(p[0]-center[0])*u+(p[1]-center[1])*v);
    const mid=(Math.max(...projections)+Math.min(...projections))/2;
    const root=new THREE.Group();root.position.set(center[0]+u*mid,0,center[1]+v*mid);root.rotation.y=Math.atan2(u,v);scene.add(root);
    const sides=platforms.map(poly=>{
      const local=poly.map(([x,z])=>[(x-root.position.x)*v-(z-root.position.z)*u,(x-root.position.x)*u+(z-root.position.z)*v]);
      const bounds=axis=>{const p=local.map(q=>q[axis]);return [Math.min(...p),Math.max(...p)]};
      const [left,right]=bounds(0),[start,end]=bounds(1);
      return {x:(left+right)/2,z:(start+end)/2,len:end-start};
    });
    lightRailStreet(code,root,Math.max(...projections)-Math.min(...projections),sides);roots.push(root);
    if(code==='C12'){
      const car=new THREE.Group();car.position.x=1.93;root.add(car);
      const paints=new Map();
      const material=(c,r=.8)=>{if(!paints.has(c))paints.set(c,new THREE.MeshStandardMaterial({color:new THREE.Color(c).convertSRGBToLinear(),roughness:r}));return paints.get(c);};
      const mesh=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);car.add(o);return o;};
      const solid=(x,y,z,w,h,d,c)=>mesh(new THREE.BoxGeometry(w,h,d),material(c),x,y,z);
      const beam=(a,b,r,c)=>{const v=new THREE.Vector3(...a),u=new THREE.Vector3(...b),dir=u.clone().sub(v);const o=mesh(new THREE.CylinderGeometry(r,r,dir.length(),9),material(c),0,0,0);o.position.copy(v).lerp(u,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());};
      lightRailCar(car,material,mesh,solid,beam);
    }
  }
  // The branching deck follows the surveyed cycleways at Kaisyuan. Roof ribs
  // and piers interpret the distinctive folded canopy of the Cianjhen Star.
  for(const line of precincts.bridges){
    const lens=[0];for(let i=1;i<line.length;i++)lens.push(lens[i-1]+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));
    const loop=line[0].join()===line.at(-1).join();
    for(let i=1;i<line.length;i++){
      const a=line[i-1],b=line[i],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
      const length=lens[i]-lens[i-1];if(!length)continue;
      const yaw=Math.atan2(b[0]-a[0],b[1]-a[1]),nx=Math.cos(yaw),nz=-Math.sin(yaw);
      const y=loop?5.6:5.6*Math.min(1,(lens.at(-1)-lens[i]+length/2)/62)+.12;
      putBox(x,y,z,4.2,.4,length+.38,yaw,0xacaea4);
      for(const s of [-1,1]){
        putBox(x+s*2*nx,y+.74,z+s*2*nz,.12,1.3,length+.2,yaw,0x899992);
        if(loop||lens[i]<47){
          putBox(x+s*1.05*nx,y+3.05,z+s*1.05*nz,2.32,.14,length+.25,yaw,0xe0e2d6,s*.21);
          putBox(x+s*1.74*nx,y+1.76,z+s*1.74*nz,.16,3.4,.17,yaw,0xc1c7bc,s*.13);
        }
      }
      if(i%3===1)putBox(x,y/2,z,.91,y,.92,yaw,0xb7b8ab);
    }
  }
  return (x,z)=>roots.forEach(root=>{root.visible=Math.hypot(x-root.position.x,z-root.position.z)<230});
}
