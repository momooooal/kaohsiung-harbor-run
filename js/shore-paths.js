import {quayEdge} from '../data/exhibition-quay.js';
// Positive offsets follow the alignment's east/south normal. These three
// short sections use different surfaces and shore treatments.
export function shorePath(kind,{length,at,band,panel,beam,P,planting}){
  if(kind==='terminalSide'){
    band('stone',-1.3,1.3,.094,1.42,2.3);
    band('brick',2.4,3.2,.092,1.8,1.8);
    for(let d=8;d<length-6;d+=8.4){
      for(const side of [-2.3,2.0]){
        const p=at(d,side);
        const trunk=P(p,2.35);
        beam(P(p,.15),trunk,.078,0x796d53);
        for(const off of [-.6,.6])beam(P(at(d+off,side+.15),.14),trunk,.043,0x675f4f);
        planting(d,side,.55,.79);
      }
    }
    return;
  }
  if(kind==='riverLawn'){
    band('grass',-6,-1.35,.056,2.6,2.6);
    band('stone',-1.35,1.35,.083,2.6,3.2);
    // Concrete edging against a dark narrow asphalt path.
    band('asphalt',-1.03,1.05,.097,2,2);
    for(let d=4;d<length-2;d+=9){
      const p=at(d,-1.67);beam(P(p,.1),P(p,.68),.082,0xd8d7c7);
      if(d%18<5)planting(d,-4.7,1,1.0);
    }
    return;
  }
  const apron=kind==='coralApron';
  // Intersect each walking cross-section with the surveyed harbour edge.
  // Its offset changes along the path, particularly north of Whale Hall 02.
  function edge(d){
    if(apron)return -4.25;
    const [x,z]=at(d,0),side=at(d,1),nx=side[0]-x,nz=side[1]-z;
    let best=Infinity,offset=0;
    for(let i=1;i<quayEdge.length;i++){
      const a=quayEdge[i-1],b=quayEdge[i],dx=b[0]-a[0],dz=b[1]-a[1],cross=nx*dz-nz*dx;
      if(Math.abs(cross)<.001)continue;
      const t=Math.max(0,Math.min(1,((a[0]-x)*nz-(a[1]-z)*nx)/cross));
      const vx=a[0]+t*dx-x,vz=a[1]+t*dz-z,error=Math.abs(nx*vz-nz*vx);
      if(error<best){best=error;offset=(vx*nx+vz*nz)/(nx*nx+nz*nz);}
    }
    return offset;
  }
  band(apron?'hex':'quayPaving',edge,apron?6.4:9,.113,1.46,.78);
  if(apron){
    for(let d=0;d<length;d+=2.2){
      const p=at(d,-4.12),q=at(Math.min(length,d+2.2),-4.12);
      beam(P(p,.12),P(p,1.04),.041,0xa8b4b3);
      for(const y of [.40,.72,1.04])beam(P(p,y),P(q,y),y===1.04?.052:.027,0xbac5c3);
    }
    return;
  }
  const step=3.65;
  for(let d=2;d+step<length;d+=step){
    // Painted gooseneck bollards, a low curb pipe and a hanging light chain.
    const side=edge(d)+.29,p=at(d,side);
    beam(P(p,.09),P(p,.7),.095,0xe4e5dc);
    let prev=P(p,.7);
    for(let k=1;k<=5;k++){
      const a=k*Math.PI/10;
      const tip=P(at(d-.23*(1-Math.cos(a)),side),.7+.23*Math.sin(a));
      beam(prev,tip,.087,0xe6e7df);prev=tip;
    }
    beam(P(at(d,side+.27),.16),P(at(d+step,side+.27),.16),.065,0xe5e5dc);
    for(let k=0;k<6;k++){
      const link=t=>P(at(d+step*t,side),.69-.27*4*t*(1-t));
      beam(link(k/6),link((k+1)/6),.018,0xc4c7be);
    }
  }
  for(let d=10;d<length-7;d+=21){
    // The through lane is clear. Trees sit inland in individual square grates.
    planting(d,7.6,.64,.87);
    panel(at(d-.65,7.6),at(d+.65,7.6),.123,.022,1.34,0x747b66);
  }
}
