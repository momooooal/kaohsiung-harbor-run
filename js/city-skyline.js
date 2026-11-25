import buildings from '../data/distant-buildings.js';

// World coordinates are shared with street geometry. The mapped upper parts
// of the 85 Sky Tower remain visible close up; its base is in the street layer.
export function citySkyline(scene,route){
  const tiles=new Map(),size=240;
  const extent=new THREE.Box3().setFromPoints(route).expandByScalar(1300);
  for(const [height,ring,base=0,pointed=false] of buildings){
    const n=ring.length,x=ring.reduce((v,p)=>v+p[0],0)/n,z=ring.reduce((v,p)=>v+p[1],0)/n;
    if(x<extent.min.x||x>extent.max.x||z<extent.min.z||z>extent.max.z)continue;
    const key=Math.floor(x/size)+','+Math.floor(z/size);
    if(!tiles.has(key))tiles.set(key,{x,z,pos:[],uv:[],tint:[],detail:[]});
    const t=tiles.get(key),warm=Math.abs(Math.sin(x+z));
    function tri(a,b,c,side,roof){
      for(const p of [a,b,c]){
        t.pos.push(...p);t.uv.push(side[0]*p[0]+side[1]*p[2],p[1]);
        t.detail.push(base>0?1:0,roof?1:0);
        const light=roof?1:.79+.17*side[0]-.10*side[1];
        const rgb=base?[.24,.37,.38]:[.54+.11*warm,.55+.036*warm,.55-.05*warm];
        t.tint.push(...rgb.map(v=>v*light));
      }
    }
    for(let i=0;i<n;i++){
      const a=ring[i],b=ring[(i+1)%n],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
      if(len<.05)continue;
      const at=(p,h)=>[p[0],h,p[1]],side=[dx/len,dz/len];
      if(pointed)tri(at(a,base),at(b,base),[x,height,z],side,true);
      else{tri(at(a,base),at(b,base),at(b,height),side,false);tri(at(a,base),at(b,height),at(a,height),side,false);}
    }
    if(!pointed)for(const ids of THREE.ShapeUtils.triangulateShape(ring.map(p=>new THREE.Vector2(...p)),[])){
      const [a,b,c]=ids.map(i=>[ring[i][0],height,ring[i][1]]);tri(a,b,c,[1,0],true);
    }
  }
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,vertexShader:`
    attribute vec3 tint;attribute vec2 detail;varying vec3 tone,world;varying vec2 facade,kind;
    void main(){tone=tint;kind=detail;facade=uv;world=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
  `,fragmentShader:`
    varying vec3 tone,world;varying vec2 facade,kind;
    void main(){
      float d=length(world.xz-cameraPosition.xz);
      if(kind.x<.5 && d<247.)discard;
      float fade=smoothstep(1120.,1480.,d);if(fade>.998)discard;
      vec2 cell=fract(facade/vec2(3.5,3.5));
      float panes=step(.12,cell.x)*step(cell.x,.87)*step(.19,cell.y)*step(cell.y,.85)*(1.-kind.y);
      float quality=1.-smoothstep(170.,750.,d);
      vec3 surface=tone*(1.-panes*(.10+.21*quality));
      vec3 haze=vec3(.73,.79,.80);surface=mix(surface,haze,.14+.49*smoothstep(100.,1250.,d)+fade*.36);
      gl_FragColor=vec4(surface,1.);
    }`});
  for(const tile of tiles.values()){
    const geo=new THREE.BufferGeometry();
    for(const [name,data,count] of [['position',tile.pos,3],['tint',tile.tint,3],['uv',tile.uv,2],['detail',tile.detail,2]])geo.setAttribute(name,new THREE.Float32BufferAttribute(data,count));
    tile.mesh=new THREE.Mesh(geo,material);scene.add(tile.mesh);
  }
  return {update(p){for(const t of tiles.values())t.mesh.visible=Math.hypot(t.x-p.x,t.z-p.z)<1770;},
    dispose(){for(const t of tiles.values()){scene.remove(t.mesh);t.mesh.geometry.dispose();}material.dispose();}};
}
