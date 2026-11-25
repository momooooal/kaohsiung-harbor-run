import {stationEntrance} from './station-entrance.js';
import {stationExitById} from '../data/station-exits.js';
import {lightRailStreet} from './transit-street.js';
// Positions below are art-direction offsets in the illustrative scene, never GPS coordinates.
const pointsOfInterest=[
 {index:1,side:-5,along:-8,id:'O1',name:'哈瑪星站',tag:'捷運・站內廁所',info:'踩線從 2 號出口集合、寄物。高捷列有站內廁所，入站動線與置物櫃費率請看現場公告。',query:'高雄捷運 哈瑪星站 臨海二路17-1號',source:'https://www.krtc.com.tw/Guide/station_info?n=O1'},
 {index:14,side:6,along:4,id:'C11',name:'真愛碼頭站',tag:'水岸周邊・輕軌',info:'走到真愛碼頭時，可查輕軌 C11 站的位置與乘車資訊。',query:'高雄輕軌 真愛碼頭站 C11',source:'https://www.krtc.com.tw/KLRT/station_info?n=C11'},
 {index:34,side:-6,along:38,id:'C12',name:'駁二大義站',tag:'回程沿線・輕軌',info:'大義街路口的地面輕軌站使用側式月台，可由這裡轉乘或步行前往大義倉庫群。',query:'高雄輕軌 駁二大義站 C12',source:'https://www.krtc.com.tw/KLRT/station_info?n=C12'},
 {index:34,side:-9.2,along:-42,id:'C8-20',name:'路人咖啡五號店',tag:'活動當日・食物與飲水',info:'從大義回程路段進入倉庫群。店址為大義街 2-2 號 C8-20，店內有咖啡沖煮與烘豆工作室。踩線當天提供食物與飲水，平日免費補水與跑者合作方案仍待店家確認。',query:'路人咖啡5號店 高雄市鹽埕區大義街2-2號 C8-20',source:'https://www.ruhcafe.com/pages/ruhcafe-no5'}
];
export function addServiceStops(scene,points,host,visit){
 const section=document.createElement('section');section.className='section-card service-stops';
 section.innerHTML='<h2>沿途可找哪些服務？</h2><p>選一站，在 3D 裡看周邊。模型中的店面與標牌為導覽示意；實際入口可開啟 Google 地圖確認。</p>';
 host.after(section);
 const stops=[];
 for(const record of pointsOfInterest.filter(item=>item.index<points.length)){
   const forward=points[record.index].clone().sub(points[record.index-1]).normalize();
   const frame=new THREE.Group();frame.position.copy(points[record.index]);frame.rotation.y=Math.atan2(forward.x,forward.z);frame.translateX(record.side);frame.translateZ(record.along);scene.add(frame);
   const cafe=record.id==='C8-20';
   const target=frame.position.clone();target.y=cafe?3.6:2.8;
   const canvas=document.createElement('canvas');canvas.width=600;canvas.height=160;
   const ctx=canvas.getContext('2d');ctx.fillStyle=cafe?'#49372d':'#15504c';ctx.fillRect(0,0,600,160);ctx.fillStyle='#fff1cc';ctx.font='bold 36px sans-serif';ctx.fillText(record.id,18,46);ctx.font='bold 64px sans-serif';ctx.fillText(record.name,18,124);
   const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
   const label=new THREE.SpriteMaterial({map:texture});label.addEventListener('dispose',()=>texture.dispose());
   const sign=new THREE.Sprite(label);sign.position.y=target.y;sign.scale.set(4.2,1.12,1);frame.add(sign);
   const steel=new THREE.MeshStandardMaterial({color:0x62716c,roughness:.47});
   function part(geometry,x,y,z,material=steel){const obj=new THREE.Mesh(geometry,material);obj.position.set(x,y,z);frame.add(obj);return obj}
   if(cafe){
     // The corner display interprets the grey wall, round plaque, white counter and
     // glazed roasting room in the shop photographs; the plaque carries no writing.
     frame.rotation.y-=.13;
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
   }else if(record.id==='O1'){
     const station=stationEntrance(frame,stationExitById.get('O1-2'),false);
     station.position.set(-7,0,3.8);station.rotation.y=1.99;station.scale.setScalar(.73);
   }else if(record.id==='C11'){
     const station=new THREE.Group();station.position.set(9,0,1);frame.add(station);lightRailStreet('C11',station);
   }
   const stop={...record,target,sign};stops.push(stop);
   const card=document.createElement('details'),title=document.createElement('summary'),description=document.createElement('p'),actions=document.createElement('div');actions.className='bay-actions';
   title.textContent=record.name+'｜'+record.tag;description.textContent=record.info;
   const jump=document.createElement('button');jump.type='button';jump.className='btn dark';jump.textContent='在 3D 觀看';jump.onclick=()=>visit(stop);
   actions.append(jump);
   for(const [text,url] of [['Google 地圖','https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(record.query)],['地點資訊',record.source]]){
     const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.className='link-arrow';link.textContent=text+' ↗';actions.append(link);
   }
   card.append(title,description,actions);section.append(card);
 }
 return stops;
}
