import assert from 'node:assert/strict';
import blocks from '../data/walking-blocks.js';
import precincts from '../data/station-surroundings.js';
import {stationExits,stationFootprints,exitPoint} from '../data/station-exits.js';
import {stationApproach} from '../js/station-entrance.js';

const underground=new Set(['-1713,-1360','2624,1558','1789,372']);
const walls=blocks.buildings.map(record=>record[1]).filter(p=>!stationFootprints.has(p[0].join())&&!underground.has(p[0].join()));
function inside([x,z],ring){
  let result=false;
  ring.forEach(([a,b],i)=>{
    const [c,d]=ring[(i+1)%ring.length];
    if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)result=!result;
  });
  return result;
}
assert.deepEqual(stationExits.map(e=>e.id),['O1-1','O1-2','R6-1','R6-2','R6-3','R7-1','R7-2','R7-3','R7-4']);
for(const exit of stationExits){
  const {start,end,length,heading}=stationApproach(exit);
  assert(length>10&&length<38);
  const door=exitPoint(exit,0,exit.length/2-.4);
  assert(Math.abs(Math.atan2(door[0]-start[0],door[1]-start[1])-heading)<.001);
  assert(new URL(exit.streetView).searchParams.has('heading'));
  for(let f=0;f<=1;f+=.05){
    const p=start.map((x,i)=>x+f*(end[i]-x));
    assert(!walls.some(ring=>inside(p,ring)),exit.id+' 的接近動線碰到建物外框');
  }
}
for(const code of ['C3','C7','C8','C10','C11','C12','C13','C14']){
  assert.equal(precincts.platforms[code].length,2);
  assert(precincts.platforms[code].every(p=>p.length>=4));
}
console.log('九個出口接近動線及八個輕軌站月台資料通過');
