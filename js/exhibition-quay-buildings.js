import {marinaBerths} from './marina-berths.js';
import {hallOutline,westDoor,whaleHalls} from '../data/exhibition-quay.js';

// A single coloured mesh per building. Only aluminium cassettes have edge seams.
function envelope(group,anchor){
  const vertices=[],colors=[],borders=[],color=new THREE.Color();
  function face(a,b,c,ink,seam=false){
    vertices.push(...a,...b,...c);color.setHex(ink).convertSRGBToLinear();
    for(let i=0;i<3;i++)colors.push(color.r,color.g,color.b);
    borders.push(...(seam?[1,0,0,0,1,0,0,0,1]:[1,1,1,1,1,1,1,1,1]));
  }
  function quad(a,b,c,d,ink){face(a,b,c,ink);face(a,c,d,ink);}
  function finish(){
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('rim',new THREE.Float32BufferAttribute(borders,3));g.computeVertexNormals();
    const m=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    m.onBeforeCompile=s=>{
      s.vertexShader='attribute vec3 rim; varying vec3 edgeRatio;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nedgeRatio=rim;');
      s.fragmentShader='varying vec3 edgeRatio;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float edge=min(edgeRatio.x,min(edgeRatio.y,edgeRatio.z));
        diffuseColor.rgb*=mix(.69,1.,smoothstep(.002,.014,edge));`);
    };
    const mesh=new THREE.Mesh(g,m);group(...anchor).add(mesh);
  }
  return {face,quad,finish};
}

const xyz=(p,h)=>[p[0],h,p[1]];
const lerp=(a,b,t)=>a+(b-a)*t;

// West/east doors share the boulevard axis. Work in transverse sections so
// the roof, both long sides and the scalloped ends meet at identical heights.
export function exhibitionHall({panel,beam,P,group,tree,mix,slab}){
  const mesh=envelope(group,westDoor),ux=.9434,uz=-.3317;
  const site=(u,v)=>[westDoor[0]+u*ux-v*uz,westDoor[1]+u*uz+v*ux];
  const local=([x,z])=>[(x-westDoor[0])*ux+(z-westDoor[1])*uz,-(x-westDoor[0])*uz+(z-westDoor[1])*ux];
  const ring=hallOutline.map(local),across=ring.map(p=>p[1]),south=Math.max(...across),north=Math.min(...across);
  function roof(v){const t=Math.min(1,Math.abs(v/(v<0?north:south)));return 12.3+12.4*Math.sin(t*Math.PI)**.92+2.1*t;}
  const rows=[...new Set([...across,0,...Array.from({length:49},(_,i)=>lerp(north,south,i/48))])].sort((a,b)=>a-b);
  let prev=null;
  for(const v of rows){
    const intersections=[];
    for(let i=1;i<ring.length;i++){
      const [a,b]=[ring[i-1],ring[i]];
      if(v<Math.min(a[1],b[1])-1e-7||v>Math.max(a[1],b[1])+1e-7||Math.abs(b[1]-a[1])<1e-8)continue;
      intersections.push(lerp(a[0],b[0],(v-a[1])/(b[1]-a[1])));
    }
    if(!intersections.length)continue;
    const edge=[Math.min(...intersections),Math.max(...intersections)].map(u=>xyz(site(u,v),roof(v)));
    if(prev)mesh.quad(prev[0],prev[1],edge[1],edge[0],Math.abs(v)<4.7?0x899d9e:0xb7bfc0);
    prev=edge;
  }
  const metals=[0xdde0dc,0xc3cbca,0xb9bfbd,0xd1d5d1,0xa2aaa9,0xd4d7d3,0xbfc8cb,0xe2e4de];
  for(let k=1;k<ring.length;k++){
    const a=ring[k-1],b=ring[k],len=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(len/3.3);
    // Right-hand (exterior) normal in local east/south coordinates.
    const normal=[-(b[1]-a[1])/len,(b[0]-a[0])/len];
    function point(t,offset=0){return site(lerp(a[0],b[0],t)+normal[0]*offset,lerp(a[1],b[1],t)+normal[1]*offset);}
    function wall(t,row){
      const v=lerp(a[1],b[1],t),portal=Math.abs(v)<10.5;
      const eave=roof(v),base=portal?8:4.05;
      const height=lerp(base,eave,row),offset=-1.15*(1-row)+1.25*Math.sin(row*Math.PI);
      return xyz(point(t,offset),height);
    }
    for(let j=0;j<count;j++){
      const lo=j/count,hi=(j+1)/count,v=lerp(a[1],b[1],(lo+hi)/2),portal=Math.abs(v)<10.5;
      // The ends of both halls are glazed from the plinth to the wave roof.
      // A deep open truss projects past the glass, seen from the park and East Lobby.
      if(Math.abs(normal[0])>.55){
        const p=point(lo,-5.4),q=point(hi,-5.4),e=point(lo),f=point(hi);
        const upper=t=>roof(lerp(a[1],b[1],t));
        const hl=upper(lo),hr=upper(hi);
        for(let r=0;r<7;r++){
          const low=r/7,top=(r+1)/7;
          const tones=[0x6d888d,0x516e77,0x557580,0x7b9b9e,0x829da2,0x738e94,0x637e87];
          const color=r<3&&((j+2*k)%7)<2?0x53696a:tones[r];
          mesh.quad(xyz(p,lerp(.32,hl-.8,low)),xyz(q,lerp(.32,hr-.8,low)),xyz(q,lerp(.32,hr-.8,top)),xyz(p,lerp(.32,hl-.8,top)),color);
          beam(P(p,lerp(.32,hl-.8,low)),P(q,lerp(.32,hr-.8,low)),.037,0xb1bfbc);
        }
        beam(P(p,.18),P(p,hl-.8),.062,0xb3bfba);
        mesh.quad(xyz(e,hl),xyz(f,hr),xyz(q,hr-.72),xyz(p,hl-.72),0x859293);
        beam(P(e,hl+.03),P(f,hr+.03),.17,0xd9dcd4);
        beam(P(e,hl-.78),P(f,hr-.78),.091,0x9aa5a2);
        beam(P(e,hl-.78),P(q,hr-.13),.094,0xb6bdb4);
        beam(P(e,hl-.1),P(p,hl-.78),.075,0xa8b1a9);
        if(portal){
          panel(p,q,1.27,2.42,.16,0x465b60);
          for(const h of [.16,2.46])panel(p,q,h,.095,.24,0xc6ccc5);
          if(j%3===1){
            const foot=point((lo+hi)/2,-2.3),fork=P(foot,hl*.66);
            beam(P(foot,.1),fork,.21,0xe2e1d5);
            beam(fork,P(e,hl-.8),.14,0xe2e1d5);beam(fork,P(q,hr-.7),.14,0xe2e1d5);
          }
        }
        continue;
      }
      const p=point(lo,portal?-3:-1.75),q=point(hi,portal?-3:-1.75);
      if(portal){
        panel(p,q,3.7,7.36,.18,0x435d62);
        for(const h of [.32,2.32,4.15,6.5,7.65])panel(p,q,h,.075,.25,0xbac4bf);
        beam(P(p,.1),P(p,7.8),.07,0xa7b3b0);
        mesh.quad(xyz(p,7.95),xyz(q,7.95),wall(hi,0),wall(lo,0),0x868d88);
      }else{
        panel(p,q,1.92,3.8,.23,0x68716f);
        panel(p,q,.68,1.28,.35,0x938f82);
        for(let h=1.4;h<4;h+=.235)panel(point(lo,-1.57),point(hi,-1.57),h,.09,.19,0xa6ada9);
        if(j%4===1)beam(P(point(lo,-1.63),2.9),P(point(hi,-1.2),4.22),.095,0xd2d4c8);
      }
      for(let r=0;r<4;r++){
        const l=wall(lo,r/4),m=wall(hi,r/4),n=wall(hi,(r+1)/4),o=wall(lo,(r+1)/4);
        const t=(r*7+j*3+k)%metals.length;
        const glass=r===2&&(j+3*k)%8===2;
        if((r+j)%2){mesh.face(l,m,o,metals[t],true);mesh.face(o,m,n,glass?0x64808b:metals[(t+3)%8],true);}
        else{mesh.face(l,m,n,metals[t],true);mesh.face(l,n,o,glass?0x5e7884:metals[(t+1)%8],true);}
      }
    }
    // Grey forecourt pavers meet the grass-block margin on the long south front.
    if(k===5){
      const apron=[point(0,-1.46),point(1,-1.46),point(1,7.4),point(0,7.4)];
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(apron.flatMap(p=>xyz(p,.121)),3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,len,0,len,8.86,0,8.86],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();
      const m=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});m.onBeforeCompile=s=>{
        s.vertexShader='varying vec2 plaza;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nplaza=uv;');
        s.fragmentShader='varying vec2 plaza;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec2 grid=plaza*vec2(2.2,3.5);grid.x+=.5*mod(floor(grid.y),2.);
        float tone=fract(sin(dot(floor(grid),vec2(27.32,71.21)))*4375.);
        vec2 joint=abs(fract(grid)-.5);
        diffuseColor.rgb=mix(vec3(.24,.25,.24),vec3(.42,.42,.40),tone)*mix(1.,.77,smoothstep(.45,.49,max(joint.x,joint.y)));
        if(plaza.y>7.)diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.14,.21,.10),smoothstep(.28,.43,max(joint.x,joint.y))); `);
      };
      group(...apron[0]).add(new THREE.Mesh(g,m));
      // A hedge separates the grey servicing apron from the tree-lined lane.
      for(let d=8;d<len-6;d+=4.2){
        const t=d/len,center=point(t,9.15);
        panel(point((d-1.95)/len,9.15),point((d+1.95)/len,9.15),.31,.47,.85,0x6e7f56);
        tree(...center,.15,1.7);
        if(Math.round((d-8)/4.2)%3===0)tree(...point(t,11.15),.9,1.15);
      }
    }
  }
  // Approach from the park, along the mapped walk rather than through the play area.
  const approach=[[765.9,390.1],[768.2,373.5],[772.7,362.5],[778.3,349.9],[787.8,342.8],[795.3,341.4]];
  for(let i=1;i<approach.length;i++){
    const a=approach[i-1],b=approach[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    const side=(p,t)=>[p[0]-dz/len*t,p[1]+dx/len*t];
    slab([side(a,-2.1),side(b,-2.1),side(b,2.8),side(a,2.8),side(a,-2.1)],.128,0xb6b8ac);
    if(i<=3)slab([side(a,2.8),side(b,2.8),side(b,10.5),side(a,10.5),side(a,2.8)],.118,0xa6ada7);
  }
  for(const p of [[758,383],[756,367],[760,348],[769,336],[787,382],[797,367]])tree(...p,1.19,1.18);
  for(const [x,z] of [[775,383],[782,369]]){
    beam(P([x,z],.12),P([x,z],2.35),.065,0xd98542);
    beam(P([x+2.5,z-.7],.12),P([x+2.5,z-.7],2.35),.065,0x528eb0);
    beam(P([x,z],2.35),P([x+2.5,z-.7],2.35),.067,0x679eb0);
  }
  for(const [x,z] of [[757,372],[768,341]]){
    beam(P([x,z],.12),P([x,z],4.5),.072,0x9a9f98);
    beam(P([x,z],4.5),P([x+.45,z-.16],4.94),.06,0x939a96);
    panel([x+.38,z-.16],[x+1.05,z-.39],4.95,.10,.17,0xaeb6b0);
  }
  mesh.finish();
}

export function whaleHall(ring,{panel,beam,P,mix,slab,group}){
  const mesh=envelope(group,ring[0]),a=ring[0],b=ring[1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
  const inland=p=>(p[0]-a[0])*(-dz)+(p[1]-a[1])*dx;
  const depth=Math.max(...ring.map(inland));
  const h=p=>.8+7.8*(1-THREE.MathUtils.clamp(inland(p)/depth,0,1));
  slab(ring,.12,0xc7c7be);slab(ring,0,0x748c4c,h);
  for(let j=1;j<ring.length;j++){
    const p=ring[j-1],q=ring[j];
    if(j===1){
      // Inset the tall glass opening into the white harbour-facing frame.
      const l=mix(p,q,.09),r=mix(p,q,.91);
      const inset=x=>[x[0]-dz*.44,x[1]+dx*.44];
      const lower=1.05,upper=7.85;
      for(const [c,d] of [[p,l],[r,q]])mesh.quad(xyz(c,.13),xyz(d,.13),xyz(d,h(d)),xyz(c,h(c)),0xdddcd4);
      for(const [bottom,top] of [[.13,lower],[upper,h(p)]])mesh.quad(xyz(l,bottom),xyz(r,bottom),xyz(r,top),xyz(l,top),0xd6d8d2);
      for(const x of [l,r])mesh.quad(xyz(x,lower),xyz(inset(x),lower),xyz(inset(x),upper),xyz(x,upper),0xabb2ac);
      const g=inset(l),i=inset(r);
      for(let t=0;t<6;t++){
        const c=mix(g,i,t/6),d=mix(g,i,(t+1)/6);
        for(const [bot,top,tint] of [[lower,2.55,0x52676b],[2.55,5.35,0x6b8992],[5.35,upper,0x99afb4]])
          mesh.quad(xyz(c,bot),xyz(d,bot),xyz(d,top),xyz(c,top),tint);
        beam(P(c,lower),P(c,upper),.042,0xbcc6c4);
      }
      for(const y of [lower,2.55,5.35,upper])panel(g,i,y,.065,.13,0xc1c9c5);
    }else{
      mesh.quad(xyz(p,.1),xyz(q,.1),xyz(q,h(q)),xyz(p,h(p)),0xc7ccc3);
      beam(P(p,h(p)),P(q,h(q)),.095,0xc5cac4);
      if(Math.hypot(q[0]-p[0],q[1]-p[1])>9){
        for(let n=0;n<8;n++){
          const t=n/8,m=mix(p,q,t);
          if(h(m)>2.6&&n%2===1){const side=mix(p,q,t+.075),y=h(m)*.47;
            mesh.quad(xyz(mix(m,side,.5),y-.43),xyz(side,y),xyz(mix(m,side,.5),y+.43),xyz(m,y),0x547377);}
          beam(P(m,h(m)+.04),P(m,h(m)+.94),.028,0x929b91);
        }
        for(const y of [.53,.96])beam(P(p,h(p)+y),P(q,h(q)+y),.033,0xaeb6af);
      }
    }
  }
  mesh.finish();
}

export function waterfrontBuildings(kit){
  marinaBerths(kit);
  if(hallOutline.some(p=>kit.nearby.has(kit.key(...p))))exhibitionHall(kit);
  for(const ring of whaleHalls)if(kit.nearby.has(kit.key(...ring[0])))whaleHall(ring,kit);
}
