const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require(require.resolve('playwright',{paths:[process.cwd()]}));
const name=process.env.TASK.replace('ride-',''),out=process.env.TEST_OUT;
const ref=require('./six-view.json').find(v=>v.id===name),section={route:name,lat:ref.position[0],lon:ref.position[1],bearing:ref.heading};
const url=process.env.TEST_URL+'#/explore/run/'+section.route;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
 try{
 const p=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 p.setDefaultTimeout(60000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.THREE && document.querySelector('#preview-start'));
 await p.evaluate(()=>{
   let sequence=0,time=performance.now();const queue=new Map();
   window.requestAnimationFrame=fn=>{const id=++sequence;queue.set(id,fn);return id;};
   window.cancelAnimationFrame=id=>queue.delete(id);
   window.nextFrame=()=>{const callbacks=[...queue.values()];queue.clear();time+=50;for(const f of callbacks)f(time);};
   const Base=THREE.WebGLRenderer;
   THREE.WebGLRenderer=class extends Base{constructor(...args){super(...args);const draw=this.render;this.render=function(scene,camera){
      draw.call(this,scene,camera);
      const forward=camera.getWorldDirection(new THREE.Vector3());
      window.capturePose=[camera.position.x,camera.position.y,camera.position.z,Math.atan2(forward.x,-forward.z)*180/Math.PI];
      if(window.capturePixels)window.captureImage=this.domElement.toDataURL('image/jpeg',.94);
   };}};
   document.querySelector('#preview-start').click();
 });
 await p.waitForFunction(()=>window.capturePose,{},{polling:100,timeout:90000});
 const settings=await p.evaluate(async s=>{
   const data=await (await fetch('./data/recommendations.json')).json(),r=data.routes.find(r=>r.variantId===s.route);
   const {stationWalkingPoint}=await import('./js/shihjia-alignment.js');
   const {default:cache}=await import('./data/preview-clearance.js');
   const center=[],pts=[];
   for(const [lat,lon] of r.geometry.flatMap(g=>g.coordinates)){
     const v=stationWalkingPoint(r.variantId,new THREE.Vector3((lon-120.29)*102820,0,(22.61-lat)*110750));
     if(!center.length||v.distanceTo(center.at(-1))>.05)center.push(v);
   }
   center.forEach((v,i)=>{for(const q of cache[r.variantId].edges[i]||[[v.x,v.z]])if(!pts.length||Math.hypot(q[0]-pts.at(-1)[0],q[1]-pts.at(-1)[1])>.006)pts.push(q);});
   const start=0,best=0;const total=pts.slice(1).reduce((d,b,i)=>d+Math.hypot(b[0]-pts[i][0],b[1]-pts[i][1]),0);
   const speed=120;(await import('./js/explore.js')).MODES.run.speed=speed;
   const mini=document.querySelector('#preview-mini');mini.hidden=true;
   const guides=document.querySelector('#preview-guides');if(guides.checked)guides.click();
   const w=document.querySelector('[data-move=w]');w.scrollIntoView({block:'center',behavior:'instant'});
   if(document.querySelector('#preview-pause').textContent==='繼續')document.querySelector('#preview-pause').click();
   document.querySelector('#preview-stage').focus({preventScroll:true});window.nextFrame();
   const b=w.getBoundingClientRect();
   return {total,end:pts.at(-1),start,offset:best,x:b.x+b.width/2,y:b.y+b.height/2,mode:document.querySelector('#preview-mode').value,first:document.querySelector('#preview-camera').textContent,initial:window.capturePose};
 },section);
 await p.waitForTimeout(1200);
 await p.bringToFront();
 const hit=await p.evaluate(()=>{
   const b=document.querySelector('[data-move=w]');document.documentElement.style.scrollBehavior='auto';b.scrollIntoView({block:'center',behavior:'instant'});
   if(document.querySelector('#preview-pause').textContent==='繼續')document.querySelector('#preview-pause').click();
   window.contact=[];for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture','blur'])document.addEventListener(type,e=>window.contact.push([type,e.target.id,e.target.dataset?.move]),true);
   const r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
   if(document.elementFromPoint(x,y)!==b)throw Error('Touch control covered '+document.elementFromPoint(x,y)?.outerHTML?.slice(0,150));
   return {x,y};
 });
 const client=await p.context().newCDPSession(p);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:hit.x,y:hit.y}]});
 console.log('contact',await p.evaluate(()=>[window.contact,document.activeElement.id,document.querySelector('#preview-pause').textContent]));
 const folder=fs.mkdtempSync('/tmp/route-frames-'),poses=[];
 for(let i=0;i<Math.ceil(settings.total/6)+5;i++){
   const {image,pose}=await p.evaluate(()=>{window.capturePixels=true;window.nextFrame();return {image:window.captureImage,pose:window.capturePose};});
   const bytes=Buffer.from(image.split(',')[1],'base64');
   fs.writeFileSync(path.join(folder,String(i).padStart(4,'0')+'.jpg'),bytes);
   if(i%100===0||i===Math.ceil(settings.total/6))fs.writeFileSync(out+'/'+name+'-'+i+'.jpg',bytes);
   poses.push(pose);
 }
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const pathLength=poses.reduce((total,p,i)=>i?total+Math.hypot(p[0]-poses[i-1][0],p[2]-poses[i-1][2]):total,0);
 fs.writeFileSync(out+'/'+name+'.json',JSON.stringify({url,settings,pathLength,stepSeconds:.05,poses,errors},null,1));
 if(Math.hypot(poses.at(-1)[0]-settings.end[0],poses.at(-1)[2]-settings.end[1])>1||pathLength<.96*settings.total||errors.length)throw Error('Insufficient travel or page error: '+pathLength+' '+errors.join(','));
 execFileSync(process.env.FFMPEG||'ffmpeg',['-loglevel','error','-framerate','20','-i',folder+'/%04d.jpg','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-movflags','+faststart',out+'/'+name+'.mp4']);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
