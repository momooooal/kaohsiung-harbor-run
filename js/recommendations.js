import {createRouteMap} from './leaflet-route-map.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const routeLink=id=>'#/run/'+encodeURIComponent(id);
export function mapsUrl(poi,directions=false){
 if(!directions)return poi.mapPlaces?.find(place=>place.infoUrl)?.infoUrl||null;
 const destination=poi.arrival?.coordinates||poi.coordinates||(poi.addressVerified?poi.address:null);
 if(!destination)return null;
 const params=new URLSearchParams({api:'1',destination:String(destination),travelmode:'walking'});
 return 'https://www.google.com/maps/dir/?'+params;
}
function placeActions(p){
 const places=p.mapPlaces||[];
 return places.map(place=>{
   const label=places.length>1?'<strong>'+esc(place.name)+'</strong>':'';
   if(!place.infoUrl)return label?'<div class="place-actions">'+label+'</div>':'';
   return '<div class="place-actions">'+label+external(place.infoUrl,'查看地點資訊')+external(mapsUrl(place,true),'導航前往')+'</div>';
 }).join('')+(p.exits?'<details><summary>各出口位置</summary>'+p.exits.map(e=>external(mapsUrl({coordinates:e.coordinates},true),e.number+' 號出口')).join('')+'</details>':'');
}
export const serviceKnown=s=>s.existenceVerified===true||s.status==='verified';
export const serviceNeedsInquiry=s=>s.runnerAccessConfirmed!==true && s.type!=='transit';
export const openingHours=(p,res)=>p.googleHours?.text||res?.display?.hours||p.venueHours||'未列固定時段，請查看地點資訊';
const external=(url,label)=>url?`<a class="btn outline" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
export function groupResources(data,route){
 const groups=new Map();for(const item of data.resources){if(!route.stopIds.includes(item.poiId)&&!item.nearPoiIds?.some(id=>route.stopIds.includes(id))&&!(route.variantId==='harbor-108'&&['gym','qianjin'].includes(item.poiId)))continue;
 const id=item.canonicalPoiId||item.poiId;if(!groups.has(id))groups.set(id,{...item,poiId:id,services:[],records:[]});const g=groups.get(id);g.records.push(item);for(const service of item.services){const prior=g.services.find(s=>s.type===service.type);if(!prior)g.services.push(service);else if(serviceKnown(service)&&!serviceKnown(prior))g.services[g.services.indexOf(prior)]=service;}}
 return [...groups.values()];
}
export function recommendationsPage(){return '<section id="run-app" class="wrap run-app" aria-busy="true"><p role="status">正在載入路線…</p></section>';}
export function mountRecommendations(id,initialResources=false){
 const host=document.getElementById('run-app');let stopped=false,map=null,selected=null,filter=initialResources?'toilet':'all',mapAttempt=0;const abort=new AbortController();
 const dispose=()=>{stopped=true;mapAttempt++;map?.destroy();abort.abort();};
 (async()=>{
 const response=await fetch(new URL('../data/recommendations.json?v=services-20261127',import.meta.url),{signal:abort.signal});if(!response.ok)throw Error();const d=await response.json();if(stopped)return;
 const pois=new Map(d.pois.map(p=>[p.poiId,p.stationCoordinates?{...p,coordinates:p.stationCoordinates}:p])),r=d.routes.find(r=>r.variantId===id),label=p=>pois.get(p)?.name||p;
 const featured=['harbor-108','central-52','heart-5'];
 const routeCard=route=>`<article class="run-route-card"><img alt="" loading="lazy" src="${route.variantId==='harbor-108'?'assets/kaohsiung-pier.jpg':'assets/routes/photo-'+route.variantId+'.jpg'}"><div><h2>${esc(route.name)}</h2><p>${esc(route.display.description)}</p><a class="btn dark" href="${routeLink(route.variantId)}" aria-label="看路線：${esc(route.name)}">看路線</a></div></article>`;
 if(!r){document.title='友善地圖｜跑出你的高雄';host.innerHTML=`<div class="run-heading"><p class="breadcrumbs"><a href="#/">首頁</a> / 友善地圖</p><h1>友善地圖</h1><p>選一條喜歡的路線，準備出發。</p></div>${id?'<p role="status">找不到這條路線，請重新選擇。</p>':''}<div class="route-picks">${featured.map(id=>routeCard(d.routes.find(r=>r.variantId===id))).join('')}</div>`;host.removeAttribute('aria-busy');return;}
 document.title=r.name+'｜跑出你的高雄';const card=d.cards.find(c=>c.id===r.cardId),resources=groupResources(d,r),byResource=new Map(resources.map(x=>[x.poiId,x]));
 const turn=r.turnaroundIds?.[0],turnIndex=turn?r.stopIds.indexOf(turn):-1;
 const labelTarget=h=>{
   const [x,y,w,height]=h.labelBox;
   return `<button class="card-label-target" tabindex="-1" aria-label="查看${esc(label(h.poiId))}" data-poi="${esc(h.poiId)}" style="left:${100*x/card.width}%;top:${100*y/card.height}%;width:${100*w/card.width}%;height:${100*height/card.height}%"></button>`;
 };
 const stopList=ids=>`<ol class="run-stops">${ids.map((pid,i)=>`<li><button data-poi="${esc(pid)}"><span>${i+1}</span>${esc(label(pid))}</button></li>`).join('')}</ol>`;

 host.innerHTML=`<div class="run-heading"><p class="breadcrumbs"><a href="#/map">友善地圖</a> / ${esc(r.name)}</p><h1>${esc(r.name)}</h1><p class="run-journey"><strong>${esc(r.display.distance)}</strong> · ${esc(r.display.journey)}</p><p>${esc(r.display.description)}</p><div class="run-actions">${external(mapsUrl(pois.get(r.stopIds[0]),true),'前往起點')}<a class="btn outline" href="#/explore/run/${r.variantId}">3D 探索</a><button class="btn dark" id="run-share-open">分享</button></div></div>
 <div class="run-switch"><label for="run-selector">換一條路線</label><select id="run-selector">${d.routes.map(a=>`<option value="${esc(a.variantId)}" ${a===r?'selected':''}>${esc(a.name)}</option>`).join('')}</select></div>
 <div class="run-map-tools"><div class="run-filters" aria-label="資源篩選">${['all','toilet','water'].map(t=>`<button data-filter="${t}" aria-pressed="${t===filter}">${t==='all'?'全部':d.serviceTypes[t]}</button>`).join('')}<details><summary>更多</summary><div>${['storage','shower','changing','transit'].map(t=>`<button data-filter="${t}" aria-pressed="false">${esc(d.serviceTypes[t])}</button>`).join('')}</div></details></div><button class="btn outline" id="run-list-toggle" aria-pressed="false">查看清單</button></div>
 <div class="run-workspace"><section class="run-map-column" aria-label="路線地圖"><div class="run-view-tabs" aria-label="地圖顯示方式"><button data-view="card" aria-pressed="true" aria-controls="run-card-panel">路線圖卡</button><button data-view="geo" aria-pressed="false" aria-controls="run-geo-panel">地理地圖</button></div><section id="run-card-panel" aria-label="路線圖卡"><label for="card-zoom">縮放圖片</label><input id="card-zoom" type="range" min="100" max="300" step="25" value="100"><div class="run-image-scroll"><div id="run-image-wrap" class="run-image-wrap ${card.width?'harbor-card':''}"><img loading="eager" width="${card.width||8000}" height="${card.height||4503}" src="${esc(card.asset.replace(/\.png$/,'.webp'))}" alt="${esc(r.name)}，${esc(r.display.distance)}路線圖卡">${card.hotspots.map((h,i)=>`<button class="run-hotspot" style="left:${h.x}%;top:${h.y}%" data-poi="${esc(h.poiId)}" aria-label="查看${esc(label(h.poiId))}">${h.labelBox?'':esc(h.label??i+1)}</button>${h.labelBox?labelTarget(h):''}`).join('')}</div></div><p class="small">高雄市政府運動發展局 · <a href="${esc(card.asset)}" target="_blank" rel="noopener">開啟原尺寸圖片</a></p></section><section id="run-geo-panel" aria-label="地理地圖" hidden><div id="run-map" class="run-map"><p role="status">正在載入地圖…</p></div><div id="run-map-failure" class="run-map-failure" hidden><p role="status">地圖暫時無法載入</p><div class="run-actions"><button id="run-retry" class="btn dark">重試</button>${external(mapsUrl(pois.get(r.stopIds[0])),'在 Google Maps 開啟')}</div></div><div class="run-map-foot"><small>${esc(r.mapNote||'部分路段仍在確認，請依現場指示通行。')}</small><button id="run-locate" class="btn outline">我的位置</button></div><p id="run-message" role="status" aria-live="polite"></p></section></section><section id="run-list" class="run-list-column"><h2>沿途資源</h2><p class="small">點選地點查看時間與使用條件。</p><div id="run-resources"></div></section></div>
 <section class="run-directions"><h2>沿途經過</h2>${r.type==='單程'?stopList(r.stopIds):turnIndex>0?`<h3>去程</h3>${stopList(r.stopIds.slice(0,turnIndex+1))}<h3>回程</h3>${stopList(r.stopIds.slice(turnIndex))}`:stopList(r.stopIds)}${r.type!=='單程'?`<p>${esc(r.variantId==='central-52'?'回程走中華三路、五福三路、中山二路，再由新光路返回總館。':r.variantId==='harbor-5'?'折返後沿海邊路，由新光路返回總館。':r.variantId==='heart-5'?'願景橋折返，沿河回愛河之心，再返回凹子底。':'折返後返回高雄橋，沿海邊路、新光路回總館。')}</p>`:''}</section>
 <section class="run-extras"><details><summary>交通資訊</summary><p>${r.variantId==="heart-5"?"搭捷運至凹子底站，沿博愛二路往愛河之心。":r.variantId==="harbor-108"?"搭捷運至獅甲站出發，終點哈瑪星可轉搭捷運或輕軌。":"搭輕軌至高雄展覽館站，由新光路步行前往市立圖書館總館。"}</p>${external(mapsUrl(pois.get(r.stopIds[0]),true),'前往起點')}</details></section>
 <dialog id="run-share-dialog" class="run-dialog"><h2>分享${esc(r.name)}</h2><div class="run-actions"><button id="run-share" class="btn dark">分享路線</button><button id="run-copy" class="btn outline">複製連結</button><button id="run-qr-button" class="btn outline" aria-expanded="false">顯示 QR Code</button></div><div id="run-qr" hidden><img width="220" height="220" src="assets/routes/share-${esc(r.variantId)}.svg" alt="${esc(r.name)}分享 QR Code"></div><p id="run-share-message" role="status"></p><button class="btn outline" data-close="run-share-dialog">關閉</button></dialog>
 <dialog id="run-resource-dialog" class="run-resource-dialog"><div class="run-sheet-handle" aria-hidden="true"></div><button class="btn outline run-sheet-close" data-close="run-resource-dialog">收起</button><div id="run-selection"></div></dialog>`;
 host.removeAttribute('aria-busy');
 const message=t=>host.querySelector('#run-message').textContent=t;
 const filtered=()=>resources.filter(p=>filter==='all'||p.services.some(s=>s.type===filter));
 const displayHours=openingHours;
 const serviceLabel=s=>esc(d.serviceTypes[s.type])+(serviceNeedsInquiry(s)?'（使用條件待確認）':'');
 function selectPoi(pid){const p=pois.get(pid);if(!p)return;selected=pid;const resource=byResource.get(pid)||resources.find(x=>x.records.some(y=>y.poiId===pid));const copy=resource?.display;
 host.querySelector('#run-selection').innerHTML=`<h2>${esc(p.name)}</h2>${resource?`<p class="run-service-types">${resource.services.map(serviceLabel).join(' · ')}</p>`:''}<p>${esc(copy?.entrance||p.address)}</p><dl><dt>開放時間</dt><dd>${esc(displayHours(p,resource))}</dd><dt>費用與條件</dt><dd>${esc(copy?.fee||'費用未公布，使用前請先詢問。')} ${esc(copy?.condition||'依現場開放情形前往。')}</dd></dl>${resource?.services?.some(s=>s.runnerAccessConfirmed)?`<ul class="run-service-details">${resource.services.filter(s=>s.runnerAccessConfirmed).map(s=>`<li><strong>${esc(d.serviceTypes[s.type])}</strong>：${esc(s.fee)}${s.restrictions?'；'+esc(s.restrictions):''}</li>`).join('')}</ul>`:''}${(resource?.serviceLinks||[]).map(link=>external(link.url,link.label)).join('')}${placeActions(p)}${p.phone?`<a class="btn outline" href="tel:${esc(p.phone)}">電話詢問</a>`:''}`;
 host.querySelectorAll('.run-resource').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.poi===(resource?.poiId||pid))));map?.focus(pid);host.querySelector('#run-resource-dialog').showModal();}
 function draw(){const list=filtered();host.querySelectorAll('[data-filter]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.filter===filter)));host.querySelector('#run-resources').innerHTML=list.length?list.map(x=>{const p=pois.get(x.poiId);return `<button class="run-resource" data-poi="${esc(x.poiId)}" aria-pressed="${selected===x.poiId}"><strong>${esc(p.name)}</strong><span>${x.services.map(s=>esc(d.serviceTypes[s.type])).join(' · ')}</span><small>${esc(p.venueHours||x.display?.condition||'使用前請先詢問')}</small></button>`}).join(''):'<p class="empty-box">這條路線目前沒有此類資源紀錄。可切換其他條件。</p>';map?.update([...(filter==='all'?r.stopIds:[]),...list.map(x=>x.poiId)]);}
 async function initMap(){const attempt=++mapAttempt;host.querySelector('#run-map-failure').hidden=true;host.querySelector('#run-map').hidden=false;host.querySelector('#run-map').innerHTML='<p role="status">正在載入地圖…</p>';try{map?.destroy();const instance=await createRouteMap(host.querySelector('#run-map'),r,pois,selectPoi);if(stopped||attempt!==mapAttempt){instance.destroy();return;}map=instance;draw();}catch{if(stopped||attempt!==mapAttempt)return;host.querySelector('#run-map').hidden=true;host.querySelector('#run-map-failure').hidden=false;}}
 draw();host.querySelector('#run-retry').onclick=initMap;
 host.addEventListener('click',e=>{const view=e.target.closest('[data-view]');if(view){const geo=view.dataset.view==='geo';host.querySelector('#run-card-panel').hidden=geo;host.querySelector('#run-geo-panel').hidden=!geo;host.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===view)));if(geo){if(map)map.resize();else initMap();}}const poi=e.target.closest('[data-poi]');if(poi)selectPoi(poi.dataset.poi);const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;selected=null;draw();}const close=e.target.closest('[data-close]');if(close)host.querySelector('#'+close.dataset.close).close();});
 host.querySelector('#run-selector').onchange=e=>location.hash=routeLink(e.target.value);
 host.querySelector('#card-zoom').oninput=e=>host.querySelector('#run-image-wrap').style.width=e.target.value+'%';
 host.querySelector('#run-list-toggle').onclick=e=>{const on=host.classList.toggle('run-list-only');e.target.textContent=on?'查看地圖':'查看清單';e.target.setAttribute('aria-pressed',String(on));if(!on)map?.resize();};
 const share=host.querySelector('#run-share-dialog');host.querySelector('#run-share-open').onclick=()=>share.showModal();const canonical='https://momooooal.github.io/kaohsiung-harbor-run/'+routeLink(r.variantId);const shareMsg=t=>host.querySelector('#run-share-message').textContent=t;
 host.querySelector('#run-copy').onclick=async()=>{try{await navigator.clipboard.writeText(canonical);shareMsg('已複製連結。')}catch{shareMsg(canonical)}};
 host.querySelector('#run-share').onclick=async()=>{try{if(navigator.share)await navigator.share({title:r.name,text:r.name+' · '+r.display.distance,url:canonical});else{await navigator.clipboard.writeText(canonical);shareMsg('已複製連結。')}}catch(e){shareMsg(e.name==='AbortError'?'已取消分享。':'請使用複製連結。')}};
 host.querySelector('#run-qr-button').onclick=e=>{const qr=host.querySelector('#run-qr');qr.hidden=!qr.hidden;e.target.setAttribute('aria-expanded',String(!qr.hidden));};
 host.querySelector('#run-locate').onclick=()=>{if(!navigator.geolocation){message('無法取得位置，仍可使用資源清單。');return;}message('正在取得位置…');navigator.geolocation.getCurrentPosition(p=>{if(stopped)return;if(map){map.locate(p.coords.latitude,p.coords.longitude);message('已顯示位置。')}else message('已取得位置，地圖恢復後可再試一次。不會儲存或上傳位置。');},e=>{if(!stopped)message(e.code===1?'定位未獲允許，仍可查看路線與清單。':'暫時無法取得位置，請稍後再試。');},{timeout:10000,maximumAge:0});};
 })().catch(e=>{if(!stopped&&e.name!=='AbortError'){host.innerHTML='<p role="alert">路線暫時無法載入，請重新整理再試。</p>';host.removeAttribute('aria-busy');}});return dispose;
}
