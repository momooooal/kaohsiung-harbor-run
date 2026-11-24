// Local axes follow the approach, with the destination on the left. Building
// spacing and cross streets interpret the reference views rather than survey data.
export function neighborhood(type,scene,box) {
  const loader=new THREE.TextureLoader(),maps=[];
  function surface(file,x,z,w,d,y,unit,tint=0xffffff){
    const t=loader.load('assets/surfaces/'+file);maps.push(t);t.encoding=THREE.sRGBEncoding;
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/unit,d/unit);t.anisotropy=4;
    const tile=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:t,color:tint}));
    tile.rotation.x=-Math.PI/2;tile.position.set(x,y,z);tile.receiveShadow=true;scene.add(tile);
  }
  const leaves=loader.load('assets/surfaces/tree.png');maps.push(leaves);leaves.encoding=THREE.sRGBEncoding;
  const foliage=new THREE.MeshLambertMaterial({map:leaves,alphaTest:.52,side:THREE.DoubleSide});
  function tree(x,z,h){
    for(const angle of [.3,1.87]){const card=new THREE.Mesh(new THREE.PlaneGeometry(h*.88,h),foliage);
      card.rotation.y=angle;card.position.set(x,h/2,z);card.castShadow=true;scene.add(card)}
  }
  function arcade(x,z,w,h,color,far=false){
    const side=far?-1:1,face=z+side*2.55;
    box(x,h/2,z-side*1.5,w-.09,h,8,color);
    const levels=Math.floor(h/3);
    for(let j=1;j<levels;j++){
      let y=j*3+1.2;
      box(x,y,face,w*.78,1.7,.14,0x566d70);
      for(let k=-1;k<=1;k++)box(x+k*w*.24,y,face+side*.1,.13,1.72,.2,0xadb2a9);
      box(x,y-.7,face+side*.36,w*.95,.48,.82,color);
    }
    box(x,1.4,face,w*.84,2.6,.15,0x4c5655);
    box(x,3.05,face+side*.75,w,.23,1.82,0xaaa89e);
    for(const dx of [-.45,.45])box(x+dx*w,1.5,face+side*1.48,.25,3,.3,color);
    box(x+w*.32,4.5,face+side*.34,.88,.53,.43,0xc3bfb1);
  }
  function scooter(x,z,color){
    for(const dx of [-.52,.54]){const wheel=box(x+dx,.29,z,.53,.56,.19,0x333738);wheel.rotation.z=.68}
    box(x,.41,z,1,.24,.4,color);box(x-.28,.64,z,.67,.21,.44,0x454441);
    box(x+.44,.74,z,.2,.63,.34,color).rotation.z=.22;
    box(x+.44,1.06,z,.12,.09,.53,0x434a48);
  }
  function fence(x0,x1,z,height,color){
    for(let x=x0;x<=x1;x+=2)box(x,height/2,z,.09,height,.1,color);
    for(let y=.35;y<height;y+=.43)box((x0+x1)/2,y,z,x1-x0,.055,.055,color);
  }
  function hedge(x,z,w){box(x,.36,z,w,.7,.88,0x657c4a);tree(x-w*.32,z,6);tree(x+w*.32,z,7)}
  function crossing(x,z){for(let i=-3;i<=3;i++)box(x+i*.86,.057,z,.44,.014,3,0xd9d5c7)}
  const residential=['gym','ice','food','coffee'].includes(type);
  const boulevard=type==='gym'||type==='metro';
  const roadEdge=type==='coffee'?5:type==='ice'||type==='food'?6.2:10.2;
  const roadWidth=boulevard?20:residential?6.5:10;
  surface('asphalt_02.jpg',8,roadEdge+roadWidth/2,116,roadWidth,.038,4.8);
  surface(type==='gym'?'herringbone_pavement.jpg':'concrete_pavement_02.jpg',8,(roadEdge-2)/2,116,roadEdge+2,.018,3.8);
  const opposite=roadEdge+roadWidth+4;
  const palette=[0xb69a87,0xc5c1ad,0xa29d91,0xcbba9d,0xb2b8b7];
  if(residential){
    const narrow=type==='coffee',w=narrow?5.1:type==='gym'?8.6:6.2;
    for(let i=0;i<10;i++){
      const h=(type==='gym'?5:2)+(i*3%4);
      arcade(-20+i*w,opposite,w,h*3,palette[(i+2)%5],true);
      const x=19+i*w;if(x<65)arcade(x,-6.6-(i%3)*.42,w,(h-(type==='gym'?0:1))*3+2,palette[i%5]);
    }
    for(const x of [-28,-21])arcade(x,-6.3,6.6,10+(x+28)*.5,0xb8b7a8);
    if(type==='gym'){
      for(const x of [-17,0,17,34,51])hedge(x,roadEdge+5,13);
      arcade(35,opposite+7,15,31,0x93a9aa,true);
    }else if(type==='ice'){
      for(const x of [-17,-13,9,13,18,23])scooter(x,roadEdge+.8,x%3?0x975b52:0x788a84);
      crossing(21,roadEdge+2.6);
      for(const x of [16,24,31])box(x,3.1,-2.1,5.5,.15,2.7,0xa29981).rotation.x=.16;
    }else if(type==='food'){
      for(const x of [-13,-8,8,15]){scooter(x,roadEdge+.9,0x63676b);box(x,4.2,-2.8,1,.68,.47,0xb2afa0)}
      for(const x of [18,26,33])fence(x-2,x+2,-2.85,2.3,0x847f74);
    }else{
      surface('asphalt_02.jpg',5,-4.9,4.1,13,.059,4);
      for(const x of [-8,-2,10,17])box(x,.058,roadEdge-.2,5.5,.02,.13,0x9c514a);
      box(8,2.3,-2.4,.27,4.6,.25,0x8b9189);box(8,2.9,-2.4,.32,.4,.31,0xc0a84c);
      crossing(9,roadEdge+3);
    }
  }else if(type==='cycle'){
    surface('aerial_grass_rock.jpg',20,5,47,9,.049,6,0x95ad7d);
    for(let i=0;i<40;i++){const x=1+i*.7,z=6.4+2*Math.sin(i*.075);
      box(x,.08,z,.76,.04,1.65,0xaa5a4d);box(x,.11,z-.72,.76,.016,.06,0xe6dfcc)}
    fence(5,49,10.3,1.55,0xb6c2ba);
    for(const x of [-16,10,21,34,48])tree(x,10.9,4.5+x%3);
    box(31,3,-8,32,6,11,0xc6c8c0);
  }else if(type==='sports'){
    for(let x=-18;x<48;x+=6){tree(x,9.9,5.8);box(x,.07,9.9,2.3,.08,2.3,0x80765b)}
    for(let i=0;i<23;i++)box(7+i*.85,.27,11.4,.8,.54,.4,i%2?0xc1aa65:0x5a5954);
    for(let i=0;i<6;i++)arcade(4+i*7,opposite,7,12+(i%2)*3,palette[i%5],true);
    box(31,4,-7,37,8,6,0xc1c4b9);
  }else if(type==='court'){
    fence(10,47,-1.4,1.7,0x879786);surface('aerial_grass_rock.jpg',31,-5,40,6,.042,5);
    for(const x of [-16,-10,13,20,29,39])tree(x,4.2,7.5+(Math.abs(x)%3));
    for(let i=0;i<5;i++)arcade(8*i,opposite,8,9+i%3*3,palette[i],true);
    crossing(20,11.8);
  }else{
    for(const x of [-15,3,21,39])hedge(x,16,12);
    for(let i=0;i<5;i++)arcade(i*12,opposite,12,18+(i%3)*8,0xadb6b5,true);
    fence(11,38,3,1.05,0x88938e);crossing(18,11.8);tree(21,-1,6);
  }
  return ()=>maps.forEach(t=>t.dispose());
}
