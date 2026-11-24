/* C12 and Dayi warehouse district. Local metres and platform placement are illustrative. */
export function buildDayiStation(scene,frame,solid,beam){
  const district=new THREE.Group();
  district.position.copy(frame.position);
  district.rotation.copy(frame.rotation);
  scene.add(district);
  const material=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
  const concrete=material(0x959082),metal=material(0xaab8ad,.48);
  function mesh(geometry,finish,x=0,y=0,z=0,parent=district){
    const object=new THREE.Mesh(geometry,finish);
    object.position.set(x,y,z);
    parent.add(object);
    return object;
  }
  function tile(file,repeatX,repeatY){
    const texture=new THREE.TextureLoader().load('assets/surfaces/'+file);
    texture.encoding=THREE.sRGBEncoding;
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.set(repeatX,repeatY);
    const finish=new THREE.MeshStandardMaterial({map:texture,roughness:.92});
    finish.addEventListener("dispose",()=>texture.dispose());
    return finish;
  }
  function ground(x,z,w,d,y,finish){
    const surface=mesh(new THREE.PlaneGeometry(w,d),finish,x,y,z);
    surface.rotation.x=-Math.PI/2;
  }
  ground(13.2,-1,6.2,72,.118,tile('herringbone_pavement.jpg',2,22));
  ground(1,-21,51,8,.13,tile('asphalt_02.jpg',12,2));
  for(let z=-24;z<-17;z+=1.25)solid(8,.145,z,3.6,.025,.48,0xe6e1d4);
  // Shift the existing platform as one assembly. The cross street stays between
  // the C8 storefront approach and the C12 platform in the return direction.
  const station=new THREE.Group();station.position.z=43;district.add(station);
  function stationGround(x,z,w,d,y,finish){
    mesh(new THREE.PlaneGeometry(w,d),finish,x,y,z,station).rotation.x=-Math.PI/2;
  }
  frame.translateZ(43);frame.updateMatrix();
  stationGround(-1.95,0,7.6,86,.105,tile('aerial_grass_rock.jpg',2,18));



  for(const center of [0,-3.9]){
    for(const side of [-.75,.75])solid(center+side,.17,0,.10,.09,88,0x757c74);
  }
  // Grass rails lead into the platform entrance, stopping at the paved crossing.
  const platformEntrance=tile('aerial_grass_rock.jpg',2,6);
  platformEntrance.color.setHex(0x709744);
  stationGround(-1.95,-12,6.9,9.6,.15,platformEntrance);
  stationGround(-1.95,12,6.9,38,.145,platformEntrance);
  // Pale independent columns, cantilever ribs and a visibly sloped, thin fascia.
  for(const [x,side] of [[3.35,1],[-7.25,-1]]){
    solid(x,.24,8,2.9,.46,38,0xa09c8e);
    solid(x-side*1.24,.49,8,.25,.035,37.8,0xc9ac68);
    for(let z=-9;z<26;z+=3)solid(x,.477,z,2.86,.02,.029,0x615e54);
    const slope=-side*.09;
    solid(x,4.32,5,3.85,.10,30,0xe6e7db,slope);
    solid(x-side*1.9,4.49,5,.10,.19,30,0xb7c4be);
    for(let z=-9;z<=19;z+=3.5){
      beam([x+side*.93,.46,z],[x+side*.93,4.22,z],.105,0xbac1b7);
      beam([x+side*.9,3.49,z],[x-side*1.75,4.39,z],.072,0x747e76);
      beam([x+side*1.23,4.12,z],[x-side*1.78,4.4,z],.075,0xb2b9b0);
    }
    for(let z=-9;z<20;z+=1.45){
      solid(x,4.16,z,3.62,.13,.08,0x697a74,slope);
    }
    for(const z of [-6,8,17]){
      solid(x,3.97,z,.19,.085,1.38,0xe9e6d5);
    }
    for(const z of [0,11])solid(x,.98,z,.69,.12,2.5,0xa79575);
    // Open entrance and white tubular approach railings.
    const outside=x+side*1.3;
    for(let z=-16;z<=-9;z+=1.75)beam([outside,.12,z],[outside,1.26,z],.043,0xdcded3);
    for(const y of [.65,1.23])beam([outside,y,-16],[outside,y,-9],.045,0xdcded3);
  }

  // A rounded, raked cab made from horizontal sections. The windscreen follows the nose.
  function noseDepth(x,y){
    return -15.4 + .52*(Math.abs(x)/1.35)**2 + .39*(y-1.35)**2;
  }
  function cabPanel(rows,finish,offset=0){
    const positions=[],indices=[],steps=16;
    const samples=[rows[0]];
    for(let i=1;i<rows.length;i++){
      const [y0,w0]=rows[i-1],[y1,w1]=rows[i];
      const divisions=Math.ceil((y1-y0)/.085);
      for(let j=1;j<=divisions;j++)samples.push([y0+(y1-y0)*j/divisions,w0+(w1-w0)*j/divisions]);
    }
    for(const [y,half] of samples){
      for(let i=0;i<=steps;i++){
        const x=half*(2*i/steps-1);
        positions.push(x,y,noseDepth(x,y));
      }
    }
    for(let j=0;j<samples.length-1;j++)for(let i=0;i<steps;i++){
      const n=j*(steps+1)+i;
      indices.push(n,n+steps+1,n+1,n+1,n+steps+1,n+steps+2);
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setIndex(indices);geo.computeVertexNormals();finish.side=THREE.DoubleSide;
    mesh(geo,finish,0,0,offset,station);
  }
  const ivory=material(0xe3e7da,.46),green=material(0x227950,.44),glass=material(0x243e43,.24);
  const outline=[[.4,.92],[.64,1.12],[.93,1.24],[1.35,1.32],[2.1,1.34],[2.9,1.26],[3.32,1.14],[3.52,.90]];
  cabPanel(outline,ivory);
  cabPanel([[.4,.9],[.64,1.10],[.84,1.18]],green,-.034);
  cabPanel([[1.26,.98],[1.38,1.10],[2.77,1.09],[3.19,.93]],glass,-.034);
  for(const side of [-1,1]){
    const sidePos=[],idx=[];
    for(const [y,w] of outline)sidePos.push(side*w,y,noseDepth(w,y),side*w,y,-10.3);
    for(let j=0;j<outline.length-1;j++){const a=j*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(sidePos,3));geo.setIndex(idx);geo.computeVertexNormals();
    mesh(geo,ivory,0,0,0,station);
    solid(side*1.32,2.32,-11.9,.045,1.05,2.7,0x2f4649);
    const x=side*.99,y=1.08;
    beam([x,y,noseDepth(x,y)-.07],[x,y,noseDepth(x,y)-.17],.133,0x394944);
    beam([x,y,noseDepth(x,y)-.171],[x,y,noseDepth(x,y)-.19],.081,0xffedc6);
  }
  beam([-.7,1.37,-15.33],[.18,1.65,-15.43],.024,0x171f20);
  for(let car=-1;car<=1;car++){
    const z=car*7.1;
    solid(0,1.43,z,2.62,1.9,6.78,0xd7e1d5);solid(0,.66,z,2.63,.38,6.64,0x377953);
    solid(0,2.46,z,2.68,1.16,6.7,0x334951);solid(0,3.21,z,2.59,.35,6.8,0xd6ddd6);
    for(const dx of [-1.35,1.35])for(let bay=-2.7;bay<3;bay+=1.45)solid(dx,2.43,z+bay,.045,1.18,.105,0x828982);
  }

  frame.translateZ(-43);frame.updateMatrix();
  // warehouseArcade: freestanding piers and recessed joinery keep the reveals visible in perspective.
  const masonry=tile('brick_wall_001.jpg',.78,1.8);
  masonry.color.setHex(0xbc8871);
  const dark=material(0x2c2824),inside=material(0x322f29),pane=material(0x253c3b,.36);
  const warmGlass=material(0x454339,.38),reflect=material(0x778781,.45);
  // Original patchy render over running-bond brick, with erosion concentrated at the foot.
  const face=document.createElement('canvas');face.width=256;face.height=512;
  const ctx=face.getContext('2d');let seed=211;
  function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  ctx.fillStyle='#a19787';ctx.fillRect(0,0,256,512);
  for(let i=0;i<18500;i++){
    const n=random(),x=random()*256,y=random()*512;
    ctx.fillStyle=n>.49?'rgba(237,226,203,.17)':'rgba(54,49,41,.19)';
    ctx.fillRect(x,y,1+random()*7,1+random()*6);
  }
  for(let i=0;i<240;i++){ctx.fillStyle='rgba(60,54,41,.07)';ctx.fillRect(random()*256,random()*512,1+random()*4,9+random()*81)}
  for(let row=0;row<40;row++){
    const erosion=13+row*.56+11*Math.sin(row*.43)+8*Math.sin(row*.7);
    for(let col=0;col<9;col++){
      const x=col*33-(row%2)*16;
      if(x>erosion && x<238+8*Math.sin(row*.38))continue;
      ctx.fillStyle=['#975e49','#986d54','#a27358','#805a48'][Math.floor(random()*4)];
      ctx.fillRect(x+1,row*13+1,30,10);
    }
  }
  const finishTexture=new THREE.CanvasTexture(face);finishTexture.encoding=THREE.sRGBEncoding;finishTexture.anisotropy=4;
  const plaster=new THREE.MeshStandardMaterial({map:finishTexture,roughness:1});
  plaster.addEventListener('dispose',()=>finishTexture.dispose());
  const unit=new THREE.BoxGeometry(),surfaces=new Map();
  function part(parent,x,y,z,w,h,d,mat){
    const obj=new THREE.Object3D();obj.position.set(x,y,z);obj.scale.set(w,h,d);parent.add(obj);
    if(!surfaces.has(mat))surfaces.set(mat,[]);surfaces.get(mat).push(obj);return obj;
  }
  const revealMetal=material(0x7d7668);
  const floor=tile('herringbone_pavement.jpg',2,3),lintel=material(0x645d50);
  const shade=document.createElement('canvas');shade.width=8;shade.height=128;
  const sc=shade.getContext('2d'),fade=sc.createLinearGradient(0,0,0,128);
  fade.addColorStop(0,'rgba(41,34,27,.76)');fade.addColorStop(.67,'rgba(50,42,34,.43)');fade.addColorStop(1,'rgba(50,42,34,0)');
  sc.fillStyle=fade;sc.fillRect(0,0,8,128);
  const shadeMap=new THREE.CanvasTexture(shade);
  const contact=new THREE.MeshBasicMaterial({map:shadeMap,transparent:true,depthWrite:false});
  contact.addEventListener('dispose',()=>shadeMap.dispose());
  // The frontage continues past both ends of the platform. Narrow cross aisles
  // keep the successive gables visible from the guided path without turning.
  const warehouseFrontage=[
    [21,-6,.10],[39,5,.15],
    [21.3,10,.10],[35,39,-.15],[31,73,-.30],
    [24,106,-.19],[25.6,136,-.18]
  ];
  ground(14,64,5.6,141,.119,tile('herringbone_pavement.jpg',2,42));
  // Swing-out perforated screens and gooseneck lights refer to the industrial facade photograph.
  const sheet=document.createElement('canvas');sheet.width=64;sheet.height=64;
  const painter=sheet.getContext('2d');painter.fillStyle='#a6aaa5';painter.fillRect(0,0,64,64);
  painter.fillStyle='#444b47';
  for(let y=2;y<64;y+=8)for(let x=2;x<64;x+=8){
    painter.beginPath();painter.arc(x+(y%16===2?0:4),y,2.1,0,Math.PI*2);painter.fill();
  }
  const punchedTexture=new THREE.CanvasTexture(sheet);
  punchedTexture.encoding=THREE.sRGBEncoding;punchedTexture.wrapS=punchedTexture.wrapT=THREE.RepeatWrapping;
  punchedTexture.repeat.set(2,7);punchedTexture.anisotropy=4;
  const perforated=new THREE.MeshStandardMaterial({map:punchedTexture,roughness:.67,metalness:.22});
  perforated.addEventListener('dispose',()=>punchedTexture.dispose());
  const umber=material(0x514031), brickRed=material(0x875944);
  function industrialBay(bay,index){
    part(bay,0,2.58,.77,4.32,5.16,1.08,inside);
    part(bay,-1.88,2.96,-.1,.58,5.92,1.28,plaster);
    part(bay,0,5.38,-.03,4.28,1.1,1.3,plaster);
    part(bay,1.93,2.55,0,.42,5.1,1.14,plaster);
    for(const sign of [-1,1]){
      const hinge=new THREE.Group();
      hinge.position.set(sign*1.64,0,-.44);
      hinge.rotation.y=-sign*(index%2===0?.92:.57);
      bay.add(hinge);part(hinge,-sign*.78,2.21,0,1.56,4.14,.12,perforated);
      part(hinge,-sign*1.53,2.21,0,.065,4.17,.16,metal);
    }
    part(bay,0,4.71,-.69,.075,.27,.64,dark);
    part(bay,0,4.52,-1,.4,.12,.34,dark);
  }
  function brickBay(bay,index){
    part(bay,0,2.9,.34,4.35,5.8,.96,masonry);
    part(bay,-1.98,2.89,-.19,.27,5.78,.28,brickRed);
    if(index%3===0){
      part(bay,0,2,-.21,3.36,3.92,.23,umber);
      for(const offset of [-1.52,0,1.52])part(bay,offset,2,-.36,.10,3.9,.11,dark);
      part(bay,0,4.13,-.34,3.95,.12,.18,dark);
    }else{
      part(bay,0,3.6,-.19,2.71,1.65,.2,pane);
      for(const offset of [-.88,0,.88])part(bay,offset,3.6,-.32,.07,1.68,.08,metal);
      part(bay,0,3.55,-.32,2.73,.07,.10,metal);
      part(bay,0,2.72,-.25,2.92,.16,.44,plaster);
    }
  }
  for(const [row,[x,z,heading]] of warehouseFrontage.entries()){
    const shed=new THREE.Group();shed.position.set(x,0,z);shed.rotation.y=heading;district.add(shed);
    // The inner shell ends behind the openings. A solid outer box would occlude the recesses.
    part(shed,.82,2.96,10.85,11.1,5.9,20.9,inside);
    const gable=new THREE.Shape();gable.moveTo(-6.45,5.95);gable.lineTo(0,7.28);gable.lineTo(6.45,5.95);gable.closePath();
    mesh(new THREE.ExtrudeGeometry(gable,{depth:23,bevelEnabled:false}),plaster,0,0,-1.5,shed);
    for(const side of [-1,1]){
      part(shed,side*3.25,6.63,10,6.9,.2,24,metal).rotation.z=-side*.20;
    }
    // Industrial loading canopies reappear on alternate blocks around the side lanes.
    if(row===4){
      part(shed,-7.24,4.36,9,2.65,.16,19,metal).rotation.z=.075;
      part(shed,-8.49,4.19,9,.13,.27,19,lintel);
      for(const postZ of [1,7,13,18]){
        const brace=part(shed,-7.2,3.82,postZ,1.93,.13,.12,lintel);
        brace.rotation.z=-.42;
      }
    }
    const bays=[[-4.2,-1.52,0],[0,-1.52,0],[4.2,-1.52,0],...Array.from({length:5},(_,i)=>[-6.34,i*4.35+.68,Math.PI/2])];
    bays.forEach(([bx,bz,angle],index)=>{
      const bay=new THREE.Group();bay.position.set(bx,0,bz);bay.rotation.y=angle;shed.add(bay);
      part(bay,0,.10,-.86,4.25,.12,4.65,floor);
      if(row===2){industrialBay(bay,index);return}
      if(row===4||row===6){brickBay(bay,index);return}
      part(bay,0,5.49,.08,4.27,.91,1.82,plaster);
      part(bay,0,4.98,-.16,4.30,.17,1.92,lintel);
      part(bay,-1.86,2.52,.04,.55,5.02,1.7,plaster);
      part(bay,1.88,2.51,.07,.46,5.02,1.64,masonry);
      part(bay,0,2.52,1.18,3.47,5.02,.14,dark);
      part(bay,0,2.0,1.04,3.11,3.66,.10,index%3===0?warmGlass:pane);
      part(bay,0,4.43,1.04,3.12,.81,.10,pane);
      part(bay,0,3.95,.91,3.38,.26,.23,metal);
      for(const dx of [-1.42,.18,1.45])part(bay,dx,1.98,.91,.084,3.58,.13,dark);
      part(bay,.34,1.32,.82,.07,.48,.09,reflect);
      part(bay,0,1.05,.92,3.10,.065,.10,dark);
      const shadow=mesh(new THREE.PlaneGeometry(4.22,3.6),contact,0,.168,-.66,bay);
      shadow.rotation.x=-Math.PI/2;shadow.rotation.z=Math.PI;
      // Projecting fascia and soffit read as separate planes even on a narrow screen.
      part(bay,0,5.30,-1.01,4.25,.16,.88,plaster);
      part(bay,0,5.19,-1.03,4.21,.075,.86,inside);
      for(const dx of [-1.76,1.76])part(bay,dx,4.99,-.96,.10,.13,.77,lintel);
      if((index+row)%5===1){
        for(let row=0;row<9;row++)
          part(bay,0,3.8-row*.16,.80,3.09,.13,.10,row%2===0?lintel:revealMetal);
      }
      if((index+row)%3===0){
        part(bay,-1.67,3.07,-.88,.17,.43,.19,dark);
        const board=part(bay,1.32,.76,-1.49,.56,.78,.05,lintel);board.rotation.x=.12;
        part(bay,1.32,.8,-1.54,.46,.51,.03,concrete);
        part(bay,1.32,.31,-1.41,.08,.52,.08,dark);
      }
    });
  }
  // Courtyard furniture interprets the photographed spool table on the brick apron.
  ground(17.6,-12.6,10.8,8.2,.137,tile('herringbone_pavement.jpg',4,3));
  const wood=tile('wood_planks_grey.jpg',1,1);wood.color.setHex(0xb28761);
  for(const [y,r,h] of [[.22,.72,.12],[.72,.39,.94],[1.21,.84,.10]]){
    mesh(new THREE.CylinderGeometry(r,r,h,24),wood,15.5,y,-13.8);
  }
  for(const [x,z] of [[14.4,-13.75],[16.63,-13.65],[15.55,-12.7]]){
    part(district,x,.84,z,.42,.075,.42,dark);
    for(const dx of [-.15,.15])for(const dz of [-.15,.15])
      beam([x+dx*1.33,.15,z+dz*1.33],[x+dx,.82,z+dz],.022,0x312d26);
  }
  const foliage=new THREE.TextureLoader().load('assets/surfaces/tree.png');
  foliage.encoding=THREE.sRGBEncoding;
  const leaves=new THREE.MeshLambertMaterial({map:foliage,alphaTest:.4,side:THREE.DoubleSide});
  leaves.addEventListener('dispose',()=>foliage.dispose());
  const tree=mesh(new THREE.PlaneGeometry(5.9,7.9),leaves,19.4,4.06,-14.9);
  tree.rotation.y=.32;
  const pavingShadow=document.createElement('canvas');pavingShadow.width=pavingShadow.height=128;
  const pc=pavingShadow.getContext('2d');
  for(let i=0;i<600;i++){
    const angle=random()*Math.PI*2,r=Math.sqrt(random())*51;
    pc.fillStyle='rgba(33,37,25,.19)';pc.beginPath();
    pc.ellipse(64+Math.cos(angle)*r,64+Math.sin(angle)*r,2+random()*6,2+random()*3,angle,0,Math.PI*2);pc.fill();
  }
  const shadowMap=new THREE.CanvasTexture(pavingShadow);
  const shadowMat=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false});
  shadowMat.addEventListener('dispose',()=>shadowMap.dispose());
  ground(16.6,-14.1,6.6,5.5,.153,shadowMat);
  // Recessed courtyard between two lanes, kept outside the guided and free walking area.
  const courtyardPaving=tile('herringbone_pavement.jpg',8,12);
  courtyardPaving.color.setHex(0xd6b397);
    // The courtyard lane opens obliquely toward the forward camera. Align its
  // brick edges and the far doorway to give the opening a readable vanishing point.
  const courtyardLane=new THREE.Group();
  courtyardLane.position.set(15.2,0,27);courtyardLane.rotation.y=.195;district.add(courtyardLane);
  const courtSurface=mesh(new THREE.PlaneGeometry(12.8,66),courtyardPaving,2.2,.156,32,courtyardLane);
  courtSurface.rotation.x=-Math.PI/2;
  for(const edge of [-4.2,8.6])part(courtyardLane,edge,.17,32,.2,.07,66,lintel);
  for(let z=9;z<64;z+=11)part(courtyardLane,2.2,.17,z,12.8,.022,.13,revealMetal);
  // A recessed portal at the far end frames the sightline from the shopfronts.
  for(const x of [0,6])part(courtyardLane,x,2.2,55,1.15,4.4,2.3,masonry);
  part(courtyardLane,3,4.62,55,7.4,.52,2.55,plaster);
  ground(22.5,99,20,6,.153,courtyardPaving);
  for(const [x,z,r] of [[14.3,34,1.10],[15.5,55,1.03],[18,73,1.03]]){
    for(const [h,radius,height] of [[.22,r,.12],[.72,r*.46,.94],[1.21,r,.10]])
      mesh(new THREE.CylinderGeometry(radius,radius,height,24),wood,x,h,z);
    for(const a of [0,2.1,4.2]){
      const sx=x+Math.cos(a)*(r+.53),sz=z+Math.sin(a)*(r+.53);
      part(district,sx,.78,sz,.44,.08,.44,dark);
      for(const dx of [-.15,.15])for(const dz of [-.15,.15])
        beam([sx+dx*1.3,.16,sz+dz*1.3],[sx+dx,.78,sz+dz],.025,0x382f28);
    }
  }
  for(const [x,z,h] of [[18.9,32,9.1],[17.9,49,9.7],[20.8,70,9.2],[23,85,7.7],[21,98,5.9]]){
    const crown=mesh(new THREE.PlaneGeometry(h*.77,h),leaves,x,.16+h/2,z);
    crown.rotation.y=.43;
    ground(x-3.6,z+1.9,h*1.35,h*1.16,.185,shadowMat);
  }
  district.updateWorldMatrix(true,true);
  for(const [finish,parts] of surfaces){
    const batch=new THREE.InstancedMesh(unit,finish,parts.length);
    parts.forEach((part,i)=>{batch.setMatrixAt(i,part.matrixWorld);part.parent.remove(part)});
    scene.add(batch);
  }
}