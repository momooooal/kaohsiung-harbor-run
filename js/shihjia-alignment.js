// Local metres. Chainage grows southeast along Zhongshan 3rd Road.
// The pavement runs between the R7 canopy and the school boundary (OSM
// 611752691 and 94058607). The geographic recommendation stays untouched.
const angle = 145 * Math.PI / 180;
const east = Math.sin(angle), south = -Math.cos(angle);
// First vertex of OSM way 88859711 in the street data's metre grid.
export const shihjiaTowerKey = '1981,560';
export function shihjiaPoint(along, right) {
  return [1881.2 + east * along - south * right, 507.1 + south * along + east * right];
}
export function stationWalkingPoint(routeId, point) {
  if (routeId !== 'harbor-108') return point;
  const dx = point.x - 1881.2, dz = point.z - 507.1;
  const d = dx * east + dz * south, side = -dx * south + dz * east;
  if (d < -0.6 || d > 200 || Math.abs(side) > 10) return point;
  const pavement = [[-1,8.1],[6,8.1],[19,6.15],[41,5.25],[91,5.5],[144,5.2],[169,1.25],[197,-.45],[201,-1.2]];
  const i = pavement.findIndex(row => row[0] >= d);
  if (i < 1) return point;
  const [a,s] = pavement[i-1], [b,t] = pavement[i];
  const [x,z] = shihjiaPoint(d,s+(t-s)*(d-a)/(b-a));
  return point.clone().set(x,point.y,z);
}
