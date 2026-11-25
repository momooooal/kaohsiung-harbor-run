// Public street-view observations and their dates are listed in DATA-SOURCES.md.
// Dimensions and movable objects are indicative. Coordinates are east/south metres.
export const streetShells = new Map([
  ['1160,-138','arcade'], ['-1806,-1401','redTile'], ['860,-316','workshop'],
  ...['533,-711','544,-717','513,-700','530,-690','526,-723'].map(id=>[id,'plaster'])
]);

// Local coordinates are right, forward, and height relative to the walking direction.
// Batches stay with their street. Distant blocks issue no furnishing draw calls.
function streetKit(scene, materials, geometries, textures, x,z,bearing) {
  const group=new THREE.Group(), batches=new Map(), dummy=new THREE.Object3D();
  group.position.set(x,0,z);group.rotation.y=-bearing*Math.PI/180;scene.add(group);
  const V=(r,f,y)=>new THREE.Vector3(r,y,-f);
  function primitive(shape,finish,r,f,y,w,h,d,ink,yaw=0,roll=0,pitch=0){
    dummy.position.copy(V(r,f,y));dummy.scale.set(w,h,d);dummy.rotation.set(pitch,yaw,roll,'YXZ');dummy.updateMatrix();
    put(shape,finish,ink);
  }
  function put(shape,finish,ink){
    const key=shape+'/'+finish;
    if(!batches.has(key))batches.set(key,{shape,finish,items:[]});
    batches.get(key).items.push([dummy.matrix.clone(),ink]);
  }
  const box=(r,f,y,w,h,d,ink,finish='paint',yaw=0,roll=0,pitch=0)=>primitive('box',finish,r,f,y,w,h,d,ink,yaw,roll,pitch);
  const drum=(r,f,y,w,h,d,ink)=>primitive('drum','paint',r,f,y,w,h,d,ink);
  const oval=(r,f,y,w,h,d,ink,yaw=0,pitch=0)=>primitive('oval','paint',r,f,y,w,h,d,ink,yaw,0,pitch);
  function beam(a,b,size,color){
    const u=V(...a),v=V(...b),dir=v.clone().sub(u);if(dir.lengthSq()<.00001)return;
    dummy.position.copy(u).lerp(v,.5);dummy.scale.set(size,dir.length(),size);
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());dummy.updateMatrix();put('drum','paint',color);
  }
  function pavement(r,f,w,length,color,finish='asphalt',height=.083){
    box(r,f,height-.02,w,.04,length,color,finish);
  }
  function pathSurface(line,width,ink,finish='asphalt',height=.083){
    // Join both edges at each bend so the surface follows the walking line.
    const positions=[],indices=[];
    const normal=(a,b)=>{const dx=b[0]-a[0],df=b[1]-a[1],len=Math.hypot(dx,df);return [df/len,-dx/len]};
    line.forEach(([r,f],i)=>{
      const a=normal(line[Math.max(0,i-1)],line[i||1]),b=normal(line[i===line.length-1?i-1:i],line[Math.min(line.length-1,i+1)]);
      const sx=a[0]+b[0],sy=a[1]+b[1],m=width*.5/Math.max(.5,sx*b[0]+sy*b[1]);
      for(const sign of [-1,1])positions.push(r+sign*sx*m,height,-f-sign*sy*m);
      if(i){const k=i*2;indices.push(k-2,k-1,k,k,k-1,k+1)}
    });
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
    const mesh=new THREE.InstancedMesh(geo,materials[finish],1);mesh.setMatrixAt(0,new THREE.Matrix4());mesh.setColorAt(0,new THREE.Color(ink).convertSRGBToLinear());
    mesh.frustumCulled=false;mesh.receiveShadow=true;group.add(mesh);
  }
  function post(r,f,h,ink=0x89918e){drum(r,f,h/2,.13,h,.13,ink)}
  function plant(r,f,h=2.1){
    drum(r,f,.25*h,.23*h,.50*h,.23*h,0x967260);
    beam([r,f,.44*h],[r+.06,f,.86*h],.039*h,0x6d624d);
    for(let j=0;j<13;j++){
      const a=j*2.42,level=.56+.027*j,dr=Math.cos(a)*h*.19,df=Math.sin(a)*h*.19;
      if(j%3===0)beam([r,f,h*(level-.16)],[r+dr,f+df,h*level],.021*h,0x6a7353);
      primitive('oval','paint',r+dr,f+df,h*level,.107*h,.065*h,.34*h,[0x617a41,0x476c43,0x738a50][j%3],a,0,-.39);
    }
  }
  function scooter(r,f,angle,color){
    const a=angle*Math.PI/180;
    const at=(u,v)=>[r+u*Math.cos(a)+v*Math.sin(a),f-u*Math.sin(a)+v*Math.cos(a)];
    for(const v of [-.61,.56]){
      const [x,z]=at(0,v);primitive('wheel','paint',x,z,.285,.55,.14,.55,0x323536,-a,Math.PI/2);
      primitive('wheel','paint',x,z,.285,.29,.151,.29,0x99a1a0,-a,Math.PI/2);
    }
    const shape=(u,v,y,w,h,d,ink,pitch=0)=>{const [x,z]=at(u,v);oval(x,z,y,w,h,d,ink,-a,pitch)};
    shape(0,-.29,.58,.62,.56,1.03,color);shape(0,-.23,.85,.50,.16,.85,0x383c3e);
    shape(0,.33,.70,.54,.64,.32,color,-.28);shape(0,.50,1.07,.43,.21,.28,color);
    shape(0,.62,1.09,.28,.11,.07,0xc6d7d3);
    for(const s of [-1,1]){
      const p=at(s*.18,.39),q=at(s*.31,.43);beam([...p,1.10],[...q,1.35],.025,0x686f70);
      shape(s*.33,.44,1.36,.13,.09,.065,0x474d50);
    }
  }
  function car(r,f,ink,reverse=false){
    const dir=reverse?-1:1,rot=reverse?Math.PI:0;
    primitive('carBody','paint',r,f,.42,1.74,.65,4.32,ink,rot);
    primitive('cabin','glass',r,f-.12*dir,.99,1.57,.57,2.45,0x526772,rot);
    box(r,f-.18*dir,1.56,1.30,.075,1.46,ink);
    for(const s of [-1,1]){
      for(const d of [-1.26,1.25]){
        primitive('wheel','paint',r+s*.794,f+d,.34,.62,.24,.62,0x353737,0,Math.PI/2);
        primitive('wheel','paint',r+s*.916,f+d,.34,.35,.040,.35,0x9fa5a2,0,Math.PI/2);
      }
      beam([r+s*.765,f-.04,1.02],[r+s*.647,f-.05,1.54],.092,0x424a4d);
      oval(r+s*.905,f+.58*dir,1.10,.23,.14,.21,ink);
      box(r+s*.58,f+2.105*dir,.80,.41,.135,.082,0xd6dcd4);
      box(r+s*.62,f-2.097*dir,.785,.32,.15,.089,0x9c5049);
    }
    box(r,f+2.13*dir,.62,.76,.15,.073,0x58605e);
    box(r,f-2.13*dir,.64,.34,.13,.074,0xc5c4b5);
  }
  function signal(r,f,arm){
    post(r,f,5.4);beam([r,f,4.45],[r+arm,f,5.3],.14,0xa2aaa8);
    box(r+arm,f,5.05,1.16,.43,.35,0x383e40);
    for(let j=0;j<3;j++)oval(r+arm-.36+j*.36,f-.18,5.04,.24,.24,.08,[0x514340,0x4b493c,0x568968][j]);
  }
  function sign(r,f,y,w,h,bg,fg,copy){
    const key=copy+bg;let map=textures.get(key);
    if(!map){
      const canvas=document.createElement('canvas');canvas.width=144;canvas.height=320;
      const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,144,320);c.strokeStyle=fg;c.lineWidth=5;c.strokeRect(6,6,132,308);
      c.fillStyle=fg;c.font='bold 77px "Microsoft JhengHei", sans-serif';c.textAlign='center';c.textBaseline='middle';
      [...copy].forEach((v,i)=>c.fillText(v,72,160+(i-(copy.length-1)/2)*85,118));
      map=new THREE.CanvasTexture(canvas);map.encoding=THREE.sRGBEncoding;textures.set(key,map);
    }
    box(r,f,y,w+.11,h+.1,.26,0x626969);
    const panel=new THREE.Mesh(geometries.face,new THREE.MeshStandardMaterial({map,roughness:.78}));
    panel.position.copy(V(r,f-.144,y));panel.scale.set(w,h,1);group.add(panel);
  }
  function finish(){
    const col=new THREE.Color();
    for(const {shape,finish,items} of batches.values()){
      const mesh=new THREE.InstancedMesh(geometries[shape],materials[finish],items.length);
      items.forEach(([m,ink],i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,col.setHex(ink).convertSRGBToLinear())});
      mesh.frustumCulled=false;mesh.castShadow=shape!=='hull';mesh.receiveShadow=true;group.add(mesh);
    }
    group.visible=false;return group;
  }
  return {box,drum,oval,primitive,pavement,pathSurface,post,plant,beam,scooter,car,signal,sign,finish};
}

function finishMaterial(kind,surface){
  const m=new THREE.MeshStandardMaterial({roughness:kind==='glass'?.34:.88});
  if(kind==='paint')return m;
  m.customProgramCacheKey=()=>kind;
  const patterns={
    tile:`vec2 g=abs(fract(vec2(u*7.,p.y*12.8))-.5);float seam=smoothstep(.43,.49,max(g.x,g.y));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.25,.21,.19),seam*.65);`,
    plaster:`float stain=.84+.14*sin(u*1.8+sin(p.y*.33))+.06*sin(u*7.1);diffuseColor.rgb*=mix(stain,1.,.42)+grain*.11;`,
    metal:`float rib=.5+.5*sin(u*38.);diffuseColor.rgb*=.7+.27*rib+.06*grain;`,
    shutter:`float rib=fract(p.y*9.5);diffuseColor.rgb*=.57+.43*smoothstep(.05,.36,rib)+.07*grain;`,
    glass:`float cloud=sin(u*1.12+p.y*.78);diffuseColor.rgb*=.73+smoothstep(-.38,.55,cloud)*.30+.12*fract(p.y*.3); `,
    asphalt:`diffuseColor.rgb*=.68+grain*.52;`,
    paving:`vec2 t=p.xz*vec2(2.,3.5);t.x+=.5*mod(floor(t.y),2.);vec2 g=abs(fract(t)-.5);diffuseColor.rgb*=.97-.32*smoothstep(.45,.495,max(g.x,g.y))+.035*grain;`
  };
  m.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 finishPos;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfinishPos=(instanceMatrix*vec4(position,1.)).xyz;');
    s.uniforms.wallFinish={value:surface};
    const uv=kind==='paving'||kind==='asphalt'?'p.xz':'vec2(u,p.y)';
    s.fragmentShader='uniform sampler2D wallFinish;varying vec3 finishPos;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n{vec3 p=finishPos;float u=p.x+p.z;float grain=texture2D(wallFinish,'+uv+'*.34).r;diffuseColor.rgb*=.84+.33*grain;'+patterns[kind]+'}');
  };return m;
}

// A tapered keel, transom and bow produce a hull silhouette from the quay.
function boatHull(){
  const pos=[],sections=[[-.5,.29],[-.39,.49],[.15,.49],[.38,.36],[.5,.04]];
  const tri=(a,b,c)=>pos.push(...a,...b,...c);
  let old;
  for(const [f,w] of sections){
    const row=[[-w,.44,-f],[-w*.7,-.19,-f],[0,-.46,-f],[w*.7,-.19,-f],[w,.44,-f]];
    if(old){for(let j=0;j<4;j++){tri(old[j],row[j],old[j+1]);tri(old[j+1],row[j],row[j+1])}tri(old[0],old[4],row[0]);tri(row[0],old[4],row[4])}
    if(f===-.5||f===.5)for(let j=1;j<4;j++)tri(row[0],row[j],row[j+1]);old=row;
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;
}

// Each section specifies fore/aft position, half width and top height.
function vehicleShell(sections){
  const positions=[];
  const tri=(a,b,c)=>positions.push(...a,...b,...c);let prev;
  sections.forEach(([z,width,top],i)=>{
    const row=[[-width,0,-z],[-width*.88,top,-z],[width*.88,top,-z],[width,0,-z]];
    if(prev)for(let j=0;j<4;j++){const k=(j+1)%4;tri(prev[j],row[j],prev[k]);tri(prev[k],row[j],row[k])}
    if(i===0||i===sections.length-1){tri(row[0],row[1],row[2]);tri(row[0],row[2],row[3])}
    prev=row;
  });
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
}

export function walkingCorridors(scene,scenery){
  const materials={},textures=new Map();for(const kind of ['paint','tile','plaster','metal','shutter','glass','asphalt','paving'])materials[kind]=finishMaterial(kind,kind==='plaster'?scenery.masonry:scenery.asphalt);
  materials.paint.side=THREE.DoubleSide;
  const geometries={box:new THREE.BoxGeometry(),oval:new THREE.SphereGeometry(.5,12,8),drum:new THREE.CylinderGeometry(.5,.5,1,12),wheel:new THREE.CylinderGeometry(.5,.5,1,16),face:new THREE.PlaneGeometry(),hull:boatHull(),umbrella:new THREE.ConeGeometry(.5,1,8)};
  geometries.carBody=vehicleShell([[-.50,.40,.60],[-.42,.50,.86],[-.23,.5,.93],[.18,.49,.87],[.43,.47,.65],[.50,.39,.51]]);
  geometries.cabin=vehicleShell([[-.50,.40,.04],[-.37,.46,.68],[-.26,.45,1],[.24,.44,.97],[.50,.46,.04]]);
  materials.glass.side=THREE.DoubleSide;
  const groups=[];
  for(const [x,z,bearing,build] of [
    [864.40,-289.73,339.86,workshopCorner],[1166.06,-138.04,71.11,xinguangStreet],
    [2279.83,1326.44,249.68,shidaiAvenue],[1455.15,745.94,249.91,neighbourhoodWalk],
    [534.56,-708.22,249.44,shengpingAlley],[-1271.38,-1276.71,305.54,railwayGreen],
    [-2065.10,-1290.78,5.31,boatBasin],[-1792.72,-1399.80,122.15,marketJunction]
  ]){
    const kit=streetKit(scene,materials,geometries,textures,x,z,bearing);build(kit);groups.push(kit.finish());
  }
  return {center(x,z){for(const g of groups)g.visible=Math.hypot(g.position.x-x,g.position.z-z)<230},dispose(){for(const t of textures.values())t.dispose()}};
}

function workshopCorner({box,pavement,post,beam,sign,scooter,car,signal}){
  // Existing mapped zebra crossings span this junction. Keep their branches clear.
  pavement(-11,19,29,21,0x686968,'asphalt',.052);
  for(const [r,f,w,l] of [[1.8,-9,4.1,37],[1.8,64,4.4,68],[-10,10,18,.14]])pavement(r,f,w,l,0xc0b5a5,'paving',.070);
  for(const f of [-12,49,76])pavement(-.58,f,.14,22,0xb65c54,'paint',.082);
  for(const f of [26,31.4,36.8,42.2]){
    box(7.3,f+2.5,1.64,3.8,3.22,5.38,0x4b4e46);
    box(5.37,f+2.5,1.38,.12,2.60,4.77,f===31.4?0x434942:0x758279,'shutter');
    box(4.85,f+2.5,3.18,2.38,.14,5.48,0xd2c8ad,'metal',0,.085);
    box(4.00,f,.1+1.45,.14,2.98,.15,0x97917d);
    box(4.41,f+2.5,4.48,.24,2.28,5.42,0xc1b897,'metal');
  }
  box(10,25.76,4.51,11.5,2.30,.25,0xbdb496,'metal');box(10,25.52,3.23,12.4,.15,1.7,0xe3dbca,'metal',0,0,-.10);
  for(const r of [4.3,9.5,15.4])post(r,25.1,3.2);
  sign(3.2,37,5.7,.87,2.36,'#31547d','#e9dab4','印刷');
  sign(3.5,52,5.32,1.05,1.68,'#e3dfcb','#294f65','洗車');
  for(const f of [32,49,56,60])scooter(2.15,f,-54,f%3?0x384d62:0x786759);
  car(-2.18,39,0xd9d8cc);car(-2.32,52.5,0x73878c);
  car(-26,45,0x79625c,true);
  signal(2.7,24,-4.7);
  // Broad carriageway and low pitched frontage opposite the workshop.
  box(-29,45,2.05,7,4.1,20,0xb3aa91,'plaster');
  for(const side of [-1,1])box(-29+side*2.26,45,4.45,4.85,.23,21.2,0x8a8174,'metal',0,-side*.30);
  beam([-30,34,3.7],[-28,34,5],.13,0x746d60);
}

function xinguangStreet({box,pavement,plant,post,scooter,sign}){
  // The OSM walking line runs just outside the existing tall building. The
  // ground-floor shell is set back beneath its overhang to give the arcade depth.
  pavement(-2.29,10,3.7,79,0xcfc3b2,'paving');
  pavement(.45,8,2.45,76,0x696c6a);
  for(const [f,w,finish,ink] of [[-9,6,'glass',0x4a6260],[-2,7,'shutter',0x939a91],[5.5,6.8,'glass',0x788688],[12.5,6.7,'glass',0x415657],[20,7,'shutter',0xa6a499],[27.1,6.8,'glass',0x677e7e],[34.2,6.7,'glass',0x4a5b55]]){
    box(-4.0,f,1.46,.26,2.81,w,ink,finish);
    box(-2.9,f,3.08,2.54,.23,w+0.13,0xc6bda7);
    box(-1.65,f+w/2,1.56,.26,3.12,.28,0xccbba5,'tile');
    box(-1.62,f,3.44,.17,.56,w-.28,finish==='glass'?0xe2d9c1:0x8b9b84);
    if(finish==='glass'){
      for(const t of [-.40,0,.4])box(-3.8,f+w*t,1.41,.14,2.77,.09,0xa7a79a);
      box(-3.69,f,.72,.52,.14,w*.65,0x8b7760);
    }
  }
  for(const [f,shade] of [[-10,0x626b73],[-7.8,0x394752],[-4,0x8a5653],[1,0x3f6c77],[4,0x424345],[8.8,0x747a72],[15,0x4f555f],[25,0x85494a]])
    scooter(-1.25,f,-55,shade);
  for(const f of [0,13,31])plant(-2.48,f,1.08);
  sign(-2.0,12,3.80,.70,1.02,'#ece6d6','#526459','茶');
  for(let f=-27;f<59;f+=17){post(4.35,f,6.85);box(3.81,f,6.75,1.2,.12,.29,0xaeb8ae)}
}

function shidaiAvenue({pavement,box,post,beam}){
  pavement(-11.1,45,13.3,156,0x6e7370);
  pavement(-4.38,45,.15,155,0xbc665a,'paint',.092);
  for(let f=-23;f<123;f+=11){pavement(-11.4,f,.13,3.8,0xd6d3bf,'paint',.094)}
  for(const f of [-18,22,65,107]){post(-3.95,f,7.4);beam([-3.95,f,6.8],[-5.58,f,7.72],.10,0xb7bcb1);box(-5.72,f,7.72,.78,.11,.24,0xd7dbd1)}
  // Keep the actual guided footpath and the park to its right.
  pavement(6.1,39,2.3,105,0xb89d7e,'paving');
}
function neighbourhoodWalk({box,pavement,beam,post,oval}){
  // The exterior panorama along this path shows dusty rose tiled gateposts,
  // arched metal grilles and pale transverse bands on the access strip.
  pavement(0,13,4.1,125,0x918d86,'paving');
  for(let f=-37;f<66;f+=3.05)pavement(0,f,4.02,.17,0xcac6b9,'paint',.094);
  for(const start of [-38,38]){
    for(let j=0;j<7;j++){
      const f=start+j*7.75;
      if(start<0&&f>15)continue;
      box(-5.6,f,4.75,1.35,9.5,7.8,0xbb9285,'tile');
      box(-4.87,f,1.49,.15,2.96,3.64,0x4b504a);
      for(let t=-1.52;t<1.73;t+=.39)box(-4.72,f+t,1.43,.065,2.62,.04,0xa4a89a);
      for(const y of [.86,1.77,2.67])box(-4.72,f,y,.065,.05,3.39,0xb6baab);
      box(-4.05,f-2.15,1.8,1.12,3.6,.77,0xc49b8d,'tile');
      box(-4.44,f,3.63,2.0,.29,7.88,0xc7b4a2);
      oval(-3.45,f-2.15,2.45,.31,.32,.31,0xdacfa3);
      box(-4.81,f,6.21,.23,1.74,3.17,0x6a7f7b,'glass');
    }
  }
  pavement(4.5,14,3.15,140,0xa57961,'paving');
  for(let f=-32;f<83;f+=17){
    box(7.1,f,.22,2.2,.32,11.3,0x758354);
    post(7.4,f,3.2);box(7.4,f,3.32,.42,.23,.42,0xc6c5a7);
  }
  for(const f of [-24,-1,22,48]){
    for(const r of [6.10,6.25,6.40])box(r,f,.53,.13,.09,1.76,0xb8ac90);
    box(6.52,f,.82,.10,.37,1.75,0xb2a284);
    for(const u of [-.58,.58])beam([6.16,f+u,.04],[6.41,f+u,.51],.076,0x545952);
  }
}

function shengpingAlley({box,pavement,beam,plant,drum,oval,primitive,car}){
  pavement(0,-14,5.1,55,0xb8b1a1,'asphalt');
  pavement(8,9,20,4.1,0xb3ac9b,'asphalt');
  pavement(16,38,4.6,61,0xb9b4a6,'asphalt');
  // The route turns right in front of the short end wall, then left again.
  box(2,13.65,2.81,15.2,5.62,.35,0xb8aea0,'plaster');
  box(1.1,13.39,1.89,1.57,1.38,.12,0x494a42);
  for(let r=.4;r<1.9;r+=.20)box(r,13.27,1.88,.035,1.39,.045,0x898471);
  for(const y of [1.44,1.9,2.34])box(1.1,13.26,y,1.51,.035,.05,0x84806e);
  box(1.04,13.07,2.88,2.24,.12,1.03,0xb3a997,'metal',0,0,-.14);
  for(const r of [.13,1.98])beam([r,13.47,2.25],[r,12.57,2.83],.049,0x796b56);
  for(const y of [3.6,3.74,4.96]){
    beam([-5.5,13.36,y],[2.5,13.35,y-.19],.023,0x403f39);
    beam([2.5,13.35,y-.19],[9.45,13.36,y],.023,0x403f39);
  }
  for(const r of [-4.6,-3.2,-1.45,-.38,7.8])plant(r,12.87,1.30+.22*Math.abs(r));
  box(-4.85,12.94,.55,2.7,1.06,.32,0x9c6d52,'tile');
  for(const [r,f,len] of [[3.15,-4,7.0],[4.56,-18.4,14],[12.3,39,32]]){
    box(r,f,1.0,.19,1.95,len,0xa5b8a3,'metal');
    box(r,f,1.99,.26,.08,len+.08,0xc1cabe);
    for(let i=-len/2;i<=len/2;i+=3.7)box(r-.12,f+i,1.0,.10,2,.12,0x8b9991);
  }
  box(-2.78,-17,.83,.26,1.58,30,0x9b8c76,'plaster');
  for(const f of [-27,-14,-6])plant(-2.96,f,2.37);
  // A parked bicycle, drainpipe and water tank along the older residential walls.
  for(const r of [3.08,4.03])primitive('wheel','paint',r,13.0,.37,.63,.067,.63,0x515550,0,0,Math.PI/2);
  for(const [a,b] of [[[3.08,13,.37],[3.52,13,.77]],[[3.52,13,.77],[4.03,13,.37]],[[3.35,13,.39],[3.96,13,.82]]])beam(a,b,.043,0x656d62);
  box(3.52,13,.82,.22,.08,.13,0x3c403c);
  drum(9.35,13.38,2.45,.17,4.9,.17,0xb5b1a2);
  drum(19.2,20.4,7.9,1.42,1.90,1.42,0xb9c1b9);oval(19.2,20.4,8.86,1.44,.23,1.44,0xc6cec3);
  box(21.3,8.1,2.86,.42,5.72,13.7,0xb1a998,'plaster');
  box(21.04,8.25,1.24,.22,2.43,5.76,0x9da995,'metal');
  for(const f of [3.1,7.0,11.1,14.0]){
    box(21.01,f,4.06,.17,1.42,1.75,0x53605b,'glass');
    for(let j=-.7;j<.83;j+=.25)box(20.89,f+j,4.07,.06,1.44,.045,0x918d7a);
  }
  box(20.54,8.1,2.97,1.68,.12,13.9,0x939f8e,'metal',0,-.14);
  for(const f of [1.8,13.8,17.3])plant(19.84,f,1.6);
  car(13.97,33,0xd3d4cd,true);
}

function railwayGreen({box,pathSurface,beam,plant,drum,primitive}){
  // Parallel preserved rails in the lawn, beside the forks of the cycle path.
  for(const r of [-19.3,-15.1,-10.8]){
    for(const off of [-.54,.54])box(r+off,22,.11,.075,.085,99,0x8d7960);
    for(let f=-27;f<72;f+=2.25)box(r,f,.071,1.59,.08,.17,0x766957);
  }
  for(const r of [-11.6,-9.5]){
    beam([r,-9,.05],[r,-6.6,1.12],.16,0x615d4e);
    beam([r,-4.2,.05],[r,-6.6,1.12],.16,0x6a6556);
  }
  beam([-11.9,-6.6,1.15],[-9.2,-6.6,1.15],.18,0x5e594d);
  pathSurface([[0,-34],[0,6],[-2,30],[-4,47],[-6,62],[-8,77],[-10,98]],3.6,0x956b5e);
  pathSurface([[-33,-28],[-32,-24],[-25,-5],[-23,0],[-17,3],[0,6]],3.6,0xa57968,'asphalt',.084);
  for(const f of [-20,-4,13,28,44]){
    box(-3.5,f,.52,.11,1.00,.12,0x8c9b91);
    if(f<44)beam([-3.5,f,.91],[-3.5,f+15,.68],.037,0x798577);
  }
  box(6.83,-6,1.69,.26,3.35,14.5,0x9faba4,'metal');
  box(5.48,-6,3.06,3.3,.17,15.2,0x969078,'metal',0,-.10);
  for(const f of [-13,-7,-1,1.6])box(4.17,f,1.45,.12,2.9,.13,0x897859);
  drum(7.48,-6.4,4.15,1.62,1.70,1.62,0xc0c6bc);
  for(const y of [3.67,4.16,4.67])drum(7.48,-6.4,y,1.66,.06,1.66,0x858f8c);
  for(const f of [-16,-9,-2,2])plant(4.48,f,1.02+.02*Math.abs(f));
  for(const f of [-8,14,35,55]){box(3.82,f,2.15,.12,4.3,.12,0x727d75);primitive('umbrella','paint',3.82,f,4.42,.64,.23,.64,0x969b89)}
}

function boatBasin({box,pavement,pathSurface,beam,primitive,oval,scooter,plant}){
  // The path is on the quay. Street View is on the parallel roadway to its east.
  pathSurface([[12,-65],[11,-52],[0,-10],[0,33],[-4,63],[-10,77],[-14,104]],4.35,0xb38a76,'paving',.087);
  pathSurface([[21,-64],[14,-27],[11,-13],[9,3],[7,33],[3,63]],7.8,0x636c6d);
  for(let j=0;j<10;j++)pavement(5.55+j*.76,7,.65,2.8,j%2?0xe4e7cf:0x77b393,'paint',.097);
  for(const [f,l,w] of [[-19,9.2,2.9],[-5.4,12.2,3.6],[12.8,10.5,3.15],[30,12,3.55],[48,8.3,2.76]]){
    const r=-9.3-w/2;
    primitive('hull','paint',r,f,.56,w,1.13,l,0xe4dfcf);
    box(r,f,.98,w*.76,.15,l*.74,0xb8ae99);
    box(r,f-.32,1.45,w*.70,.86,l*.49,0xe5e5d7);
    for(const side of [-1,1])for(const t of [-.17,0,.17])box(r+side*w*.357,f+t*l,1.57,.07,.47,l*.128,0x46646d,'glass');
    box(r,f+l*.21,1.62,w*.66,.47,.10,0x53717a,'glass',0,0,.15);
    box(r,f-.32,1.96,w*.86,.14,l*.53,0xc7d7d4);
    box(r,f-l*.12,2.12,w*.57,.30,l*.19,0xe6dfd0);
    box(r,f-l*.06,2.32,w*.48,.24,.14,0x546b72,'glass',0,0,.28);
    beam([r,f-l*.18,2.22],[r+.14,f-l*.20,2.98],.05,0x8e9b97);
    for(const side of [-1,1])box(r+side*w*.394,f-.08,.87,.065,.14,l*.67,0x4f7181);
    for(const side of [-1,1]){
      for(const t of [.26,.37])beam([r+side*w*.34,f+l*t,.96],[r+side*w*.34,f+l*t,1.34],.034,0xc5c6b8);
      beam([r+side*w*.34,f+l*.24,1.34],[r+side*w*.34,f+l*.38,1.34],.043,0xc5c6b8);
    }
    oval(r+w*.46,f-l*.19,.69,.20,.52,.23,0x536b78);
    beam([r+w*.29,f+.29*l,1],[-7.6,f+.41*l,.63],.027,0x7c8079);
  }
  box(-7.4,13,.49,.91,.35,90,0x9b8b79);
  // A small arched waterfront shelter and open benches beside the red promenade.
  for(const f of [22,26,30]){
    for(const r of [-4.6,-2.3])box(r,f,1.29,.12,2.57,.14,0xb1b8ae);
  }
  for(let i=0;i<10;i++){
    const a=(i+.5)*Math.PI/10,r=-3.45+1.35*Math.cos(a),y=2.48+.91*Math.sin(a);
    box(r,26,y,.47,.10,9.4,0xb18372,'metal',0,a-Math.PI/2);
  }
  for(const f of [24,28]){box(-3.72,f,.48,.61,.13,2.22,0x897760);for(const d of [-.72,.72])box(-3.72,f+d,.21,.48,.41,.11,0x606964)}
  // Corner along the roadway, behind the quay, with a cut-back balcony and slatted shop base.
  for(const [f,w] of [[-3,7],[5,8.8],[14,7.8]]){
    box(17.9,f,4.84,3.4,9.65,w,0xc7b9a5,'tile');
    box(16.1,f,1.62,.28,3.22,w-.55,0x857b68,'shutter');
    for(const y of [3.4,6.55]){
      box(15.72,f,y,1.06,.25,w+.28,0xd2cbbb);
      box(16.08,f,y+1.45,.22,1.72,w*.68,0x546a6b,'glass');
      for(const h of [.45,.83])box(15.28,f,y+h,.08,.064,w,0x46534d);
      for(const t of [-.4,0,.4])box(15.28,f+t*w,y+.41,.065,.85,.068,0x586059);
    }
  }
  for(const f of [-10,3.2,12.4])scooter(14.8,f,58,0x454d52);
  for(const f of [4.9,18])plant(15.1,f,1.75);
}
function marketJunction({box,pavement,beam,oval,primitive,sign,scooter,car,signal,plant}){
  // Red tiled corner with wrap-around windows and a separate shaded tea counter.
  box(8.04,-3.3,6.7,4.5,13.39,17.5,0x9f5c53,'tile');
  for(const y of [4.7,7.85,11.0]){
    for(const f of [-8.92,-3.38,2.14]){
      box(5.72,f,y,.14,1.61,3.78,0xadbbac);
      box(5.62,f,y,.1,1.36,3.54,0x577477,'glass');
      for(const t of [-1.1,.04,1.22])box(5.54,f+t,y,.10,1.42,.06,0xc3c4b4);
      box(5.42,f,y-.46,.10,.08,3.99,0x5e655b);
      for(const t of [-1.6,-.8,0,.8,1.6])box(5.42,f+t,y-.63,.075,.38,.045,0x6f7467);
    }
    box(8.03,5.51,y,3.28,1.49,.13,0x58757a,'glass');
    box(8.03,5.61,y-.63,3.64,.11,.17,0xb6b6a3);
  }
  box(5.13,-3.3,3.35,1.47,.28,17.83,0x955c50,'tile');
  for(const f of [-11.57,-5.76,.05,5.1])box(4.74,f,1.68,.36,3.36,.41,0x935746,'tile');
  box(5.59,-2.44,1.55,.23,2.94,4.81,0x46544b);
  box(5.27,-2.44,.94,.67,.16,4.52,0xc3b59a);
  sign(5.19,2.4,5.75,.98,2.17,'#e5e5cb','#426245','青草茶');
  for(const [f,len,color] of [[25,5,0xcdbdab],[31.5,7.7,0xcead9a],[40,8.9,0xa6a598]]){
    box(7.8,f,4.03,3.32,8.01,len,color,'plaster');
    box(6.08,f,1.52,.15,2.91,len-.44,0x617376,'glass');
    box(5.44,f,3.13,1.59,.21,len+.08,0xa49c89);
    box(5.0,f+len*.46,1.52,.21,3.03,.23,0xb8aa96);
    for(const t of [-.26,.26]){
      box(6.03,f+t*len,5.64,.16,1.53,len*.29,0x566c69,'glass');
      box(5.86,f+t*len,4.83,.43,.12,len*.34,0xc3bdab);
      box(5.89,f+t*len,5.63,.09,1.50,.075,0xc9c6b6);
    }
    for(let k=0;k<11;k++)box(5.47,f+(k/11-.45)*len,2.92,1.52,.18,len/11,k%2?0xc1b2a6:0x9b6d66,'paint',0,-.15);
    box(5.52,f-.18*len,.85,.78,.14,len*.45,0x97836b);
  }
  pavement(0,11,13,10.7,0x697070);
  for(const f of [7.4,15.2]){
    for(let r=-5.8;r<=5.8;r+=1.32)pavement(r,f,.65,2.53,0xe7e2ca,'paint',.098);
  }
  for(const f of [-18,32,55])for(const r of [-.87,-.63])pavement(r,f,.09,15,0xcdb879,'paint',.09);
  for(const [f,ink] of [[-4,0xb19a9c],[1,0x77a58a],[4.5,0x9f92a3]]){
    box(-8.7,f,.76,1.6,1.23,1.82,0x879b88,'metal');box(-8.7,f,1.44,1.76,.14,1.97,0xb9b69c);
    beam([-8.7,f,1.3],[-8.7,f,2.90],.065,0x7b8175);
    primitive('umbrella','paint',-8.7,f,2.73,3.03,.70,3.03,ink);
    for(let j=0;j<3;j++)oval(-8.45,f+(j-1)*.48,1.58,.39,.26,.44,[0x8c9858,0xb59161,0x66895e][j]);
  }
  for(const [r,f,a] of [[-7,-11,-52],[4.2,-15,64],[4.56,22,58],[-6,25,-36],[4.88,34,66]])scooter(r,f,a,0x57636a);
  signal(-7.2,4.8,5.2);plant(5.0,19.5,1.3);
  car(3.37,36.4,0x475764,true);car(-4.45,54,0xc2c6c1);
}
