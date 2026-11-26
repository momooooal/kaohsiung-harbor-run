import features from '../data/corridor-details.js';

// Source geometry stays in the same east/south metre grid as the route.
// Preserve gaps where a mapped wall crosses the playable opening.
export function corridorDetails({nearby,key,points,beam,panel,slab,P}){
  const lanes=new Map();
  const cell=(x,z)=>Math.floor(x/8)+','+Math.floor(z/8);
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(a.distanceTo(b)/2));
    for(let j=0;j<=steps;j++){
      const t=j/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
      const id=cell(x,z);if(!lanes.has(id))lanes.set(id,[]);lanes.get(id).push([x,z]);
    }
  }
  function inWalk([x,z]){
    for(const dx of [-8,0,8])for(const dz of [-8,0,8]){
      if(lanes.get(cell(x+dx,z+dz))?.some(p=>Math.hypot(x-p[0],z-p[1])<2.2))return true;
    }
    return false;
  }
  for(const [kind,,line] of features){
    if(!line.some(p=>nearby.has(key(...p))))continue;
    const [x,z]=line[0];
    if(kind==='bus'||kind==='bollard'){
      if(inWalk(line[0]))continue;
      const bus=kind==='bus';
      beam(P(line[0],.08),P(line[0],bus?2.65:.78),bus?.05:.095,0x818888);
      if(bus){
        panel([x-.23,z],[x+.23,z],2.32,.66,.09,0x376267);
        panel([x-.18,z+.06],[x+.18,z+.06],2.31,.42,.025,0xe1e3d9);
      }
      continue;
    }
    const closed=line[0][0]===line.at(-1)[0]&&line[0][1]===line.at(-1)[1];
    if(closed&&['pier','court','shelter'].includes(kind)){
      const roof=kind==='shelter';
      slab(line,roof?2.84:kind==='court'?.073:.084,roof?0x98a3a4:kind==='court'?0x859183:0xb5aaa0);
      if(roof)for(const p of line.slice(1))if(!inWalk(p))beam(P(p,.10),P(p,2.82),.065,0x798380);
      continue;
    }
    for(let i=1;i<line.length;i++){
      const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
      if(len<.05)continue;
      const at=(d,offset=0)=>[a[0]+(dx*d-dz*offset)/len,a[1]+(dz*d+dx*offset)/len];
      if(kind==='track'){
        // Grass track is visible beside the Linhai waterfront in the Nov 2025
        // tram-side panoramas. Keep road crossings and unobserved track bare.
        const mid=at(len/2),north=(22.61-22.61696)*110750,south=(22.61-22.61279)*110750;
        if(mid[1]>north&&mid[1]<south&&mid[0]>135&&mid[0]<355&&!inWalk(mid)){
          panel(a,b,.077,.014,2.45,0x91a16b);
        }
        for(const r of [-.72,.72])panel(at(0,r),at(len,r),.112,.028,.074,0x889091);
      }else if(kind==='pier'){
        panel(a,b,.085,.075,1.8,0xa9a299);
      }else if(kind==='wall'||kind==='hedge'){
        const hedge=kind==='hedge',n=Math.ceil(len/3);
        for(let j=0;j<n;j++){
          const start=at(len*j/n),end=at(len*(j+1)/n);
          if(inWalk(start)||inWalk(end)||inWalk(at(len*(j+.5)/n)))continue;
          panel(start,end,hedge?.56:.86,hedge?.98:1.58,hedge?.82:.22,hedge?0x71805a:0xb7b4ab);
          if(!hedge)panel(start,end,1.67,.08,.27,0xa29f96);
        }
      }
    }
  }
}

