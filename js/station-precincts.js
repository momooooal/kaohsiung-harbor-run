import {shihjiaPoint,shihjiaTowerKey} from './shihjia-alignment.js';
import streets from '../data/route-streets.js';

// Positions in local east/south metres. The finish and heights of street
// furniture interpret the dated views in DATA-SOURCES. No panorama textures.
const boaiOrigin=[1377.28,-4920.33];
const gardenOrigin=[(120.2987095-120.29)*102820,(22.61-22.6238832)*110750];
const minshengCorner=[193.39,-1541.95];
export function hasStationPrecinct(nearby,key){
  return [shihjiaPoint(0,0),boaiOrigin,gardenOrigin,minshengCorner].some(p=>nearby.has(key(...p)));
}
export function stationPrecincts({nearby,key,quad,crown,group,panel,beam,P,materials}){
  const tint=hex=>new THREE.Color(hex).convertSRGBToLinear();
  const solid=(a,b,y,h,w,c)=>panel(a,b,y,h,w,c);
  function band(frame,start,end,left,right,h,finish,tile=2.2){
    const width=right-left,length=end-start;
    const n=Math.max(1,Math.ceil(length/25));
    for(let i=0;i<n;i++){
      const a=start+length*i/n,b=start+length*(i+1)/n;
      quad(finish,h,frame(a,left),frame(a,right),frame(b,left),frame(b,right),left/tile,a/tile,right/tile,b/tile);
    }
  }
  function stem(base,top,r,colour){beam(P(base,.13),P(top[0],top[1]),r,colour);}
  function hedge(frame,a,b,side,width,height){
    for(let d=a;d<=b;d+=1.6){
      const p=frame(d,side+.13*Math.sin(d));crown(p,height*.57,width,height*1.23,d,0xc4d493);
      if(d+1<b)crown(frame(d+.9,side),height*.68,width*1.08,height*1.21,d*.4,0xacbf91);
    }
  }
  function canopy(frame,d,s,h,r){
    const p=frame(d,s),base=frame(d+.30,s+.14),bend=frame(d+.65,s-.15);
    stem(p,[base,h*.24],h*.031,0x665944);beam(P(base,h*.23),P(bend,h*.48),h*.024,0x766a54);
    for(let j=0;j<7;j++){
      const a=d*.61+j*2.39996,k=r*(.48+.22*Math.sin(j*1.7+d));
      const tip=frame(d+Math.cos(a)*k,s+Math.sin(a)*k);
      const y=h*(.58+.1*Math.sin(j*1.7));
      beam(P(j%2?base:bend,h*(j%2?.24:.44)),P(tip,y),h*.012,0x756a54);
      crown(tip,y+h*.10,r*(1.08+.21*Math.sin(a)),h*.42,a,[0xc7d4b4,0xb2c8a0,0xcad59e][j%3]);
    }
    crown(bend,h*.82,r*1.2,h*.37,d,0xd8e0b4);
    const x=p[0]-1.4,z=p[1]+1.3;
    quad('shade',.141,[x-r,z-r*.78],[x+r,z-r*.78],[x-r,z+r*.90],[x+r,z+r*.90],0,0,1,1);
  }
  function post(frame,d,s,height,r,col){const p=frame(d,s);stem(p,[p,height],r,col);}
  function lamp(frame,d,s,direction=1){
    const p=frame(d,s),arm=frame(d,s+direction*1.18);
    stem(p,[p,3.95],.080,0xc9c8ba);beam(P(p,3.63),P(arm,3.70),.045,0xb8b9b0);
    solid(frame(d-.22,s+direction*1.18),frame(d+.22,s+direction*1.18),3.71,.16,.30,0x8d918b);
  }
  // Walls carry real-world UVs. Using metre-based photographs of brick and
  // stone from our licensed surface library keeps the relief legible close up.
  function wall(a,b,lo,hi,mat,scale=1){
    const l=Math.hypot(b[0]-a[0],b[1]-a[1]),g=new THREE.BufferGeometry();
    const v=(p,y)=>[p[0],y,p[1]];
    g.setAttribute('position',new THREE.Float32BufferAttribute([v(a,lo),v(b,lo),v(a,hi),v(a,hi),v(b,lo),v(b,hi)].flat(),3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,l/scale,0,0,(hi-lo)/scale,0,(hi-lo)/scale,l/scale,0,l/scale,(hi-lo)/scale],2));g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;group(...a).add(m);
  }
  function sign(frame,d,s,width,height,y,draw){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=192;
    draw(canvas.getContext('2d'));
    const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;texture.anisotropy=4;
    const material=new THREE.MeshLambertMaterial({map:texture});
    material.addEventListener('dispose',()=>texture.dispose());
    const p=frame(d,s),front=frame(d-1,s);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
    mesh.position.set(p[0],y,p[1]);mesh.lookAt(front[0],y,front[1]);group(...p).add(mesh);
  }
  function shopFront(frame,d0,d1,s,y,h,spacing){
    solid(frame(d0,s),frame(d1,s),y+h*.5,h,.18,0x39494b);
    const bays=Math.ceil((d1-d0)/spacing);
    for(let i=0;i<bays;i++){
      const a=d0+(d1-d0)*i/bays,b=d0+(d1-d0)*(i+1)/bays;
      solid(frame(a+.12,s+.12),frame(b-.10,s+.12),y+h*.58,h*.69,.05,i%2?0x718783:0x5d7473);
      post(frame,a,s+.16,y+h,.057,0xa4aaa0);
    }
  }
  if(nearby.has(key(...shihjiaPoint(0,0)))){
    const f=shihjiaPoint;
    // West sidewalk, school driveway (OSM 381691225), then the brick edge of
    // the school grounds (94058607). Keep the gate and the walkway open.
    band(f,-51,24,2.1,16,.096,'plaza',1.65);
    band(f,24,36,1.6,17,.093,'aggregate',2.5);
    band(f,36,147,1.7,9.5,.098,'plaza',1.65);
    band(f,-45,23,9.6,32,.101,'grass');
    band(f,38,143,9.5,36,.101,'grass');
    for(const [a,b,side] of [[-49,13,9.4],[37,78,9.25],[78,123,9.4],[123,142,9.55]]){
      const h=a<0?.54:1.0;
      solid(f(a,side),f(b,side),h*.51,h,.32,a<0?0xa19c93:0x995c49);
      wall(f(a,side-.18),f(b,side-.18),.13,h+.01,materials.get(a<0?'aggregate':'masonry'),a<0?1.8:1.35);
      solid(f(a,side),f(b,side),h+.055,.11,.40,a<0?0xbcb7a9:0xab7460);
    }
    hedge(f,-45,11,10.2,2.6,1.14);
    for(const d of [-39,-23,-9,2,11,46,63,88,112,135])canopy(f,d,11.2+(d>40?2.8:0),7+1.1*Math.sin(d),4.8+.72*Math.cos(d));
    for(const d of [43,62,84,106,131])canopy(f,d,3.05,5.4+.6*Math.cos(d),2.75);
    for(const [a,b] of [[39,53],[59,74],[81,97],[103,121],[126,141]])hedge(f,a,b,2.34,1.25,.73);
    // Alternating tree/hedge groups on the divided boulevard clear both the
    // junction and the footway crossings. The median changes width to the south.
    for(const [a,b,side] of [[-83,29,-10.2],[-86,30,-40.4],[104,179,-28.7]]){
      band(f,a,b,side-1.15,side+1.15,.09,'grass');
      solid(f(a,side-1.14),f(b,side-1.14),.16,.16,.17,0xb2ada4);
      solid(f(a,side+1.14),f(b,side+1.14),.16,.16,.17,0xb2ada4);
      hedge(f,a+1,b-1,side,1.9,.76);
      for(let d=a+4;d<b-2;d+=13){
        if(side===-10.2&&d>-27)continue;
        canopy(f,d,side,6.6+1.1*Math.sin(d),3.6);
      }
    }
    for(const d of [-17,-7,7.5,15])lamp(f,d,5.55,-1);
    // The slow lane ends at a painted taper and stop line at Minquan Road.
    // Paint stays below ankle level and outside the guided footway.
    const paint=(a,b,w)=>solid(a,b,.096,.009,w,0xdad9ce);
    paint(f(29,-11.25),f(56,-8.0),.14);
    paint(f(29,-9.15),f(56,-8.0),.14);
    for(let d=30;d<53;d+=2.3){
      const t=(d-29)/27;
      paint(f(d,-11.15+3.2*t),f(d+.95*(1-t),-9.15+1.12*t),.21);
    }
    for(const d of [48.8,52.8])paint(f(d,-5.7),f(d,.95),.22);
    for(const s of [-5.7,.95])paint(f(48.8,s),f(52.8,s),.16);
    // Pale signal mast and the transverse green street-name plate face the
    // southeast-bound traffic. The cabinet and drain lie outside the walking line.
    const mast=f(28.5,-10.2);
    beam(P(mast,.13),P(mast,7.15),.145,0xcacac0);
    beam(P(mast,6.95),P(f(28.5,-5.5),6.58),.105,0xc8c8bc);
    solid(f(28.5,-7.7),f(28.5,-5.4),5.98,.52,.19,0x356c5d);
    solid(f(28.5,-7.6),f(28.5,-5.5),6.48,.48,.37,0x39443b);
    for(const side of [-7.15,-6.60,-6.05]){
      beam(P(f(28.48,side),6.49),P(f(28.26,side),6.49),.176,0x2d3931);
    }
    sign(f,28.38,-6.55,2.26,.49,5.98,c=>{
      c.fillStyle='#31614e';c.fillRect(0,0,640,192);c.strokeStyle='#d2d7c6';c.lineWidth=5;c.strokeRect(5,5,630,182);
      c.fillStyle='#eff1de';c.textAlign='center';c.font='bold 84px sans-serif';c.fillText('民 權 二 路',320,93);
      c.font='47px sans-serif';c.fillText('Minquan 2nd Rd.',320,156);
    });
    for(const [d,s] of [[26,2.5],[49,1.95],[121,1.97]]){
      solid(f(d,s),f(d+.58,s),.49,.85,.48,0x547560);
      solid(f(d-.03,s),f(d+.61,s),.94,.055,.53,0x667d6a);
    }
    for(let d=20;d<142;d+=12.7){
      solid(f(d,1.83),f(d+.52,1.83),.110,.017,.34,0x777b74);
      for(let j=0;j<5;j++)solid(f(d+.035+j*.10,1.72),f(d+.035+j*.10,1.94),.125,.013,.026,0x545950);
    }
    const trim=0xaaa89d;
    for(let d=10;d<22;d+=4.3){
      solid(f(d,3.6),f(d+3.5,3.6),.106,.025,.12,trim);
    }
    // Inlaid rectangular forecourt and tactile band at the station mouth.
    for(const [d,s,w,h] of [[12.4,3.8,4.5,4.3],[12.4,3.8,2.9,2.7]]){
      const colour=w>4?0x605e59:0xb09275;
      for(const ds of [-1,1])solid(f(d+ds*h/2,s-w/2),f(d+ds*h/2,s+w/2),.126,.026,.20,colour);
      for(const ss of [-1,1])solid(f(d-h/2,s+ss*w/2),f(d+h/2,s+ss*w/2),.126,.026,.20,colour);
    }
    solid(f(8.3,2),f(8.3,6.5),.127,.022,.48,0xc7a04c);
    for(const s of [2.9,4.25,7.45,8.75]){
      post(f,36.3,s,.65,.085,0xb7b7ae);beam(P(f(36.3,s),.36),P(f(36.3,s),.48),.089,0xce8244);
    }
    for(const [a,b] of [[-45,25],[36,143]])solid(f(a,1.46),f(b,1.46),.122,.08,.13,0xb46b62);
    // Guardhouse and school entrance facing the driveway.
    const guardA=f(16.85,10.1),guardB=f(23.85,11.0);
    solid(guardA,guardB,1.57,3.05,.34,0xc4c0ab);solid(guardA,guardB,.45,.70,.38,0x965944);
    solid(f(17.7,9.98),f(22.8,10.61),1.68,1.14,.08,0x63726b);
    for(const d of [18,19.3,20.65,22.1])post(f,d,10.0+.125*(d-18),2.27,.047,0xc8cbba);
    solid(f(16.45,9.64),f(24.3,10.65),3.18,.23,1.15,0xd4cfbf);
    for(const d of [24.8,36.2]){
      solid(f(d,9.4),f(d,11.0),1.47,2.8,.58,0xb6a392);
      solid(f(d,9.2),f(d,11.2),2.90,.18,.79,0xa88676);
    }
    // Shallow peaked brick panels and a school notice board follow the wall
    // behind the first bollards. Caps are interrupted at the panels.
    for(const d of [41,44,47,50]){
      const side=9.21;
      solid(f(d-.94,side),f(d+.94,side),.90,.47,.27,0x98654f);
      for(let k=-3;k<=3;k++){
        const h=.08*(4-Math.abs(k));
        solid(f(d+k*.26-.13,side),f(d+k*.26+.13,side),1.08+h*.5,h,.22,0x9a6a53);
      }
      beam(P(f(d-1.0,side),1.09),P(f(d,side),1.42),.085,0xb08263);
      beam(P(f(d,side),1.42),P(f(d+1.0,side),1.09),.085,0xb08263);
      post(f,d+1.05,side,1.13,.108,0xac785c);
    }
    for(const d of [54.5,58.8]){
      solid(f(d,9.13),f(d+3.8,9.13),.93,.71,.14,0x8b9992);
      solid(f(d+.08,9.04),f(d+3.70,9.04),.94,.58,.04,0xb5c4b5);
    }
    // The office block across the intersection has an identifiable horizontally
    // banded plinth below its fine glass fins. Keep the recorded 135 m height.
    const tower=streets.buildings.find(([,p])=>p[0].map(Math.round).join()===shihjiaTowerKey);
    if(tower){
      const ring=tower[1],poly=ring.slice(0,-1),cx=poly.reduce((n,p)=>n+p[0]/poly.length,0),cz=poly.reduce((n,p)=>n+p[1]/poly.length,0);
      const expanded=poly;
      const top=new THREE.BufferGeometry(),indices=THREE.ShapeUtils.triangulateShape(poly.map(p=>new THREE.Vector2(...p)),[]);
      top.setAttribute('position',new THREE.Float32BufferAttribute(poly.flatMap(p=>[p[0],tower[0],p[1]]),3));
      top.setIndex(indices.flat());top.computeVertexNormals();
      group(cx,cz).add(new THREE.Mesh(top,new THREE.MeshLambertMaterial({color:0x989f98,side:THREE.DoubleSide})));
      const mat=new THREE.MeshLambertMaterial({color:tint(0x738889),side:THREE.DoubleSide});
      mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 towerUV;').replace('#include <color_fragment>',`#include <color_fragment>
        float y=towerUV.y,u=towerUV.x;
        float horizontal=fract(y/3.56);
        float pane=.54+.15*sin(u*.095+y*.017)+.14*sin(u*.36);
        vec3 glass=vec3(.28,.37,.38)*pane+vec3(.09,.12,.14)*smoothstep(12.,110.,y);
        float mullion=step(.956,fract(u/1.45));
        vec3 lower=mix(vec3(.42,.37,.30),vec3(.14,.17,.17),step(.52,horizontal));
        if(y<5.)lower=mix(vec3(.15,.24,.25),vec3(.52,.50,.43),step(.85,fract(u/5.5)));
        diffuseColor.rgb=y<36.?lower:mix(glass,vec3(.49,.53,.50),max(mullion*.68,step(.925,horizontal)));
      `);shader.vertexShader='varying vec2 towerUV;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntowerUV=uv;');};
      for(let i=0;i<expanded.length;i++){
        const a=expanded[i],b=expanded[(i+1)%expanded.length];wall(a,b,.14,135,mat);
        if(Math.hypot(b[0]-a[0],b[1]-a[1])>40){
          const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];solid(a,mid,36.2,.5,.86,0xbfc3b8);
          for(const t of [.47,.49,.51,.53]){const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];beam(P(p,36),P(p,135),.20,0x7d8b87);}
        }
      }
    }
  }
  if(nearby.has(key(...boaiOrigin))){
    const f=(d,s)=>[boaiOrigin[0]+s+.144*d,boaiOrigin[1]+d-.144*s];
    // Longde Road junction. Street View shows a low shop with an open plant
    // display on the southwest corner and a curved billboard opposite.
    band(f,-66,-10,-17,-1,.088,'plaza');band(f,12,98,-14,-1.5,.088,'plaza');
    // Road centerlines alone leave open ground on either side of this wide
    // junction. The existing mapped zebra stripes are at 0.084 m.
    band(f,-10.1,12.1,-38,1.8,.075,'aggregate',3.8);
    band(f,-62,96,-1.5,7.5,.076,'aggregate',3.8);
    // Fan out the corner pavement to meet the actual pedestrian crossings.
    for(const [d,sign] of [[-10,-1],[12,1]]){
      for(let i=0;i<9;i++){
        const a=i*Math.PI/18,b=(i+1)*Math.PI/18;
        const p=f(d+sign*4.5,-5.9);
        const edge=t=>f(d+sign*4.5*(1-Math.cos(t)),-5.9+4.4*Math.sin(t));
        quad('plaza',.088,p,edge(a),p,edge(b),.2,.2,1.,1.);
        solid(edge(a),edge(b),.108,.048,.14,0xb4796e);
      }
    }
    band(f,12,97,-2.6,-1.5,.101,'aggregate');
    for(let d=16;d<53;d+=9.5){canopy(f,d,-2.05,5.3,2.5);}
    for(let d=-57;d<-13;d+=12)canopy(f,d,-3.3,5.65,2.95);
    solid(f(12,-8.7),f(37,-8.7),3.1,6,.35,0xc5bfa7);
    solid(f(12,-8.8),f(12,-24),3.0,5.8,.35,0xc8c1b0);
    shopFront(f,13.1,34.5,-8.5,.35,3.0,2.65);
    solid(f(13,-8.0),f(34.5,-8.0),3.35,.20,1.9,0x979b91);
    for(let j=0;j<7;j++){
      const s=-9.5-j*1.9;
      solid(f(12.14,s),f(12.14,s-1.7),1.75,2.95,.28,0x47524e);
    }
    solid(f(10.98,-9.3),f(10.98,-23.8),3.25,.27,2.35,0x919184);
    solid(f(11.4,-9),f(11.4,-23.8),5.55,2.6,.12,0x706358);
    sign(f,11.30,-16.4,14.6,2.54,5.55,c=>{
      c.fillStyle='#56464a';c.fillRect(0,0,640,192);
      c.textAlign='center';c.fillStyle='#dbc8a5';c.font='bold 89px serif';c.fillText('園　藝',320,117);
      c.fillStyle='#bfad90';c.fillRect(166,140,308,3);
      for(const x of [68,572]){
        c.save();c.translate(x,97);
        for(let j=0;j<6;j++){c.rotate(Math.PI/3);c.fillStyle=j%2?'#a97b76':'#b08e76';c.beginPath();c.ellipse(0,24,9,21,0,0,2*Math.PI);c.fill();}
        c.restore();
      }
    });
    for(let s=-23;s<-9;s+=.34)solid(f(10.02,s),f(12.0,s),3.42,.052,.065,0xb0b0a2);
    for(const s of [-9.1,-23.7])post(f,11.6,s,7.45,.061,0x5b605c);
    for(let i=0;i<15;i++){
      const s=-9.0-(i%8)*1.72,d=10.1-Math.floor(i/8)*.95,h=.49+.53*Math.abs(Math.sin(i*7));
      beam(P(f(d,s),.16),P(f(d,s),.44),.19,i%2?0x9c6145:0x605f54);crown(f(d,s),h*.65+.32,1.05,h,d+s,0xa1bc85);
    }
    const corner=[];for(let i=0;i<=12;i++){
      const a=i*Math.PI/24;corner.push(f(-19+8*Math.sin(a),-16+8*Math.cos(a)));
    }
    for(let i=1;i<corner.length;i++){
      const a=corner[i-1],b=corner[i];solid(a,b,1.59,3.04,.24,0x43525a);solid(a,b,3.79,1.49,.44,0x999999);solid(a,b,6.1,3.15,.30,0xa44d40);solid(a,b,4.42,.18,.48,0xc3b5a6);
      if(i%3===1){beam(P(a,.13),P(a,4.42),.16,0x545753);solid(a,b,7.68,.12,.36,0x64635d);}
    }
    for(const s of [-2.9,-4.1])post(f,11.5,s,.78,.095,0x969687);
    for(const d of [-10.3,11.4])solid(f(d,-11.0),f(d,-6.0),.108,.04,.16,0xab6258);
  }
  if(nearby.has(key(...minshengCorner))){
    // Minsheng 2nd Road, westbound. A service lane separates the arcade
    // from the planted island. Leave the perpendicular crossing open.
    const h=252*Math.PI/180;
    const f=(d,r)=>[minshengCorner[0]+d*Math.sin(h)+r*Math.cos(h),minshengCorner[1]-d*Math.cos(h)+r*Math.sin(h)];
    band(f,11,53,.5,6.4,.095,'grass',2.3);
    for(const side of [.5,6.4])solid(f(11,side),f(53,side),.147,.19,.18,0x9d9a8d);
    for(let i=0;i<10;i++)solid(f(11,.5+i*.59),f(11,.5+(i+1)*.59),.156,.23,.22,i%2?0xc49b4d:0x433f39);
    for(const d of [15,27,43])canopy(f,d,3.5,6.5+(d%4)*.18,3.55);
    for(const d of [22,38])for(let j=0;j<3;j++)
      solid(f(d-.85,4.5+j*.14),f(d+.85,4.5+j*.14),.54,.085,.12,0x807b61);
    // Extend the north-facing shop arcade from the mapped building edges.
    const edges=[[[175.3,-1525.8],[154.8,-1518.4]],[[154.8,-1518.4],[130.2,-1509.6]]];
    for(const [a,b] of edges){
      const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.round(len/4.9);
      const loc=(t,depth)=>[a[0]+dx*t-dz*depth/len,a[1]+dz*t+dx*depth/len];
      solid(loc(0,1.22),loc(1,1.22),3.50,.46,2.6,0xb4a796);
      for(let i=0;i<n;i++){
        const t=(i+.08)/n,p=loc(t,2.25);
        solid(loc(t-.012,2.25),loc(t+.012,2.25),1.72,3.4,.52,0xb2a48c);
        wall(loc((i+.14)/n,.10),loc((i+.94)/n,.10),.15,3.18,materials.get('aggregate'),1.8);
        solid(loc((i+.19)/n,.13),loc((i+.89)/n,.13),1.72,2.63,.12,0x465754);
        beam(P(p,.1),P(p,.54),.32,0x958875);
      }
    }
  }
  if(nearby.has(key(...gardenOrigin))){
    const angle=153*Math.PI/180,f=(d,s)=>[gardenOrigin[0]+Math.sin(angle)*d-Math.cos(angle)*s,gardenOrigin[1]-Math.cos(angle)*d-Math.sin(angle)*s];
    // The park panorama looks across low, interlocking concrete planting beds.
    for(const [a,b,s] of [[-6,3,-3.6],[2,10,-5.55],[8,16,-7.45],[12,18,-9.05]]){
      solid(f(a,s),f(b,s),.42,.32,.32,0x9c9d90);solid(f(b,s),f(b,s-1.65),.42,.32,.32,0x999a90);
      hedge(f,a+.6,b-.6,s+.85,2.55,1.26);
    }
    for(let i=0;i<12;i++){const d=-12+i*4.6;hedge(f,d,d+2.5,5.0+.8*Math.sin(i),2.5,.96+.42*Math.cos(i));}
    for(const [d,s] of [[2,11],[22,15],[-7,-15],[18,-18],[32,-8]])canopy(f,d,s,7.3,4.7);
  }
}

