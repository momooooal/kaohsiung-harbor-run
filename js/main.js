import {previewPage,mountPreview} from './route-preview.js';
let catalog;
import {recommendationsPage,mountRecommendations} from './recommendations.js?v=services-20261127';
import { friendlyDirectory } from './friendly-directory.js';
import {notesSection} from './field-notes.js';
import {reportMap,ride} from './report.js';
import { loadData, publicItems, safeImagePath } from './data.js';
import { mountMap } from './map.js';
import { mountExplore } from './explore.js';
import {stationExitById} from '../data/station-exits.js';

const app = document.getElementById('app');
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  const main = document.getElementById('main');
  if (main) {
    main.focus();
    main.scrollIntoView();
  }
});
let data;
let dispose = () => {};

const links = [
  ['/', '首頁'], ['/map', '友善地圖'], ['/explore', '3D 探索'], ['/community', '公民共創'], ['/about', '計畫介紹']
];
const href = path => `#${path}`;
const logo = `<svg aria-hidden="true" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0b3451"/><path d="M9 43c10-14 19 9 29-5 6-8 12-7 17-4" fill="none" stroke="#26a7a4" stroke-width="6" stroke-linecap="round"/><circle cx="21" cy="20" r="7" fill="#f3a45d"/></svg>`;

function shell(path, content) {
  const nav = links.map(([target, label]) => `<a href="${href(target)}" ${path === target ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  return `
    <header class="site-header"><div class="wrap header-row"><a class="brand" href="#/" aria-label="跑出你的高雄，回首頁">${logo}<span>跑出你的高雄<small>高雄友善跑步地圖</small></span></a><button class="menu-toggle" id="menu-toggle" aria-label="開啟選單" aria-expanded="false" aria-controls="nav-links">☰</button><nav class="nav-links" id="nav-links" aria-label="主要導覽">${nav}</nav></div></header>
    <main id="main" tabindex="-1">${content}</main>
    <footer class="site-footer"><div class="wrap"><div class="footer-grid"><div><div class="eyebrow light">KAOHSIUNG · MOVE TOGETHER</div><h3>跑出你的高雄</h3><p>查跑步路線、交通與沿途補給。</p></div><div><h3>探索網站</h3><div class="footer-links">${links.map(([p,l])=>`<a href="${href(p)}">${l}</a>`).join('')}<a href="#/about/contact">與我們聯絡</a></div></div><div><h3>資料與素材</h3><p class="small">計畫主辦：高雄市政府運動發展局。</p><p class="small">照片：<a href="https://commons.wikimedia.org/wiki/File:Kaohsiung_Harbour_-_KaohsiungHarbour4515.jpg" target="_blank" rel="noopener">lumoplank / Wikimedia Commons</a>（CC0）<br>地圖：© OpenStreetMap contributors</p></div></div><div class="footer-bottom">© 2026 跑出你的高雄</div></div></footer>`;
}

function intro(label, title, description, crumb) {
  return `<section class="page-intro"><div class="wrap"><div class="breadcrumbs"><a href="#/">首頁</a> / ${crumb || title}</div><div class="eyebrow">${label}</div><h1>${title}</h1><p class="lead">${description}</p></div></section>`;
}

function home() {
  return `<section class="hero"><div class="wrap hero-content"><div class="eyebrow light">KAOHSIUNG · CITY IN MOTION</div><h1>跑出你的<br>高雄</h1><p class="lead">找跑步路線、查沿途廁所與補水。</p><div class="hero-actions"><a class="btn primary" href="#/map">友善地圖 ↗</a></div></div></section>
  <section class="section feature-section" id="discover"><div class="wrap"><div class="section-heading"><h2>網站功能</h2></div><div class="feature-grid">
    <a class="feature-card" href="#/map"><div class="art map-art"><span class="route-line"></span><span class="pin"></span></div><div class="copy"><div class="num">01 / MAP</div><h3>友善地圖</h3><p>找一條適合自己的路線，看看沿途有哪些友善設施。</p><span class="go" aria-hidden="true">↗</span></div></a>
    <a class="feature-card" href="#/explore"><div class="art game-art"><span class="sun"></span><span class="building"></span><span class="runner"></span></div><div class="copy"><div class="num">02 / EXPERIENCE</div><h3>3D 探索</h3><p>出發前，先用不同視角體驗城市運動空間。</p><span class="go" aria-hidden="true">↗</span></div></a>
    <a class="feature-card" href="#/community"><div class="art community-art"><span class="bars"></span><span class="dot"></span></div><div class="copy"><div class="num">03 / COMMUNITY</div><h3>公民共創</h3><p>從市民的想法出發，一起打造更友善的運動城市。</p><span class="go" aria-hidden="true">↗</span></div></a>
    <a class="feature-card" href="#/about"><div class="art about-art"></div><div class="copy"><div class="num">04 / THE PROJECT</div><h3>計畫介紹</h3><p>了解這張地圖如何從市民需求一步步誕生。</p><span class="go" aria-hidden="true">↗</span></div></a>
  </div></div></section>
  <section class="section wrap"><h2>跑者想找到什麼？</h2><p>494 份跑者端問卷中，76.3% 勾選希望途中有廁所。</p><a class="btn dark citizen-button" href="#/community">看市民想法</a></section>`;
}

function mapPriorities(){
  const survey=publicItems(data['survey-results'],'survey-results').find(item=>item.id==='map-info');
  if(!survey)return '';
  const items=survey.items.map(item=>'<li>'+escapeText(item.label)+'：'+Number(item.value)+'%</li>').join('');
  return '<section class="wrap activity-guide"><h2>跑者希望地圖標出什麼？</h2><p>494 份跑者端問卷中，以下是最常被選到的三項資訊，可複選。</p><ul>'+items+'</ul><a class="link-arrow" href="#/community">看更多公民共創成果 ↗</a></section>';
}
function mapPage() {
  if(!data.routes.some(r=>r.kind!=='activity' && r.status==='verified' && r.published) && !publicItems(data.stores,'stores').length && !publicItems(data.facilities,'facilities').length)
    return intro('HARBOR MAP','友善跑步地圖','跟著市民踩線的腳步，探索去程、回程與沿途服務。','友善地圖') + mapPriorities();
  return `${intro('INTERACTIVE MAP', '探索友善地圖', '從駁二 × 亞洲新灣區開始。拖曳與縮放地圖，查看已公開的場域與服務資料。', '友善地圖')}
  <div class="wrap page-body"><div class="status-note"><strong>資料狀態：</strong>地圖只顯示已公開資料；示範場域的圓形是示意焦點，並非正式路徑或邊界。</div><div class="page-grid" style="margin-top:22px"><div><div class="map-toolbar"><label for="map-selection"><strong>地圖範圍</strong></label><select id="map-selection"><option value="bay">駁二 × 亞洲新灣區</option><option value="all">全市總覽</option></select><span class="small muted">可拖曳、縮放；使用地圖上的＋／－縮放</span></div><div id="map-canvas" class="map-frame" aria-label="互動式地圖"></div><p class="small muted" style="margin-top:9px">底圖 © OpenStreetMap contributors。示意焦點不是正式路線或場域邊界。</p><div class="panel" style="margin-top:20px"><h2>設施篩選</h2><p class="small muted">類別已建置。未經確認的設施不會出現在地圖上；取得資料後可依類別篩選。</p><div id="facility-filters" class="filter-grid"></div><p id="map-visible-count" class="small" aria-live="polite" style="margin:15px 0 0"></p></div></div><aside class="panel"><span class="pill warning" id="map-info-status">示範場域</span><h2 id="map-info-title" style="margin-top:15px">駁二 × 亞洲新灣區</h2><p id="map-info-summary"></p><ul class="info-list"><li><span>正式路徑</span><strong id="map-info-path">待確認</strong></li><li><span>路線距離</span><strong id="map-info-length">待確認</strong></li><li><span>合作店家</span><strong id="map-info-stores">資料待更新</strong></li></ul><a id="map-nav-link" class="btn dark" target="_blank" rel="noopener" href="#">導航至示意焦點 ↗</a><p class="small muted">示範場域的導航目標是照片參考座標，並非路線起點。出發前請自行查核現地通行條件。</p><a id="map-detail-link" class="link-arrow" href="#/routes/bay">閱讀場域介紹</a><div id="store-list" class="empty-box" style="margin-top:24px">沿線服務清單待合作店家與公共設施查核後更新。</div></aside></div></div>`;
}

function routePage() {
  const bay=data.routes.find(item=>item.id==='bay');
  if(bay.kind!=='activity')return genericRoutePage(bay);
  return intro('HARBOR RUN',bay.name,bay.summary,'港灣踩線')+'<div class="wrap page-body"><a class="link-arrow" href="#/community">看市民提出的路線與設施需求 ↗</a></div>';
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function genericRoutePage(route) {
  const name = escapeText(route.name);
  const summary = escapeText(route.summary || '已公開路線資訊');
  const photo = safeImagePath(route.image);
  const photoBlock = photo ? `<img class="route-hero-photo" src="${photo}" alt="${escapeText(route.imageAlt || route.name)}">` : '';
  const length = Number.isFinite(route.distanceKm) ? `${route.distanceKm} 公里` : '待確認';
  return `${intro('VERIFIED ROUTE', name, summary, name)}<div class="wrap page-body">${photoBlock}<div class="status-note" style="margin:24px 0"><strong>資料來源：</strong>${escapeText(route.source)} · 查核日期：${escapeText(route.verifiedAt)}</div><div class="split"><div><h2>路線地圖</h2><div id="map-canvas" class="map-frame" aria-label="${name}路線地圖"></div><div style="display:none"><select id="map-selection"><option value="${escapeText(route.id)}">${name}</option></select><div id="map-info-title"></div><div id="map-info-summary"></div><div id="map-info-status"></div><div id="map-info-length"></div><a id="map-nav-link"></a><div id="map-visible-count"></div></div><p class="small muted">底圖 © OpenStreetMap contributors。請以最新現地資訊為準。</p></div><div><div class="section-card"><h2>${name}</h2><p>${summary}</p><ul class="info-list"><li><span>路線距離</span><strong>${length}</strong></li><li><span>路線軌跡</span><strong>${Array.isArray(route.path) ? '已查核' : '待確認'}</strong></li></ul><h3>交通資訊</h3><p>${escapeText(route.traffic || '交通資訊待補充。')}</p><a class="btn dark" href="#/map">開啟完整地圖 ↗</a></div><h2 style="margin-top:25px">沿線合作店家</h2><div id="store-list" class="empty-box">合作店家清單待確認。</div></div></div></div>`;
}

function communityPage(){return `<section class="wrap page-body"><h1>公民共創</h1><p class="lead">跑者出門最需要什麼？附近店家又能提供哪些幫助？</p><p>2026 年 7 月 10 日至 11 月 4 日，494 位跑者與 25 家店家分別填答。</p><h2>跑者想借用，店家能提供嗎？</h2><p>免費飲水的兩組比例接近，借廁所與寄物則有落差。以下各列可複選，兩組各用自己的母數。</p><table class="needs-table"><thead><tr><th>服務</th><th>跑者期待（494 人）</th><th>店家可提供（25 家）</th></tr></thead><tbody><tr><th>免費飲水</th><td>75.3%</td><td>76.0%</td></tr><tr><th>借廁所</th><td>77.7%</td><td>56.0%</td></tr><tr><th>寄物</th><td>37.4%</td><td>16.0%</td></tr></tbody></table><div id="survey-highlight"></div><div id="gallery"></div><h2>一起討論、一起走過</h2><p>10 月 26 日，32 位參與者在南鼓山聯合里活動中心討論選線、照明和人行空間。當日港灣踩線約 4.5 公里。</p><div class="participation-photos"><figure><img src="assets/discussion.jpg" alt="參與者分桌討論"><figcaption>從選線到補給，三桌輪流交換意見。</figcaption></figure><figure><img src="assets/departure.jpg" alt="跑友在捷運站外集合"><figcaption>在哈瑪星集合，準備出發踩線。</figcaption></figure><figure><img src="assets/meetup.jpg" alt="跑友在終點交流"><figcaption>回到終點，分享沿途觀察。</figcaption></figure></div><a href="#/routes/bay">看當日行程</a><details><summary>看座談討論</summary><div id="discussion-results"></div></details><details><summary>看各題問卷結果</summary><div id="survey-results"></div></details><dialog id="gallery-dialog" class="dialog" aria-label="調查結果放大檢視"><button type="button" id="gallery-close" class="btn dark">關閉</button><img id="gallery-large" alt=""><h3 id="gallery-title"></h3><p id="gallery-description"></p><div class="dialog-controls"><button type="button" class="btn outline" id="gallery-prev">← 上一張</button><button type="button" class="btn outline" id="gallery-next">下一張 →</button></div></dialog></section>`;}
function aboutPage(){return `<section class="wrap page-body project-story"><h1>計畫介紹</h1><h2>這張地圖怎麼一路做起來</h2><ol class="story-list"><li><strong>2024</strong><div><h3>走跑高雄 1.0</h3><p>鼓勵市民用走路和跑步認識高雄。</p></div></li><li><strong>2025</strong><div><h3>從走跑高雄 2.0 到跑者驛站</h3><p>走跑活動串聯運動熱點。同年「跑者驛站–友善運動地圖」成為數位發展部全國公民科技試驗場域推廣案合作場域。</p></div></li><li><strong>2026</strong><div><h3>走跑高雄 3.0</h3><p>延續城市走跑活動。運發局也透過公民參與計畫，整理跑者與沿途商家的需求。</p></div></li><li><strong>7 月 10 日至 11 月 4 日</strong><div><h3>透過問卷聽需求</h3><p>分別詢問跑者需要哪些服務、店家願意提供什麼。</p></div></li><li><strong>10 月 26 日</strong><div><h3>一起討論、實地踩線</h3><p>跑者、店家與市民分桌討論，再到港灣觀察步道與沿途補給。</p></div></li><li><strong>問卷與踩線之後</strong><div><h3>把路線整理成地圖</h3><p>讓大家在出發前就能查到路線、交通與附近設施。</p></div></li><li><strong>後續更新</strong><div><h3>跟上場館與店家的變動</h3><p>依場館公告與實際回覆調整服務時間、入口和使用條件。</p></div></li></ol><section id="contact" tabindex="-1"><h2>與我們聯絡</h2><p>反映路線或設施資訊、提出跑步需求，或洽詢店家合作。</p><p>線上收件尚未開放。</p><fieldset disabled><legend>聯絡資料只用於回覆此次需求。</legend><label>姓名或稱呼<input autocomplete="name"></label><label>聯絡電話（選填）<input type="tel" autocomplete="tel"></label><label>需求內容（必填）<textarea required rows="4"></textarea></label></fieldset></section></section>`;}
function filmPage(){
 return intro('ON LOCATION','港灣實景隨行','從哈瑪星出發，跟著實地拍攝的步行鏡頭看沿途街景。','港灣實景隨行')+
 '<section class="wrap page-body"><iframe title="沿著高雄輕軌散步：現地拍攝" style="width:100%;aspect-ratio:16/9;border:0;background:#182823" src="https://www.youtube-nocookie.com/embed/cwMuB5xZztE" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><p>影片由原作者透過 YouTube 播放。可在播放器調整速度；05:00 到駁二蓬萊區，27:30 到高雄流行音樂中心。拍攝行程與報告踩線範圍僅部分重疊。</p><p><a class="btn dark" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=cwMuB5xZztE">在 YouTube 觀看原片 ↗</a> <a class="btn outline" href="#/explore">進入可操作的 3D 路線</a></p></section>';
}
function explorePage() {
  return `${intro('IMMERSIVE DEMO', '沉浸式運動探索', '用五種移動方式，在原創的風格化港灣場景中觀察同一段空間。', '3D 探索')}
  <div class="wrap page-body"><div class="status-note"><strong>互動示範：</strong>場景與任務位置均為原創示意，與真實路況、坡度、騎乘規範及無障礙設施條件可能不同。</div><div class="game-shell" style="margin-top:22px"><div class="game-top"><div><label for="mobility-mode">移動方式</label> <select id="mobility-mode"><option value="run">跑步</option><option value="walk">健走</option><option value="bike">腳踏車</option><option value="wheelchair">輪椅</option><option value="cane">拐杖／輔具</option></select></div><div class="game-controls"><button id="camera-toggle" type="button">第三人稱</button><button id="quality-toggle" type="button">省電畫質</button><button id="pause-toggle" type="button">暫停</button><button id="reset-game" type="button">重設</button></div></div><div id="game-stage" class="game-stage" aria-label="可操作的 3D 港灣示範場景"><div class="game-overlay"><strong id="game-state">準備探索</strong><div id="game-hint">WASD／方向鍵移動；靠近節點按 E 觀察。</div></div><div class="game-minimap" aria-label="示範場景位置圖"><span id="game-dot" class="game-dot"></span></div><div class="touch-pad" aria-label="觸控移動控制"><button class="up" data-move="forward" aria-label="前進">↑</button><button class="left" data-move="left" aria-label="左轉">←</button><button class="down" data-move="back" aria-label="後退">↓</button><button class="right" data-move="right" aria-label="右轉">→</button></div><button id="touch-interact" class="touch-action" type="button">觀察 E</button></div><p class="game-help">桌面：點擊 3D 畫面後使用 WASD／方向鍵移動，E 觀察；拖曳畫面可轉動視線。手機：使用方向按鍵。操作不會儲存個人資料。</p></div><div class="split" style="margin-top:25px"><div class="section-card"><h2>探索任務</h2><p>每種移動方式都能完成。請觀察環境，而不必比速度。</p><ol id="mission-list" class="mission-list"><li data-mission="rest">找到示範休息區</li><li data-mission="surface">觀察步道鋪面</li><li data-mission="crossing">觀察示範路口與通行空間</li></ol></div><div class="section-card"><h2>目前模式</h2><p id="mode-description" class="mode-description">跑步：較快的步伐，留意鋪面與動線。</p><p class="small muted">第一人稱鏡頭高度是示範設定，不代表所有人的實際視角。3D 體驗不構成無障礙通行或騎乘許可認證。</p><a class="link-arrow" href="#/routes/bay">閱讀非遊戲版場域資訊</a></div></div></div>`;
}

function renderResults() {
  const surveys = publicItems(data['survey-results'], 'survey-results');
  const surveyHost = document.getElementById('survey-results');
  if (surveyHost && surveys.length) {
    surveyHost.className = '';
    surveyHost.replaceChildren();
    for (const result of surveys) {
      const section = document.createElement('section');
      section.className = 'chart';
      const title = document.createElement('h3'); title.textContent = result.title; section.append(title);
      const max = result.unit === '%' ? 100 : Math.max(...result.items.map(item => Number(item.value) || 0), 1);
      for (const item of result.items) {
        if (!Number.isFinite(item.value) || item.value < 0) continue;
        const row = document.createElement('div'); row.className = 'chart-row';
        const label = document.createElement('span'); label.textContent = item.label;
        const track = document.createElement('span'); track.className = 'chart-track';
        const bar = document.createElement('span'); bar.className = 'chart-bar'; bar.style.width = `${Math.min(100, item.value/max*100)}%`;
        const value = document.createElement('strong'); value.textContent = `${item.value}${result.unit || ''}`;
        track.append(bar); row.append(label, track, value); section.append(row);
      }
      const source=document.createElement("p");source.textContent=result.source;section.append(source);if(result.id==='locations')document.querySelector('#survey-highlight').append(section);else surveyHost.append(section);
    }
  }
  const discussions = publicItems(data['community-results'], 'community-results');
  const discussionHost = document.getElementById('discussion-results');
  if (discussionHost && discussions.length) {
    discussionHost.className = '';
    discussionHost.replaceChildren();
    discussions.forEach(item => { const article = document.createElement('article'); const h = document.createElement('h3'); h.textContent = item.title; const p = document.createElement('p'); p.textContent = item.summary; const source=document.createElement("small");source.textContent=item.source;article.append(h,p); discussionHost.append(article); });
  }
  const cards = publicItems(data.gallery, 'gallery').filter(item => safeImagePath(item.image));
  const gallery = document.getElementById('gallery');
  if (!gallery || !cards.length) return;
  gallery.className = 'gallery-grid'; gallery.replaceChildren();
  const dialog = document.getElementById('gallery-dialog');
  let index = 0;
  function show(i) { index = (i + cards.length) % cards.length; const item = cards[index]; const img = document.getElementById('gallery-large'); img.src = item.image; img.alt = item.alt; document.getElementById('gallery-title').textContent = item.title; document.getElementById('gallery-description').textContent = item.description; if (!dialog.open) dialog.showModal(); }
  cards.forEach((item, i) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'gallery-card'; const img = document.createElement('img'); img.src = item.image; img.alt = item.alt; const title = document.createElement('strong'); title.textContent = item.title; const summary = document.createElement('span'); summary.textContent = item.summary; button.append(img,title,summary); button.addEventListener('click',()=>show(i)); gallery.append(button); });
  document.getElementById('gallery-close').onclick = () => dialog.close();
  document.getElementById('gallery-prev').onclick = () => show(index - 1);
  document.getElementById('gallery-next').onclick = () => show(index + 1);
  let startX = 0;
  dialog.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
  dialog.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1)); }, {passive:true});
}

function render() {
  dispose(); dispose = () => {};
  const requested = (location.hash.slice(1) || '/').replace(/\/$/, '') || '/';
  const midLeg = requested.match(/^\/explore\/walk\/mid\/([1-9])$/);
  const exitId=requested.startsWith('/explore/station/')?requested.slice('/explore/station/'.length):null;
  const entrance=stationExitById.get(exitId);
  const sectionLink=requested.match(/^\/explore\/run\/([^/]+)\/from\/([^/]+)$/);
  const path = sectionLink ? '/explore/run/'+sectionLink[1] : entrance ? '/explore' : midLeg ? '/explore/walk' : requested;
  const pages = { '/': home, '/map': recommendationsPage, '/map/resources': recommendationsPage, '/routes/bay': routePage, '/explore/film': filmPage, '/explore/activity': explorePage, '/explore/short': explorePage, '/explore/walk': explorePage, '/explore': explorePage, '/community': communityPage, '/about/contact': aboutPage, '/about': aboutPage };
  const previewId=path.startsWith('/explore/run/')?path.slice(13):null;const preview=!entrance&&(path==='/explore'||previewId);const chosen=catalog.routes.find(r=>r.variantId===previewId)||catalog.routes[0];
  const recommendedId=path.startsWith('/run/')?path.slice(5):null;
  const routeId = path.startsWith('/routes/') ? path.slice('/routes/'.length) : null;
  const extraRoute = routeId && routeId !== 'bay' ? data.routes.find(item => item.id === routeId && item.status === 'verified' && item.published && item.verifiedAt) : null;
  app.innerHTML = shell(path, preview ? previewPage(catalog,chosen) : recommendedId ? recommendationsPage() : pages[path] ? pages[path]() : extraRoute ? genericRoutePage(extraRoute) : `${intro('404', '找不到這個頁面', '請回首頁繼續探索。')}<div class="wrap page-body"><a class="btn dark" href="#/">返回首頁</a></div>`);
  const toggle = document.getElementById('menu-toggle');
  toggle.addEventListener('click', () => { const nav = document.getElementById('nav-links'); const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單'); });
  document.querySelectorAll('#nav-links a').forEach(a => a.addEventListener('click', () => { document.getElementById('nav-links').classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }));
  if (path === '/routes/bay' || extraRoute) dispose = mountMap(data, { compact: path !== '/map' });
  if (path === '/routes/bay') {
    const clearBase = dispose, clearReport = reportMap(data.routes.find(r=>r.id==='bay'));
    dispose = () => { clearBase(); clearReport(); };
  }
  if(path==='/map'||path==='/map/resources'||recommendedId) dispose=mountRecommendations(recommendedId||(path==='/map/resources'?'harbor-108':null),path==='/map/resources');
  if(preview)dispose=mountPreview(catalog,chosen,sectionLink?.[2]);
  const isGame=[...(entrance?['/explore']:[]),'/explore/activity','/explore/short','/explore/walk'].includes(path);
  if (isGame) {
    document.querySelector('.status-note').innerHTML = '<a href="#/explore/walk">十站連續步行</a> · <a href="#/explore/short">港灣去程練習</a> · <a href="#/explore/activity">港灣完整往返</a> · <a href="#/explore/station/O1-2">從街口走近捷運出口</a><p>3D 場景依地圖與街景建模。建物細節、尺度及通行空間為示意。</p>';
    document.querySelector('#mission-list').innerHTML='<li>從哈瑪星出發，沿紅線走訪港灣。</li><li>在去程末端觀察折返方向。</li><li>全程模式沿回程路徑返回哈瑪星。</li>';
    document.querySelector('.game-help').textContent='點選畫面後用 WASD 或方向鍵移動及轉向，手機可按住方向鍵。按 E 或「觀察」可觀看鄰近地標全景，再按一次或前進即可返回。';
    document.querySelector('.game-shell').before(friendlyDirectory());
    dispose = ride(path.endsWith('/short'),path.endsWith('/walk'),midLeg ? Number(midLeg[1])-1 : null,entrance);
  }


  if(isGame)document.querySelector('.game-shell').after(notesSection('explore'));
  if (path === '/community') renderResults();
  window.scrollTo(0, 0);
  if(path==='/about/contact') document.getElementById('contact').focus();
  if(path==='/explore/walk'||entrance)document.querySelector('#game-stage')?.scrollIntoView({block:'center'});
  document.title = `${path === '/' ? '跑出你的高雄' : preview ? chosen.name+' · 3D 探索' : document.querySelector('main h1')?.textContent || '跑出你的高雄'}｜友善跑步地圖`;
}

try {
  [data,catalog]=await Promise.all([loadData(),fetch('data/recommendations.json?v=services-20261127').then(r=>r.json())]);
  if (!data.routes.some(route => route.id === 'bay')) throw new Error('缺少駁二示範場域');
  addEventListener('hashchange', render);
  render();
} catch (error) {
  app.innerHTML = `<main id="main" tabindex="-1" class="wrap page-body"><h1 style="font-size:2.5rem">資料暫時無法載入</h1><p id="load-error"></p><p>請稍後重新整理頁面。</p></main>`;

  console.error(error);
}








