// Broad phase restricted to the playable corridor. Large merged street meshes
// get triangle-level cells; instanced street furniture keeps its local bounds.
export function corridorCollisions(points) {
  const size=12, allowed=new Set(), cells=new Map();
  const key=(x,z)=>x+','+z,cell=n=>Math.floor(n/size);
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(a.distanceTo(b)/6));
    for(let j=0;j<=steps;j++){const x=cell(THREE.MathUtils.lerp(a.x,b.x,j/steps)),z=cell(THREE.MathUtils.lerp(a.z,b.z,j/steps));
      for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)allowed.add(key(x+dx,z+dz));}
  }
  function register(bounds,make){
    if(bounds.max.y<.22||bounds.min.y>5)return;
    let record;
    for(let x=cell(bounds.min.x);x<=cell(bounds.max.x);x++)for(let z=cell(bounds.min.z);z<=cell(bounds.max.z);z++){
      const id=key(x,z);if(!allowed.has(id))continue;
      if(!record)record=make();
      if(!cells.has(id))cells.set(id,[]);cells.get(id).push(record);
    }
  }
  const bounds=new THREE.Box3(), matrix=new THREE.Matrix4(), source=new THREE.Matrix4();
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  function add(group){
    group.updateMatrixWorld(true);
    group.traverse(obj=>{
      if(!obj.isMesh||obj.material?.transparent||obj.material?.fog===false||obj.material?.isShaderMaterial)return;
      const g=obj.geometry;
      if(!g.boundingBox)g.computeBoundingBox();
      if(obj.isInstancedMesh){
        for(let i=0;i<obj.count;i++){
          obj.getMatrixAt(i,source);matrix.multiplyMatrices(obj.matrixWorld,source);
          bounds.copy(g.boundingBox).applyMatrix4(matrix);
          if(bounds.max.y-bounds.min.y<.045||bounds.max.x-bounds.min.x<.04&&bounds.max.z-bounds.min.z<.04)continue;
          register(bounds,()=>({box:g.boundingBox,inverse:matrix.clone().invert(),world:matrix.clone()}));
        }
      } else{
        bounds.copy(g.boundingBox).applyMatrix4(obj.matrixWorld);
        if(bounds.max.y<.22||bounds.min.y>5)return;
        const pos=g.getAttribute('position'),idx=g.index;
        const vertex=(out,i)=>out.fromBufferAttribute(pos,idx?idx.getX(i):i).applyMatrix4(obj.matrixWorld);
        for(let i=0,n=idx?idx.count:pos.count;i<n;i+=3){
          vertex(a,i);vertex(b,i+1);vertex(c,i+2);bounds.setFromPoints([a,b,c]);
          register(bounds,()=>({a:a.clone(),b:b.clone(),c:c.clone()}));
        }
      }
    });
  }
  const ray=new THREE.Ray(),local=new THREE.Ray(),hit=new THREE.Vector3(),seen=new Set();
  function distance(from,to,padding=0){
    const delta=to.clone().sub(from),length=delta.length();if(length<.00001)return Infinity;
    ray.set(from,delta.divideScalar(length));let nearest=Infinity;seen.clear();
    const end=ray.at(length+padding,new THREE.Vector3());
    for(let x=cell(Math.min(from.x,end.x));x<=cell(Math.max(from.x,end.x));x++)
    for(let z=cell(Math.min(from.z,end.z));z<=cell(Math.max(from.z,end.z));z++){
      for(const record of cells.get(key(x,z))||[]){
        if(seen.has(record))continue;seen.add(record);
        let result;
        if(record.box){
          local.copy(ray).applyMatrix4(record.inverse);
          result=local.intersectBox(record.box,hit);if(result)hit.applyMatrix4(record.world);
        }else result=ray.intersectTriangle(record.a,record.b,record.c,false,hit);
        if(result){const d=from.distanceTo(hit);if(d>.008&&d<=length+padding)nearest=Math.min(d,nearest);}
      }
    }
    return nearest;
  }
  return {add,distance};
}
