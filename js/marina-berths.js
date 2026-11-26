import {berths} from '../data/exhibition-quay.js';

// Public views show leisure craft moored alongside floating fingers.
// Hull forms and berth occupancy are illustrative, not a real-time inventory.
export function marinaBerths({nearby,key,group,panel,beam,P}){
  if(!nearby.has(key(...berths[0][0])))return;
  const pos=[],col=[],tint=new THREE.Color();
  function face(a,b,c,ink){
    pos.push(...a,...b,...c);tint.setHex(ink).convertSRGBToLinear();
    for(let k=0;k<3;k++)col.push(tint.r,tint.g,tint.b);
  }
  function strip(a,b,c,d,ink){face(a,b,c,ink);face(a,c,d,ink);}
  for(const [i,line] of berths.entries()){
    const a=line[0],b=line.at(-1),len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len;
    panel(a,b,.21,.29,1.24,0x8b8276);
    beam(P(a,.02),P(a,1.96),.13,0x465055);beam(P(a,1.94),P(a,2.12),.135,0xe1ded0);
    if(len<12||i%4===0)continue;
    const L=Math.min(len-1.8,9.8+2.6*(i%3)),w=1.53+.17*(i%3);
    const site=(s,r,h)=>[a[0]+s*dx-(r+w+1.12)*dz,h,a[1]+s*dz+(r+w+1.12)*dx];
    const hull=[[.10,.61,.58],[.18,.91,.67],[.51,1,.75],[.78,.78,.93],[.94,.40,1.04],[1,.025,1.22]];
    for(let j=1;j<hull.length;j++){
      const [f,v,y]=hull[j-1],[f2,v2,y2]=hull[j];
      for(const side of [-1,1]){
        const A=site(L*f,side*w*v,y),B=site(L*f2,side*w*v2,y2);
        strip(A,B,site(L*f2,side*w*v2*.60,.06),site(L*f,side*w*v*.60,.06),0xe0e1d9);
        strip(A,B,site(L*f2,side*w*v2,y2-.10),site(L*f,side*w*v,y-.10),0x627579);
      }
      strip(site(L*f,-w*v,y),site(L*f2,-w*v2,y2),site(L*f2,w*v2,y2),site(L*f,w*v,y),0xe6e4d8);
    }
    for(const side of [-1,1]){
      strip(site(L*.24,side*w*.72,.72),site(L*.72,side*w*.76,.86),site(L*.58,side*w*.56,1.85),site(L*.32,side*w*.64,1.88),0x455d64);
      strip(site(L*.30,side*w*.67,1.88),site(L*.61,side*w*.61,1.85),site(L*.597,side*w*.59,2.00),site(L*.32,side*w*.65,2.02),0xe3e0ce);
    }
    strip(site(L*.32,-w*.65,2.02),site(L*.597,-w*.59,2),site(L*.597,w*.59,2),site(L*.32,w*.65,2.02),0xe9e7db);
    strip(site(L*.58,-w*.56,1.85),site(L*.72,-w*.76,.86),site(L*.72,w*.76,.86),site(L*.58,w*.56,1.85),0x6d888c);
    if(i%6===3){
      const base=site(L*.54,0,.78),tip=site(L*.52,0,10.2);
      beam(new THREE.Vector3(...base),new THREE.Vector3(...tip),.055,0xc5cac9);
      for(const t of [.20,.9])beam(new THREE.Vector3(...site(L*t,0,.83)),new THREE.Vector3(...tip),.011,0xb1b5ad);
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  group(...berths[0][0]).add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})));
}
