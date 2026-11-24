import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root,'data/schemas.json'),'utf8'));
const kinds = { route:'routes', facility:'facilities', store:'stores', surveyResult:'survey-results', communityResult:'community-results', gallery:'gallery' };
const errors = [];
for (const [kind,file] of Object.entries(kinds)) {
  const items = JSON.parse(readFileSync(join(root,`data/${file}.json`),'utf8'));
  if (!Array.isArray(items)) { errors.push(`${file}: 必須是陣列`); continue; }
  const ids = new Set();
  for (const item of items) {
    for (const field of schema[kind]) if (!(field in item)) errors.push(`${file}/${item.id || '?'}: 缺少 ${field}`);
    if (typeof item.id !== 'string' || !/^[a-z0-9-]+$/.test(item.id)) errors.push(`${file}: ID 只能使用小寫英數與連字號`);
    if (!['verified','pending','demo'].includes(item.status)) errors.push(`${file}/${item.id}: 無效狀態`);
    if (ids.has(item.id)) errors.push(`${file}: 重複 ID ${item.id}`);
    ids.add(item.id);
    if (item.published && item.status === 'verified' && !item.verifiedAt) errors.push(`${file}/${item.id}: 已公開資料缺少查核日期`);
    if (kind === 'store' && item.published && (item.status !== 'verified' || !item.cooperationConfirmed)) errors.push(`${file}/${item.id}: 店家未確認合作，不得公開`);
    if (kind === 'route' && item.status === 'demo' && (item.distanceKm != null || item.path != null)) errors.push(`${file}/${item.id}: 示範場域不可填正式路徑或距離`);
    if (kind === 'route' && item.status === 'verified' && item.published) {
      if (item.kind !== 'activity' && (!Array.isArray(item.center) || item.center.length !== 2 || !item.center.every(Number.isFinite))) errors.push(`${file}/${item.id}: 地圖中心無效`);
      if (item.path != null && (!Array.isArray(item.path) || item.path.length < 2 || !item.path.every(p=>Array.isArray(p) && p.length===2 && p.every(Number.isFinite)))) errors.push(`${file}/${item.id}: 軌跡座標無效`);
      if (item.distanceKm != null && (!Number.isFinite(item.distanceKm) || item.distanceKm <= 0)) errors.push(`${file}/${item.id}: 距離無效`);
    }
    if ((kind === 'facility' || kind === 'store') && item.published) {
      if (!Number.isFinite(item.lat) || item.lat < -90 || item.lat > 90 || !Number.isFinite(item.lng) || item.lng < -180 || item.lng > 180) errors.push(`${file}/${item.id}: 座標無效`);
      if (!Array.isArray(item.routeIds)) errors.push(`${file}/${item.id}: routeIds 必須是陣列`);
    }
    if (kind === 'gallery' && item.image && !existsSync(join(root,item.image))) errors.push(`${file}/${item.id}: 圖片不存在`);
  }
  console.log(`${file}: ${items.length} 筆`);
}
for (const path of ['index.html','assets/style.css','assets/leaflet.js','assets/leaflet.css','assets/three.min.js','assets/kaohsiung-harbor.jpg','assets/kaohsiung-pier.jpg','js/main.js','js/map.js','js/explore.js']) {
  if (!existsSync(join(root,path))) errors.push(`缺少 ${path}`);
}
if (errors.length) { errors.forEach(e=>console.error(e)); process.exitCode=1; }
else console.log('資料與靜態資源檢查通過');
