import { friendlyPlaces } from '../data/friendly-places.js';

export function friendlyDirectory() {
  const section = document.createElement('details');
  section.className = 'section-card';
  section.style.marginBlock = '1rem';
  const summary = document.createElement('summary');
  summary.style.cursor = 'pointer';
  summary.textContent = '全市友善店家與據點（' + friendlyPlaces.length + ' 處）';
  const intro = document.createElement('p');
  intro.textContent = '從港灣延伸到各行政區。點選據點即可在 Google 地圖選擇出發點、查看步行路線。各店服務及使用條件請向現場確認。';
  const list = document.createElement('ul');
  for (const [name, address] of friendlyPlaces) {
    const row = document.createElement('li');
    const link = document.createElement('a');
    const url = new URL('https://www.google.com/maps/dir/');
    url.search = new URLSearchParams({ api: '1', destination: name + ' 高雄市' + address, travelmode: 'walking' });
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = name;
    link.setAttribute('aria-label', name + '，在 Google 地圖開啟步行路線（新分頁）');
    link.style.display = 'inline-block';
    link.style.paddingBlock = '.65rem';
    row.append(link, document.createTextNode('　' + address));
    list.append(row);
  }
  section.append(summary, intro, list);
  return section;
}
