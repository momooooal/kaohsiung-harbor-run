const fs=require('fs'),{chromium}=require(require.resolve('playwright',{paths:[process.cwd()]}));
const catalog=require(process.cwd()+'/data/recommendations.json'),refs=require('./scene-points.json');
const base=process.env.TEST_URL||'http://localhost:8789/',out=process.env.TEST_OUT;
fs.mkdirSync(out,{recursive:true});
const samples=['harbor-108-start','harbor-108-street','harbor-108-school','harbor-108-mouth',...refs.filter(v=>v.id.endsWith('-0.47')||v.id.endsWith('-0.72')||v.id==='heart-5-0.94'||/-(?:coral|wharf|terminal|river|swing|library|bridge|terminalside)$/.test(v.id)).map(v=>v.id)];
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
try{const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
p.setDefaultTimeout(65000);const errors=[];p.on('pageerror',e=>{console.error(e.message);errors.push(e.message);});p.on('console',m=>{if(m.text().includes('VALIDATE_STATUS')||m.text().includes('Shader Error'))errors.push(m.text());});
await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.THREE);await p.evaluate(()=>{const O=THREE.WebGLRenderer;THREE.WebGLRenderer=class extends O{
 constructor(...args){super(...args);const draw=this.render;this.render=function(s,c){const v=draw.call(this,s,c);if(!window.snap)return v;
 const {x,z,angle}=window.snap,alternate=c.clone(),a=angle*Math.PI/180;window.normalShot=this.domElement.toDataURL('image/jpeg',.91);
 alternate.position.set(x,1.79,z);alternate.lookAt(x+Math.sin(a),1.79,z-Math.cos(a));draw.call(this,s,alternate);
 window.streetShot=this.domElement.toDataURL('image/jpeg',.91);draw.call(this,s,c);window.snap=null;return v;};}};});
for(const id of samples){
 const r=catalog.routes.find(r=>id.startsWith(r.variantId+'-')),ref=refs.find(s=>s.id===id),m=ref.view.match(/@([-\d.]+),([-\d.]+)/);
 const x=(+m[2]-120.29)*102820,z=(22.61-+m[1])*110750,angle=Number(ref.view.match(/,([-\d.]+)h/)?.[1]||ref.heading);
 await p.evaluate(id=>location.hash='/explore/run/'+id,r.variantId);await p.locator('#preview-start').click();await p.waitForFunction(()=>document.querySelector('#preview-position')?.textContent.includes('%'));
 await p.evaluate(async({r,x,z})=>{const clear=(await import('./data/preview-clearance.js')).default[r.variantId].edges,pts=[];
 const ctr=r.geometry.flatMap(g=>g.coordinates).map(([lat,lon])=>[(lon-120.29)*102820,(22.61-lat)*110750]).filter((v,i,a)=>!i||Math.hypot(v[0]-a[i-1][0],v[1]-a[i-1][1])>.05);
 ctr.forEach((v,i)=>{for(const q of clear[i]||[v])if(!pts.length||Math.hypot(q[0]-pts.at(-1)[0],q[1]-pts.at(-1)[1])>.006)pts.push(q);});
 let distance=0,best=Infinity,target=0;pts.slice(1).forEach((b,i)=>{let a=pts[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(len*len||1))),sep=Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z);if(sep<best-.012){best=sep;target=distance+t*len;}distance+=len;});
 const select=document.querySelector('#preview-stop');if(r.variantId==='harbor-108' && target<12)target=0;select.add(new Option('test position',String(target)));select.value=String(target);select.dispatchEvent(new Event('change'));},{r,x,z});
 await p.waitForTimeout(1600);await p.bringToFront();await p.evaluate(v=>{window.snap=v;if(document.querySelector('#preview-pause').textContent==='繼續')document.querySelector('#preview-pause').click();document.querySelector('#preview-stage').focus();},{x,z,angle});await p.waitForFunction(()=>!window.snap);
 for(const [k,v] of Object.entries(await p.evaluate(()=>({normal:normalShot,street:streetShot}))))fs.writeFileSync(out+'/'+id+'-'+k+'.jpg',Buffer.from(v.split(',')[1],'base64'));
 console.log(id,'captured');await p.evaluate(()=>location.hash='/');await p.locator('#preview-start').waitFor({state:'detached'});}
 if(errors.length)throw Error(errors.join('\n'));}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
