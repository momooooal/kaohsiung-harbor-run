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
  ground(-1.95,0,7.6,86,.105,tile('aerial_grass_rock.jpg',2,18));
  ground(13.2,-1,6.2,72,.118,tile('herringbone_pavement.jpg',2,22));
  ground(1,-21,51,8,.13,tile('asphalt_02.jpg',12,2));
  for(let z=-24;z<-17;z+=1.25)solid(8,.145,z,3.6,.025,.48,0xe6e1d4);
  for(const center of [0,-3.9]){
    for(const side of [-.75,.75])solid(center+side,.17,0,.10,.09,88,0x757c74);
  }
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
    mesh(geo,finish,0,0,offset);
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
    mesh(geo,ivory);
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

  // Photographs show worn rendered piers, exposed brick reveals and tall recessed glazing.
  const plaster=tile('concrete_pavement_02.jpg',3,2);
  plaster.color.setHex(0xb5aa91);
  const masonry=tile('brick_wall_001.jpg',1,2);
  const dark=material(0x322e29),pane=material(0x2c4344,.31);
  const reveal=material(0x574c40),reflect=material(0x728887);
  const unit=new THREE.BoxGeometry();
  const surfaces=new Map();
  function part(parent,x,y,z,w,h,d,mat){
    const obj=new THREE.Object3D();obj.position.set(x,y,z);obj.scale.set(w,h,d);parent.add(obj);
    if(!surfaces.has(mat))surfaces.set(mat,[]);surfaces.get(mat).push(obj);return obj;
  }
  for(const [x,z] of [[21,5],[39,10]]){
    const shed=new THREE.Group();shed.position.set(x,0,z);district.add(shed);
    part(shed,0,3,10,12.8,6,23,plaster);
    const gable=new THREE.Shape();gable.moveTo(-6.4,6);gable.lineTo(0,7.3);gable.lineTo(6.4,6);gable.closePath();
    mesh(new THREE.ExtrudeGeometry(gable,{depth:23,bevelEnabled:false}),concrete,0,0,-1.5,shed);
    for(const side of [-1,1]){
      const roof=part(shed,side*3.28,6.6,10,6.9,.24,24,metal);roof.rotation.z=-side*.20;
    }
    for(const [bx,bz,angle] of [[-4.2,-1.56,0],[0,-1.56,0],[4.2,-1.56,0],...Array.from({length:5},(_,i)=>[-6.48,i*4.35+.5,Math.PI/2])]){
      const bay=new THREE.Group();bay.position.set(bx,0,bz);bay.rotation.y=angle;shed.add(bay);
      part(bay,0,2.62,-.04,3.37,5.18,.14,dark);
      part(bay,0,2.04,-.13,2.92,3.72,.08,pane);
      part(bay,0,4.69,-.13,2.95,.90,.09,pane);
      part(bay,-1.82,2.88,-.21,.40,5.76,.48,concrete);
      part(bay,1.62,2.67,-.24,.36,4.97,.22,masonry);
      part(bay,0,4.02,-.27,3.22,.20,.24,metal);
      part(bay,0,1.96,-.21,.075,3.65,.08,dark);
      part(bay,-1.42,2.08,-.23,.10,3.7,.11,reveal);
      part(bay,.68,2.13,-.23,.045,3.35,.08,reflect);
      part(bay,.15,1.35,-.31,.065,.45,.09,metal);
      for(const h of [1.1,3.78,4.93])part(bay,0,h,-.22,2.95,.06,.08,dark);
    }
  }
  district.updateWorldMatrix(true,true);
  for(const [finish,parts] of surfaces){
    const batch=new THREE.InstancedMesh(unit,finish,parts.length);
    parts.forEach((part,i)=>{batch.setMatrixAt(i,part.matrixWorld);part.parent.remove(part)});
    scene.add(batch);
  }
}