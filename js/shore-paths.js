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
  band(apron?'hex':'stone',-4.25,apron?6.4:5,.091,2.4,2.4);
  const side=-3.72,step=4.4;
  for(let d=2;d+step<length;d+=step){
    // Painted gooseneck bollards, a low curb pipe and a hanging light chain.
    const p=at(d,side);
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
  if(!apron){
    for(let d=12;d<length-7;d+=17){
      planting(d,5.7,.95,1.15);
      if(d<48)for(let i=0;i<3;i++){
        const along=d+i*1.2;let last=P(at(along-.30,3.9),.1);
        for(let j=1;j<=10;j++){
          const a=Math.PI*j/10,q=P(at(along-.3*Math.cos(a),3.9),.1+.68*Math.sin(a));
          beam(last,q,.034,0xa54f45);last=q;
        }
      }
    }
  }
}
