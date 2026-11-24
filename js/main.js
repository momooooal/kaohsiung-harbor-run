import {notesSection} from './field-notes.js';
import {reportMap,ride} from './report.js';
import { loadData, publicItems, safeImagePath } from './data.js';
import { mountMap } from './map.js';
import { mountExplore } from './explore.js';

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
  return `<div class="prototype-band">網站互動原型｜示範場景與地圖焦點並非現地查核結果</div>
    <header class="site-header"><div class="wrap header-row"><a class="brand" href="#/" aria-label="跑出你的高雄，回首頁">${logo}<span>跑出你的高雄<small>友善跑步地圖 · 互動原型</small></span></a><button class="menu-toggle" id="menu-toggle" aria-label="開啟選單" aria-expanded="false" aria-controls="nav-links">☰</button><nav class="nav-links" id="nav-links" aria-label="主要導覽">${nav}</nav></div></header>
    <main id="main" tabindex="-1">${content}</main>
    <footer class="site-footer"><div class="wrap"><div class="footer-grid"><div><div class="eyebrow light">KAOHSIUNG · MOVE TOGETHER</div><h3>跑出你的高雄</h3><p>從市民需求出發，逐步建立更清楚的城市運動資訊。本網站為互動原型，正式路線、設施、合作店家與調查結果須經確認後發布。</p></div><div><h3>探索網站</h3><div class="footer-links">${links.slice(1).map(([p,l])=>`<a href="${href(p)}">${l}</a>`).join('')}<a href="#/routes/bay">駁二示範場域</a></div></div><div><h3>資料與素材</h3><p class="small">目前狀態：成果報告已完成；本版資料更新：2026-11-24。計畫主辦：高雄市政府運動發展局（成果報告第 6 頁）。</p><p class="small">照片：<a href="https://commons.wikimedia.org/wiki/File:Kaohsiung_Harbour_-_KaohsiungHarbour4515.jpg" target="_blank" rel="noopener">lumoplank / Wikimedia Commons</a>（CC0）<br>地圖：© OpenStreetMap contributors</p></div></div><div class="footer-bottom">© 2026 跑出你的高雄 · 示範原型。3D 場景為原創風格化示意，與現地路況、坡度及無障礙條件可能不同。</div></div></footer>`;
}

function intro(label, title, description, crumb) {
  return `<section class="page-intro"><div class="wrap"><div class="breadcrumbs"><a href="#/">首頁</a> / ${crumb || title}</div><div class="eyebrow">${label}</div><h1>${title}</h1><p class="lead">${description}</p></div></section>`;
}

function home() {
  return `<section class="hero"><div class="wrap hero-content"><div class="eyebrow light">KAOHSIUNG · CITY IN MOTION</div><h1>跑出你的<br>高雄</h1><p class="lead">探索城市路線，發現更多友善運動的可能。</p><div class="hero-actions"><a class="btn primary" href="#/map">開始探索 <span aria-hidden="true">↗</span></a><a class="btn outline" href="#/explore">體驗沉浸式試跑 <span aria-hidden="true">↗</span></a></div></div><div class="wrap hero-foot"><span class="scroll-cue">往下滑，認識這座城市 ↓</span><span>駁二 × 亞洲新灣區 · 首波示範場域</span></div></section>
  <section class="section feature-section" id="discover"><div class="wrap"><div class="section-heading"><div class="eyebrow">01 / FOUR WAYS TO EXPLORE</div><h2>從這裡開始，<br>找到你的探索方式。</h2><p class="lead muted">看地圖、走進 3D 場景，或了解這張地圖如何由市民一起構想。</p></div><div class="feature-grid">
    <a class="feature-card" href="#/map"><div class="art map-art"><span class="route-line"></span><span class="pin"></span></div><div class="copy"><div class="num">01 / MAP</div><h3>探索友善地圖</h3><p>找一條適合自己的路線，看看沿途有哪些友善設施。</p><span class="go" aria-hidden="true">↗</span></div></a>
    <a class="feature-card" href="#/explore"><div class="art game-art"><span class="sun"></span><span class="building"></span><span class="runner"></span></div><div class="copy"><div class="num">02 / EXPERIENCE</div><h3>沉浸式運動探索</h3><p>出發前，先用不同視角體驗城市運動空間。</p><span class="go" aria-hidden="true">↗</span></div></a>
    <a class="feature-card" href="#/community"><div class="art community-art"><span class="bars"></span><span class="dot"></span></div><div class="copy"><div class="num">03 / COMMUNITY</div><h3>公民共創成果</h3><p>從市民的想法出發，一起打造更友善的運動城市。</p><span class="go" aria-hidden="true">↗</span></div></a>
    <a class="feature-card" href="#/about"><div class="art about-art"></div><div class="copy"><div class="num">04 / THE PROJECT</div><h3>認識友善跑步計畫</h3><p>了解這張地圖如何從市民需求一步步誕生。</p><span class="go" aria-hidden="true">↗</span></div></a>
  </div></div></section>
  <section class="section bay-section"><div class="wrap bay-grid"><div class="bay-image"><img src="assets/kaohsiung-pier.jpg" alt="高雄港灣與城市天際線實景" loading="lazy"><a class="map-peek" href="#/map" aria-label="開啟駁二場域示意地圖"><span class="map-peek-art" aria-hidden="true"><i></i></span><strong>場域地圖預覽 <small>示意焦點 · 非正式路徑</small></strong><span aria-hidden="true">↗</span></a><span class="photo-credit">lumoplank / Wikimedia Commons · CC0</span></div><div class="bay-copy"><div class="eyebrow">02 / FIRST DEMONSTRATION AREA</div><h2>駁二 ×<br>亞洲新灣區</h2><p class="lead">從港灣到城市，先認識第一個示範場域。</p><p>從哈瑪星出發，經鹽埕綠廊道與真愛碼頭探索港灣。成果報告記載踩線約 4.5 公里，可在場域頁查看圖 46。</p><div class="info-rule">地圖圓形僅為示意焦點，並非正式路徑或可通行範圍。</div><div class="bay-actions"><a class="btn dark" href="#/routes/bay">查看場域介紹 ↗</a><a class="btn outline" href="#/explore">進入 3D 探索 ↗</a></div></div></div></section>
  <section class="section explore-promo"><div class="wrap explore-grid"><div><div class="eyebrow light">03 / MOVE IN YOUR OWN WAY</div><h2>同一座城市，<br>不同的移動視角。</h2><p class="lead">在原創 3D 示範場景中，切換移動方式與第一、第三人稱，觀察空間中的不同細節。</p><div class="mode-strip" aria-label="體驗模式"><span>跑步</span><span>健走</span><span>腳踏車</span><span>輪椅</span><span>拐杖／輔具</span></div><a class="btn primary" href="#/explore">進入沉浸式探索 ↗</a></div><div class="scene-preview" role="img" aria-label="原創風格化港灣步道場景示意圖"><span class="scene-sun"></span><span class="scene-person"></span><span class="scene-label">互動示範 · 非真實路況</span></div></div></section>
  <section class="section progress-section"><div class="wrap"><div class="section-heading"><div class="eyebrow">04 / THE PROCESS</div><h2>市民的想法，<br>正在成為下一步。</h2><p class="lead muted">問卷共取得 519 份有效樣本，座談後亦辦理港灣踩線。</p></div><div class="progress-list"><div class="progress-step"><span class="step-no">01</span><h3>線上需求問卷</h3><p>已完成</p></div><div class="progress-step"><span class="step-no">02</span><h3>實體座談會</h3><p>已完成</p></div><div class="progress-step"><span class="step-no">03</span><h3>意見彙整</h3><p>已完成</p></div><div class="progress-step pending"><span class="step-no">04</span><h3>成果報告</h3><p>已完成</p></div></div><p style="margin-top:36px"><a class="link-arrow" href="#/community">了解公民共創進度</a></p></div></section>`;
}

function mapPage() {
  return `${intro('INTERACTIVE MAP', '探索友善地圖', '從駁二 × 亞洲新灣區開始。拖曳與縮放地圖，查看已公開的場域與服務資料。', '友善地圖')}
  <div class="wrap page-body"><div class="status-note"><strong>資料狀態：</strong>地圖只顯示已公開資料；示範場域的圓形是示意焦點，並非正式路徑或邊界。</div><div class="page-grid" style="margin-top:22px"><div><div class="map-toolbar"><label for="map-selection"><strong>地圖範圍</strong></label><select id="map-selection"><option value="bay">駁二 × 亞洲新灣區</option><option value="all">全市總覽</option></select><span class="small muted">可拖曳、縮放；使用地圖上的＋／－縮放</span></div><div id="map-canvas" class="map-frame" aria-label="互動式地圖"></div><p class="small muted" style="margin-top:9px">底圖 © OpenStreetMap contributors。示意焦點不是正式路線或場域邊界。</p><div class="panel" style="margin-top:20px"><h2>設施篩選</h2><p class="small muted">類別已建置。未經確認的設施不會出現在地圖上；取得資料後可依類別篩選。</p><div id="facility-filters" class="filter-grid"></div><p id="map-visible-count" class="small" aria-live="polite" style="margin:15px 0 0"></p></div></div><aside class="panel"><span class="pill warning" id="map-info-status">示範場域</span><h2 id="map-info-title" style="margin-top:15px">駁二 × 亞洲新灣區</h2><p id="map-info-summary"></p><ul class="info-list"><li><span>正式路徑</span><strong id="map-info-path">待確認</strong></li><li><span>路線距離</span><strong id="map-info-length">待確認</strong></li><li><span>合作店家</span><strong id="map-info-stores">資料待更新</strong></li></ul><a id="map-nav-link" class="btn dark" target="_blank" rel="noopener" href="#">導航至示意焦點 ↗</a><p class="small muted">示範場域的導航目標是照片參考座標，並非路線起點。出發前請自行查核現地通行條件。</p><a id="map-detail-link" class="link-arrow" href="#/routes/bay">閱讀場域介紹</a><div id="store-list" class="empty-box" style="margin-top:24px">沿線服務清單待合作店家與公共設施查核後更新。</div></aside></div></div>`;
}

function routePage() {
  const bay = data.routes.find(item => item.id === 'bay');
  if (bay?.status === 'verified' && bay.published && bay.verifiedAt) return genericRoutePage(bay);
  return `${intro('DEMONSTRATION AREA', '駁二 × 亞洲新灣區', '港灣、水岸與城市景觀，是首波示範場域的探索起點。', '駁二 × 亞洲新灣區')}
  <div class="wrap page-body"><img class="route-hero-photo" src="assets/kaohsiung-pier.jpg" alt="高雄港灣與城市景觀"><p class="small muted">照片：lumoplank / Wikimedia Commons（CC0）。照片僅呈現場域氛圍，非路況查核影像。</p><div class="split" style="margin:28px 0"><div class="section-card"><h2>場域介紹</h2><p>駁二與亞洲新灣區是本網站第一個示範主題。互動地圖標示場域焦點，協助探索港灣周邊；報告記載活動踩線約 4.5 公里。精確 GPX 尚待取得。</p><span class="pill warning">正式路徑待確認</span></div><div class="section-card"><h2>出發前請留意</h2><p>目前不提供沿線飲水、廁所、AED、無障礙或騎乘許可的現地保證。請依現場標示與最新資訊規劃行程。</p><a class="link-arrow" href="#/explore">先看 3D 互動示範</a></div></div><div class="split"><div><h2>地圖預覽</h2><div id="map-canvas" class="map-frame" aria-label="駁二示範場域地圖"></div><div style="display:none"><select id="map-selection"><option value="bay">駁二</option></select><div id="map-info-title"></div><div id="map-info-summary"></div><div id="map-info-status"></div><div id="map-info-length"></div><a id="map-nav-link"></a><div id="map-visible-count"></div></div><p class="small muted">虛線圓形僅為示意焦點。底圖 © OpenStreetMap contributors。</p></div><div><div class="section-card"><h2>後續資料欄位</h2><ul class="info-list"><li><span>活動踩線里程（報告）</span><strong>約 4.5 公里</strong></li><li><span>公共設施</span><strong>待查核</strong></li><li><span>合作店家</span><strong>待確認</strong></li><li><span>交通資訊</span><strong>待查核</strong></li></ul><p class="small muted">資料核准公開後，將同步出現在地圖與服務清單。</p><a class="btn dark" href="#/map">開啟完整地圖 ↗</a></div><div id="store-list" class="empty-box" style="margin-top:18px">合作店家清單待確認。</div></div></div></div>`;
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

function communityPage() {
  return `${intro('COMMUNITY IN ACTION', '公民共創成果', '從跑者、運動民眾與店家代表的想法出發，一起整理城市運動需求。', '公民共創成果')}
  <div class="wrap page-body"><div class="status-note"><strong>519 份有效問卷、32 人參與座談。</strong>問卷涵蓋跑者端與店家端兩種對象；座談以三桌換桌討論，整理選線、店家與公共服務需求。（第 3、19 頁）</div><div class="split" style="margin-top:28px"><div class="section-card"><h2>計畫背景</h2><p>線上問卷與實體座談蒐集運動路線、公共服務、友善店家及地圖資訊等需求，作為後續規劃參考。這些是調查主題，尚非調查結論。</p></div><div class="section-card"><h2>公民參與歷程</h2><div class="timeline"><article><strong>線上需求問卷 · 已完成</strong></article><article><strong>實體公民座談 · 已完成</strong></article><article><strong>意見彙整 · 已完成</strong></article><article><strong>成果報告 · 已完成</strong></article></div></div></div><div class="community-findings" style="margin-top:22px"><div class="section-card"><h3>問卷成果</h3><p>資料依成果報告整理，複選題的比例可重疊。</p><div id="survey-results" class="empty-box">尚未取得正式問卷結果。</div></div><div class="section-card"><h3>座談會成果</h3><div id="discussion-results" class="empty-box">座談成果報告已完成。</div></div><div class="section-card"><h3>路線推薦成果</h3><div class="empty-box">座談參與者推薦愛河、衛武營、美術館、中山大學—西子灣、旗津，以及哈瑪星—美術館。這些是市民提案，路徑與設施仍待現勘。（第 26 頁，表 17）</div></div></div><section style="margin-top:55px"><div class="section-heading"><div class="eyebrow">RESULT CARDS</div><h2>成果圖卡</h2><p>依報告數據重繪，點選圖卡可放大閱讀。</p></div><div id="gallery" class="empty-box">成果圖卡尚未發布。</div></section><section style="margin-top:55px"><h2>後續辦理進度</h2><p>報告列出清晨盥洗、夜間照明及運動中心服務等待追蹤事項。後續須與場地方確認條件，核實後才會加入地圖。（第 26 頁，表 18）</p><a class="link-arrow" href="#/about">了解計畫背景</a></section><dialog id="gallery-dialog" class="dialog" aria-label="成果圖卡放大檢視"><button type="button" id="gallery-close" class="btn dark">關閉</button><img id="gallery-large" alt=""><h3 id="gallery-title"></h3><p id="gallery-description"></p><div class="dialog-controls"><button type="button" class="btn outline" id="gallery-prev">← 上一張</button><button type="button" class="btn outline" id="gallery-next">下一張 →</button></div></dialog></div>`;
}

function aboutPage() {
  return `${intro('ABOUT THE PROJECT', '認識友善跑步計畫', '這張地圖從蒐集市民需求開始，逐步建立可信、可更新的運動資訊。', '計畫介紹')}
  <div class="wrap page-body"><div class="split"><div><h2>從需求出發</h2><p class="lead">計畫配合高雄市政府運動發展局推動的「高雄市友善跑步地圖」公民參與工作。問卷與座談蒐集跑者、跑團、運動民眾及店家代表的想法，作為規劃參考。</p><p>目前成果報告已收錄問卷、座談與踩線活動。常態合作店家名單及全市路線仍待查核。</p></div><div class="section-card"><h2>目前網站進度</h2><ul class="info-list"><li><span>網站外觀與互動</span><strong>原型</strong></li><li><span>首波示範場域</span><strong>駁二 × 亞洲新灣區</strong></li><li><span>正式路線</span><strong>待查核</strong></li><li><span>合作店家</span><strong>待確認</strong></li><li><span>公民參與成果</span><strong>報告已完成</strong></li></ul></div></div><section style="margin-top:60px"><div class="eyebrow">WHAT PEOPLE WERE ASKED</div><h2>需求調查關注什麼？</h2><div class="about-list"><article><strong>01 公共服務</strong><span>路線資訊、飲水、廁所、置物、休息、遮陽、照明、AED 與其他運動途中需求。</span></article><article><strong>02 合作店家</strong><span>飲水、借用廁所、充電、寄物、補給及可能的跑友優惠。</span></article><article><strong>03 地圖資訊</strong><span>路線、設施、觀光、大眾運輸、停車與多元友善空間等資訊需求。</span></article><article><strong>04 市民提案</strong><span>推薦路線與店家，以及友善店家是否影響路線選擇。</span></article></div><p class="small muted">以上為問卷蒐集的主題，並非已完成的調查結論。</p></section><section class="section-card" style="margin-top:40px"><h2>資料如何發布？</h2><p>路線、設施、店家與成果資料分開管理。正式頁面只顯示來源、查核日期、合作狀態與公開狀態均符合要求的紀錄。沒有資料時保留明確空狀態。</p><a class="btn dark" href="#/map">前往互動地圖 ↗</a></section></div>`;
}

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
      const source=document.createElement("p");source.textContent=result.source;section.append(source);surveyHost.append(section);
    }
  }
  const discussions = publicItems(data['community-results'], 'community-results');
  const discussionHost = document.getElementById('discussion-results');
  if (discussionHost && discussions.length) {
    discussionHost.className = '';
    discussionHost.replaceChildren();
    discussions.forEach(item => { const article = document.createElement('article'); const h = document.createElement('h3'); h.textContent = item.title; const p = document.createElement('p'); p.textContent = item.summary; const source=document.createElement("small");source.textContent=item.source;article.append(h,p,source); discussionHost.append(article); });
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
  const path = (location.hash.slice(1) || '/').replace(/\/$/, '') || '/';
  const pages = { '/': home, '/map': mapPage, '/routes/bay': routePage, '/explore/film': filmPage, '/explore/short': explorePage, '/explore': explorePage, '/community': communityPage, '/about': aboutPage };
  const routeId = path.startsWith('/routes/') ? path.slice('/routes/'.length) : null;
  const extraRoute = routeId && routeId !== 'bay' ? data.routes.find(item => item.id === routeId && item.status === 'verified' && item.published && item.verifiedAt) : null;
  app.innerHTML = shell(path, pages[path] ? pages[path]() : extraRoute ? genericRoutePage(extraRoute) : `${intro('404', '找不到這個頁面', '請回首頁繼續探索。')}<div class="wrap page-body"><a class="btn dark" href="#/">返回首頁</a></div>`);
  const toggle = document.getElementById('menu-toggle');
  toggle.addEventListener('click', () => { const nav = document.getElementById('nav-links'); const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單'); });
  document.querySelectorAll('#nav-links a').forEach(a => a.addEventListener('click', () => { document.getElementById('nav-links').classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }));
  if (path === '/map' || path === '/routes/bay' || extraRoute) dispose = mountMap(data, { compact: path !== '/map' });
  if (path === '/map' || path === '/routes/bay') {
    const clearBase = dispose, clearReport = reportMap();
    dispose = () => { clearBase(); clearReport(); };
  }
  if (path === '/explore' || path === '/explore/short') {
    document.querySelector('.status-note').innerHTML = '依報告圖 46 描繪，場景比例、路寬與街景為示意。 <a href="#/explore/short">去程練習</a> · <a href="#/explore">完整往返</a>';
    document.querySelector('#mission-list').innerHTML='<li>從哈瑪星出發，沿紅線走訪港灣。</li><li>在去程末端觀察折返方向。</li><li>全程模式沿回程路徑返回哈瑪星。</li>';
    document.querySelector('.game-help').textContent='點選畫面後用 WASD 或方向鍵移動及轉向，手機可按住方向鍵。按 E 或「觀察」可觀看鄰近地標全景，再按一次或前進即可返回。';
    dispose = ride(path.endsWith('/short'));
  }
  if(path==='/about')document.querySelector('.page-intro').after(notesSection('about'));
  if(path==='/map')document.querySelector('#main').append(notesSection('map'));
  if(path==='/explore'||path==='/explore/short')document.querySelector('.game-shell').after(notesSection('explore'));
  if (path === '/community') renderResults();
  window.scrollTo(0, 0);
  document.title = `${path === '/' ? '跑出你的高雄' : document.querySelector('.page-intro h1')?.textContent || '跑出你的高雄'}｜友善跑步地圖互動原型`;
}

try {
  data = await loadData();
  if (!data.routes.some(route => route.id === 'bay')) throw new Error('缺少駁二示範場域');
  addEventListener('hashchange', render);
  render();
} catch (error) {
  app.innerHTML = `<main id="main" tabindex="-1" class="wrap page-body"><h1 style="font-size:2.5rem">資料暫時無法載入</h1><p id="load-error"></p><p>請透過本機 HTTP 伺服器開啟網站，或檢查 JSON 檔案。</p></main>`;
  document.getElementById('load-error').textContent = error.message;
  console.error(error);
}








