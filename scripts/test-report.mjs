import assert from 'node:assert/strict';
import {track} from '../js/track.js';
import {clampMovement} from '../js/report.js';
import {MODES} from '../js/explore.js';
assert.deepEqual(track[0],track.at(-1));
assert.ok(track.length>20);
const length=track.slice(1).reduce((sum,p,i)=>sum+2*Math.hypot(p[0]-track[i][0],p[1]-track[i][1]),0);
for(const mode of Object.values(MODES)){
 let progress=0,lateral=0;
 for(let frame=0;frame<Math.ceil(length/mode.speed*60)+2;frame++){
   [progress,lateral]=clampMovement(progress+mode.speed/60,lateral+mode.speed/60,length);
 }
 assert.equal(progress,length);assert.equal(lateral,3);
 assert.deepEqual(clampMovement(-5,-20,length),[0,-3]);
}
console.log('完整往返端點、五種速度、左右邊界與終點阻擋通過');
