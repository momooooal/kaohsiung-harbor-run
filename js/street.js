const assets='assets/surfaces/';
export function streetMaterials(scene, materials, points){
  const loader=new THREE.TextureLoader();
  const textures=[];
  function load(file){const t=loader.load(assets+file);textures.push(t);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
  function projected(mat,file,scale,vertical=false){
    const t=load(file);t.wrapS=t.wrapT=THREE.RepeatWrapping;
    mat.map=t;mat.color.setHex(0xffffff);
    mat.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 worldSurface; varying vec3 worldSide;\n'+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nworldSurface=(modelMatrix*vec4(transformed,1.)).xyz;worldSide=normalize(mat3(modelMatrix)*normal);');
      const coords=vertical?'(abs(worldSide.x)>abs(worldSide.z)?worldSurface.zy:worldSurface.xy)':'worldSurface.xz';
      shader.fragmentShader='varying vec3 worldSurface; varying vec3 worldSide;\n'+shader.fragmentShader.replace('#include <map_fragment>', 'vec4 texelColor=texture2D(map,'+coords+'*'+scale.toFixed(3)+');diffuseColor*=mapTexelToLinear(texelColor);');
    };
    mat.customProgramCacheKey=()=>file;
  }
    const surfaces=[
    [0xb8ac92,'cobblestone_square.jpg',.24],
    [0xaaaca0,'asphalt_02.jpg',.24],
    [0xa68260,'wood_planks_grey.jpg',.32],
    [0xc6c3b8,'concrete_pavement_02.jpg',.22]
  ];
  for(const [color,file,scale] of surfaces){if(materials.has(color))projected(materials.get(color),file,scale)}  projected(materials.get(0x88bab0),'aerial_grass_rock.jpg',.13);
  const brick=new THREE.MeshLambertMaterial();projected(brick,'brick_wall_001.jpg',.25,true);
  const sky=new THREE.Mesh(new THREE.SphereGeometry(550,64,32),new THREE.MeshBasicMaterial({map:load('harbor-light.jpg'),side:THREE.BackSide,fog:false,toneMapped:false}));
  sky.scale.x=-1;sky.rotation.y=1.2;scene.add(sky);
  scene.fog=new THREE.FogExp2(0xe8dfcf,.0016);
  const box=new THREE.BoxGeometry(), cache=new Map(),batches=new Map();
  function rect(x,y,z,w,h,d,angle,color){
    if(!batches.has(color))batches.set(color,[]);
    const o=new THREE.Object3D();o.position.set(x,y,z);o.rotation.y=angle;o.scale.set(w,h,d);o.updateMatrix();batches.get(color).push(o.matrix);
  }
  const treePositions=[],placed=[],shadowPositions=[];
  const treeTex=load('tree.png');
  function nearWalk(x,z){return points.slice(1).some((b,i)=>{const a=points[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<6.8})}
  const waterMat=new THREE.MeshPhongMaterial({color:0x477b74,specular:0xbccdd2,shininess:48});
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1],len=a.distanceTo(b),v=b.clone().sub(a).normalize(),angle=Math.atan2(v.x,v.z);
    for(let d=3;d<len;d+=8){
      const x=a.x+v.x*d,z=a.z+v.z*d;
      if(placed.some(p=>Math.hypot(p.x-x,p.z-z)<6))continue;placed.push({x,z});
      const pos=(side,fwd=0)=>[x+v.z*side+v.x*fwd,z-v.x*side+v.z*fwd];
      function detail(side,y,w,h,l,color,fwd=0){const [px,pz]=pos(side,fwd);rect(px,y,pz,w,h,l,angle,color)}
      const n=placed.length,waterside=i>=7 && i<=31;
      for(const side of [-1,1]){
        if(waterside || i<2 || i>=40)continue;
        const [tx,tz]=pos(side*(i>=3&&i<=6?7.1:8+n%4));if(nearWalk(tx,tz))continue;
        const h=(i>=3&&i<=6?12:5.8)+2*Math.sin(n*1.6);treePositions.push([tx,tz,h]);shadowPositions.push([tx+1.3,tz+1.5,h]);
      }
      if(waterside){
        const [wx,wz]=pos(36);
        if(!nearWalk(wx,wz)){rect(wx,-.16,wz,49,.12,9,angle,waterMat);detail(10,.1,.6,.35,8.4,0xa99b89);detail(9.6,.76,.1,1.32,.11,0x414b49);detail(9.6,1.38,.11,.10,8.3,0x526361);detail(9.6,.85,.07,.07,8.3,0x526361)}
      }
      if(n%3===0){detail(-5.8,2.15,.12,4.3,.12,0x414c4e);detail(-5.6,4.3,.65,.12,.34,0xe6dabd)}
      if(n%4===0){detail(-5.6,.5,1.1,.13,2.6,0x92603d);detail(-6.02,.86,.12,.7,2.6,0x92603d);for(const f of [-.82,.82])detail(-5.7,.24,.8,.48,.12,0x4e514b,f)}
      if(n%4===1 && (i===2||i>=32 && i<40)){
        const [hx,hz]=pos(-27);
        if(nearWalk(hx,hz))continue;
        const h=5+n%3;const wall=new THREE.Mesh(box,brick);wall.position.set(hx,h/2,hz);wall.rotation.y=angle;wall.scale.set(9,h,17);scene.add(wall);
        for(const side of [-1,1]){const [rx,rz]=pos(-27+side*2.45);const roof=new THREE.Mesh(box,cache.get('roof')||new THREE.MeshLambertMaterial({color:0x755e52}));cache.set('roof',roof.material);roof.position.set(rx,h+.35,rz);roof.rotation.order='YXZ';roof.rotation.y=angle;roof.rotation.z=-side*.18;roof.scale.set(5.1,.20,17.8);scene.add(roof)}
        for(let f=-6;f<=6;f+=3){detail(-22.45,h*.55,.22,1.8,1.7,0x324a4a,f);detail(-22.29,h*.55,.08,1.8,.09,0xe3dbc7,f);detail(-22.29,h*.55,.08,.1,1.8,0xe3dbc7,f)}
      }
    }
  }
  for(const [color,list] of batches){const mat=typeof color==='number'?new THREE.MeshLambertMaterial({color}):color;const mesh=new THREE.InstancedMesh(box,mat,list.length);list.forEach((m,i)=>mesh.setMatrixAt(i,m));scene.add(mesh)}
  const trees=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:treeTex,alphaTest:.28,side:THREE.DoubleSide,color:0xe5e1ca}),treePositions.length);
  scene.add(trees);trees.frustumCulled=false;trees.castShadow=true;trees.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:treeTex,alphaTest:.28,side:THREE.DoubleSide});
  const blob=document.createElement('canvas');blob.width=blob.height=64;const ctx=blob.getContext('2d'),g=ctx.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(30,23,10,.48)');g.addColorStop(1,'rgba(30,23,10,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  const shade=new THREE.CanvasTexture(blob);textures.push(shade);
  const shadows=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false}),shadowPositions.length);
  const dummy=new THREE.Object3D();shadowPositions.forEach(([x,z,h],i)=>{dummy.position.set(x,.11,z);dummy.rotation.set(-Math.PI/2,0,.5);dummy.scale.set(h*.85,h*1.4,1);dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix)});scene.add(shadows);
  let lastYaw=Infinity;
  return {update(camera){sky.position.copy(camera.position);const dir=camera.getWorldDirection(dummy.position);const yaw=Math.atan2(dir.x,dir.z);if(Math.abs(yaw-lastYaw)<.025)return;lastYaw=yaw;treePositions.forEach(([x,z,h],i)=>{dummy.position.set(x,h/2-.1,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(h*.64,h,1);dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix)});trees.instanceMatrix.needsUpdate=true},dispose(){textures.forEach(t=>t.dispose())}};
}



