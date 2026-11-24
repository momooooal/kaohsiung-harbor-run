import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {project,canMove,switchTravel,movementKey,observations,eligibleObservation} from '../js/ride-logic.js';
import {sceneTrack,nodes} from '../js/route-model.js';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n+'.json',import.meta.url)));
const survey=read('survey-results');for(const [id,len,figure] of [['public-needs',15,12],['map-info',10,13],['shop-needs',12,14]]){const q=survey.find(x=>x.id===id);assert.equal(q.items.length,len);assert.equal(q.sampleSize,494);assert.equal(q.figure,figure);assert.ok(q.sourceLocator);assert.equal(q.questionType,'複選');if(id==='shop-needs'){assert.equal(q.storeSampleSize,25);assert.ok(q.items.every(i=>Number.isFinite(i.storeValue)))}else assert.ok(q.items.every(i=>Number.isInteger(i.count)))}
const services=[...read('stores'),...read('facilities')];assert.equal(services.length,7);assert.equal(services.filter(s=>s.recordClass==='current').length,0);for(const s of services){assert.ok(s.sourceLocator);assert.equal(s.serviceCheckedAt,null);assert.ok(s.services.every(x=>x.sourceLocator));if(s.id==='coffee-five'){assert.equal(s.lat,null);assert.equal(s.cooperationConfirmed,false)}}
const points=sceneTrack().map(([x,z])=>({x:x*2,z:z*2}));assert.equal(sceneTrack(true).length,nodes.find(n=>n.poiId==='music').trackIndex+1);assert.ok(points.length>sceneTrack(true).length);
const straight=[{x:0,z:0},{x:0,z:100}];assert.ok(canMove({x:0,z:30},straight));assert.ok(!canMove({x:3.8,z:30},straight));assert.ok(!canMove({x:0,z:30},straight,[{x:0,z:30,w:1,d:2,angle:0}]));assert.ok(!canMove({x:5.6,z:30},straight));
const transition=switchTravel({x:2,z:45},.5,straight);assert.equal(transition.progress,45);assert.equal(transition.offset,2);assert.equal(transition.heading,.5);assert.deepEqual(transition.position,{x:2,z:45});assert.equal(movementKey('W'),movementKey('w'));assert.equal(movementKey('ArrowUp'),'forward');assert.equal(movementKey('q'),undefined);
for(const o of observations){assert.ok(eligibleObservation(o,points[o.index],points));assert.ok(!eligibleObservation(o,{x:-500,z:-500},points))}assert.equal(observations.length,4);
assert.equal(project({x:2,z:45},straight).distance,2);console.log('現行資料、雙母數、來源、未知座標、服務隔離、路徑、模式切換、碰撞及觀察可達條件通過。非 WebGL 操作驗收。');
const outBack=[{x:0,z:0},{x:0,z:100},{x:0,z:0}];assert.equal(switchTravel({x:0,z:30},Math.PI,outBack,170).progress,170,'重疊返回段切換應保留返回進度');
