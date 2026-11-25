// Contract test with API doubles, not Google rendering/authorization validation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const markers=[],lines=[];let lastMap,info;
class FakeMap{constructor(){lastMap=this;}fitBounds(b){this.bounds=b;}panTo(p){this.position=p;}setZoom(z){this.zoom=z;}}
class Marker{constructor(o){Object.assign(this,o);markers.push(this);}addListener(name,fn){this.click=fn;}}
class Bounds{constructor(){this.points=[];}extend(p){this.points.push(p);}isEmpty(){return !this.points.length;}}
class Line{constructor(o){Object.assign(this,o);lines.push(this);}setMap(m){this.map=m;}}
class Info{constructor(){info=this;}close(){this.closed=true;}setContent(c){this.content=c;}setPosition(p){this.position=p;}open(){this.closed=false;}}
globalThis.document={createElement:()=>({})};globalThis.google={maps:{importLibrary:async()=>{},Map:FakeMap,LatLngBounds:Bounds,Polyline:Line,InfoWindow:Info,SymbolPath:{FORWARD_OPEN_ARROW:1},marker:{AdvancedMarkerElement:Marker,PinElement:class{element={};}},event:{clearInstanceListeners(){}}}};
globalThis.window={google};globalThis.fetch=async()=>({ok:true,json:async()=>({apiKey:'test-double',mapId:'test-double'})});
const {createRouteMap}=await import('../js/google-route-map.js');
const d=JSON.parse(fs.readFileSync(new URL('../data/recommendations.json',import.meta.url)));const pois=new Map(d.pois.map(p=>[p.poiId,p]));let selected;
const r=d.routes.find(r=>r.variantId==='pier-22'),map=await createRouteMap({},r,pois,id=>selected=id);
assert.equal(lines.length,r.geometry.length);assert.deepEqual(lines[0].path[0],{lat:r.geometry[0].coordinates[0][0],lng:r.geometry[0].coordinates[0][1]});assert(lastMap.bounds.points.length>r.stopIds.length);
map.update(['library','coral','coral']);assert.equal(markers.length,2);markers[1].click();assert.equal(selected,'coral');map.focus('coral');assert.equal(lastMap.zoom,16);assert.equal(info.content.textContent,pois.get('coral').name);
map.update(['ruh5']);assert.equal(markers[0].map,null);map.locate(22.6,120.3);assert.deepEqual(lastMap.position,{lat:22.6,lng:120.3});map.destroy();assert(lines.every(l=>l.map===null));assert(markers.every(m=>m.map===null));console.log('Google adapter doubles: geometry preserved / bounds / filtering / click / focus / location / disposal PASS. Live Google NOT verified.');
