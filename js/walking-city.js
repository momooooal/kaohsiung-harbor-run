import legs from '../data/walking-legs.js';
import blocks from '../data/walking-blocks.js';
import {stops} from '../data/shared-route.js';

// Local east/south metre coordinates, derived from OSM. Floor counts without
// recorded heights use an indicative extrusion, not a surveyed facade.
export function walkingCity(start=0){
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0xc6dfe3);scene.fog=new THREE.Fog(0xc6dfe3,90,430);
  scene.add(new THREE.HemisphereLight(0xfff4e2,0xa5b5ad,1));
  const sun=new THREE.DirectionalLight(0xffe5bb,.66);sun.position.set(-40,70,24);scene.add(sun);
  const positions=[],colors=[];
  function tri(a,b,c,color){positions.push(...a,...b,...c);for(let i=0;i<3;i++)colors.push(color.r,color.g,color.b)}
  const tint=n=>new THREE.Color(n).convertSRGBToLinear();
  const vert=(p,y)=>[p[0],y,p[1]];
  function ribbon(a,b,w,y,color){
    const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(!l)return;
    const x=-dz/l*w/2,z=dx/l*w/2;
    const p=[a[0]+x,y,a[1]+z],q=[a[0]-x,y,a[1]-z],r=[b[0]+x,y,b[1]+z],s=[b[0]-x,y,b[1]-z];
    tri(p,r,q,color);tri(q,r,s,color);
  }
  function polygon(points,h,color){
    const vs=points.map(p=>new THREE.Vector2(...p));
    for(const [a,b,c] of THREE.ShapeUtils.triangulateShape(vs,[]))tri(vert(points[a],h),vert(points[b],h),vert(points[c],h),color);
  }
  const roof=tint(0xc4b9ac),facades=[0xb89f83,0xb9b6ab,0xc7b49c,0xacb4ae].map(tint);
  blocks.buildings.forEach(([h,points],i)=>{
    polygon(points,h,roof);
    points.forEach((a,j)=>{const b=points[(j+1)%points.length],color=facades[i%4];tri(vert(a,0),vert(b,0),vert(a,h),color);tri(vert(a,h),vert(b,0),vert(b,h),color)});
  });
  blocks.water.forEach(p=>polygon(p,.01,tint(0x78aeb0)));
  for(const [w,line] of blocks.roads){const c=tint(w<=2?0xc6bca7:0x797e7d);line.slice(1).forEach((b,i)=>ribbon(line[i],b,w,.035,c))}
  const path=[],dist=[],ends=[],names=[],guide=tint(0xf7bb64);
  let total=0;
  legs.forEach(({path:line,streets})=>{
    let street='',cursor=0;
    line.forEach((p,i)=>{
      while(cursor<streets.length&&streets[cursor][0]<=i)street=streets[cursor++][1];
      const a=path.at(-1);if(a){const l=Math.hypot(a[0]-p[0],a[1]-p[1]);if(!l)return;total+=l;ribbon(a,p,.45,.095,guide)}
      path.push(p);dist.push(total);names.push(street);
    });ends.push(total);
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1});
  m.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 streetPos; varying vec3 streetNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstreetPos=position;streetNormal=normal;');
    shader.fragmentShader='varying vec3 streetPos; varying vec3 streetNormal;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(abs(streetNormal.y)<0.2 && streetPos.y>1.0){float u=fract((abs(streetNormal.x)>0.65?streetPos.z:streetPos.x)/3.35);float v=fract(streetPos.y/3.2);if(u>.20 && u<.74 && v>.25 && v<.78) diffuseColor.rgb*=vec3(.39,.52,.58);}');
  };
  scene.add(new THREE.Mesh(geometry,m));
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000),new THREE.MeshLambertMaterial({color:0xb9bcaa}));const paving=new THREE.TextureLoader().load('assets/surfaces/concrete_pavement_02.jpg');paving.encoding=THREE.sRGBEncoding;paving.wrapS=paving.wrapT=THREE.RepeatWrapping;paving.repeat.set(2400,2400);ground.material.map=paving;ground.rotation.x=-Math.PI/2;scene.add(ground);
  const labels=[];
  stops.forEach(([name],i)=>{
    if(i===5)return; // The second coffee stop occupies the same physical site.
    const [x,z]=sample(i?ends[i-1]:0);
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#154d48';ctx.fillRect(0,0,512,96);
    ctx.fillStyle='#fff8e3';ctx.font='bold 37px sans-serif';ctx.textAlign='center';
    ctx.fillText(name,256,61,482);
    const map=new THREE.CanvasTexture(canvas);labels.push(map);
    const sign=new THREE.Sprite(new THREE.SpriteMaterial({map}));sign.position.set(x,4,z);sign.scale.set(8,1.5,1);scene.add(sign);
  });
  let at=start?ends[start-1]:0,segment=0;
  function sample(distance){
    let l=0,r=path.length-1;
    while(l+1<r){const mid=(l+r)>>1;if(dist[mid]<=distance)l=mid;else r=mid}
    const a=path[l],b=path[r],t=(distance-dist[l])/(dist[r]-dist[l]);
    return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,l];
  }
  return {scene,walk:true,get distance(){return at},seek(distance){at=Math.max(0,Math.min(total,distance))},advance(delta,pos){
    at=Math.max(0,Math.min(total,at+delta));
    const [x,z,i]=sample(at),f=sample(Math.min(total,at+3.5)),b=sample(Math.max(0,at-.5));
    pos.set(x,0,z);segment=ends.findIndex(end=>at<end);if(segment<0)segment=8;
    const nearest=at- (segment?ends[segment-1]:0)<ends[segment]-at?segment:segment+1;
    return {nearest,near:Math.abs(at-(nearest?ends[nearest-1]:0))<90,heading:Math.atan2(f[0]-b[0],f[1]-b[1]),status:at===total?'全程抵達':stops[segment][0]+' → '+stops[segment+1][0],hint:(names[i]||'步行路段')+' · 全程 '+Math.floor(100*at/total)+'%'};
  },dispose(){paving.dispose();labels.forEach(t=>t.dispose());scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}};
}
