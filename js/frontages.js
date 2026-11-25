/* Original interpretive geometry. All dimensions are local scene units. */
export function frontage(type, {box,mesh}) {
  const ivory=0xe0d9ca, iron=0x343e41, glass=0x698987, wood=0x9c7150, pale=0xc2c5bc;
  const dark=0x535754;
  function glazing(x,y,z,w,h,n){
    box(x,y,z,w,h,.12,glass);
    for(let i=0;i<=n;i++)box(x-w/2+i*w/n,y,z+.1,.065,h,.12,iron);
    box(x,y+h*.21,z+.11,w,.085,.12,iron);
    for(let i=0;i<n;i++)box(x-w/2+(i+.28)*w/n,y+.06,z+.08,.12,h*.82,.025,0x86a5a1).rotation.z=-.14;
  }
  function tile(x,y,z,w,h,pitch){
    for(let i=pitch;i<w;i+=pitch)box(x-w/2+i,y,z,.019,h,.026,0xa6aaa5);
    for(let i=pitch;i<h;i+=pitch)box(x,y-h/2+i,z,w,.019,.026,0xa6aaa5);
  }
  function bay(x,w,height,color=ivory,z=-3){
    box(x,height/2,z-3,w,height,6,color);
    glazing(x,2,z+.04,w-.65,3.46,Math.max(2,Math.round(w/1.8)));
    for(let y=5;y<height-.3;y+=2.8){
      glazing(x,y,z+.05,w-.96,1.5,Math.ceil(w/2.4));
      box(x,y-.8,z+.17,w,.21,.6,pale);
    }
  }
  function leaf(x,y,z,r){const m=mesh(new THREE.IcosahedronGeometry(r,1),x,y,z,0x58784b);m.scale.set(1.15,.76,1)}
  function tree(x,z,r=1.7){
    box(x,1.6,z,.25,3.2,.3,0x70614a);
    for(const sign of [-1,1]){box(x+sign*.33,2.8,z,.15,1.4,.16,0x645642).rotation.z=-sign*.5;leaf(x+sign*.7,3.8,z,r)}
  }
  function planter(x,z){mesh(new THREE.CylinderGeometry(.36,.27,.55,12),x,.27,z,0xb39879);leaf(x,.85,z,.54)}
  function awning(x,y,z,w,d,color){
    box(x,y,z,w,.16,d,color).rotation.x=.1;
    box(x,y-.18,z+d/2,w,.32,.08,color);
  }
  function pavement(x,z,w,d,color){box(x,.022,z,w,.044,d,color)}
  function wing(x,w,h,color){bay(x,w,h,color,-4.25)}
  function ribs(x,y,z,w,h,color,step=.4){for(let i=0;i<w;i+=step)box(x-w/2+i,y,z,.045,h,.07,color)}
  function blades(x,y,z,w,d,color){for(let i=0;i<d;i+=.28)box(x,y,z+i,w,.09,.13,color)}
  function rail(x,z){box(x,.5,z,1.5,.075,.075,iron);for(const dx of [-.64,.64])box(x+dx,.27,z,.065,.53,.065,iron)}
  if(type==='gym'){
    wing(-10,10,11,0xc3bfb0);wing(10,10,10,0xaba79b);
    box(0,6.9,-4,9,6.8,2,0xbe794f);
    for(const side of [-1,1]){box(side*4.12,1.8,-1.05,.62,3.6,1.3,0x343433);box(side*4.12,1.7,-.38,.46,.075,.02,0x9a9385)}
    glazing(0,1.53,-2.9,7.55,3.06,5);box(0,3.37,-1.8,9,.46,2.8,0x292d2c);
    for(const x of [-2.6,0,2.6])box(x,3.11,-1.56,.92,.035,.12,0xffdd9c);
    pavement(0,.9,9,2.8,0xaa8e7e);rail(-2,1.65);tree(6,.5);
    // Recessed arcade below the tall ochre wall on Zhonghua 4th Road.
    for(let y=4.15;y<10;y+=1.12)box(-.10,y,-2.981,8.53,.024,.025,0xa16a4c);
    for(const x of [-3.26,-.9,2.35]){box(x,1.44,-2.78,.08,2.78,.07,0x949a91);box(x+.28,.09,-.47,.49,.14,.35,0xa7a59a)}
  }else if(type==='ice'){
    wing(-8,7,8,0xa7a293);wing(9,9,10,0xd3b3a2);
    box(0,5.7,-4.4,8.7,4.5,2.5,0xc5c3aa);glazing(0,6.3,-3.1,7.9,1.65,5);
    box(0,2,-5.6,8.5,4,.2,0xe0cdb0);awning(0,3.22,-1.95,8.7,3.4,0xe4dcc2);
    for(const x of [-4.15,4.15])box(x,1.5,-.4,.14,3,.14,dark);
    box(-1.55,.65,-1.45,4.65,1.3,1.06,0xebdfce);box(-1.55,.27,-.91,4.63,.42,.06,0x31729b);
    for(let i=0;i<5;i++)mesh(new THREE.CylinderGeometry(.26,.24,.15,16),-3+i*.67,1.36,-1.35,0xb7b9ac);
    for(const x of [1.5,3]){box(x,.64,-2,1.05,.09,.7,ivory);box(x,.31,-2,.1,.62,.1,iron);box(x,.25,-1.12,.43,.5,.41,0xbb6251)}
    planter(4.6,.15);
    for(const x of [-3.5,-1.65,.20]){box(x,2.42,-4.7,1.66,.68,.08,0xc7dbd3);box(x,2.16,-4.64,1.56,.07,.08,0x9b634b)}
    for(let x=-4.1;x<4.1;x+=.49)box(x,3.01,-.23,.19,.12,.1,0xcab182);
  }else if(type==='sports'||type==='cycle'){
    const asia=type==='cycle', width=asia?29:22;
    box(0,4.6,-6.8,width,9.2,5,asia?0x15558a:0xbfc4c1);glazing(1,1.95,-4.23,12,3.9,8);
    box(0,4.9,-3.9,width,asia?2.4:1.15,.9,0x1165a0);
    if(asia){
      pavement(-4,4,12,9,0x809b5b);
      for(let i=0;i<24;i++){const t=(i-12)*.047, x=-8+8*Math.cos(t),z=5+11*Math.sin(t);box(x,.076,z,2.5,.047,.72,0xb3604e).rotation.y=-t;box(x,.105,z,.065,.02,.72,ivory).rotation.y=-t}
      for(const x of [-7,7])box(x,2,-2.4,.3,4.6,.33,ivory).rotation.z=x>0?-.45:.45;
      glazing(11,6,-4.21,4,5,3);tree(-11,3);
      for(let x=-13;x<11;x+=3.5){box(x,3.62,-2,.13,.08,.53,0xf1e5c3);box(x,4.94,-3.43,.037,2,.06,0x658395)}
    }else{
      for(const x of [-8,-5.8,6,8.2]){box(x,2.25,-4.1,1.95,3.5,.18,x<0?0x71886f:0xb08e68);box(x,2.25,-3.97,.45,2.55,.07,ivory).rotation.z=.43}
      for(const x of [-5,-3.5,5,6.5]){rail(x,.8);for(const dx of [-.44,.44])mesh(new THREE.TorusGeometry(.34,.053,8,20),x+dx,.39,.93,iron);box(x,.56,.93,.87,.08,.12,0x7c969b).rotation.z=.29}
      tree(-6.6,3.5);tree(8,2.8);
      for(let x=-10.4;x<10;x+=1.12)box(x,7.3,-4.26,.041,2.8,.047,0x959f9d);
    }
  }else if(type==='food'){
    wing(-6.4,7,9,0xb6ada0);wing(6.4,7,10,0xc7ab91);
    box(0,5.4,-4,5.9,4.8,2,0xc4b9ac);tile(0,5.4,-2.98,5.9,4.8,.38);glazing(0,5.85,-2.92,4.8,1.45,3);
    glazing(0,1.46,-3.3,4.65,2.92,3);
    for(const x of [-2.65,2.65])box(x,1.5,-2.4,.48,3.05,2.2,wood);
    blades(0,3.1,-3.3,5.8,2.3,wood);box(0,3.3,-1.17,5.8,.41,.19,iron);
    box(.66,1.4,-3.1,.06,.64,.09,ivory);mesh(new THREE.SphereGeometry(.14,12,8),.66,1.76,-3.1,ivory).scale.set(.84,1.25,.35);
    for(const x of [-2,2.24,3.15])planter(x,-.72);
    for(const x of [-4.3,4.65]){box(x,3.75,-1.7,1.03,.72,.57,0xada79c);for(let j=0;j<4;j++)box(x,3.53+j*.13,-1.4,.82,.055,.05,0x777b75)}
  }else if(type==='court'){
    box(0,5.5,-6.6,22,11,6,0xd7d0bd);glazing(-1,2,-3.5,7,3.9,5);glazing(6.5,4.3,-3.5,3.3,8.5,3);
    for(let y=4.6;y<10;y+=1.5)box(6.5,y,-3.36,3.5,.11,.25,pale);
    awning(-1,3.75,-2.35,8.5,2.8,0xe18b42);
    for(let i=0;i<4;i++)box(-1,.065+i*.085,-.35-i*.36,7,.13+i*.17,.39,0xafad9e);
    for(const x of [-6.4,7.4,12])tree(x,2,2.35);
    for(let x=-13;x<-5;x+=.35)box(x,.65,-1,.18,1.3,.16,wood);
    for(const x of [-4.55,2.55]){box(x,.73,-.26,.075,1.15,.09,iron);box(x,.96,-1,.075,.07,1.65,pale).rotation.x=-.19}
  }else{
    wing(-7.5,9,8,0xb8ab99);bay(13,7,10,0xbea682,-8);
    box(0,5.1,-4.35,5.5,4.2,3,0xe2dfd6);tile(0,5.1,-2.83,5.5,4.2,.25);
    glazing(-.38,5.5,-2.79,3.8,1.52,4);glazing(0,1.48,-3.8,4.86,2.85,3);
    for(const x of [-2.54,2.54]){box(x,1.53,-1.55,.42,3.06,2.65,pale);tile(x,1.53,-.2,.42,3.06,.22)}
    pavement(5,-3,4.2,14,0x747673);for(let i=0;i<9;i++)box(2.94+.12*i,.065,.62-.1*i,.24,.025,.095,0xad5851);
    for(const x of [-1.7,1.75])planter(x,-1.16);
    for(const z of [-1.8,-4.2,-6.5]){box(2.78,.45,z,.16,.64,.16,pale);box(2.78,.80,z,.18,.085,.18,ivory)}
    box(-.35,1.1,-3.59,4.3,.14,.32,wood);box(-1.05,1.46,-3.58,.05,.72,.08,iron);
  }
}
