// A CC0 sky-only lighting reference. All visible streets and buildings are geometry.
const swatches=new Map();
export function surfaceTexture(file){
  const color=file==='tree.png'?'transparent':file==='daylight-sky.jpg'?'#cadde6':file==='aerial_grass_rock.jpg'?'#8e9c71':'#b5b0a4';
  if(!swatches.has(color)){
    const tile=document.createElement('canvas');tile.width=tile.height=4;
    const c=tile.getContext('2d');c.fillStyle=color;c.fillRect(0,0,4,4);swatches.set(color,tile);
  }
  // TextureLoader replaces this image when the real JPEG is decoded. This
  // also keeps a usable base colour if a phone loses its connection mid-run.
  const texture=new THREE.TextureLoader().load('assets/surfaces/'+file);
  texture.image=swatches.get(color);texture.encoding=THREE.sRGBEncoding;texture.needsUpdate=true;return texture;
}
export function daylightSky(scene){
  const texture=surfaceTexture('daylight-sky.jpg');
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,fog:false,toneMapped:false,depthWrite:false});
  material.addEventListener('dispose',()=>texture.dispose());
  const sky=new THREE.Mesh(new THREE.SphereGeometry(550,48,24),material);
  sky.scale.x=-1;sky.rotation.y=1.85;sky.renderOrder=-2;scene.add(sky);return sky;
}
