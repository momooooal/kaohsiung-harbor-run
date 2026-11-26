import {shorePath} from './shore-paths.js';
import {stationExitById} from '../data/station-exits.js';
import {clipStationGround} from './station-entrance.js';
import {stationPrecincts,hasStationPrecinct} from './station-precincts.js';
import streets from '../data/route-streets.js';
import {surfaceTexture} from './daylight.js';

// Select the surveyed polylines by their first map vertex. Cross sections
// interpret the dated ground-level references listed in DATA-SOURCES.md.
const sites=[
  {kind:'coralApron',anchor:[331.6,-898.3],span:[5,10]},
  {kind:'wharfTurn',anchor:[164.9,-356.7],span:[0,3]},
  {kind:'wharf',anchor:[164.9,-356.7],span:[2,5]},
  {kind:'terminalSide',anchor:[685.6,-5.5],span:[0,3]},
  {kind:'riverLawn',anchor:[1450.4,-4681.9],span:[15,21]},
  {kind:'park',anchor:[749.8,669.9]},
  {kind:'hedongStreet',anchor:[-104.7,-1885.8],span:[0,7],reverse:true},
  {kind:'quay',anchor:[-124.2,-1853.6],reverse:true,fromZ:-1390,toZ:-1685},
  {kind:'pier',anchor:[-558.6,-933.2],reverse:true}
];
function alignment(line){
  const cumulative=[0],dirs=[];
  for(let i=1;i<line.length;i++){
    const dx=line[i][0]-line[i-1][0],dz=line[i][1]-line[i-1][1],length=Math.hypot(dx,dz);
    dirs.push([dx/length,dz/length]);cumulative.push(cumulative[i-1]+length);
  }
  const normals=line.map((p,i)=>{
    const a=dirs[Math.max(0,i-1)],b=dirs[Math.min(dirs.length-1,i)];
    const x=-a[1]-b[1],z=a[0]+b[0],scale=Math.max(.6,x*(-b[1])+z*b[0]);
    return [x/scale,z/scale];
  });
  function at(d,side=0){
    let i=0;while(i<dirs.length-1&&cumulative[i+1]<d)i++;
    const t=THREE.MathUtils.clamp((d-cumulative[i])/(cumulative[i+1]-cumulative[i]),0,1);
    return [0,1].map(k=>THREE.MathUtils.lerp(line[i][k]+side*normals[i][k],line[i+1][k]+side*normals[i+1][k],t));
  }
  return {at,cumulative,length:cumulative.at(-1)};
}

export function waterfrontWalks({nearby,key,group,panel,beam,P,tree}){
  const paths=sites.flatMap(site=>{
    const feature=streets.roads.find(r=>r[4][0][0]===site.anchor[0]&&r[4][0][1]===site.anchor[1]);
    if(!feature)return [];
    const segment=site.span?feature[4].slice(...site.span):feature[4];
    const path=segment.filter(p=>site.fromZ===undefined||(p[1]<=site.fromZ&&p[1]>=site.toZ));
    if(!path.some(p=>nearby.has(key(...p))))return [];
    return [{site,line:site.reverse?path.reverse():path}];
  });
  const precinct=hasStationPrecinct(nearby,key);
  if(!paths.length&&!precinct)return ()=>{};
  const textures=[],materials=new Map(),meshes=[];
  function surface(name,file,tint){
    const map=surfaceTexture(file);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;textures.push(map);
    materials.set(name,new THREE.MeshLambertMaterial({map,color:new THREE.Color(tint).convertSRGBToLinear(),side:THREE.DoubleSide}));
  }
  surface('grass','aerial_grass_rock.jpg',0xcad5ad);surface('stone','concrete_pavement_02.jpg',0xd4d2c7);
  surface('timber','wood_planks_grey.jpg',0xbda284);surface('brick','herringbone_pavement.jpg',0xe5a188);
  materials.get('timber').map.rotation=Math.PI/2;
  for(const [name,rgb,strength] of [['grass','vec3(.097,.185,.051)',.56],['brick','vec3(.43,.235,.147)',.51],['timber','vec3(.28,.216,.157)',.42]]){
    const mat=materials.get(name);
    mat.customProgramCacheKey=()=>name;
    mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
      '#include <map_fragment>\nfloat grain=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb=mix(diffuseColor.rgb,'+rgb+'*(.63+grain*1.6),'+strength+');');};
  }
  const shade=document.createElement('canvas');shade.width=shade.height=128;
  const ctx=shade.getContext('2d'),grad=ctx.createRadialGradient(64,62,4,64,64,61);
  grad.addColorStop(0,'rgba(21,29,20,.62)');grad.addColorStop(.68,'rgba(22,29,20,.47)');grad.addColorStop(1,'rgba(20,25,18,0)');
  ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
  ctx.globalCompositeOperation='destination-out';
  let seed=731;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<450;i++){
    ctx.fillStyle='rgba(0,0,0,'+(.16+random()*.43)+')';ctx.beginPath();ctx.ellipse(random()*128,random()*128,1+random()*3,1+random()*1.8,random()*3,0,Math.PI*2);ctx.fill();
  }
  const shadowTex=new THREE.CanvasTexture(shade);textures.push(shadowTex);
  materials.set('shade',new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));
  if(precinct){
    surface('plaza','concrete_pavement_02.jpg',0xcfc8b8);
    surface('aggregate','asphalt_02.jpg',0xcccdc9);
    surface('masonry','brick_wall_001.jpg',0xc99c87);
    materials.get('plaza').onBeforeCompile=s=>{
      s.vertexShader='varying vec2 forecourt;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nforecourt=position.xz;');
      s.fragmentShader='varying vec2 forecourt;\n'+s.fragmentShader;
      clipStationGround(s,[stationExitById.get('R7-1')],'forecourt');
      s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec2 joints=abs(fract(vUv*vec2(3.,4.5))-.5);
        float gap=smoothstep(.465,.5,max(joints.x,joints.y));
        float stone=dot(diffuseColor.rgb,vec3(.30,.59,.11));
        diffuseColor.rgb=vec3(.79,.81,.80)*(.13+.60*stone)*(1.-.24*gap);`);
    };
  }
  if(paths.some(({site})=>site.kind==='wharf')){
    surface('quayPaving','concrete_pavement_02.jpg',0xc2c3c0);
    materials.get('quayPaving').onBeforeCompile=s=>{
      s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        float grain=dot(diffuseColor.rgb,vec3(.30,.59,.11));
        vec2 grid=vUv;grid.x+=.5*mod(floor(grid.y),2.);
        vec2 joint=abs(fract(grid)-.5);float stone=fract(sin(dot(floor(grid),vec2(17.91,63.02)))*8761.);
        diffuseColor.rgb=vec3(.235,.244,.24)*(.56+1.45*grain+stone*.24)*(1.-.23*smoothstep(.475,.495,max(joint.x,joint.y)));`);
    };
  }
  if(paths.some(({site})=>['riverLawn','wharfTurn','hedongStreet'].includes(site.kind)))surface('asphalt','concrete_pavement_02.jpg',0x606363);
  if(paths.some(({site})=>site.kind==='coralApron')){
    surface('hex','concrete_pavement_02.jpg',0xc4c0b0);
    materials.get('hex').onBeforeCompile=s=>{
      s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec2 p=vUv*7.,cell=vec2(1.,1.73205);
        vec2 a=mod(p,cell)-cell*.5,b=mod(p-cell*.5,cell)-cell*.5;
        vec2 nearest=abs(dot(a,a)<dot(b,b)?a:b);
        float edge=max(nearest.x,dot(nearest,vec2(.5,.866025)));
        diffuseColor.rgb*=1.-.30*smoothstep(.46,.50,edge);`);
    };
  }
  const batches=new Map(),crownCells=new Map(),dummy=new THREE.Object3D();
  const crownGeometry=new THREE.PlaneGeometry(1,1);
  const leaf=surfaceTexture('tree.png');textures.push(leaf);
  const crownMaterial=new THREE.MeshBasicMaterial({map:leaf,side:THREE.DoubleSide,alphaTest:.38,transparent:true});
  crownMaterial.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 leafUV;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nleafUV=uv;vUv.y=.42+.57*vUv.y;');
    shader.fragmentShader='varying vec2 leafUV;\n'+shader.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
      vec2 l=(leafUV-.5)*2.;
      float edge=dot(l,l)+.065*sin(17.*l.x+4.*l.y)+.09*cos(11.*l.y-5.*l.x);
      if(edge>.87+.12*sin(38.*l.x)*cos(32.*l.y))discard;
      diffuseColor.rgb*=.82+.18*leafUV.y;`);
  };
  function crown(p,y,w,h,angle,tint){
    const id=key(...p);if(!crownCells.has(id))crownCells.set(id,{at:p,rows:[]});
    for(let i=0;i<3;i++){
      dummy.position.set(p[0],y,p[1]);dummy.rotation.set(0,angle+i*Math.PI/3,0);dummy.scale.set(w,h,1);dummy.updateMatrix();
      crownCells.get(id).rows.push([dummy.matrix.clone(),tint]);
    }
  }
  function quad(name,height,a,b,c,d,u0,v0,u1,v1){
    const id=key(a[0],a[1])+name;
    if(!batches.has(id))batches.set(id,{name,at:a,pos:[],uv:[]});
    const batch=batches.get(id);
    for(const p of [a,c,b,b,c,d])batch.pos.push(p[0],height,p[1]);
    batch.uv.push(u0,v0,u0,v1,u1,v0,u1,v0,u0,v1,u1,v1);
  }
  if(precinct)stationPrecincts({nearby,key,quad,crown,group,panel,beam,P,materials});
  for(const {site,line} of paths){
    const {at,cumulative,length}=alignment(line);
    function band(name,left,right,h,tileAcross,tileAlong){
      for(let i=1;i<cumulative.length;i++){
        const a=cumulative[i-1],b=cumulative[i];
        const l=typeof left==='function'?left(a):left,r=typeof left==='function'?left(b):left;
        quad(name,h,at(a,l),at(a,right),at(b,r),at(b,right),0,a/tileAlong,(right-(l+r)/2)/tileAcross,b/tileAlong);
      }
    }
    function bench(d,side){
        for(let i=-1;i<=1;i++)panel(at(d-1,side+i*.14),at(d+1,side+i*.14),.54,.085,.126,0x8b7560);
      for(const t of [d-.72,d+.72])panel(at(t,side-.19),at(t,side+.19),.27,.44,.22,0xaba69c);
    }
    function planting(d,side,scale,width){
      const p=at(d,side),seed=Math.abs(Math.sin(d*8+side));
      if(scale<.8){
        for(let j=0;j<3;j++)crown(at(d+j*.8-.8,side+.48*Math.cos(j+d)),.56*scale*2.5,3.1*scale*width,2.45*scale,d+j,j%2?0xcedda3:0xa8ba8d);
      }else if(seed>.68){
        tree(...p,scale,width);
      }else{
        const fork=at(d-.24,side-.33),height=(6.4+1.2*seed)*scale;
        beam(P(p,.1),P(fork,height*.47),.18*scale,0x746d56);
        for(let j=0;j<5;j++){
          const angle=j*2.4+d,r=(1.15+seed)*width;
          const tip=at(d+r*Math.cos(angle),side+r*Math.sin(angle));
          const y=height*(.69+.11*Math.cos(angle));
          beam(P(fork,height*.42),P(tip,y),.088*scale,0x7f755d);
          crown(tip,y+(j%2)*.4,4*scale,3.25*scale,angle,j%2?0xc1d3aa:0xccd9b0);
        }
        crown(fork,height*.91,4.35*scale,3.6*scale,d,0xd5dfb3);
      }
      const r=scale*3.9,sx=p[0]-scale*3.3,sz=p[1]+scale*2.4;
      quad('shade',.118,[sx-r*1.3,sz-r],[sx+r*1.6,sz-r],[sx-r*1.3,sz+1.25*r],[sx+r*1.6,sz+1.25*r],0,0,1,1);
    }
    if(['wharf','wharfTurn','coralApron','riverLawn','terminalSide'].includes(site.kind)){
      shorePath(site.kind,{length,at,band,panel,beam,P,planting,bench,cumulative});
    }else if(site.kind==='park'){
      band('grass',-15,22,-.038,3.2,3.2);band('stone',-2.25,2.25,.090,2.1,2.1);
      for(let d=7;d<length-5;d+=9.7){
        planting(d,4.8+Math.sin(d)*1.6,1.0+.14*Math.cos(d),1.35);
        planting(d+3,11+3*Math.sin(d),1.07,1.45);
        planting(d,-6+Math.cos(d),.42+.20*Math.abs(Math.sin(d)),1.6);
        if(Math.sin(d)>.05)planting(d+2,-11,.9,1.4);
      }
      for(let d=31;d<length-12;d+=35){bench(d,-2.9);bench(d+9,3.0);}
      for(let d=22;d<length-5;d+=29){
        const base=at(d,3.4),fork=P(base,3.4);
        beam(P(base,.08),fork,.067,0xa9aaa1);
        for(const s of [-1,1])beam(fork,P(at(d+s*.48,3.4),4.12),.043,0xb6b8b3);
        panel(at(d-.48,3.4),at(d+.48,3.4),4.12,.07,.10,0xe0dfcd);
      }
    }else if(site.kind==='hedongStreet'){
      band('asphalt',-4.8,4.8,.122,4,4);
      band('stone',4.8,7.6,.133,1.4,1.6);
      for(let d=4;d<length-5;d+=9){
        panel(at(d,0),at(d+3,0),.143,.012,.095,0xd7b660);
        panel(at(d,3.62),at(d+8.9,3.62),.143,.012,.09,0xe4e2d6);
      }
      for(let d=12;d<length-8;d+=16){
        planting(d,6.85,1.02,1.22);
        const a=at(d+2,7.85),b=at(d+11,7.85);
        for(const h of [.21,1.02])beam(P(a,h),P(b,h),.043,0xbac2c3);
        for(let t=2;t<=11;t+=.34){const q=at(d+t,7.85);beam(P(q,.17),P(q,1.03),.024,0xacb6b6);}
      }
    }else if(site.kind==='quay'){
      band('timber',-5.4,2.3,.092,2.15,2.15);band('stone',2.3,12,.093,2.4,2.4);
      for(let i=1;i<cumulative.length;i++){
        const a=cumulative[i-1],b=cumulative[i];
        panel(at(a,-5.5),at(b,-5.5),-.1,.45,.22,0x938982);
        for(const h of [.43,.76,1.12])beam(P(at(a,-5.45),h),P(at(b,-5.45),h),h>1?.051:.019,0xb6bec1);
      }
      for(let d=.2;d<length;d+=2.25){const p=at(d,-5.45);beam(P(p,.09),P(p,1.12),.044,0x7d8787);}
      // Keep the shore-facing landing open at the mapped transverse footpath.
      const landing=line.findIndex(p=>Math.abs(p[0]-15.4)<.2);
      if(landing>=0){
        const along=cumulative[landing];
        // Low riverside pavilion seen from the road, leaving the deck clear.
        const center=along+20;
        panel(at(center-7,8.6),at(center+7,8.6),1.67,3.0,4.1,0xe3dfd3);
        panel(at(center-7.4,8.6),at(center+7.4,8.6),3.26,.24,4.6,0xd6d1bd);
        for(let t=-6;t<=6;t+=1.6){
          panel(at(center+t,6.49),at(center+t+1,6.49),2.31,.54,.05,0x4c5859);
          const post=at(center+t,6.46);beam(P(post,3.35),P(post,4.24),.032,0x9da8a7);
        }
        for(const y of [3.80,4.24])beam(P(at(center-7,6.46),y),P(at(center+7,6.46),y),.034,0xaeb8b6);
        for(const d of [along-5.2,along+5.2]){
          const p=at(d,2.6);beam(P(p,.14),P(p,.73),.093,0x797c75);
          beam(P(p,.72),P(p,.88),.14,0xb4b5aa,.20);
        }
        for(let d=along-7;d<=along+7;d+=2.8)panel(at(d,2.4),at(d+2.72,2.4),.157,.09,.23,0xa8a69b);
      }
      for(let d=5;d<length-4;d+=9.4){
        planting(d,4.3,1.25,1.5);panel(at(d-1.3,4.4),at(d+1.3,4.4),.29,.39,1.65,0xaba99a);
        for(let j=-1;j<=1;j++)crown(at(d+j*.74,4.4),.72,1.4,.83,d+j,0xacc095);
        if(Math.sin(d)>.15)bench(d+3.5,3.2);
      }
    }else{
      // The brick apron fills the space up to the warehouse forecourts.
      band('brick',-4.5,7.4,.097,2.8,2.8);
      // The old masonry boundary and free-standing steel frame are visible
      // in the January 2020 panorama. Keep the mapped crossing clear.
      const mastNode=line.findIndex(p=>Math.abs(p[0]+431.9)<.2);
      if(mastNode>=0){
        const d=cumulative[mastNode]+5;
        for(let j=-3;j<=3;j++){
          const a=d+j*3.4,b=a+3.34;
          panel(at(a,-6.8),at(b,-6.8),2.03,3.84,.38,j%3?0xb0aa9e:0xa69f93);
          panel(at(a,-6.68),at(b,-6.68),.35,.40,.37,0x928c7d);
          panel(at(a,-6.8),at(b,-6.8),4.0,.14,.51,0x918c7d);
          beam(P(at(a,-6.8),4.04),P(at(a,-6.8),4.65),.035,0x5d6057);
          beam(P(at(a,-6.8),4.64),P(at(b+.06,-6.8),4.64),.026,0x5e6258);
        }
        const center=-2.35;
        const corner=(sign,side,h)=>at(d+sign*(.45-h*.029),center+side*(.34-h*.021));
        for(const sign of [-1,1])for(const side of [-1,1]){
          beam(P(corner(sign,side,.13),.13),P(corner(sign,side,8),8),.069,0x49463c);
          for(let j=0;j<5;j++){const h=.73+j*1.38;
            beam(P(corner(sign,side,h),h),P(corner(-sign,side,h),h),.042,0x5d5848);
            if(side===1)beam(P(corner(sign,side,h),h),P(corner(-sign,side,h+1.25),h+1.25),.027,0x635e50);
          }
        }
        for(const side of [-1,1]){
          panel(at(d-1.05,center+side*.59),at(d+1.05,center+side*.59),.18,.19,.32,0xa6a094);
          for(const y of [.45,.84])for(let j=0;j<7;j++)
            panel(at(d-1.03+j*.29,center+side*.6),at(d-.74+j*.29,center+side*.6),y,.15,.12,j%2?0xc9a447:0x44433a);
          for(const sign of [-1,1])beam(P(at(d+sign*.98,center+side*.60),.17),P(at(d+sign*.98,center+side*.60),.94),.061,0x736e59);
        }
      }
      // Drain covers and a cross-street threshold at the end of the brick apron.
      for(let d=11;d<length-5;d+=14){
        panel(at(d-.43,5.76),at(d+.43,5.76),.106,.014,.27,0x656257);
        for(let j=0;j<6;j++)panel(at(d-.34+j*.13,5.76),at(d-.30+j*.13,5.76),.119,.012,.20,0x47473e);
      }
    }
  }
  for(const c of crownCells.values()){
    const mesh=new THREE.InstancedMesh(crownGeometry,crownMaterial,c.rows.length),color=new THREE.Color();
    c.rows.forEach(([matrix,tint],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,color.setHex(tint).convertSRGBToLinear());});
    mesh.frustumCulled=false;group(...c.at).add(mesh);meshes.push(mesh);
  }
  for(const b of batches.values()){
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.computeVertexNormals();
    const m=new THREE.Mesh(g,materials.get(b.name));m.receiveShadow=b.name!=='shade';group(...b.at).add(m);meshes.push(m);
  }
  return ()=>{for(const m of meshes){m.parent?.remove(m);if(!m.isInstancedMesh)m.geometry.dispose();else m.dispose?.();}crownGeometry.dispose();crownMaterial.dispose();for(const m of materials.values())m.dispose();for(const t of textures)t.dispose();};
}
