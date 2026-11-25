// A CC0 sky-only lighting reference. All visible streets and buildings are geometry.
export function daylightSky(scene){
  const texture=new THREE.TextureLoader().load('assets/surfaces/daylight-sky.jpg');texture.encoding=THREE.sRGBEncoding;
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,fog:false,toneMapped:false,depthWrite:false});
  material.addEventListener('dispose',()=>texture.dispose());
  const sky=new THREE.Mesh(new THREE.SphereGeometry(550,48,24),material);
  sky.scale.x=-1;sky.rotation.y=1.85;sky.renderOrder=-2;scene.add(sky);return sky;
}
