// Derive collision bounds from the same solid meshes that are rendered.
// Low pavement/rail surfaces and overhead structures are not blockers.
export function sceneColliders(scene){
 const out=[],matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Quaternion(),center=new THREE.Vector3();scene.updateMatrixWorld(true);
 scene.traverse(o=>{
  if(!o.isMesh||!['BoxGeometry','CylinderGeometry'].includes(o.geometry.type)||o.material?.transparent)return;
  o.geometry.computeBoundingBox();const box=o.geometry.boundingBox;
  for(let i=0;i<(o.isInstancedMesh?o.count:1);i++){
   if(o.isInstancedMesh){o.getMatrixAt(i,matrix);matrix.premultiply(o.matrixWorld)}else matrix.copy(o.matrixWorld);
   matrix.decompose(position,rotation,scale);center.copy(box.min).add(box.max).multiplyScalar(.5).applyMatrix4(matrix);
   const h=(box.max.y-box.min.y)*Math.abs(scale.y);if(center.y+h/2<.3||center.y-h/2>1.8)continue;
   const angle=new THREE.Euler().setFromQuaternion(rotation,'YXZ').y;
   out.push({x:center.x,z:center.z,w:(box.max.x-box.min.x)*Math.abs(scale.x),d:(box.max.z-box.min.z)*Math.abs(scale.z),angle});
  }
 });return out;
}
