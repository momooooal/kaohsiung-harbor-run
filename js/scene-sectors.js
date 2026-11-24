// Keep shared geometry resident; render nearby sectors. No network streaming claim.
export function manageSceneSectors(scene,size=120,radius=330){
 const sectors=new Map();scene.updateMatrixWorld(true);const box=new THREE.Box3(),center=new THREE.Vector3(),extent=new THREE.Vector3();
 for(const o of [...scene.children]){
  if(!o.isMesh&&!o.isGroup)continue;if(o.material?.fog===false||o.isInstancedMesh)continue;
  box.setFromObject(o);if(box.isEmpty())continue;box.getSize(extent);if(extent.length()>240)continue;box.getCenter(center);
  const key=Math.floor(center.x/size)+','+Math.floor(center.z/size);if(!sectors.has(key)){const group=new THREE.Group();group.name='sector-'+key;scene.add(group);sectors.set(key,{group,x:(Math.floor(center.x/size)+.5)*size,z:(Math.floor(center.z/size)+.5)*size})}sectors.get(key).group.add(o);
 }
 return {update(pos){for(const s of sectors.values())s.group.visible=Math.hypot(pos.x-s.x,pos.z-s.z)<radius},count:sectors.size};
}
