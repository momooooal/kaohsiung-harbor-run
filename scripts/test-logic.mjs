import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { publicItems } from '../js/data.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exports = {};
const context = { module: { exports }, exports };
vm.runInNewContext(readFileSync(join(root,'assets/three.min.js'),'utf8'), context);
globalThis.THREE = exports;
const { MODES, makeActor, makeWorld, stepMovement } = await import('../js/explore.js');

assert.equal(exports.REVISION, '128');
const scene = new THREE.Scene();
makeWorld(scene);
assert.ok(scene.children.length > 50, '3D 場景應包含地面、港灣、街景與任務節點');

const modes = ['run','walk','bike','wheelchair','cane'];
const actors = modes.map(makeActor);
actors.forEach((actor,i) => assert.ok(actor.children.length > 0, `${modes[i]} 模型不可為空`));
assert.equal(actors[2].userData.wheels.length, 2, '腳踏車需有雙輪');
assert.equal(actors[3].userData.wheels.length, 2, '輪椅需有大輪');
assert.ok(actors[4].userData.cane, '輔具模式需有拐杖');
assert.ok(MODES.run.speed > MODES.walk.speed);
assert.ok(MODES.bike.turn < MODES.walk.turn);
assert.ok(MODES.wheelchair.eye < MODES.run.eye);

const runner = { position: {x:0,z:14}, rotation: {y:0} };
const walker = { position: {x:0,z:14}, rotation: {y:0} };
stepMovement(runner,'run',{left:false,right:false,forward:true,back:false},1);
stepMovement(walker,'walk',{left:false,right:false,forward:true,back:false},1);
assert.ok(runner.position.z < walker.position.z, '跑步應快於健走');
stepMovement(runner,'run',{left:true,right:false,forward:true,back:false},1);
assert.ok(runner.rotation.y > 0 && runner.position.x > 0, '轉向應改變移動方向');
for(let i=0;i<100;i++)stepMovement(runner,'run',{left:false,right:false,forward:true,back:false},1);
assert.ok(runner.position.x <= 7.5 && runner.position.z >= -59, '角色不可離開示範步道邊界');
const nearBench={position:{x:5,z:-13},rotation:{y:0}};
stepMovement(nearBench,'walk',{left:false,right:false,forward:true,back:false},.5);
assert.ok(nearBench.position.z >= -13.8, '角色不可穿過休息座位');

const records = [
  { status:'verified', published:true, verifiedAt:'2026-11-04', cooperationConfirmed:true },
  { status:'pending', published:true, verifiedAt:null, cooperationConfirmed:false },
  { status:'demo', published:true, verifiedAt:null, cooperationConfirmed:false }
];
assert.equal(publicItems(records,'stores').length, 1, '只公開已確認合作店家');
assert.equal(publicItems(records,'facilities').length, 1, '未查核設施不可公開');
console.log('3D 場景、五種模型、移動邊界與資料公開條件測試通過');
