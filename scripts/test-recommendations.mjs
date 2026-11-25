import fs from 'node:fs';
import assert from 'node:assert/strict';
import {mapsUrl} from '../js/recommendations.js';
const d=JSON.parse(fs.readFileSync(new URL('../data/recommendations.json',import.meta.url)));
assert.equal(d.cards.length,5);assert.equal(d.routes.length,6);assert.equal(d.qr.length,6);
const poi=new Map(d.pois.map(p=>[p.poiId,p]));
assert.equal(new Set(d.routes.map(r=>r.variantId)).size,6);
for(const r of d.routes){assert(r.stopIds.every(id=>poi.has(id)));assert(d.cards.some(c=>c.id===r.cardId));assert(r.segmentIds.every(id=>d.segments.some(s=>s.segmentId===id)));assert(!r.gpx);if(r.type!=='單程')assert.equal(r.stopIds[0],r.stopIds.at(-1));for(const s of r.geometry||[]){assert(s.coordinates.length>10);assert(s.coordinates.every(([lat,lon])=>lat>22&&lat<23&&lon>120&&lon<121));}assert(fs.existsSync(new URL('../assets/routes/share-'+r.variantId+'.svg',import.meta.url)));}
assert(!d.routes.find(r=>r.variantId==='love-21').stopIds.includes('greatbridge'));assert(!d.routes.find(r=>r.variantId==='pier-22').stopIds.includes('hedong'));
for(const c of d.cards){assert.equal(c.publishedAt,null);for(const h of c.hotspots){assert(poi.has(h.poiId));assert(h.x>=0&&h.x<=100&&h.y>=0&&h.y<=100);}}
for(const q of d.qr){assert(q.rawUrl.startsWith('https://reurl.cc/'));assert(q.finalUrl.startsWith('https://www.google.com/maps/dir/'));assert(q.finalUrl.includes('!3e2'));}
for(const p of d.resources){assert(poi.has(p.poiId));for(const s of p.services){assert(s.evidence.length);assert(Object.hasOwn(s,'fee'));assert(Object.hasOwn(s,'hours'));assert(Object.hasOwn(s,'purchaseRequired'));assert(Object.hasOwn(s,'lastCheckedAt'));}}
assert.equal(mapsUrl({coordinates:null}),null);assert(mapsUrl(poi.get('ruh5'),true).includes('travelmode=walking'));assert(mapsUrl(poi.get('ruh5')).includes('/search/'));assert.notEqual(mapsUrl(poi.get('ruh5')),mapsUrl(poi.get('ruh5'),true));
assert.equal(JSON.parse(fs.readFileSync(new URL('../data/routes.json',import.meta.url))).find(r=>r.id==='bay').activityDistanceLabel,'活動路線約 4.5 公里');
console.log('6 variants / 5 original cards / 6 source QR / services / URLs / historical separation PASS');
