// Shared C8-20 corner interior, from the harbor activity model. Local +X faces the long window.
export function coffeeWindow(part,steel){
  const chalk=new THREE.MeshStandardMaterial({color:0xe7e5d9,roughness:.78});
  const render=new THREE.MeshStandardMaterial({color:0x716e66,roughness:.96});
  const glazing=new THREE.MeshStandardMaterial({color:0x405051,roughness:.28});
  function block(x,y,z,w,h,d,finish){return part(new THREE.BoxGeometry(w,h,d),x,y,z,finish)}
  // Two different elevations: the short end is seen on approach; the long
  // harbour window faces the promenade. Original geometry, no panorama textures.
  const harbourWindow=new THREE.MeshStandardMaterial({color:0xa9c2bc,transparent:true,opacity:.14,roughness:.17,side:THREE.DoubleSide,depthWrite:false});
  const iron=new THREE.MeshStandardMaterial({color:0x493932,roughness:.68});
  const brick=new THREE.MeshStandardMaterial({color:0x985d46,roughness:.94});
  const shell=render.clone();shell.color.setHex(0x878076);
  block(0,.13,3.6,8.6,.24,11.4,shell);
  block(-4.16,2.46,3.6,.32,4.9,11.4,shell);
  block(0,2.46,9.18,8.6,4.9,.28,render);
  block(0,4.97,3.6,8.8,.23,11.65,shell);
  // A single sheet per opening avoids stacked transparent faces turning the interior grey.
  function windowPane(x,y,z,w,h,rotation=0){
    part(new THREE.PlaneGeometry(w,h),x,y,z,harbourWindow).rotation.y=rotation;
  }
  const windowBench=new THREE.MeshStandardMaterial({color:0x6a6c69,roughness:.96});
  const tabletop=new THREE.MeshStandardMaterial({color:0x4c5251,roughness:.38,metalness:.26});
  const sill=new THREE.MeshStandardMaterial({color:0x948e81,roughness:.87});
  for(const z of [3.46,9.06]){
    block(4.05,2.53,z,.38,5.04,.36,shell);
    for(let row=0;row<15;row++)block(4.25,.36+row*.21,z,.045,.14,row%2?.32:.20,brick);
  }
  for(const z of [.75,6.25]){
    windowPane(4.04,2.4,z,5.18,4.28,Math.PI/2);
    block(4.08,3.85,z,.12,.14,5.18,iron);
    block(4.09,.34,z,.31,.18,5.18,sill);
    block(4.08,2.12,z,.08,3.43,.08,iron);
  }
  block(4.03,2.5,-1.96,.145,4.9,.145,iron);
  for(const x of [-3.96,-1.1])block(x,2.5,-1.99,.17,4.9,.21,iron);
  block(.02,3.87,-1.99,8,.15,.20,iron);
  windowPane(.02,2.48,-1.97,7.96,4.35);
  // Set the roasting-room partition behind the seating, leaving the corner sightline open.
  block(-.24,2.68,7.92,7.64,4.23,.15,render);
  block(-1.33,2.67,7.79,4.79,3.61,.10,glazing);
  for(const x of [-3.69,-2.14,-.55,1.02])block(x,2.65,7.68,.075,3.71,.11,chalk);
  for(const y of [.82,2.78,4.46])block(-1.33,y,7.68,4.81,.085,.12,chalk);
  part(new THREE.CylinderGeometry(.76,.76,.08,48),2.13,3.19,7.76,chalk).rotation.x=Math.PI/2;
  // Upholstered continuous seat and individual curved backs, as in the window photographs.
  block(3.15,.46,3.58,.78,.27,9.64,windowBench);
  block(3.48,.90,3.58,.17,.72,9.56,windowBench);
  function cushion(w,h,d,r){
    const profile=new THREE.Shape();profile.moveTo(-w/2+r,0);profile.lineTo(w/2-r,0);
    profile.quadraticCurveTo(w/2,0,w/2,r);profile.lineTo(w/2,h-r);
    profile.quadraticCurveTo(w/2,h,w/2-r,h);profile.lineTo(-w/2+r,h);
    profile.quadraticCurveTo(-w/2,h,-w/2,h-r);profile.lineTo(-w/2,r);
    profile.quadraticCurveTo(-w/2,0,-w/2+r,0);
    return new THREE.ExtrudeGeometry(profile,{depth:d,bevelEnabled:false,curveSegments:5});
  }
  const seatBack=cushion(.72,.60,.13,.19);
  for(const z of [-.75,2.4,5.65]){
    block(2.25,.91,z,1.07,.067,1.03,tabletop);
    part(new THREE.CylinderGeometry(.065,.065,.70,10),2.25,.55,z,steel);
    block(2.25,.25,z,.49,.06,.47,steel);
    block(1.33,.57,z,.70,.13,.72,chalk);
    part(seatBack,.96,.59,z-.36,chalk).rotation.y=-Math.PI/2;
    for(const dx of [-.24,.24])block(1.33+dx,.39,z,.05,.34,.55,steel);
  }
  // Rounded, tiled counter with a dark recessed toe kick and a continuous steel lip.
  const counter=new THREE.Shape();
  counter.moveTo(-3.47,0);counter.lineTo(-.08,0);counter.quadraticCurveTo(.31,0,.31,.42);
  counter.lineTo(.31,3.42);counter.lineTo(-.61,3.42);counter.lineTo(-.61,.94);
  counter.lineTo(-3.47,.94);counter.closePath();
  const bar=part(new THREE.ExtrudeGeometry(counter,{depth:1.09,bevelEnabled:false}),0,1.44,-.81,chalk);
  bar.rotation.x=Math.PI/2;
  const lip=part(new THREE.ExtrudeGeometry(counter,{depth:.06,bevelEnabled:false}),0,1.50,-.81,tabletop);
  lip.rotation.x=Math.PI/2;
  block(-1.62,.28,-.34,3.45,.15,.70,iron);
  for(let x=-3.2;x<-.1;x+=.34)block(x,.91,-.817,.013,1.04,.018,sill);
  block(1.26,1.05,-.11,1.8,.14,1.2,steel);
  for(const x of [-1.68,-1.19]){
    part(new THREE.CylinderGeometry(.12,.075,.18,16),x,1.55,-.91,chalk);
    part(new THREE.ConeGeometry(.15,.23,16),x,1.81,-.91,steel).rotation.z=Math.PI;
  }
  const enamel=new THREE.MeshStandardMaterial({color:0x32403a,roughness:.53});
  part(new THREE.CylinderGeometry(.42,.42,.74,18),.64,1.65,0,enamel).rotation.x=Math.PI/2;
  part(new THREE.CylinderGeometry(.33,.10,.48,16),.64,2.18,.02);
  part(new THREE.CylinderGeometry(.35,.34,.16,20),.64,1.26,-.45);
  part(new THREE.CylinderGeometry(.115,.115,1.6,12),1.12,2.2,.23);
}
