# Google Maps 設定與驗收

友善地圖已改用 `js/google-route-map.js` 的 Maps JavaScript API 介接，不使用非正式 Google 圖磚，也不把 Leaflet 外連當 Google 底圖。**目前沒有 API key / Map ID，所以 Google 實際底圖尚未啟用或驗收。** 前台會顯示「地圖暫時無法載入」、重試、外連及可操作資源清單。

## 需由帳號管理者完成的設定

1. 在 Google Cloud 選擇要使用的專案，確認是否已有 Maps Platform 帳務。網站開發不會代為開通付費帳務；請由帳號管理者決定。
2. 啟用 **Maps JavaScript API**。這次沒有使用 Places API 或 Routes API，不需要為此啟用它們。
3. 建立供網站使用的瀏覽器 API key。Application restrictions 選 **Websites (HTTP referrers)**，加入 `https://momooooal.github.io/*`。瀏覽器常僅傳 origin，勿只依 `/kaohsiung-harbor-run/` 路徑限制。需要本機測試時另用開發 key，允許 `http://127.0.0.1:8784/*`。
4. API restrictions 選 **Restrict key → Maps JavaScript API**。設定用量配額、預算通知；預算通知不是自動費用上限。
5. 建立 JavaScript 類型的 Map ID（Advanced Markers 使用）。正式站不用 DEMO_MAP_ID。
6. 在 `data/google-maps-config.json` 填入 `apiKey` 與 `mapId`。瀏覽器 key 會被公開下載，必須先加來源與 API 限制；不可使用伺服器私密金鑰。
7. 執行 `npm test`、`npm run validate`，本機預覽測試後提交 main。Pages 部署成功，再正式站檢查 Google Logo／署名、拖曳縮放、六路線範圍、雙向清單標記同步、定位、拒絕定位、錯誤重試。

## 介接行為

- 沿用 `recommendations.json` 的幾何與節點；不呼叫 Google Directions 重新計算路線。
- 起終點、節點、資源使用 AdvancedMarkerElement。去回程使用不同顏色與方向箭頭。
- 篩選與清單使用同一份去重後資料；同一場域的多來源合併。選清單會聚焦地圖、選標記會開資源面板。
- 地圖載入逾時、網路失敗或 `gm_authFailure` 會回到一般失敗提示，不把 API 或帳務細節放進前台。
- 原始來源、條件與 OSM 幾何授權保留於「資料來源」，Google 原生署名不遮蓋。

## 尚待驗收

目前已測試沒有金鑰時的前台流程；Google 真實渲染與 API 授權成功後的同步操作尚待設定完成。任何以測試替身驗證的程式契約，不算 Google 實際底圖驗收。Android/iOS 實機仍未測試。

官方說明：[載入 API](https://developers.google.com/maps/documentation/javascript/load-maps-js-api)、[金鑰限制](https://developers.google.com/maps/api-security-best-practices)。
