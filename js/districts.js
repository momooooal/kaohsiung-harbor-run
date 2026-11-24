// Local frames use metres in the illustrative scene, not surveyed coordinates.
export function addHarborDistricts(scene,points){
 const box=new THREE.BoxGeometry(),tube=new THREE.CylinderGeometry(1,1,1,12),batches=new Map(),frame=new THREE.Object3D(),item=new THREE.Object3D();
 const axis=new THREE.Vector3(0,1,0);
 function anchor(index,side=0,along=0){
   frame.position.copy(points[index]);const d=points[Math.max(index,1)].clone().sub(points[Math.max(index,1)-1]);
   frame.rotation.set(0,Math.atan2(d.x,d.z),0);frame.translateX(side);frame.translateZ(along);frame.updateMatrix();
 }
 function add(shape,color){item.updateMatrix();const key=color+'-'+shape.id;if(!batches.has(key))batches.set(key,{shape,color,matrices:[]});batches.get(key).matrices.push(frame.matrix.clone().multiply(item.matrix))}
 function solid(x,y,z,w,h,d,c,rz=0){item.position.set(x,y,z);item.scale.set(w,h,d);item.rotation.set(0,0,rz);add(box,c)}
 function beam(a,b,r,c){const u=new THREE.Vector3(...a),v=new THREE.Vector3(...b),delta=v.clone().sub(u);item.position.copy(u).lerp(v,.5);item.scale.set(r,delta.length(),r);item.quaternion.setFromUnitVectors(axis,delta.normalize());add(tube,c)}
 const iron=0x343c39,rust=0x81372a,rail=0x68716a,cream=0xe0cf9e;
 function rails(x,z,len){for(const side of [-1,1])solid(x+side*.76,.16,z,.1,.13,len,rail);for(let d=-len/2;d<len/2;d+=1.45)solid(x,.08,z+d,2.45,.13,.27,0x655749)}
 function engine(x,z){
  solid(x,1.05,z,2.5,.52,9,iron);beam([x,2,z-3.9],[x,2,z+1],.97,0x212926);
  solid(x,2.2,z+2.65,2.7,2.5,2.6,iron);solid(x,3.6,z+2.6,3.2,.25,3.4,0x202624);solid(x,2.77,z+1.30,1.85,.68,.08,0x607870);
  for(const side of [-1,1]){for(let w=-3;w<=3;w+=1.6){beam([x+side*1.05,.76,z+w],[x+side*1.33,.76,z+w],.64,rust)}solid(x+side*1.36,.79,z, .11,.14,6.9,0xc1b598)}
  beam([x,2.65,z-2.6],[x,4,z-2.6],.34,iron);beam([x,3.78,z-2.6],[x,4.12,z-2.6],.49,iron);
 }
 anchor(1,-7,0);rails(0,0,62);engine(0,0);
 // The park's red viewing bridge is composed in the sightline on arrival.
 anchor(0,0,-17);
 solid(0,.01,5,30,.16,29,0xbeb6a2);
 solid(0,4.35,0,32,.48,3.1,rust);
 for(const z of [-1.3,1.3]){
   let prev;for(let x=-16;x<=16;x+=2){const y=4.7+5.3*(1-(x/16)**2);if(prev)beam(prev,[x,y,z],.23,0xa93a2c);beam([x,4.55,z],[x,y,z],.075,rust);prev=[x,y,z]}
 }
 for(const x of [-12,12])solid(x,2.1,0,1.25,4.3,3.5,0xa5a294);
 for(const x of [-9,9]){solid(x,.32,8,4,.62,1.1,cream);beam([x,.1,3],[x,5.5,3],.16,iron);solid(x,4.8,3,.6,1.3,.4,iron)}
 // Sheltered station platform behind the viewing bridge, seen from the finish.
 solid(7,.26,-8,18,.5,7,0xb0aa92);solid(7,3.45,-8,19,.25,7.8,0x50635b);
 for(const x of [-1,4,10,15]){solid(x,1.85,-10,.18,3.2,.18,0x394c42);solid(x,1.85,-5.2,.18,3.2,.18,0x394c42)}
 for(const x of [3,9]){solid(x,.84,-8,3,.16,.72,0x806347);solid(x,1.22,-8.3,3,.65,.12,0x806347)}
 // Green corridor: linear beds, twin ribbons of steel and shaded rest pockets.
 anchor(5);for(let z=-57;z<=55;z+=8){for(const side of [-1,1]){
 solid(side*5.8,.23,z,2.8,.45,7.8,0x798767);solid(side*5.8,.55,z,2.5,.34,7.4,0x496738);
 for(let j=-3;j<=3;j+=1.4){beam([side*5.9,.63,z+j],[side*5.5,1.04,z+j+.3],.10,0x83954b)}
 }}rails(8.5,0,106);
 // A timber wharf, piles and a low hull frame the two sails.
 anchor(14,-28);frame.rotateY(Math.PI);frame.updateMatrix();solid(5,-.29,0,48,.2,63,0x337c80);
 for(let z=-19;z<=17;z+=1.15)solid(1,.17,z,13,.28,1.11,0x9f7b53);
 for(let z=-18;z<=17;z+=5){beam([7.6,-.3,z],[7.6,1,z],.25,iron);beam([7.6,.86,z],[7.6,1.07,z],.4,iron)}
 solid(12,.6,-4,3.5,1.35,12,0x244651);solid(12,1.65,-3,2.8,1.25,5.2,cream);solid(12,2,-3,2.85,.44,4.1,0x385e66);
 // Hexagonal screen over glass, stepping down towards the open plaza.
 anchor(19,11);for(let col=0;col<18;col++){const z=-15+col*1.58,rows=3+Math.round(7*Math.exp(-((col-4)**2)/15)+3*Math.exp(-((col-14)**2)/8));for(let row=0;row<rows;row++){
 const y=1.8+row*1.86+(col%2)*.93,x=-3.5;
 const verts=Array.from({length:6},(_,k)=>[x,y+Math.sin(k*Math.PI/3)*1.06,z+Math.cos(k*Math.PI/3)*1.06]);
 for(let k=0;k<3;k++)beam(verts[k],verts[k+1],.10,0xe3e3d3);
 solid(x+.25,y,z,.16,1.78,1.52,(col+row)%3===0?0x48707b:0x63828b)
 }}
 // Dayi return: low-floor tram and warehouse loading apron.
 if(points.length>35){anchor(34,-7,-17);rails(0,0,82);
 for(let car=-1;car<=1;car++){const z=car*7.1;solid(0,1.05,z,2.7,1.45,6.9,0x77ac47);solid(0,2.32,z,2.65,1.42,6.65,0xe5e7dc);solid(0,2.43,z,2.72,1.06,6.25,0x344c52);solid(0,3.21,z,2.85,.36,6.75,0xe2e4d9);for(let j=-2.4;j<=2.4;j+=1.5)solid(0,2.44,z+j,2.77,1.16,.14,cream)}
 }
 for(const {shape,color,matrices} of batches.values()){const mesh=new THREE.InstancedMesh(shape,new THREE.MeshStandardMaterial({color,roughness:.76}),matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));scene.add(mesh)}
}


