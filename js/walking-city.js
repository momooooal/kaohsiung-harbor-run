import {walkingScenery} from './walking-scenery.js';
import environment from '../data/walking-environment.js';
import legs from '../data/walking-legs.js';
import blocks from '../data/walking-blocks.js';
import {stops} from '../data/shared-route.js';

// Local east/south metre coordinates, derived from OSM. Floor counts without
// recorded heights use an indicative extrusion, not a surveyed facade.
export function walkingCity(start=0){
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0xc6dfe3);scene.fog=new THREE.Fog(0xc6dfe3,90,430);
  scene.add(new THREE.HemisphereLight(0xfff4e2,0xa5b5ad,1));
  const sun=new THREE.DirectionalLight(0xffe5bb,.66);sun.position.set(-40,70,24);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(512,512);
  Object.assign(sun.shadow.camera,{left:-56,right:56,top:56,bottom:-56,far:210});sun.shadow.bias=-.0013;sun.shadow.normalBias=.12;
  const positions=[],colors=[],styles=[];let style=0;
  function tri(a,b,c,color){positions.push(...a,...b,...c);styles.push(style,style,style);for(let i=0;i<3;i++)colors.push(color.r,color.g,color.b)}
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
  const profiles=new Map(environment.profiles.map(([p,type])=>[p.join(),type]));
  const buildings=blocks.buildings.concat(environment.mappedBuildings);
  buildings.forEach(([h,points,kind],i)=>{
    const [x,z]=points[0],parkHouse=h===8&&Math.hypot(x-1980,z-716)<76;
    if(parkHouse)h=3.45;
    style=0;polygon(points,h,roof);
    const profile=kind||profiles.get(points[0].join());
    style=x===2017&&z===1360?6:profile==='warehouse'?3:profile==='hall'?4:profile==='terminal'?5:2;
    if(parkHouse||profile==='warehouse'){
      // Clip both faces of the pitched roof at its ridge so that irregular footprints retain their outline.
      let ax=1,az=0,longest=0;
      points.forEach((a,j)=>{const b=points[(j+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len>longest){longest=len;ax=-dz/len;az=dx/len}});
      const projection=p=>p[0]*ax+p[1]*az,ds=points.map(projection),min=Math.min(...ds),max=Math.max(...ds),mid=(min+max)/2;
      const rise=Math.min(2.4,(max-min)*.20);
      function roofVertex(p){return vert(p,h+.12+rise*(1-Math.abs(projection(p)-mid)/Math.max(.01,(max-min)/2)))}
      for(const side of [-1,1]){
        const half=[];points.forEach((a,j)=>{const b=points[(j+1)%points.length],u=side*(projection(a)-mid),v=side*(projection(b)-mid);if(u>=0)half.push(a);if(u*v<0){let t=u/(u-v);half.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])}});
        const fill=tint(side<0?0x6a665c:0x817e70);for(const [a,b,c] of THREE.ShapeUtils.triangulateShape(half.map(v=>new THREE.Vector2(...v)),[]))tri(roofVertex(half[a]),roofVertex(half[b]),roofVertex(half[c]),fill);
      }
    }
    points.forEach((a,j)=>{const b=points[(j+1)%points.length],color=facades[i%4];tri(vert(a,0),vert(b,0),vert(a,h),color);tri(vert(a,h),vert(b,0),vert(b,h),color)});
  });
  style=0;
  blocks.water.forEach(p=>polygon(p,.01,tint(0x78aeb0)));
  for(const [width,line,surface,lanes] of blocks.roads){
    const paved=surface==='paving_stones'||surface==='concrete:plates';
    const roadColor=tint(paved?0xad9f8f:width<=2?0xb5afa0:0x686f70);
    let phase=0;
    line.slice(1).forEach((b,i)=>{
      const a=line[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
      ribbon(a,b,width,paved?.044:.035,roadColor);
      if(length<.15||lanes<2||lanes>8)return;
      for(let lane=1;lane<lanes;lane++){
        const offset=width*(lane/lanes-.5),x=a[0]-dz/length*offset,z=a[1]+dx/length*offset;
        for(let t=-phase;t<length;t+=10){
          const first=Math.max(0,t),last=Math.min(length,t+3.2);if(last<=first)continue;
          ribbon([x+dx*first/length,z+dz*first/length],[x+dx*last/length,z+dz*last/length],.105,.057,tint(0xe3dfce));
        }
      }phase=(phase+length)%10;
    });
  }
  const scenery=walkingScenery(scene,{polygon,ribbon,tint});
  const path=[],dist=[],ends=[],names=[],guide=tint(0xf7bb64);
  let total=0;
  legs.forEach(({path:line,streets})=>{
    let street='',cursor=0;
    line.forEach((p,i)=>{
      while(cursor<streets.length&&streets[cursor][0]<=i)street=streets[cursor++][1];
      const a=path.at(-1);if(a){const l=Math.hypot(a[0]-p[0],a[1]-p[1]);if(!l)return;total+=l;ribbon(a,p,.14,.112,guide)}
      path.push(p);dist.push(total);names.push(street);
    });ends.push(total);
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('facadeStyle',new THREE.Float32BufferAttribute(styles,1));geometry.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1});
  m.onBeforeCompile=shader=>{
    shader.uniforms.roadTexture={value:scenery.asphalt};
    shader.uniforms.paverTexture={value:scenery.brick};
    shader.vertexShader='attribute float facadeStyle; varying float style; varying vec3 streetPos; varying vec3 streetNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstreetPos=position;streetNormal=normal;style=facadeStyle;');
    shader.fragmentShader='uniform sampler2D roadTexture; uniform sampler2D paverTexture; varying float style; varying vec3 streetPos; varying vec3 streetNormal;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 uv=streetPos.xz;
      if(streetPos.y<.1 && abs(streetNormal.y)>.9){
        float grain=texture2D(roadTexture,uv*.23).r;
        if(abs(streetPos.y-.035)<.001)diffuseColor.rgb*=.37+grain*1.12;
        else if((abs(streetPos.y-.075)<.001 || abs(streetPos.y-.044)<.001))diffuseColor.rgb*=.32+texture2D(paverTexture,uv*.19).r*1.15;
        else diffuseColor.rgb*=.74+grain*.49;
      }
      if(abs(streetNormal.y)<.2 && style>1.5){
        float along=dot(streetPos.xz,vec2(streetNormal.z,-streetNormal.x));
        float u=fract(along/3.35),v=fract(streetPos.y/3.25);
        if(style>2.5 && style<3.5){
          float bay=fract(along/7.6);
          if(streetPos.y<3.2 && bay>.20 && bay<.78)diffuseColor.rgb*=vec3(.19,.22,.21);
          else diffuseColor.rgb*=vec3(.87,.65,.50)*(.56+.6*texture2D(paverTexture,vec2(along,streetPos.y)*.36).r);
        }else if(style>5.5){
          if(streetPos.y>3.8)diffuseColor.rgb=vec3(.018,.095,.21);
          else diffuseColor.rgb=mix(vec3(.06,.12,.15),vec3(.31,.36,.36),step(.94,u));
        }else if(style>3.5){
          float rib=smoothstep(.06,.13,u);
          diffuseColor.rgb*=mix(vec3(.26,.37,.4),vec3(.78,.89,.90),rib)*(.8+.2*v);
        }else{
          float pane=step(.16,u)*step(u,.82)*step(.22,v)*step(v,.8);
          if(streetPos.y<2.75)pane=step(.12,u)*step(u,.90);
          diffuseColor.rgb*=mix(vec3(.84+.16*v),vec3(.26,.37,.39),pane);
          if(pane>.5 && abs(u-.49)<.014)diffuseColor.rgb*=1.7;
        }
      }`);
  };
  const streetMesh=new THREE.Mesh(geometry,m);streetMesh.castShadow=streetMesh.receiveShadow=true;scene.add(streetMesh);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000),new THREE.MeshLambertMaterial({color:0xb9bcaa}));const paving=new THREE.TextureLoader().load('assets/surfaces/concrete_pavement_02.jpg');paving.encoding=THREE.sRGBEncoding;paving.wrapS=paving.wrapT=THREE.RepeatWrapping;paving.repeat.set(2400,2400);ground.material.map=paving;ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
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
    pos.set(x,0,z);scenery.setCenter(x,z);sun.position.set(x-42,66,z+28);sun.target.position.set(x,0,z);segment=ends.findIndex(end=>at<end);if(segment<0)segment=8;
    const nearest=at- (segment?ends[segment-1]:0)<ends[segment]-at?segment:segment+1;
    return {nearest,near:Math.abs(at-(nearest?ends[nearest-1]:0))<90,heading:Math.atan2(f[0]-b[0],f[1]-b[1]),status:at===total?'全程抵達':stops[segment][0]+' → '+stops[segment+1][0],hint:(names[i]||'步行路段')+' · 全程 '+Math.floor(100*at/total)+'%'};
  },dispose(){sun.shadow.map?.dispose();scenery.dispose();paving.dispose();labels.forEach(t=>t.dispose());scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}};
}
