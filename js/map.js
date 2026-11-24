import { FACILITY_CATEGORIES, publicItems } from './data.js';

export function mountMap(data, { compact = false } = {}) {
  const container = document.getElementById('map-canvas');
  if (!container) return () => {};
  if (!window.L) {
    container.textContent = '地圖程式庫無法載入。請查看下方文字版場域資訊。';
    return () => {};
  }
  const routes = data.routes.filter(route => Array.isArray(route.center) && route.published === true && (route.status === 'demo' || (route.status === 'verified' && !!route.verifiedAt)));
  const bay = routes.find(route => route.id === 'bay');
  const map = L.map(container, { scrollWheelZoom: false }).setView(bay?.center || [22.625,120.303], compact ? 14 : 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
  }).addTo(map);
  const demoLayer = L.layerGroup().addTo(map);
  const facilityLayer = L.layerGroup().addTo(map);
  const stores = publicItems(data.stores, 'stores');
  const facilities = publicItems(data.facilities, 'facilities');
  const active = new Set(FACILITY_CATEGORIES);
  const selector = document.getElementById('map-selection');
  if (selector && !compact) {
    selector.replaceChildren();
    for (const route of routes) {
      const option = document.createElement('option');
      option.value = route.id;
      option.textContent = route.name + (route.status === 'demo' ? '（示範）' : '');
      selector.append(option);
    }
    const all = document.createElement('option'); all.value = 'all'; all.textContent = '全市總覽'; selector.append(all);
  }
  const title = document.getElementById('map-info-title');
  const summary = document.getElementById('map-info-summary');
  const status = document.getElementById('map-info-status');
  const length = document.getElementById('map-info-length');
  const pathState = document.getElementById('map-info-path');
  const storeState = document.getElementById('map-info-stores');
  const nav = document.getElementById('map-nav-link');
  const detail = document.getElementById('map-detail-link');
  const count = document.getElementById('map-visible-count');
  const filterHost = document.getElementById('facility-filters');
  const storeList = document.getElementById('store-list');

  function popup(name, detail) {
    const el = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = name;
    const p = document.createElement('p');
    p.textContent = detail;
    el.append(strong, p);
    return el;
  }
  function drawFacilities() {
    facilityLayer.clearLayers();
    let visible = 0;
    const selected = selector?.value || 'bay';
    for (const item of facilities) {
      if (selected !== 'all' && !item.routeIds?.includes(selected)) continue;
      if (!active.has(item.category)) continue;
      L.circleMarker([item.lat, item.lng], { radius: 8, color: '#0b3451', fillColor: '#26a7a4', fillOpacity: .9, weight: 2 })
        .bindPopup(popup(item.name, `${item.category}・查核日期：${item.verifiedAt}`)).addTo(facilityLayer);
      visible++;
    }
    if (active.has('友善合作店家')) {
      for (const item of stores) {
        if (selected !== 'all' && !item.routeIds?.includes(selected)) continue;
        L.circleMarker([item.lat, item.lng], { radius: 9, color: '#8c4d23', fillColor: '#f3a45d', fillOpacity: .95, weight: 2 })
          .bindPopup(popup(item.name, `合作店家・查核日期：${item.verifiedAt}`)).addTo(facilityLayer);
        visible++;
      }
    }
    count.textContent = `目前可公開設施與店家：${visible} 筆`;
    if (filterHost) {
      for (const button of filterHost.querySelectorAll('button[data-category]')) {
        const category = button.dataset.category;
        const total = category === '友善合作店家'
          ? stores.filter(item => selected === 'all' || item.routeIds?.includes(selected)).length
          : facilities.filter(item => item.category === category && (selected === 'all' || item.routeIds?.includes(selected))).length;
        button.querySelector('.filter-state').textContent = total ? `已查核 ${total} 筆` : '資料待更新';
      }
    }
  }
  function drawStores(selected) {
    if (!storeList) return;
    const matching = stores.filter(item => selected === 'all' || item.routeIds?.includes(selected));
    if (!matching.length) { storeList.className = 'empty-box'; storeList.textContent = '合作店家清單待確認。'; return; }
    storeList.className = 'store-list'; storeList.replaceChildren();
    for (const item of matching) {
      const card = document.createElement('details'); card.className = 'store-card';
      const heading = document.createElement('summary'); heading.textContent = item.name + (item.branch ? ` · ${item.branch}` : '');
      const address = document.createElement('p'); address.textContent = item.address || '地址待更新';
      const services = document.createElement('p'); services.textContent = `服務：${Array.isArray(item.services) ? item.services.join('、') : '待更新'}`;
      const offer = document.createElement('p'); offer.textContent = item.offer ? `優惠：${item.offer}${item.limitations ? `；限制：${item.limitations}` : ''}` : '優惠資訊未提供';
      const date = document.createElement('p'); date.className = 'small muted'; date.textContent = `資料更新：${item.updatedAt} · 查核：${item.verifiedAt}`;
      const link = document.createElement('a'); link.href = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`; link.target='_blank'; link.rel='noopener'; link.className='link-arrow'; link.textContent='開啟外部導航';
      card.append(heading,address,services,offer,date,link); storeList.append(card);
    }
  }
  function drawSelection(value) {
    demoLayer.clearLayers();
    const route = routes.find(item => item.id === value);
    if (route) {
      map.setView(route.center, route.zoom || 14);
      if (route.status === 'demo') {
        L.circle(route.center, { radius: 800, color: '#148b89', weight: 2, dashArray: '7 7', fillColor: '#26a7a4', fillOpacity: .08 })
          .bindPopup(popup(route.name, '圓形僅作為地圖上的示意焦點，並非路線、場域邊界或可通行範圍。')).addTo(demoLayer);
      } else if (Array.isArray(route.path) && route.path.length > 1) {
        const line = L.polyline(route.path, { color: '#138b89', weight: 5 }).addTo(demoLayer);
        map.fitBounds(line.getBounds(), { padding: [35,35] });
      }
      L.circleMarker(route.center, { radius: 10, color: '#fff', fillColor: '#e9964d', fillOpacity: 1, weight: 3 })
        .bindPopup(popup(route.name, route.status === 'demo' ? '示意焦點，非正式路線起點。' : '已查核路線資訊，請參考來源與更新日期。')).addTo(demoLayer);
      title.textContent = route.name;
      summary.textContent = route.summary || '路線資訊已公開。';
      status.textContent = route.status === 'demo' ? '示範場域；正式路徑待確認' : '已查核路線';
      if (pathState) pathState.textContent = route.status === 'verified' && Array.isArray(route.path) ? '已查核' : '待確認';
      length.textContent = route.activityDistanceLabel ? route.activityDistanceLabel : route.status === 'verified' && Number.isFinite(route.distanceKm) ? `${route.distanceKm} 公里` : '待確認';
      if (storeState) { const count = stores.filter(item => item.routeIds?.includes(route.id)).length; storeState.textContent = count ? `${count} 筆已確認` : '資料待更新'; }
      nav.hidden = false;
      nav.textContent = route.status === 'demo' ? '導航至示意焦點 ↗' : '開啟外部導航 ↗';
      const target = Array.isArray(route.start) ? route.start : route.center;
      nav.href = `https://www.google.com/maps/dir/?api=1&destination=${target[0]},${target[1]}`;
      if (detail) { detail.hidden = false; detail.href = `#/routes/${route.id}`; }
      drawStores(route.id);
    } else {
      map.setView([22.625, 120.303], 12);
      title.textContent = '全市總覽';
      summary.textContent = `目前可查詢：${routes.map(item => item.name).join('、')}。其他路線將於查核後加入。`;
      status.textContent = '資料彙整中';
      if (pathState) pathState.textContent = '—';
      length.textContent = '—';
      if (storeState) storeState.textContent = stores.length ? `${stores.length} 筆已確認` : '資料待更新';
      nav.hidden = true;
      if (detail) detail.hidden = true;
      drawStores('all');
    }
    setTimeout(() => map.invalidateSize(), 50);
    drawFacilities();
  }
  if (filterHost) {
    for (const category of FACILITY_CATEGORIES) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip';
      button.dataset.category = category;
      button.setAttribute('aria-pressed', 'true');
      const label = document.createElement('span');
      label.textContent = category;
      const state = document.createElement('span');
      state.className = 'filter-state';
      state.textContent = '資料待更新';
      button.append(label, state);
      button.addEventListener('click', () => {
        if (active.has(category)) active.delete(category); else active.add(category);
        button.setAttribute('aria-pressed', String(active.has(category)));
        drawFacilities();
      });
      filterHost.append(button);
    }
  }
  selector?.addEventListener('change', () => drawSelection(selector.value));
  drawSelection(selector?.value || 'bay');
  drawFacilities();
  setTimeout(() => map.invalidateSize(), 150);
  return () => map.remove();
}


