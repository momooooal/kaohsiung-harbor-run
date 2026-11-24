// Positions below are art-direction offsets in the illustrative scene, never GPS coordinates.
const pointsOfInterest=[
 {index:1,side:-5,along:-8,id:'O1',name:'哈瑪星站',tag:'捷運・站內廁所',info:'踩線從 2 號出口集合、寄物。高捷列有站內廁所，入站動線與置物櫃費率請看現場公告。',query:'高雄捷運 哈瑪星站 臨海二路17-1號',source:'https://www.krtc.com.tw/Guide/station_info?n=O1'},
 {index:14,side:6,along:4,id:'C11',name:'真愛碼頭站',tag:'水岸周邊・輕軌',info:'走到真愛碼頭時，可查輕軌 C11 站的位置與乘車資訊。',query:'高雄輕軌 真愛碼頭站 C11',source:'https://www.krtc.com.tw/KLRT/station_info?n=C11'},
 {index:34,side:-6,along:-5,id:'C12',name:'駁二大義站',tag:'回程沿線・輕軌',info:'大義街路口的地面輕軌站使用側式月台，可由這裡轉乘或步行前往大義倉庫群。',query:'高雄輕軌 駁二大義站 C12',source:'https://www.krtc.com.tw/KLRT/station_info?n=C12'},
 {index:34,side:12.7,along:-18,id:'C8-20',name:'路人咖啡五號店',tag:'活動當日・食物與飲水',info:'從大義回程路段進入倉庫群。店址為大義街 2-2 號 C8-20，店內有咖啡沖煮與烘豆工作室。踩線當天提供食物與飲水，平日免費補水與跑者合作方案仍待店家確認。',query:'路人咖啡5號店 高雄市鹽埕區大義街2-2號 C8-20',source:'https://www.ruhcafe.com/pages/ruhcafe-no5'}
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
     // A small roasting counter, cooling tray, hopper and exhaust flue, seen from the lane.
     part(new THREE.BoxGeometry(3.7,.12,1.05),0,1.03,0);
     for(const x of [-1.55,1.55])part(new THREE.BoxGeometry(.12,.98,.75),x,.53,0);
     const enamel=new THREE.MeshStandardMaterial({color:0x32403a,roughness:.53});
     part(new THREE.CylinderGeometry(.42,.42,.74,18),.64,1.65,0,enamel).rotation.x=Math.PI/2;
     part(new THREE.CylinderGeometry(.33,.10,.48,16),.64,2.18,.02);
     part(new THREE.CylinderGeometry(.35,.34,.16,20),.64,1.26,-.45);
     part(new THREE.CylinderGeometry(.115,.115,1.6,12),1.12,2.2,.23);
   }else part(new THREE.CylinderGeometry(.065,.09,2.65,8),0,1.36,0);
   const stop={...record,target};stops.push(stop);
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
