const FILES = ['routes', 'facilities', 'stores', 'survey-results', 'community-results', 'gallery'];
const SCHEMA_KEY = { routes:'route', facilities:'facility', stores:'store', 'survey-results':'surveyResult', 'community-results':'communityResult', gallery:'gallery' };

export const FACILITY_CATEGORIES = [
  '飲水站', '廁所', '置物櫃', '休憩座椅', '遮陽空間', '夜間照明',
  'AED', '更衣及沐浴', '停車場', '大眾運輸', '友善合作店家', '無障礙設施'
];

function isValid(item, kind, required) {
  if (!item || typeof item !== 'object' || !required.every(key => Object.hasOwn(item, key))) return false;
  if (!['verified', 'pending', 'demo'].includes(item.status)) return false;
  if (typeof item.id !== 'string' || !/^[a-z0-9-]+$/.test(item.id) || typeof item.source !== 'string' || typeof item.published !== 'boolean') return false;
  if (kind === 'routes') return item.status === 'pending' || (item.kind === 'activity' && item.center === null && Array.isArray(item.stops) && item.stops.length > 0) || (Array.isArray(item.center) && item.center.length === 2 && item.center.every(Number.isFinite));
  if (kind === 'facilities' || kind === 'stores') return !item.published || (Number.isFinite(item.lat) && Number.isFinite(item.lng));
  return true;
}

export async function loadData() {
  const schemaResponse = await fetch('data/schemas.json');
  if (!schemaResponse.ok) throw new Error('資料欄位清單無法載入');
  const schema = await schemaResponse.json();
  const entries = await Promise.all(FILES.map(async kind => {
    const response = await fetch(`data/${kind}.json`);
    if (!response.ok) throw new Error(`${kind}.json 無法載入`);
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error(`${kind}.json 必須是陣列`);
    const required = schema[SCHEMA_KEY[kind]];
    if (!Array.isArray(required)) throw new Error(`${kind} 欄位清單無效`);
    const bad = items.find(item => !isValid(item, kind, required));
    if (bad) throw new Error(`${kind}.json 有缺漏或無效欄位`);
    const ids = new Set(items.map(item => item.id));
    if (ids.size !== items.length) throw new Error(`${kind}.json 有重複 ID`);
    return [kind, items];
  }));
  return Object.fromEntries(entries);
}

export function publicItems(items, kind) {
  return items.filter(item => item.published === true && item.status === 'verified' && !!item.verifiedAt && (kind !== 'stores' || item.cooperationConfirmed === true));
}

export function safeImagePath(path) {
  return typeof path === 'string' && /^assets\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp|svg)$/.test(path) ? path : null;
}
