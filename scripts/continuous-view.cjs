// Open public panoramas in the normal Maps UI and walk through its connected
// arrows. Record geographic movement and the image-capture footer at each step.
const {chromium}=require('playwright'),fs=require('node:fs');
const route=process.env.ROUTE,rows=require('./sequence-points.json').filter(v=>v.route===route);
const folder='moves';fs.mkdirSync(folder,{recursive:true});
const distance=(a,b)=>Math.hypot((a[1]-b[1])*102820,(a[0]-b[0])*110750);
async function state(p){
 const m=p.url().match(/@([-\d.]+),([-\d.]+),[\d.]+a/),id=p.url().match(/!1s([^!]+)/)?.[1];
 const content=await p.locator('body').innerText();
 const date=content.match(/(?:Image capture|Imagery date)\s*:\s*([a-z]+\s+20\d\d)/i)?.[1]||content.match(/圖像拍攝日期[：:]\s*(20\d\d年\d+月)/)?.[1];
 return m&&id&&date?{id,position:[+m[1],+m[2]],date}:null;
}
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--enable-unsafe-swiftshader']});
 try{
 const p=await b.newPage({viewport:{width:1060,height:680},locale:'en-US'});p.setDefaultTimeout(5500);
 const log=[];for(const seed of rows){
  const sample={seed:seed.id,steps:[]};log.push(sample);
  try{
    await p.goto(seed.url,{waitUntil:'domcontentloaded',timeout:22000});
    const reject=p.getByRole('button',{name:/Reject all/}).first();if(await reject.isVisible())await reject.click();
    await p.waitForFunction(()=>/Image capture|Imagery date|圖像拍攝日期/.test(document.body.innerText),null,{timeout:11500});
    const first=await state(p);if(!first)continue;
    const expected=seed.url.match(/@([-\d.]+),([-\d.]+),/);if(expected&&distance(first.position,expected.slice(1).map(Number))>50)continue;
    sample.steps.push(first);
    // Panoramas from a continuous Google capture support the forward key.
    // A standalone contributed image may have no connection.
    const canvas=p.locator('canvas').last();await canvas.click({position:{x:519,y:313},timeout:2500}).catch(()=>{});
    let last=first;
    for(let i=0;i<7;i++){
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
