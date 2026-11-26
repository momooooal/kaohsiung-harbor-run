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
  const pts=g.coordinates,n=pts.slice(1).reduce((v,p,i)=>v+length(pts[i],p),0),nSteps=Math.max(3,Math.ceil(n/530));
  return Array.from({length:nSteps+1},(_,i)=>{const d=n*i/nSteps,a=sample(pts,Math.min(d,n-1)),b=sample(pts,Math.min(d+14,n));const [x,y]=offset(a,b);
    return {id:r.variantId+'-'+leg+'-'+i,route:r.variantId,leg,index:i,at:Math.round(d),position:a,heading:Math.round((Math.atan2(x,y)*180/Math.PI+360)%360),pegman:i===0,image:[0,Math.floor(nSteps*.34),Math.floor(nSteps*.70),nSteps].includes(i)};});
}));
const ledger=[],save=()=>fs.writeFileSync(out+'/review.json',JSON.stringify(ledger,null,2));
const view=/@(-?[\d.]+),(-?[\d.]+),[\d.]+a/;
async function consent(p){const btn=p.getByRole('button',{name:/Reject all|全部拒絕/}).first();if(await btn.isVisible())await btn.click();}
async function hasPano(p,ms){try{await p.waitForURL(view,{timeout:ms});return true;}catch{return false;}}
async function inspect(p,s){
  const coord=s.position.map(n=>n.toFixed(6)).join(',');
  const url='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+coord+'&heading='+s.heading+'&pitch=0&hl=en';
  let dropped=false;
  if(s.pegman){
    await p.goto('https://www.google.com/maps/@'+coord+',19z?hl=en',{waitUntil:'domcontentloaded',timeout:22000});await consent(p);
    const man=p.getByRole('button',{name:/Browse Street View images|Pegman|瀏覽街景服務圖像/i}).first();
    try{await man.waitFor({timeout:9000});const box=await man.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(550,321,{steps:15});await p.waitForTimeout(450);await p.mouse.up();dropped=await hasPano(p,3500);}catch{}
  }
  // From a road entered with Pegman, use the route bearing at each checkpoint.
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:24000});await consent(p);
  if(!await hasPano(p,11000)){const content=(await p.locator('body').innerText()).slice(0,450);return {status:/unusual traffic|robot|captcha/i.test(content)?'access challenge':'view unavailable',dropped,notice:content};}
  const label=()=>p.locator('body').innerText();
  await p.waitForFunction(()=>/image capture|imagery date|圖像拍攝日期|Street View|街景/.test(document.body.innerText),{},{timeout:9000}).catch(()=>{});
  const more=p.getByRole('button',{name:/see more dates|查看更多日期/i}).first();let choices=[];
  if(await more.isVisible()){
    await more.click();await p.waitForTimeout(420);
    const dateRx=/^\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{4}年\d{1,2}月)\s*$/i;
    const els=await p.getByText(dateRx).all();
    for(const e of els){const d=(await e.textContent()).trim();if(await e.isVisible()&&!choices.includes(d))choices.push(d);}
    const time=d=>Date.parse(d.replace(/(\d{4})年(\d{1,2})月/,'$1-$2-01'));
    choices.sort((a,b)=>time(b)-time(a));if(choices[0]){const pick=p.getByText(choices[0],{exact:true}).last();if(await pick.isVisible())await pick.click().catch(()=>{});}
  }
  await p.waitForTimeout(s.image?1800:450);
  const body=await label(),m=p.url().match(view);
  if(!m)return {status:'view unavailable',dropped};
  const actual=[+m[1],+m[2]],id=p.url().match(/!1s([^!]+)/)?.[1];const text=body.split(/\n/).map(v=>v.trim()).filter(v=>/image capture|imagery date|圖像拍攝日期|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20\d\d|20\d\d年\d+月/i.test(v));
  if(s.image)keepReviewImage(s.id,await p.screenshot({type:'jpeg',quality:72}));
  return {status:'view',dropped,actual,pano:id,offset:Math.round(length(s.position,actual)),dates:text.slice(0,9),choices};
}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{const p=await browser.newPage({viewport:{width:1080,height:650},locale:'en-US'});p.setDefaultTimeout(4500);
 for(const s of plan){
   const prev=ledger.find(x=>x.status==='view'&&length(x.position,s.position)<48&&Math.cos((x.heading-s.heading)*Math.PI/180)>.87);
   if(prev){ledger.push({...s,status:'shared',via:prev.id});save();continue;}
   let v;try{v=await inspect(p,s);}catch(e){v={status:'unavailable',notice:e.message.slice(0,220)};}
   ledger.push({...s,...v});save();console.log(s.id,v.status,v.offset??'',v.dates?.[0]??'');
   if(v.status==='access challenge')break;
   if(ledger.length===4&&ledger.every(i=>i.status==='view unavailable'||i.status==='unavailable'))break;
 }
 }finally{save();await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1});
