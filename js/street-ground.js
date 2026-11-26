import streets from '../data/route-streets.js';
import {surfaceTexture} from './daylight.js';

// Road edges meet at their bisectors. Vertices carry world-metre UVs so pavement
// does not stretch at long segments. Existing detailed street surfaces sit above.
export function streetGround(parent,points){
  const batches=new Map(),textures=[],materials=new Map(),near=new Set();
  const key=(x,z)=>Math.floor(x/125)+','+Math.floor(z/125);
  for(const p of points)for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)near.add(key(p.x+125*i,p.z+125*j));
  function finish(name,file,color){
    let map=null;if(file){map=surfaceTexture(file);map.wrapS=map.wrapT=THREE.RepeatWrapping;textures.push(map);}
    materials.set(name,new THREE.MeshLambertMaterial({map,color:new THREE.Color(color).convertSRGBToLinear(),side:THREE.DoubleSide}));
  }
  finish('road','asphalt_02.jpg',0xc2c4bf);finish('path','concrete_pavement_02.jpg',0xd3c8b8);
  finish('brick','herringbone_pavement.jpg',0xd5b39c);finish('line',null,0xe7e1cb);
  finish('wood','wood_planks_grey.jpg',0xb4aaa0);
  finish('grass','aerial_grass_rock.jpg',0xbdc99d);
  finish('gravel','aerial_grass_rock.jpg',0xaca99d);
  finish('slabs','concrete_pavement_02.jpg',0xc3c0b9);
  const surfaceType={asphalt:'road',wood:'wood',grass:'grass',grass_paver:'grass',fine_gravel:'gravel',paving_stones:'brick','concrete:plates':'slabs',concrete:'slabs',stepping_stones:'slabs'};
  function quad(a,b,c,d,h,type){
    const x=(a[0]+d[0])/2,z=(a[1]+d[1])/2,cell=key(x,z);if(!near.has(cell))return;
    const id=cell+type;if(!batches.has(id))batches.set(id,{x,z,type,pos:[],uv:[]});
    const batch=batches.get(id);
    for(const p of [a,c,b,b,c,d]){batch.pos.push(p[0],h,p[1]);batch.uv.push(p[0]*.20,p[1]*.20);}
  }
  function normal(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],k=1/(Math.hypot(dx,dz)||1);return [-dz*k,dx*k];}
  function strip(line,width,type,h,lanes=0){
    let prev=null,traveled=0;
    for(let i=0;i<line.length;i++){
      const p=line[i],a=normal(line[Math.max(0,i-1)],line[i||1]),b=normal(line[i===line.length-1?i-1:i],line[Math.min(line.length-1,i+1)]);
      const nx=a[0]+b[0],nz=a[1]+b[1],k=width*.5/Math.max(.75,nx*b[0]+nz*b[1]);
      const sides=[[p[0]-nx*k,p[1]-nz*k],[p[0]+nx*k,p[1]+nz*k]];
      if(prev){quad(...prev,...sides,h,type);
        const start=line[i-1],dx=p[0]-start[0],dz=p[1]-start[1],len=Math.hypot(dx,dz);
        if(lanes>=2&&len>.1){
          const point=(d,s)=>[start[0]+dx*d/len+a[0]*s,start[1]+dz*d/len+a[1]*s];
          for(let lane=1;lane<lanes;lane++){
            const offset=width*(lane/lanes-.5);
            for(let t=-(traveled%9);t<len;t+=9){const from=Math.max(0,t),to=Math.min(len,t+3);if(to>from)quad(point(from,offset-.06),point(from,offset+.06),point(to,offset-.06),point(to,offset+.06),.061,'line');}
          }
        }
        traveled+=len;
      }
      prev=sides;
    }
  }
  for(const [kind,w,n,s,p] of streets.roads)strip(p,w,surfaceType[s]||(kind==='road'?'road':'path'),kind==='road'?.050:.069,n);
  for(const line of streets.crossings)for(let i=1;i<line.length;i++){
    const a=line[i-1],b=line[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=normal(a,b);
    const p=(t,s)=>[a[0]+(b[0]-a[0])*t/len+n[0]*s,a[1]+(b[1]-a[1])*t/len+n[1]*s];
    for(let j=.25;j+.47<len;j+=1.05)quad(p(j,-1.5),p(j,1.5),p(j+.47,-1.5),p(j+.47,1.5),.084,'line');
  }
  const objects=[];
  for(const batch of batches.values()){
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(batch.pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(batch.uv,2));geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,materials.get(batch.type));mesh.receiveShadow=true;parent.add(mesh);objects.push([mesh,batch.x,batch.z]);
  }
  return {update(p){for(const [m,x,z] of objects)m.visible=Math.hypot(p.x-x,p.z-z)<390;},dispose(){for(const [m] of objects)m.geometry.dispose();for(const m of materials.values())m.dispose();for(const t of textures)t.dispose();}};
}
