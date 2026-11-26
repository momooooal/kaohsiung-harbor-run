// Run against the static preview or TEST_URL. This observes the meshes and
// camera passed to the real WebGL renderer; UI events drive all movement.
const {chromium}=require(require.resolve('playwright',{paths:[process.cwd()]})),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');

const base=process.env.TEST_URL||'http://localhost:8789/',out=process.env.TEST_OUT||'../repair-proof';
const modes=['run','walk','bike','wheelchair','cane'];
const delta=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
fs.mkdirSync(out,{recursive:true});
async function observe(p){
  await p.evaluate(()=>{
    if(window.testRendererInstalled)return;window.testRendererInstalled=true;
    const original=THREE.WebGLRenderer;
    THREE.WebGLRenderer=class extends original{
      constructor(...args){super(...args);const draw=this.render;
        this.render=function(scene,camera){const result=draw.call(this,scene,camera);
          const actors=scene.children.filter(o=>o.name.startsWith('route-avatar-'));
          if(actors.length){const a=actors[0];window.framePose={mode:a.name.slice(13),visible:a.visible,
            count:actors.length,pos:a.position.toArray(),yaw:a.rotation.y,cam:camera.position.toArray(),q:camera.quaternion.toArray(),bones:a.children.map(c=>c.quaternion.toArray()).flat(),draws:this.info.render.calls};}
          return result;};
      }
    };
  });
}
async function main(){
 const b=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'msedge'}),args:['--enable-unsafe-swiftshader']});
 try{for(const mobile of [process.env.TASK==='controls-mobile']){
  const kind=mobile?'mobile':'desktop',context=await b.newContext({viewport:mobile?{width:390,height:844}:{width:1120,height:790},isMobile:mobile,hasTouch:mobile});
  const p=await context.newPage(),errors=[];p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));
  const l=id=>p.locator('#preview-'+id),pose=()=>p.evaluate(()=>window.framePose);
  const img=async file=>{await l('stage').screenshot({path:path.join(out,file+'.jpg'),quality:88});};
  const start=async()=>{await l('start').click();await p.waitForFunction(()=>window.framePose&&document.querySelector('#preview-position')?.textContent.includes('%'),null,{timeout:80000});};
  const leave=async()=>{await p.evaluate(()=>{window.framePose=null;location.hash='/map';});await p.locator('#preview-controls').waitFor({state:'detached'});};
  const go=async id=>{await p.goto(base+'#/explore/run/'+id);await l('start').waitFor();await observe(p);await start();};
  let session; if(mobile)session=await context.newCDPSession(p);
  const touch=async (type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  const press=async()=>{
    if(mobile){const el=p.locator('[data-move="w"]');await el.scrollIntoViewIfNeeded();const bb=await el.boundingBox();await touch('touchStart',[{x:bb.x+bb.width/2,y:bb.y+bb.height/2,id:1}]);}
    else{await l('stage').focus();await p.keyboard.down('W');}
  };
  const release=async()=>{if(mobile)await touch('touchEnd',[]);else await p.keyboard.up('W');};
  await go('harbor-108');await p.waitForTimeout(900);await img(kind+'-station');
  await l('stop').selectOption({index:7});
  for(const mode of modes){
    await l('mode').selectOption(mode);
    for(const third of [false,true]){
      await l('stop').selectOption({index:7});
      if((await pose()).visible!==third)await l('camera').click();
      await p.waitForFunction(([m,v])=>framePose.mode===m&&framePose.visible===v&&framePose.count===1,[mode,third]);
      const first=await pose();await press();await p.waitForFunction(old=>Math.hypot(...framePose.pos.map((v,i)=>v-old[i]))>.15,first.pos,{timeout:9000});
      const moving=await pose();await l('stage').evaluate(e=>e.scrollIntoView({block:'center'}));await img(kind+'-'+mode+'-'+(third?'third':'first'));await release();await p.waitForTimeout(150);
      assert(delta(first.bones,moving.bones)>.005,kind+' animation '+mode);assert(moving.draws>10);
      const idle=await pose();await p.waitForTimeout(120);assert(delta(idle.pos,(await pose()).pos)<.002);

      if(mobile){
        await l('travel').selectOption({index:1});const right=p.locator('[data-move="d"]');await right.scrollIntoViewIfNeeded();
        const bb=await right.boundingBox();await touch('touchStart',[{x:bb.x+bb.width/2,y:bb.y+bb.height/2,id:1}]);await p.waitForTimeout(360);await release();
        assert(Math.abs((await pose()).yaw-idle.yaw)>.01);await l('travel').selectOption({index:0});
      }else{await l('travel').selectOption({index:1});await l('stage').focus();await p.keyboard.down('D');await p.waitForTimeout(350);await p.keyboard.up('D');assert(Math.abs((await pose()).yaw-idle.yaw)>.01);await l('travel').selectOption({index:0});}
      console.log(kind,mode,third?'third':'first','render, movement, stop, animation OK');
    }
  }
  await l('pause').click();const paused=await pose();await l('camera').click();await l('mode').selectOption('bike');
  await p.waitForFunction(()=>!framePose.visible&&framePose.mode==='bike');const edited=await pose();
  assert(delta(paused.pos,edited.pos)<.001);assert(delta(paused.cam,edited.cam)>.25);
  assert.equal(await l('pause').innerText(),'繼續');await l('pause').click();
  await l('stop').selectOption({index:6});await p.waitForTimeout(350);await img(kind+'-cafe');
  await l('stop').selectOption({index:8});await p.waitForTimeout(350);await img(kind+'-ferry');
  await l('stop').selectOption({index:7});await l('mode').selectOption('run');
  if(mobile){
    const w=p.locator('[data-move="w"]');await w.scrollIntoViewIfNeeded();const bb=await w.boundingBox(),sb=await l('stage').boundingBox();
    const finger={id:1,x:bb.x+bb.width/2,y:bb.y+bb.height/2},look={id:2,x:sb.x+sb.width*.5,y:sb.y+sb.height*.6};
    const a=await pose();await touch('touchStart',[finger]);await touch('touchStart',[finger,look]);
    await touch('touchMove',[finger,{...look,x:look.x+45}]);await p.waitForTimeout(400);
    const moving=await pose();assert(delta(a.pos,moving.pos)>.02);assert(delta(a.q,moving.q)>.03);
    await touch('touchCancel',[]);await p.waitForTimeout(180);const stopped=await pose();await p.waitForTimeout(200);assert(delta(stopped.pos,(await pose()).pos)<.001);
  }else{
    await press();await p.waitForTimeout(300);const a=await pose();await l('camera').click();await p.waitForTimeout(300);assert(delta(a.pos,(await pose()).pos)>.03);await release();
    await press();await p.keyboard.press('Escape');await release();assert.equal(await l('pause').innerText(),'繼續');await l('pause').click();
  }
  await p.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await l('pause').innerText(),'繼續');
  await p.evaluate(()=>{const gl=document.querySelector('#preview-stage canvas').getContext('webgl2')||document.querySelector('#preview-stage canvas').getContext('webgl');gl.getExtension('WEBGL_lose_context').loseContext();});
  await l('start').waitFor();assert(await l('stage').isHidden());await p.evaluate(()=>window.framePose=null);await start();assert.equal(await l('stage').locator('canvas').count(),2);
  await leave();await go('heart-5');await l('quality').selectOption('on');await l('stage').screenshot({path:path.join(out,kind+'-quality.jpg')});await leave();
  await p.goto(base+'#/explore/run/heart-5');await l('start').waitFor();await p.evaluate(()=>{
    const orig=HTMLCanvasElement.prototype.getContext;
    window.allowWebGL=()=>HTMLCanvasElement.prototype.getContext=orig;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:orig.call(this,type,...args);};
  });await l('start').click();await p.waitForFunction(()=>document.querySelector('#preview-start')?.textContent.includes('重試'));
  assert(await l('controls').isHidden());await p.evaluate(()=>window.allowWebGL());await start();await leave();
  console.log(kind,'state retention, retry, re-entry OK');assert.deepEqual(errors,[]);
  await context.close();
 }}finally{await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
