// Official Maps JavaScript API only; no tile proxy, directions recomputation or fallback basemap.
let loading;
export async function loadGoogleMaps(){
 const response=await fetch(new URL('../data/google-maps-config.json',import.meta.url));
 if(!response.ok)throw Error('configuration');
 const config=await response.json();
 if(!config.apiKey||!config.mapId)throw Error('configuration');
 if(!loading)loading=new Promise((resolve,reject)=>{
  if(window.google?.maps?.importLibrary){resolve();return;}
  const script=document.createElement('script');let settled=false;
  const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timer);if(error){script.remove();loading=null;reject(Error('unavailable'));}else resolve();};
  const timer=setTimeout(()=>finish(true),15000);
  window.__runGoogleReady=()=>finish(false);window.gm_authFailure=()=>{finish(true);window.dispatchEvent(new Event('run-map-error'));};
  const params=new URLSearchParams({key:config.apiKey,v:'weekly',loading:'async',callback:'__runGoogleReady',language:'zh-TW',region:'TW'});
  script.src='https://maps.googleapis.com/maps/api/js?'+params;script.async=true;script.onerror=()=>finish(true);document.head.append(script);
 });
 await loading;await Promise.all([google.maps.importLibrary('maps'),google.maps.importLibrary('marker')]);return config;
}
export async function createRouteMap(element,route,pois,onSelect){
 const config=await loadGoogleMaps(),gm=google.maps;
 const map=new gm.Map(element,{mapId:config.mapId,center:{lat:22.62,lng:120.3},zoom:14,gestureHandling:'cooperative',streetViewControl:false,mapTypeControl:false});
 let markers=[],lines=[],disposed=false,position;
 const coordinates=p=>p?.coordinates&&({lat:p.coordinates[0],lng:p.coordinates[1]});
 const info=new gm.InfoWindow();
 for(const segment of route.geometry||[])lines.push(new gm.Polyline({map,path:segment.coordinates.map(([lat,lng])=>({lat,lng})),strokeColor:segment.direction==='return'?'#c66936':'#187f79',strokeOpacity:.8,strokeWeight:4,icons:[{icon:{path:gm.SymbolPath.FORWARD_OPEN_ARROW},offset:'50%',repeat:'120px'}]}));
 const bounds=new gm.LatLngBounds();for(const segment of route.geometry||[])for(const [lat,lng]of segment.coordinates)bounds.extend({lat,lng});for(const id of route.stopIds){const point=coordinates(pois.get(id));if(point)bounds.extend(point);}if(!bounds.isEmpty())map.fitBounds(bounds,35);
 return {
  update(ids){if(disposed)return;markers.forEach(m=>m.map=null);markers=[];info.close();for(const id of new Set(ids)){const p=pois.get(id),point=coordinates(p);if(!point)continue;const n=route.stopIds.indexOf(id);const start=id===route.stopIds[0],end=id===route.stopIds.at(-1);const pin=new gm.marker.PinElement({background:start?'#176e66':end?'#bc6231':'#0b3451',glyphText:start?'起':end?'迄':n>=0?String(n+1):'＋',glyphColor:'white',borderColor:'white'});const m=new gm.marker.AdvancedMarkerElement({map,position:point,title:p.name,content:pin.element});m.addListener('click',()=>{onSelect(id);});markers.push(m);}},
  focus(id){const p=pois.get(id),point=coordinates(p);if(!point)return;map.panTo(point);map.setZoom(16);const label=document.createElement('strong');label.textContent=p.name;info.setContent(label);info.setPosition(point);info.open({map});},
  locate(lat,lng){position?.map&&(position.map=null);position=new gm.marker.AdvancedMarkerElement({map,position:{lat,lng},title:'我的位置'});map.panTo({lat,lng});map.setZoom(15);},
  destroy(){disposed=true;markers.forEach(m=>m.map=null);lines.forEach(l=>l.setMap(null));if(position)position.map=null;info.close();gm.event.clearInstanceListeners(map);}
 };
}
