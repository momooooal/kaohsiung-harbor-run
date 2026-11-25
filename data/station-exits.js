// Exit nodes and canopy outlines © OpenStreetMap contributors. The origin and
// axes match walking-blocks.js. 'front' is the outward compass bearing.
export const stations = {
  O1: {name:'哈瑪星', english:'Hamasen', line:'橘線', color:'#df811d'},
  R6: {name:'凱旋', english:'Kaisyuan', line:'紅線', color:'#c83948'},
  R7: {name:'獅甲', english:'Shihjia', line:'紅線', color:'#c83948'}
};

// The panorama viewpoints are on the street, separate from the entrance nodes.
// The destination copy follows the operator's exit guide.
const records = [
  ['O1',1,'鼓山輪渡站方向',22.6219496,120.2733381,[-1710,-1319],32,20,16,'-1715,-1334',[22.6222189,120.2733977,191.6]],
  ['O1',2,'輕軌 C14、舊打狗驛方向',22.6215501,120.2753859,[-1505,-1275],32,20.8,13.3,'-1505,-1288',[22.6216668,120.2753991,186]],
  ['R6',1,'輕軌 C3 前鎮之星方向',22.5961198,120.3152883,[2602,1536],144,19.2,8.7,'2592,1530',[22.596147,120.3154104,256.5]],
  ['R6',2,'慈仁六村方向',22.5964418,120.3160983,[2683,1500],51,19.4,8.6,'2688,1490',[22.5963638,120.3159208,64.7]],
  ['R6',3,'時代大道、夢時代方向',22.5975554,120.3143248,[2505,1379],324,19.4,8.7,'2496,1374',[22.5975723,120.3144073,257.6]],
  ['R7',1,'獅甲國中方向',22.605399,120.3082605,[1878,510],140,11.8,4.3,'1873,507',[22.6054328,120.3083586,249.6]],
  ['R7',2,'前鎮游泳池方向',22.6057171,120.3086947,[1921,474],140,11.8,4.3,'1915,470',[22.6055955,120.3086058,34.2]],
  ['R7',3,'勞工公園方向',22.6066381,120.3079807,[1851,375],320,14.6,4.7,'1845,370',[22.6065826,120.3078842,58.2]],
  ['R7',4,'獅甲國小方向',22.6064106,120.3074988,[1800,399],320,11.8,4.3,'1795,396',[22.6064822,120.3076322,240]]
];
export const stationExits=records.map(([code,number,landmark,lat,lon,center,front,length,width,footprint,view])=>({
  ...stations[code],code,number,id:code+'-'+number,landmark,lat,lon,center,front,length,width,footprint,
  label:stations[code].name+'站 '+number+' 號出口',source:'https://www.krtc.com.tw/Guide/station_info?n='+code,
  streetView:'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+view.slice(0,2).join(',')+'&heading='+view[2]+'&pitch=1'
}));
export const stationExitById=new Map(stationExits.map(exit=>[exit.id,exit]));
export const stationFootprints=new Set(stationExits.map(exit=>exit.footprint));

export function exitPoint(exit,side,forward) {
  const a=exit.front*Math.PI/180;
  return [exit.center[0]-Math.cos(a)*side+Math.sin(a)*forward,exit.center[1]-Math.sin(a)*side-Math.cos(a)*forward];
}
