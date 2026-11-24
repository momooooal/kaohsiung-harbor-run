# 高雄友善跑步地圖｜成果報告版

以 HTTP 啟動本目錄。首頁為 #/，報告成果為 #/community，報告圖 46 可在 #/map 拖曳縮放。#/explore/short 提供哈瑪星至去程折返點的連續練習；#/explore 提供包含回程的完整踩線體驗。里活動中心到捷運站的步行集合段依文字另行說明。

js/track.js 保存依圖 46 描繪的像素轉折序列。js/report.js 使用同一路線建置去程和完整往返模型並載入 assets/report-route.jpg。這組相對位置不可轉用為導航座標。既有 js/explore.js 供應各模式角色與運動參數。地圖中的地理底圖仍以示意焦點標示場域。報告第 33 頁表 19 為當日服務紀錄，尚無常態合作公開資料。

本版以三組問卷資料及一組座談摘要更新 data 檔案。圖 46 來源為使用者提供之成果報告；公開發布前請確認其圖資轉載條件。
## 目錄

```text
index.html                  單一靜態入口與 Hash Router
assets/                     設計樣式、照片、Leaflet、Three.js
js/main.js                  頁面、導覽、成果圖卡與圖表
js/map.js                   Leaflet 地圖、路線切換與設施篩選
js/explore.js               3D 場景、角色與操作
js/data.js                  資料載入與公開條件
data/routes.json            路線及場域
data/facilities.json        公共設施
data/stores.json            合作店家
data/survey-results.json    已確認問卷結果
data/community-results.json 已確認座談成果
data/gallery.json           成果圖卡
data/schemas.json           資料欄位清單
scripts/validate.mjs        資料與資源檢查
.github/workflows/pages.yml GitHub Pages 部署
```

## 本機執行與檢查

在專案根目錄執行：

```powershell
node scripts/validate.mjs
node scripts/test-logic.mjs
node scripts/test-map.mjs
python -m http.server 8000
```

再開啟 `http://localhost:8000/`。不要直接以 `file://` 開啟，因為瀏覽器會限制 JSON 載入。網站不需 npm 安裝或建置；Leaflet 與 Three.js 已存放在 `assets/`。地圖底圖和 Google Fonts 需要網路；離線時仍可閱讀文字資訊，地圖底圖可能無法顯示。

11 月 4 日原型已通過資料／資源檢查、JavaScript 語法檢查、3D 場景與五模式模型建構、移動邊界及座位碰撞測試、地圖路線切換／資訊卡同步／設施篩選測試。亦使用瀏覽器實際檢查桌面首頁、地圖與 3D 畫面，以及 390px 手機首頁、導覽、地圖與 3D 控制。地圖底圖瓦片正常載入；切換全市總覽後資訊卡同步歸零，返回駁二後恢復示範場域資訊；縮放及篩選有效。3D 的五種角色模式、視角切換、暫停、重設均可操作；聚焦畫布後按住 W，角色位置提示確實前進。公民成果與計畫介紹頁正常載入，內頁重新整理仍可使用。測試期間 Console 未見錯誤，390px 寬度沒有水平溢出。

交付截圖位於專案上一層的 `kaohsiung-run-map-desktop.png` 與 `kaohsiung-run-map-mobile.png`。這些是首頁首屏截圖。發布到 GitHub Pages 後，仍需在正式網址檢查部署工作流程、子路徑重新整理、實體手機觸控手感與不同瀏覽器的 WebGL 表現。

## GitHub Pages 部署

1. 將**本目錄內容**放在 GitHub 儲存庫根目錄，推送到 `main` 分支。勿只上傳外層 `outputs` 目錄。
2. 在儲存庫 **Settings → Pages → Build and deployment** 選擇 **GitHub Actions**。
3. 推送後 `.github/workflows/pages.yml` 會先執行資料檢查，再部署靜態檔案。
4. 網站可位於 `https://使用者.github.io/儲存庫名稱/`；連結採 `#/map` 等形式，能在子路徑重新整理。
5. 發布前檢查照片授權、所有資料來源與查核日期，並由計畫方確認主辦單位及正式對外文案。

網站沒有 API Key、後端或可提交的推薦表單。民眾輸入不會被假裝儲存。

## 未來更新資料

所有資料為 JSON 陣列。先取得廠商原始資料與授權，核對座標、名稱、服務、日期與公開同意後，再更新對應檔案。新增一筆資料時必須使用唯一 `id`，填入 `source`、`verifiedAt`（YYYY-MM-DD）、`updatedAt`（YYYY-MM-DD）、`status` 與 `published`。上線前執行 `node scripts/validate.mjs` 並在桌面、手機檢查頁面。

### 新增路線／場域

編輯 `data/routes.json`。填入 `id`（小寫英數與連字號）、`name`、`center`（`[緯度, 經度]`）、`summary`、`source` 等欄位。`path` 是查核後的 `[[緯度,經度], ...]` 座標序列；`distanceKm` 僅填經確認的長度。可選填 `image`（`assets/` 下的相對路徑）、`imageAlt`、`traffic`。未確認時維持 `null`、`status: "pending"`、`published: false`。已查核且允許公開時設 `status: "verified"`、`published: true`、`verifiedAt`，地圖選單與通用路線詳細頁會自動新增此路線，地圖會繪出軌跡。目前駁二資料為 `demo`，僅顯示示意焦點。若供應商提供 GPX，須先確認軌跡與距離，轉成 `path` 後才發布。

### 新增設施

編輯 `data/facilities.json`。依 `data/schemas.json` 的 `facility` 欄位填入名稱、`category`、`lat`、`lng`、`routeIds`、來源與查核日期。`category` 必須對應頁面的 12 個篩選類別之一。只有 `verified` 且 `published: true` 並有 `verifiedAt` 的點位會公開。查核前請保留 `pending` 與 `published: false`。

### 新增合作店家

編輯 `data/stores.json`。依 `store` 欄位填寫店名、分店、地址、座標、所屬路線、服務、優惠限制、營業時間、聯絡方式、資料來源、查核日期及更新日期。店家須已確認合作並同意公開，設 `cooperationConfirmed: true`、`status: "verified"`、`published: true` 才會顯示於地圖。推薦或待洽談店家不可直接變成公開合作店家。**目前此檔為空陣列**。

### 新增問卷、座談及圖卡

- `data/survey-results.json`：每個結果有 `title`、`question`、`unit`、`items`（`[{"label":"選項名稱","value":正式數值}]`），並附來源與查核日期；頁面會產生可閱讀的長條圖。不要加入測試百分比。
- `data/community-results.json`：座談或後續成果的 `title`、`summary`、`body`、來源及公開狀態。
- `data/gallery.json`：成果圖卡的 `title`、`summary`、`image`、`alt`、`description`、來源及公開狀態。圖片放在 `assets/`，`image` 使用 `assets/檔名.jpg` 等相對路徑。公開後自動出現縮圖、放大檢視、前後切換與手機滑動。

## 3D 操作

桌面使用 WASD／方向鍵移動、E 觀察、拖曳 3D 畫面轉向；手機使用畫面上的方向鍵與「觀察」。可切換跑步、健走、腳踏車、輪椅、拐杖／輔具及第一／第三人稱；有暫停、重設、省電畫質。三個任務都在原創示範場景內，所有模式均可完成。不支援 WebGL 時提供非遊戲場域頁連結。

## 原始檔審查與處理

原始 `code_artifact.html` 約 733 KB，將全市地圖、店家、圖表與照片模擬器堆在單頁。它包含未經提供的公里數、設施及店家數、問卷百分比、店家優惠與引力推算，還把固定照片縮放描述成 Google 實景試跑。本重構未沿用這些資料、照片模擬器或假表單；保留 Leaflet 地圖與 Three.js 3D 的可行技術方向，改為分頁、獨立資料檔及明確空狀態。

## 授權與來源

- 港灣照片：[KaohsiungHarbour4515](https://commons.wikimedia.org/wiki/File:Kaohsiung_Harbour_-_KaohsiungHarbour4515.jpg)、[KaohsiungHarbour4478](https://commons.wikimedia.org/wiki/File:Kaohsiung_Harbour_-_KaohsiungHarbour4478.jpg)，lumoplank，CC0 1.0。
- 地圖底圖：© [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)。請遵守瓦片使用政策；若正式網站流量增加，應改用合適的地圖瓦片服務。
- Leaflet 1.9.4（BSD 2-Clause）與 Three.js r128（MIT）：原始碼與授權文字分別位於 `assets/leaflet.js`、`assets/three.min.js`、`assets/LEAFLET-LICENSE.txt`、`assets/THREE-LICENSE.txt`。發布前可依正式維護政策更新版本。
- 字體：Google Fonts Noto Sans TC；無法載入時使用系統字體。

## 已知限制

- 精確 GPX、常態合作店家與經查核的設施座標待提供。
- 全程模型依報告圖描線，角色受步道兩側邊界限制。建物、鋪面與高程均為示意。
- 地圖瓦片需連網，可能受 OpenStreetMap 服務負載限制。此版不使用 Google Street View API。


## 沿途地標
在完整路線上使用 E 或觸控「觀察」鍵可切換地標全景。地標分為哈瑪星鐵道意象、鹽埕綠廊道、真愛碼頭雙帆及高流高低塔。js/landmarks.js 管理模型、路線錨點與來源網址；來源與示意範圍也可在遊戲畫面下方展開閱讀。

## 步道材質與實景參考（11 月 23 日更新）
第一人稱 3D 場景使用 Poly Haven 的 CC0 素材：herringbone_pavement、aerial_grass_rock、brick_wall_001、tree_small_02 及 docklands_02（https://polyhaven.com/a/ 加上素材名稱即可查看原始頁）。植栽為從來源模型渲染的透明貼圖；Docklands 影像作通用遠景，不代表高雄現地天際線。近景步道、模型與布置為示意。實拍步行影片在 #/explore/film 使用原平台播放器，高雄旅遊網環景由官方網站提供。兩者需連網。真正可任意移動的全程現地重建仍需沿線拍攝與定位的授權素材。
