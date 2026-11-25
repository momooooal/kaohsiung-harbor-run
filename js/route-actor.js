import {makeActor} from './explore.js';

// Actor-local metres. The existing models face -Z and the axle runs along X.
export function routeActor(mode) {
  const root = makeActor(mode), person = root.userData.person || root;
  root.name='route-avatar-'+mode;
  const kit = new Map(), up = new THREE.Vector3(0,1,0);
  const v = (x,y,z) => new THREE.Vector3(x,y,z);
  function mesh(geometry, color, parent=root) {
    if (!kit.has(color)) kit.set(color,new THREE.MeshLambertMaterial({color}));
    const part = new THREE.Mesh(geometry,kit.get(color));
    parent.add(part);
    return part;
  }
  function link(part,a,b,r) {
    part.position.copy(a).lerp(b,.5);
    const axis = b.clone().sub(a);
    part.scale.set(r,axis.length(),r);
    part.quaternion.setFromUnitVectors(up,axis.normalize());
  }
  const bone = (color,parent) => mesh(new THREE.CylinderGeometry(.90,1,1,12),color,parent);
  const skin=0xcc9677, shorts=0x263d4c, shirt=mode==='run'?0xe99550:mode==='walk'?0x387f96:0x287f78;
  const retired = [];
  for(const limb of [...(person.userData.arms||[]),...(person.userData.legs||[])]) {
    person.remove(limb); retired.push(limb);
  }
  if(person.userData.cane){person.remove(person.userData.cane);retired.push(person.userData.cane);}
  function oval(parent,color,x,y,z,w,h,d){
    const o=mesh(new THREE.SphereGeometry(1,18,14),color,parent);
    o.position.set(x,y,z);o.scale.set(w,h,d);return o;
  }
  // Retain the frames, saddle, wheels and seat. Dress the articulated body
  // separately so a seated user and a rider do not inherit a standing torso.
  if(mode!=='wheelchair'){
    for(const part of person.children.slice(0,3)){person.remove(part);retired.push(part);}
  }else{
    for(const part of root.children.slice()){
      const seatedBody=(part.geometry?.type==='SphereGeometry'||part.geometry?.type==='BoxGeometry'&&part.position.y===1.14);
      if(seatedBody){root.remove(part);retired.push(part);}
    }
    for(const s of [-1,1]){
      const rim=mesh(new THREE.TorusGeometry(.34,.018,8,40),0x9ea6aa);
      rim.position.set(s*.747,.55,.1);rim.rotation.y=Math.PI/2;
      const handle=bone(shorts);link(handle,v(s*.46,.9,.4),v(s*.46,1.57,.49),.037);
      const bar=bone(0x151d24);link(bar,v(s*.46,1.54,.49),v(s*.46,1.54,.65),.036);
      const plate=mesh(new THREE.BoxGeometry(.24,.045,.29),0x353c42);plate.position.set(s*.22,.15,-.56);
    }
    root.scale.x=.87;
  }
  const seat=mode==='wheelchair'?-.14:0;
  const torso=oval(person,shirt,0,1.25+seat,0,.29,.40,.175);
  oval(person,shorts,0,.95+seat,.015,.25,.14,.17);
  oval(person,skin,0,1.64+seat,-.012,.093,.115,.09);
  const head=oval(person,skin,0,1.82+seat,-.016,.18,.22,.17);
  oval(person,0x302b2c,0,1.90+seat,.021,.188,.155,.169);
  oval(person,0x302b2c,0,1.84+seat,.093,.166,.145,.095);
  for(const side of [-1,1])oval(person,skin,side*.174,1.81+seat,-.008,.035,.05,.028);
  if(mode==='run'){
    torso.rotation.x=-.15;head.position.z-=.05;
    oval(person,0x175168,0,1.976,-.027,.199,.094,.188);
    oval(person,0x175168,0,1.96,-.2,.145,.024,.11);
    for(const side of [-1,1])oval(person,0xf3c08b,side*.22,1.3,.045,.038,.26,.088);
  }
  if(mode==='bike'){
    person.scale.setScalar(.86);person.position.set(0,.31,.08);person.rotation.x=-.27;
    const stem=bone(shorts);link(stem,v(0,.47,-.74),v(0,1.1,-.8),.032);
    const downTube=bone(0xcb5b28);link(downTube,v(0,1.0,-.56),v(0,.46,-.15),.052);
    const seatTube=bone(0xcb5b28);link(seatTube,v(0,.46,-.15),v(0,1.07,.05),.05);
    for(const side of [-1,1]){
      const fork=bone(0xec783a);link(fork,v(0,.98,-.56),v(side*.065,.42,-.75),.028);
      const stay=bone(shorts);link(stay,v(side*.065,.42,.82),v(side*.065,.46,-.15),.023);
    }
    oval(person,0xf18b2b,0,1.967,-.035,.205,.138,.22);
    for(const x of [-.095,0,.095])oval(person,0x383c40,x,2.072,-.042,.022,.023,.12);
  }
  for(const wheel of root.userData.wheels||[]){
    const radius=wheel.geometry.parameters.radius;
    for(let n=0;n<8;n++){
      const spoke=mesh(new THREE.CylinderGeometry(.009,.009,radius*1.92,6),0xc9d3d4,wheel);
      spoke.rotation.z=n*Math.PI/8;
    }
  }
  const limbs=[-1,1].map(side=>{
    const thigh=bone(shorts,root),shin=bone(skin,root),upper=bone(shirt,root),fore=bone(skin,root);
    const shoe=oval(root,0x254550,0,0,0,.098,.069,.165);
    const hand=mesh(new THREE.SphereGeometry(.065,10,8),skin);
    const cane=mode==='cane'&&side===1?bone(0x956022,root):null;
    const grip=cane?bone(shorts,root):null;
    const pedal=mode==='bike'?mesh(new THREE.BoxGeometry(.16,.045,.12),shorts):null;
    return {side,thigh,shin,upper,fore,shoe,hand,cane,grip,pedal};
  });
  // The knee/elbow lies on a two-link chain between the joint and contact.
  function joint(a,b,length,bend){
    const edge=b.clone().sub(a),d=Math.max(.001,edge.length()),mid=a.clone().lerp(b,.5);
    const perpendicular=v(0,-edge.z,edge.y).normalize();
    return mid.addScaledVector(perpendicular,bend*Math.sqrt(Math.max(.0001,length*length-d*d/4)));
  }
  function pose(travel,active){
    const run=mode==='run',bike=mode==='bike',chair=mode==='wheelchair',assist=mode==='cane';
    const rate=bike?3.3:chair?3:run?3.15:assist?4.5:4;
    for(const l of limbs){
      const s=l.side,phase=travel*rate+(s===1?Math.PI:0),wave=active?Math.sin(phase):0;
      const hip=v(s*.155,chair?.79:bike?1.08:.92,bike?0:chair?-.01:0);
      const shoulder=v(s*(chair?.36:.29),chair?1.37:bike?1.57:1.5,bike?-.32:run?-.10:0);
      let foot,hand;
      if(bike){
        foot=v(s*.17,.47+.16*Math.sin(phase),-.18+.16*Math.cos(phase));hand=v(s*.30,1.12,-.8);
        l.pedal.position.copy(foot);foot.y+=.06;
      } else if(chair){
        foot=v(s*.22,.23,-.56);const push=travel*rate;
        hand=v(s*.60,.92+(active?.12*Math.cos(push):0),.06+(active?.27*Math.sin(push):0));
      } else {
        const stride=run?.45:assist?.17:.32;
        foot=v(s*.15,.13+Math.max(0,wave)*(run?.31:.12),-wave*stride);
        hand=v(s*.32,run?1.14:assist&&s===1?.95:.89,run?-.40+wave*.26:assist&&s===1?-.24+wave*.10:wave*.25-.06);
      }
      const knee=joint(hip,foot,chair?.42:.47,1);
      const elbow=joint(shoulder,hand,bike?.38:.36,-1);
      link(l.thigh,hip,knee,.104);link(l.shin,knee,foot,.073);
      link(l.upper,shoulder,elbow,.091);link(l.fore,elbow,hand,.066);
      l.shoe.position.copy(foot);l.shoe.position.z-=.035;l.hand.position.copy(hand);
      if(l.cane){const tip=v(hand.x+.09,.07+Math.max(0,wave)*.065,hand.z-.10-wave*.13);
        link(l.cane,hand,tip,.026);link(l.grip,hand.clone().add(v(0,0,.08)),hand.clone().add(v(0,0,-.08)),.038);}
    }
    for(const wheel of root.userData.wheels||[])wheel.rotation.z=-travel/wheel.geometry.parameters.radius;
  }
  const finishes=new Set();root.traverse(o=>{if(o.material)finishes.add(o.material);});
  for(const m of finishes)m.color?.convertSRGBToLinear();
  pose(0,false);
  return {root,pose,dispose(){
    const materials=new Set(),geometries=new Set();
    for(const obj of [root,...retired])obj.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
    for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
    root.parent?.remove(root);
  }};
}
