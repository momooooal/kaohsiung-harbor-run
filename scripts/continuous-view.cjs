// Open public panoramas in the normal Maps UI and walk through its connected
// arrows. Record geographic movement and the image-capture footer at each step.
const {chromium}=require('playwright'),fs=require('node:fs');
const route=process.env.ROUTE,rows=require('./unresolved-views.json').filter(v=>v.route===route);
const folder='moves';fs.mkdirSync(folder,{recursive:true});
const crypto=require('node:crypto'),key=crypto.randomBytes(32);fs.writeFileSync(folder+'/viewer-key.bin',crypto.publicEncrypt(fs.readFileSync('scripts/review-public.pem'),key));
async function sampleView(p,id){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const bytes=Buffer.concat([cipher.update(await p.screenshot({type:'jpeg',quality:65})),cipher.final()]);fs.writeFileSync(folder+'/'+id+'.bin',Buffer.concat([iv,cipher.getAuthTag(),bytes]));}
const distance=(a,b)=>Math.hypot((a[1]-b[1])*102820,(a[0]-b[0])*110750);
async function state(p){
 const m=p.url().match(/@([-\d.]+),([-\d.]+),[\d.]+a/),id=p.url().match(/!1s([^!]+)/)?.[1];
 const content=await p.locator('body').innerText();
 const date=content.match(/(?:Image capture|Imagery date)\s*:\s*([a-z]+\s+20\d\d)/i)?.[1]||content.match(/圖像拍攝日期[：:]\s*(20\d\d年\d+月)/)?.[1];
 const header=content.match(/20\d\d年\d+月|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* 20\d\d/i)?.[0];
 return m&&id&&(date||header)?{id,position:[+m[1],+m[2]],date:date||header}:null;
}
(async()=>{
 const b=await chromium.launch({headless:false,executablePath:'/usr/bin/google-chrome',args:['--enable-unsafe-swiftshader']});
 try{
 const p=await b.newPage({viewport:{width:1060,height:680},locale:'zh-TW'});p.setDefaultTimeout(5500);
 const log=[];for(const seed of rows){
  const sample={seed:seed.id,steps:[]};log.push(sample);
  try{
    const point=seed.position;
    const bearing=seed.heading;
    await p.goto('https://www.google.com/maps/@'+point.join(',')+',20z?hl=zh-TW',{waitUntil:'domcontentloaded',timeout:22000});
    const reject=p.getByRole('button',{name:/Reject all|全部拒絕/}).first();if(await reject.isVisible())await reject.click();
    const man=p.getByRole('button',{name:/Browse Street View images|瀏覽街景服務圖像|瀏覽街景服務圖片|小黃人|Pegman/i}).first();
    await man.waitFor({timeout:10000});const bb=await man.boundingBox();
    await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(530,340,{steps:24});await p.waitForTimeout(1100);await p.mouse.up();await p.waitForTimeout(3300);
    let first=await state(p);sample.pegman=!!first&&distance(first.position,point)<=75;
    if(!first||distance(first.position,point)>75){
      const deep=new URL(seed.url);deep.searchParams.set('hl','zh-TW');
      await p.goto(deep.toString(),{waitUntil:'domcontentloaded'});await p.waitForTimeout(4500);first=await state(p);
    }
    if(!first||distance(first.position,point)>75){sample.note=(await p.locator('body').innerText()).slice(0,450);continue;}
    const m=p.url().match(/,([-\d.]+)h/);
    if(m&&Math.abs((Number(m[1])-bearing+540)%360-180)>12){
      const facing=p.url().replace(/,[-\d.]+h/,','+bearing+'h');
      await p.goto(facing,{waitUntil:'domcontentloaded'});await p.waitForTimeout(2400);
      const corrected=await state(p);if(corrected&&distance(corrected.position,first.position)<30)first=corrected;
    }
    if(rows.indexOf(seed)%3===0)await sampleView(p,seed.id);
    sample.steps.push(first);sample.offset=Math.round(distance(first.position,point));
    // Panoramas from a continuous Google capture support the forward key.
    // A standalone contributed image may have no connection.
    const canvas=p.locator('canvas').last();await canvas.click({position:{x:519,y:313},timeout:2500}).catch(()=>{});
    let last=first;
    for(let i=0;i<12;i++){
      await p.keyboard.press('ArrowUp');await p.waitForTimeout(800);
      let next=await state(p);
      if(!next||next.id===last.id){
        await p.mouse.dblclick(530,408);await p.waitForTimeout(1050);next=await state(p);
      }
      if(!next||next.id===last.id)break;
      const step=distance(last.position,next.position);if(step<.6||step>65)break;
      sample.steps.push(next);last=next;
    }
  }catch(e){sample.note=e.message.split('\n')[0];}
  finally{fs.writeFileSync(folder+'/'+route+'.json',JSON.stringify(log,null,1));console.log(seed.id,sample.steps.length);}
 }}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
