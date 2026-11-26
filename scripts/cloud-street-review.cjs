// Only public Street View. No sign-in, account storage or saved places.
const {chromium}=require('playwright'), fs=require('node:fs'), crypto=require('node:crypto');
const {routes}=require('../data/recommendations.json');
const out='review-output';fs.mkdirSync(out,{recursive:true});
const envelopeKey=crypto.randomBytes(32);
fs.writeFileSync(out+'/viewer-key.bin',crypto.publicEncrypt(fs.readFileSync('scripts/review-public.pem'),envelopeKey));
function keepReviewImage(name,bytes){
  const iv=crypto.randomBytes(12),enc=crypto.createCipheriv('aes-256-gcm',envelopeKey,iv);
  const ciphertext=Buffer.concat([enc.update(bytes),enc.final()]);
  fs.writeFileSync(out+'/'+name+'.bin',Buffer.concat([iv,enc.getAuthTag(),ciphertext]));
}
function offset(a,b){return [(b[1]-a[1])*102820,(b[0]-a[0])*110750]}
function length(a,b){return Math.hypot(...offset(a,b))}
function sample(coords,metres){
  let rest=metres;
  for(let i=1;i<coords.length;i++){const a=coords[i-1],b=coords[i],dist=length(a,b);
    if(dist<.1)continue;if(rest<=dist||i===coords.length-1){const t=Math.max(0,Math.min(1,rest/dist));return a.map((v,j)=>v+(b[j]-v)*t);}
    rest-=dist;
  }return coords.at(-1);
}
const plan=routes.flatMap(r=>r.geometry.flatMap((g,leg)=>{
  const pts=g.coordinates,n=pts.slice(1).reduce((v,p,i)=>v+length(pts[i],p),0),nSteps=Math.max(3,Math.ceil(n/390));
  return Array.from({length:nSteps+1},(_,i)=>{const d=n*i/nSteps,a=sample(pts,Math.min(d,n-1)),b=sample(pts,Math.min(d+14,n));const [x,y]=offset(a,b);
    return {id:r.variantId+'-'+leg+'-'+i,route:r.variantId,leg,index:i,at:Math.round(d),position:a,heading:Math.round((Math.atan2(x,y)*180/Math.PI+360)%360),pegman:i===0,image:[0,Math.floor(nSteps*.34),Math.floor(nSteps*.70),nSteps].includes(i)};});
}));
const ledger=[],save=()=>fs.writeFileSync(out+'/review.json',JSON.stringify(ledger,null,2));
const view=/@(-?[\d.]+),(-?[\d.]+),[\d.]+a/;
async function consent(p){const btn=p.getByRole('button',{name:/Reject all|全部拒絕/}).first();if(await btn.isVisible())await btn.click();}
async function hasPano(p,ms){try{await p.waitForURL(view,{timeout:ms});return true;}catch{return false;}}
const seeds=require('./known-street-points.json');
const snapURL=(point,head,id)=>id?'https://www.google.com/maps/@'+point.join(',')+',3a,75y,'+head+'h,90t/data=!3m6!1e1!3m4!1s'+id+'!2e0!7i16384!8i8192?hl=en':'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+point.join(',')+'&heading='+head+'&pitch=0&hl=en';
async function inspect(p,s){
 const exact=s.position,near=seeds.map(v=>({...v,away:length(v.coord,exact)})).sort((a,b)=>a.away-b.away)[0];
 const label=()=>p.locator('body').innerText({timeout:5000});
 const read=async()=>{
  let body='';try{await p.waitForFunction(()=>/Image capture:|Imagery date:/.test(document.body.innerText),null,{timeout:3500});body=await label();}catch{return null;}
  if(/No Street View imagery available/.test(body)&&!p.url().includes('!1s'))return null;
  const m=p.url().match(view),id=p.url().match(/!1s([^!]+)/)?.[1],date=body.match(/(?:Image capture|Imagery date):\s*([A-Za-z]+\s+20\d\d)/i)?.[1];
  if(!m||!date||!id)return null;
  const actual=[+m[1],+m[2]],off=Math.round(length(exact,actual));
  return off<115?{actual,pano:id,date,offset:off}:null;
 };
 let dropped=false;
 if(s.pegman){
  await p.goto('https://www.google.com/maps/@'+exact.join(',')+',19z?hl=en',{waitUntil:'domcontentloaded'});await consent(p);
  const man=p.getByRole('button',{name:/Browse Street View images|Pegman/i}).first();
  try{await man.waitFor({timeout:6500});const bb=await man.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(540,325,{steps:17});await p.waitForTimeout(620);await p.mouse.up();dropped=await hasPano(p,3300);}catch{}
 }
 const h=s.heading*Math.PI/180,shift=t=>[exact[0]-Math.sin(h)*t/110750,exact[1]+Math.cos(h)*t/102820];
 const tries=[...(near&&near.away<50?[snapURL(near.coord,s.heading,near.id)]:[]),snapURL(exact,s.heading),snapURL(shift(12),s.heading),snapURL(shift(-13),s.heading)];
 let record=null,choices=[];
 for(const url of tries){
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:20000});await consent(p);if(!await hasPano(p,3800))continue;
  record=await read();if(!record)continue;
  const more=p.getByRole('button',{name:/See more dates/i}).first();
  if(await more.isVisible()){
   await more.click();await p.waitForTimeout(550);
   const matches=await p.getByText(/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* 20\d\d$/i).all();
   for(const el of matches){const d=(await el.innerText()).trim();if(await el.isVisible()&&!choices.includes(d))choices.push(d);}
   choices.sort((a,b)=>Date.parse(b)-Date.parse(a));if(choices[0]&&Date.parse(choices[0])>Date.parse(record.date)){const el=p.getByText(choices[0],{exact:true}).last();if(await el.isVisible()){await el.click();await p.waitForTimeout(700);}}
   const updated=await read();if(updated)record=updated;
   const close=p.getByRole('button',{name:/^Close dates|^Close historical imagery/i}).first();if(await close.isVisible())await close.click();
  }
  break;
 }
 if(!record)return {status:'no nearby dated panorama',dropped};
 let advanced=false;
 if(s.image){
  await p.waitForTimeout(1200);keepReviewImage(s.id,await p.screenshot({type:'jpeg',quality:74}));
  const original=record.actual;
  await p.mouse.click(527,327);await p.keyboard.press('ArrowUp');await p.waitForTimeout(900);
  const next=await read();if(next)advanced=length(original,next.actual)>1.5&&length(original,next.actual)<55;
 }
 return {status:'view',dropped,...record,choices,advanced};
}

(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{const p=await browser.newPage({viewport:{width:1080,height:650},locale:'en-US'});p.setDefaultTimeout(4500);
 for(const s of plan.filter(s=>s.route===process.env.ROUTE)){
   const prev=ledger.find(x=>x.status==='view'&&length(x.position,s.position)<48&&Math.cos((x.heading-s.heading)*Math.PI/180)>.87);
   if(prev){ledger.push({...s,status:'shared',via:prev.id});save();continue;}
   let v;try{v=await inspect(p,s);}catch(e){v={status:'unavailable',notice:e.message.slice(0,220)};}
   ledger.push({...s,...v});save();console.log(s.id,v.status,v.offset??'',v.date??'');
   if(v.status==='access challenge')break;

 }
 }finally{save();await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1});
