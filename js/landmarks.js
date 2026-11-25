export const places=[
 {index:1,name:'哈瑪星',detail:'港區鐵道與舊驛意象',source:'https://khh.travel/zh-tw/attractions/detail/206/'},
 {index:5,name:'鹽埕綠廊道',detail:'樹列與花圃間的水波紋座椅、花架通道，配置為示意',source:'https://orgws.kcg.gov.tw/001/KcgOrgUploadFiles/466/relfile/78183/329469/91ea6982-a618-4112-a0ed-e290cf797a83.pdf'},
 {index:14,name:'真愛碼頭',detail:'愛河出海口的雙座風帆',source:'https://khh.travel/zh-tw/attractions/detail/1053/'},
 {index:19,name:'高雄流行音樂中心',detail:'海浪起伏的高低塔與珊瑚礁群意象',source:'https://khh.travel/zh-tw/attractions/detail/1175/'}
];
export function landmarks(scene,points){
 const light=new THREE.DirectionalLight(0xfff2d8,.68);light.position.set(-45,70,28);light.name="sun";light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:145});light.shadow.camera.updateProjectionMatrix();light.shadow.bias=-.0004;light.shadow.normalBias=.035;scene.add(light,light.target);
 places.forEach(({index},k)=>{
 const root=new THREE.Group(),a=points[index],v=a.clone().sub(points[index-1]).normalize();
 root.position.copy(a);root.rotation.y=Math.atan2(v.x,v.z);root.translateX(k===2?-24:13);if(k===2)root.rotateY(Math.PI);scene.add(root);
 function part(geo,c,x,y,z){const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:c,roughness:.78,side:THREE.DoubleSide}));m.position.set(x,y,z);root.add(m);return m}
 function box(w,h,d,c,x,y,z){return part(new THREE.BoxGeometry(w,h,d),c,x,y,z)}
 if(k===0){for(const x of [-2,0,4,6])box(.16,.2,40,0x586168,x,.16,0);
 for(let z=-18;z<20;z+=2)box(10,.16,.5,0x77533e,2,.06,z);
 box(6,3,16,0xead4aa,8,1.5,0);for(const side of [-1,1])box(4,.4,18,0x994b36,8+side*1.7,3.8,0).rotation.z=-side*.33;
 for(let z=-6;z<=6;z+=3)box(.14,1.4,1.3,0x355558,4.95,1.8,z)}
 // Street planting along this corridor uses the tree scan in street.js.
 if(k===2){
   box(18,.8,29,0xc9b99c,4,.4,0);
   // Fan the two curved sail profiles toward the approach from the boardwalk.
   for(const side of [-1,1]){
     const sail=new THREE.Shape();
     sail.moveTo(0,.4);
     sail.quadraticCurveTo(side*2.2,8.3,side*1.3,18);
     sail.quadraticCurveTo(side*5.4,10.8,side*8.6,1.2);
     sail.quadraticCurveTo(side*3.4,2.1,0,.4);
     const panel=part(new THREE.ExtrudeGeometry(sail,{depth:.46,bevelEnabled:false}),0xfffaf0,side*1.2,1,side*2);
     panel.rotation.y=-.75+side*.2;
   }
 }
 if(k===3){box(32,.45,70,0xad9d84,7,0,0);box(90,.22,120,0x297788,62,-.1,0);for(let j=-24;j<25;j+=4){box(.13,1.15,.13,0x334b50,21,.8,j);box(.09,.1,4,0x778587,21,1.3,j+2)}for(let i=0;i<14;i++){const h=7+17*Math.exp(-((i-3)**2)/8)+9*Math.exp(-((i-11)**2)/5);box(10,h,2.3,0xe7e8dc,5,h/2,i*2-13);box(.2,h*.72,1.4,0x577e87,-.1,h*.4,i*2-13);for(let level=1;level<h-1;level+=2){box(.16,.10,2.2,0x47616d,-.24,level,i*2-13);box(9,.85,.16,0x719098,5,level,i*2-14.18)}}
 for(let i=0;i<4;i++)part(new THREE.IcosahedronGeometry(4+i%2,0),0xe9eadc,2+i*3,2,-20-i*3)}
 });
}



