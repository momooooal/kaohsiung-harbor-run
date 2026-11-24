import {track} from './track.js';
export const routeId='bay';
export const sceneScale=2;
export const nodes=[
 {poiId:'hamasen',name:'哈瑪星',report:[17,59],trackIndex:0,modelIndex:1,geographic:[22.62152,120.27536],accuracy:'OSM 出口建物中心，非現地實測'},
 {poiId:'greenway',name:'鹽埕綠廊道',report:[232,155],trackIndex:5,modelIndex:5,geographic:null},
 {poiId:'love-pier',name:'真愛碼頭',report:[495,173],trackIndex:14,modelIndex:14,geographic:[22.61862,120.28966],accuracy:'地標概略位置'},
 {poiId:'music',name:'高雄流行音樂中心',report:[625,196],trackIndex:20,modelIndex:19,geographic:[22.61781,120.28732],accuracy:'地標概略位置，造景錨點與路線終點分開'},
 {poiId:'dayi',name:'輕軌大義沿線',report:[310,205],trackIndex:34,modelIndex:35,geographic:null,accuracy:'車站概略位置'}
];
export const segments=nodes.slice(1).map((n,i)=>({segmentId:`bay-${nodes[i].poiId}-${n.poiId}`,from:nodes[i].poiId,to:n.poiId,status:'依報告整理，通行軌跡待核對'}));
export function sceneTrack(short=false){return track.slice(0,short?nodes.find(n=>n.poiId==='music').trackIndex+1:track.length)}
export const modelPlaces=nodes.map(n=>({...n,index:n.modelIndex}));

export const geographicSources={hamasen:'https://mapcarta.com/W303165537','love-pier':'https://khh.travel/zh-tw/attractions/detail/1053/',music:'https://khh.travel/zh-tw/attractions/detail/1175/'};
