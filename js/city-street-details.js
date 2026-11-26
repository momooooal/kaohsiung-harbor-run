// Local metre coordinates, clockwise bearings from north. Reference images and
// observation dates are listed in DATA-SOURCES.md. Furniture is illustrative.
export function cityStreetDetails({nearby,key,panel,beam,tree,P}){
  function frontage(x,z,bearing,draw){
    if(!nearby.has(key(x,z)))return;
    const h=bearing*Math.PI/180,c=Math.cos(h),s=Math.sin(h);
    const at=(d,r)=>[x+d*s+r*c,z-d*c+r*s];
    const wall=(a,b,r,y,height,width,color)=>panel(at(a,r),at(b,r),y,height,width,color);
    const pole=(d,r,h,color,radius)=>beam(P(at(d,r),.14),P(at(d,r),h),radius,color);
    draw({at,wall,pole});
  }
  // Zhongshan Road: utilities and low clipped planting between kerb and school walk.
  frontage(1900,543,145,({at,wall})=>{
    for(const d of [8,24,43,60]){
      wall(d,d+7,-2.6,.37,.52,.88,0x78934e);
      wall(d,d+7,-2.6,.15,.16,1.05,0xa5a492);
    }
    for(const [d,h,ink] of [[15,1.6,0x8caba2],[17,1.2,0x658581],[62,.95,0xaaa49a]]){
      wall(d,d+1.2,-2.7,h/2+.13,h,.67,ink);
      wall(d-.05,d+1.25,-2.7,h+.15,.07,.78,0x708078);
      for(let j=0;j<4;j++)wall(d+.14,d+.54,-2.34,.45+j*.09,.032,.03,0x455854);
    }
  });
  // Lawn and transverse shade trees on the north side of Xinguang Road.
  frontage(1225,-86,71,({at,wall,pole})=>{
    wall(4,73,-8,.13,.10,8.6,0x7c9354);
    for(const d of [9,19,35,51,67]){
      tree(...at(d,-6),.99,1.16);
      for(const delta of [-.85,.85])beam(P(at(d+delta,-6),.17),P(at(d,-6),2.25),.045,0x82755d);
    }
    for(const d of [15,46]){pole(d,-9.8,4.4,0xc5cac4,.065);wall(d-.55,d+.55,-9.8,4.42,.09,.28,0xdfe3d6);}
  });
  // Box junction at the riverfront approach. Clip both diagonal sets to its edges.
  frontage(-73,-1813,336,({at,wall})=>{
    const start=2,end=15,side=3.25,paint=0xd9aa52;
    for(const r of [-side,side])wall(start,end,r,.155,.011,.10,paint);
    for(const sign of [-1,1])for(let d=start-6;d<end;d+=2.8){
      const a=Math.max(start,d),b=Math.min(end,d+2*side);if(b<=a)continue;
      panel(at(a,sign*(a-d-side)),at(b,sign*(b-d-side)),.155,.011,.09,paint);
    }
  });
  // Narrow path past the Dayi warehouses: paired edge lines and planted verge.
  frontage(-504,-908,295,({at,wall})=>{
    for(const r of [-1.45,1.45])wall(1,58,r,.178,.014,.10,0xe6e3cd);
    for(let d=5;d<55;d+=9){
      wall(d,d+6.6,3.5,.40,.50,.80,0x766846);
      tree(...at(d+3,-4.8),.75,1.0);
    }
  });
  // Minsheng Road corner, crossing and park-side curved streetlights.
  frontage(729,-1724,68,({at,wall,pole})=>{
    for(let d=3;d<17;d+=1.6)wall(d,d+.53,-3.6,.17,.014,5.5,0xe6e3d6);
    for(const d of [21,52,84]){
      pole(d,5.6,6.4,0xadb6b4,.105);
      beam(P(at(d,5.6),5.8),P(at(d,4.6),6.58),.078,0xb6bfbb);
      beam(P(at(d,4.6),6.58),P(at(d,3.35),6.72),.063,0xb6bfbb);
      wall(d-.3,d+.3,3.35,6.69,.12,.36,0xd4d8c7);
      tree(...at(d+4,9),1.22,1.4);
    }
  });
  // Boai / Dashun corner: short stone bollards and the red kerb turn.
  frontage(1379,-5123,169,({at,wall,pole})=>{
    for(const [d,r] of [[2,-3.1],[5,-3.55],[8,-3.75],[11,-3.8]]){
      wall(d-.13,d+.13,r,.46,.74,.27,0xb6b2a5);
      wall(d-.14,d+.14,r,.84,.045,.29,0xd6d0c3);
    }
    for(const [a,b,r,t] of [[1,5,-4,-4.8],[5,10,-4.8,-5.1],[10,19,-5.1,-5.1]])
      panel(at(a,r),at(b,t),.17,.08,.14,0xbb6962);
    pole(10,-4.2,3.6,0x666963,.088);
    wall(9.83,10.17,-4.2,2.88,.74,.29,0x404944);
  });
}

