import panoramas from '../data/walking-panoramas.js';

export function panoramaDialog(){
  const dialog=document.createElement('dialog');dialog.className='section-card';
  dialog.style.cssText='width:min(94vw,960px);max-width:94vw;padding:14px';
  dialog.innerHTML='<header><strong></strong> <button type="button" autofocus>返回步行</button></header><iframe title="Google 街景實景" allowfullscreen referrerpolicy="no-referrer-when-downgrade" style="width:100%;height:65vh;border:0;margin-top:10px"></iframe>';
  const frame=dialog.querySelector('iframe');
  dialog.querySelector('button').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>frame.removeAttribute('src'));
  return {dialog,available:name=>Boolean(panoramas[name]),open(name){
    if(!panoramas[name])return;
    dialog.querySelector('strong').textContent=name+'附近實景';
    frame.src=panoramas[name];dialog.showModal();
  }};
}
