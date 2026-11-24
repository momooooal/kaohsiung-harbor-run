let enginePromise;
function engine(){if(window.THREE)return Promise.resolve();if(!enginePromise)enginePromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/three.min.js';s.onload=resolve;s.onerror=()=>{s.remove();enginePromise=null;reject(new Error('3D 引擎載入失敗，請確認連線後重試'))};document.head.append(s)});return enginePromise}
export function startExperience(short){
 const stage=document.querySelector('#game-stage'),shell=stage.closest('.game-shell'),state=document.querySelector('#game-state');let dead=false,cleanup=()=>{};
 const controls=[...shell.querySelectorAll('button,select')];controls.forEach(e=>e.disabled=true);
 const panel=document.createElement('div');panel.className='start-panel';const msg=document.createElement('p');msg.textContent='按開始後才載入 3D。場景比例與通行空間為示意。';const start=document.createElement('button');start.className='btn dark';start.textContent='開始體驗';const links=document.createElement('p');links.innerHTML='<a href="#/map">回地圖</a> · <a href="#/routes/bay">文字導覽</a>';panel.append(msg,start,links);stage.append(panel);
 const fail=error=>{if(dead)return;shell.querySelectorAll('button,select').forEach(e=>e.disabled=true);shell.querySelectorAll('#travel,#destination').forEach(e=>e.disabled=true);panel.hidden=false;state.textContent='3D 暫時無法使用';msg.textContent=error.message||String(error);start.disabled=false;start.textContent='重試體驗';document.querySelector('#game-hint').textContent='可重試，或改看地圖與文字導覽。';};
 start.onclick=async()=>{cleanup();stage.querySelector('canvas')?.remove();shell.querySelector('.ride-toolbar')?.remove();document.querySelectorAll('.ride-guide,.ride-actions').forEach(e=>e.remove());start.disabled=true;msg.textContent='正在載入引擎與場景程式…';state.textContent='載入中';try{await engine();const {ride}=await import('./report.js');if(dead)return;controls.forEach(e=>e.disabled=false);cleanup=ride(short,fail);panel.hidden=true;state.textContent='已開始，點選場景操作';}catch(e){fail(e)}};
 return ()=>{dead=true;cleanup()};
}
