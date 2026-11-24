import assert from 'node:assert/strict';
import { mountMap } from '../js/map.js';

class Element {
  constructor(tag='div') { this.tag=tag; this.children=[]; this.listeners={}; this.dataset={}; this.textContent=''; this.value=''; this.hidden=false; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children=[...children]; }
  setAttribute(key,value) { this[key]=value; }
  addEventListener(type,fn) { this.listeners[type]=fn; }
  dispatch(type) { this.listeners[type]?.(); }
  querySelectorAll(selector) { return selector==='button[data-category]' ? this.children.filter(c=>c.tag==='button' && c.dataset.category) : []; }
  querySelector(selector) { return selector==='.filter-state' ? this.children.find(c=>c.className==='filter-state') : null; }
}
const ids = ['map-canvas','map-selection','map-info-title','map-info-summary','map-info-status','map-info-length','map-info-path','map-info-stores','map-nav-link','map-detail-link','map-visible-count','facility-filters','store-list'];
const elements = Object.fromEntries(ids.map(id=>[id,new Element()]));
globalThis.document={getElementById:id=>elements[id]||null,createElement:tag=>new Element(tag)};
const marker=()=>({bindPopup(){return this},addTo(layer){layer.items?.push(this);return this},getBounds(){return [[22.6,120.2],[22.7,120.3]]}});
const map={setView(){return this},fitBounds(){return this},invalidateSize(){},remove(){this.removed=true}};
const group=()=>({items:[],addTo(){return this},clearLayers(){this.items=[]}});
globalThis.L={map:()=>map,tileLayer:()=>({addTo(){}}),layerGroup:group,circle:marker,circleMarker:marker,polyline:marker};
globalThis.window={L};
const verified={status:'verified',published:true,verifiedAt:'2026-11-04'};
const data={
  routes:[
    {id:'bay',name:'駁二 × 亞洲新灣區',status:'demo',published:true,center:[22.618,120.279],summary:'示範場域',path:null,distanceKm:null},
    {id:'checked',name:'測試路線',...verified,center:[22.63,120.3],summary:'測試用',path:[[22.63,120.3],[22.64,120.31]],distanceKm:2.1}
  ],
  facilities:[{id:'f1',name:'測試設施',category:'飲水站',lat:22.63,lng:120.3,routeIds:['checked'],...verified}],
  stores:[{id:'s1',name:'測試店家',branch:'',address:'測試地址',lat:22.63,lng:120.3,routeIds:['checked'],services:['飲水'],offer:null,limitations:null,updatedAt:'2026-11-04',cooperationConfirmed:true,...verified}]
};
const dispose=mountMap(data);
assert.equal(elements['map-selection'].children.length,3,'路線選單應由資料自動生成');
assert.equal(elements['map-info-title'].textContent,'駁二 × 亞洲新灣區');
assert.equal(elements['map-info-length'].textContent,'待確認');
assert.equal(elements['map-visible-count'].textContent,'目前可公開設施與店家：0 筆');
elements['map-selection'].value='checked';elements['map-selection'].dispatch('change');
assert.equal(elements['map-info-title'].textContent,'測試路線');
assert.equal(elements['map-info-length'].textContent,'2.1 公里');
assert.equal(elements['map-info-path'].textContent,'已查核');
assert.equal(elements['map-detail-link'].href,'#/routes/checked');
assert.equal(elements['map-visible-count'].textContent,'目前可公開設施與店家：2 筆');
assert.equal(elements['store-list'].children.length,1);
const water=elements['facility-filters'].children.find(button=>button.dataset.category==='飲水站');
assert.equal(water.querySelector('.filter-state').textContent,'已查核 1 筆');
water.dispatch('click');
assert.equal(elements['map-visible-count'].textContent,'目前可公開設施與店家：1 筆');
elements['map-selection'].value='all';elements['map-selection'].dispatch('change');
assert.equal(elements['map-info-title'].textContent,'全市總覽');
assert.equal(elements['map-info-length'].textContent,'—');
assert.equal(elements['map-nav-link'].hidden,true);
dispose();assert.equal(map.removed,true);
console.log('地圖路線切換、資訊卡同步、設施篩選及店家清單測試通過');
