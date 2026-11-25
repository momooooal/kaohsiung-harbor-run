import { sharedRoute, stops } from '../data/shared-route.js';

export function walkingGuide(visit, available, begin) {
  const guide = document.createElement('details');
  guide.className = 'section-card';
  guide.innerHTML = '<summary>從台塑王氏昆仲公園走到哈瑪星｜沿途景點與街景</summary><p>依分享的步行行程，路人咖啡五號店會經過兩次。連續 3D 依這十站重算步行路網。沿金色線前進。道路與建物輪廓取自開放圖資，山景依高程建模。店面外觀、樓高與陳設為示意。Google 地圖的選路可能不同。</p><label>沿途停靠點 <select></select></label><p aria-live="polite"></p><div class="bay-actions"></div>';
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
    const run=document.createElement('button');run.type='button';run.className='btn dark';run.textContent=i===9?'查看連續路線終點':'從本站開始連續 3D';run.onclick=()=>begin(i);actions.append(run);
    external('開啟本站附近街景','https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+lat+','+lon);
    external('查看整條步行路線',sharedRoute);
    if(available.has(key)){
      const button=document.createElement('button');button.type='button';button.className='btn dark';button.textContent='探索本站 3D 場景';
      button.onclick=()=>visit(key);actions.append(button);
    }
  }
  const credit=document.createElement("a");credit.href="https://www.openstreetmap.org/copyright";credit.textContent="© OpenStreetMap 貢獻者 · ODbL";const sources=document.createElement("a");sources.href="https://github.com/momooooal/kaohsiung-harbor-run/blob/main/DATA-SOURCES.md";sources.textContent="Shi 等人／Overture 建物、Mapzen 地形及授權";sources.target="_blank";sources.rel="noopener";guide.append(credit," · ",sources);menu.onchange=show;show();return guide;
}
