import records from '../data/corridor-buildings.js';
export function mappedBuilding(point){
  return records[point.map(Math.round).join()];
}
export function mappedHeight(record,fallback){
  if(!record)return fallback;
  const raw=String(record.height||'').trim().match(/^(\d+(?:\.\d+)?)\s*m?$/);
  if(raw&&Number(raw[1])>0)return Number(raw[1]);
  const storeys=Number(record['building:levels']);
  return storeys>0?storeys*3.15:fallback;
}
export function mappedColour(value,fallback){
  return /^#[\da-f]{6}$/i.test(value||'')?parseInt(value.slice(1),16):fallback;
}

