// Create only when the visitor selects the geographic view. No tile prefetch.
export async function createRouteMap(element,route,pois,onSelect){
 const L=window.L;if(!L)throw Error('map unavailable');element.replaceChildren();
 const map=L.map(element,{scrollWheelZoom:false}),markers=L.layerGroup().addTo(map);
 const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);
 let position,disposed=false;const bounds=L.latLngBounds([]);
 for(const segment of route.geometry||[]){L.polyline(segment.coordinates,{color:segment.direction==='return'?'#c66936':'#187f79',weight:4,opacity:.85}).addTo(map);segment.coordinates.forEach(p=>bounds.extend(p));}
 for(const id of route.stopIds){const p=pois.get(id);if(p?.coordinates)bounds.extend(p.coordinates);}
 const resize=()=>{if(disposed)return;map.invalidateSize();if(bounds.isValid())map.fitBounds(bounds,{padding:[30,30]});else map.setView([22.62,120.3],13);};resize();
 const notice=document.createElement('p');notice.className='run-tile-notice';notice.hidden=true;notice.textContent='地圖暫時無法載入 ';const retry=document.createElement('button');retry.className='btn outline';retry.textContent='重試';retry.onclick=()=>tiles.redraw();notice.append(retry); element.after(notice);
 tiles.on('tileerror',()=>notice.hidden=false);tiles.on('tileload',()=>notice.hidden=true);
 return {
  update(ids){markers.clearLayers();for(const id of new Set(ids)){const p=pois.get(id);if(!p?.coordinates)continue;const n=route.stopIds.indexOf(id),start=id===route.stopIds[0],end=id===route.stopIds.at(-1);const glyph=start&&end?'起迄':start?'起':end?'迄':n>=0?String(n+1):'＋';const marker=L.marker(p.coordinates,{title:p.name,alt:p.name,zIndexOffset:start||end?1000:0,riseOnHover:true,icon:L.divIcon({className:'run-map-pin',html:`<span>${glyph}</span>`,iconSize:[36,36],iconAnchor:[18,18]})}).addTo(markers);marker.on('click',()=>onSelect(id));}},
  focus(id){const p=pois.get(id);if(!p?.coordinates)return;map.setView(p.coordinates,16);},
  locate(lat,lng){if(position)position.remove();position=L.circleMarker([lat,lng],{radius:9,color:'#fff',fillColor:'#2477c9',fillOpacity:1}).addTo(map).bindTooltip('我的位置');map.setView([lat,lng],15);},
  resize,
  destroy(){disposed=true;notice.remove();map.remove();}
 };
}
