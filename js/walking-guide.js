import { sharedRoute, stops } from '../data/shared-route.js';

export function walkingGuide(visit, available) {
  const guide = document.createElement('details');
  guide.className = 'section-card';
  guide.innerHTML = '<summary>從台塑王氏昆仲公園走到哈瑪星｜沿途景點與街景</summary><p>依分享的步行行程，路人咖啡五號店會經過兩次。選一站看前後順序，或開啟整條路線查看實際轉彎。</p><label>沿途停靠點 <select></select></label><p aria-live="polite"></p><div class="bay-actions"></div>';
  const menu = guide.querySelector('select'), detail = guide.querySelector('[aria-live]'), actions = guide.querySelector('.bay-actions');
  stops.forEach(([name], i) => menu.add(new Option((i+1)+'．'+name, i)));
  function external(label,url) {
    const link = document.createElement('a');
    link.className='btn outline';link.textContent=label;link.href=url;link.target='_blank';link.rel='noopener';
    actions.append(link);
  }
  function show() {
    const i=menu.selectedIndex,[name,lat,lon,key]=stops[i];
    detail.textContent=[i ? '上一站：'+stops[i-1][0] : '起點', name, i+1<stops.length ? '下一站：'+stops[i+1][0] : '終點'].join('　→　');
    actions.replaceChildren();
    external('開啟本站附近街景','https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+lat+','+lon);
    external('查看整條步行路線',sharedRoute);
    if(available.has(key)){
      const button=document.createElement('button');button.type='button';button.className='btn dark';button.textContent='探索本站 3D 場景';
      button.onclick=()=>visit(key);actions.append(button);
    }
  }
  menu.onchange=show;show();return guide;
}
