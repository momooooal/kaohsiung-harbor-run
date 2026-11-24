import {geography} from './geography.js';
import {nodes} from './route-model.js';
export function reportMap(route,data){
 if(!route?.published || route.status!=='verified' || route.kind!=='activity')return ()=>{};
 const host=document.createElement('section');host.className='wrap activity-guide';
 host.innerHTML='<header><div class="eyebrow">港灣踩線</div><h2></h2><p class="activity-meta"></p></header><p class="assembly"></p><div class="stop-list" aria-label="聚焦沿途地點"></div><div class="activity-map" aria-label="港灣踩線去回程圖"></div><p class="stop-detail" aria-live="polite"></p><h3>踩線當日的寄物與補給</h3><div class="activity-services"></div><a class="btn dark" href="#/explore">沿路線進入 3D 探索 ↗</a>';
 document.querySelector('.page-intro').after(host);
 host.querySelector('h2').textContent=route.name;
 host.querySelector('.activity-meta').textContent=route.activityDate+'　·　'+route.activityDistanceLabel;
 host.querySelector('.assembly').textContent=route.assembly;
 for(const [name,copy] of route.services){
   const card=document.createElement('article'),h=document.createElement('h4'),p=document.createElement('p');
   h.textContent=name;p.textContent=copy;card.append(h,p);host.querySelector('.activity-services').append(card);
 }
 const bounds=[[0,0],[436,650]],container=host.querySelector('.activity-map');
 const map=window.L && L.map(container,{crs:L.CRS.Simple,minZoom:-3,maxZoom:3,zoomSnap:.1,scrollWheelZoom:false});
 if(map)L.imageOverlay('assets/report-route.jpg',bounds,{alt:'哈瑪星經鹽埕、真愛碼頭至高流，沿大義返回的踩線原圖'}).addTo(map);
 else container.innerHTML='<img style="width:100%" src="assets/report-route.jpg" alt="港灣踩線去回程圖">';
 const detail=host.querySelector('.stop-detail'),list=host.querySelector('.stop-list');
 function choose(button,text){
   for(const other of list.children)other.setAttribute('aria-pressed',String(other===button));
   detail.textContent=text;
 }
 function addButton(name,action){
   const button=document.createElement('button');button.type='button';button.textContent=name;
   button.onclick=()=>action(button);list.append(button);return button;
 }
 const reset=addButton('全程',button=>{
   if(map){map.closePopup();map.fitBounds(bounds,{padding:[8,8],animate:false})}
   choose(button,'去程從哈瑪星跑向高流，回程沿大義輕軌返回。點選地點可放大查看。');
 });
 for(const node of nodes){
 const name=node.name,copy=route.stops.find(s=>s[0]===name)?.[1]||"依報告記錄的路線節點",[x,y]=node.report;
   const pos=[436-y,x],button=addButton(name,btn=>{
     choose(btn,name+'｜'+copy);
     if(map){map.setView(pos,Math.max(map.getBoundsZoom(bounds)+1,.3),{animate:false});marker.openPopup()}
   });
   const marker=map && L.circleMarker(pos,{radius:7,color:'#fff',weight:2,fillColor:'#0b665d',fillOpacity:1}).bindPopup(name).addTo(map);
   if(marker)marker.on('click',()=>choose(button,name+'｜'+copy));
 }
 reset.click();
 const clearGeo=geography(host,route,data);
 return ()=>{clearGeo();map?.remove()};
}
