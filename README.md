# 高雄市友善跑步地圖

保留「跑出你的高雄」主視覺、GitHub Pages 子路徑 `/kaohsiung-harbor-run/` 與 Hash Router。已收錄公民參與成果，路況與服務資訊持續更新。成果報告已提供，不表示官方核定、驗收或改善完成。

## 啟動與部署

純靜態 HTML、ES Modules，無付費 API、會員或資料庫需求。

```sh
python3 -m http.server 8772
npm run validate
npm test
```

開啟 `http://localhost:8772/`。GitHub Pages 沿用原專案 main 的 root 部署設定，合併前先審閱本分支。所有資源為相對路徑，內頁使用 `#/map`、`#/routes/bay`、`#/explore`、`#/explore/short`、`#/community`、`#/about`。

本次沒有切換部署平台或新增另一個網站。`dist/`、`.openai/` 為忽略的本機 QA 預覽資料，不提交。發布內容僅取既有靜態網站檔案。

## 現行入口與檔案

- `main.js`：導覽、頁面與資料渲染。
- `report-map.js` / `geography.js`：報告原圖與 Leaflet 地理地圖切換、節點及圖層。
- `start-experience.js`：使用者按開始後載入 Three.js 與 `report.js`。
- `report.js` 的 `ride()`：目前全程及短程遊戲入口。
- `route-model.js`：共用 poiId、segmentId、報告位置、地理位置、路徑及造景錨點。
- `ride-logic.js`：實際入口使用的路徑投影、模式轉換、碰撞判斷、觀察條件、資源釋放。
- `scene-collision.js`：從實際繪製的實心網格產生碰撞框；低鋪面與高架構件排除。
- `scene-sectors.js`：附近場景分區顯示。共用資源仍常駐，**尚非完整素材串流／卸載**。
- `explore.js`：仍保留 `MODES` 與 `makeActor`。舊 `makeWorld` / `stepMovement` 不代表現行主線。
- `evidence.js`：完整問卷、文字表格、方法說明、歷史服務、活動照片及追蹤項目。

## 維護資料

統計存於 `survey-results.json`。跑者 n=494、店家 n=25，三組題目完整列出，母數、複選、圖號與頁碼會實際顯示。`verifiedAt` 在舊資料代表報告內容核對，不能拿來表示現場查核。

服務存於 `stores.json` / `facilities.json`，`recordClass` 為 `activity`、`reference` 或 `current`。參與討論單位另放 `participation.json`，不升級為合作商家。每筆分開保存 `sourceDate`、`contentCheckedAt`、`updatedAt`、`serviceCheckedAt`、合作狀態及座標精度。未知填 null。新增常態服務前應填個別現況依據，店家合作宣稱另需證據；公共設施合作狀態可不適用。

路人咖啡 5 號店地址未核對，不放座標。哈瑪星活動據點採 OSM 出口建物中心，非置物櫃精確位置。報告約 4.5 公里與集合前 400 公尺分開，沒有推算成 4.9 公里。`sceneDistance` 單位是遊戲場景單位，非公尺。

照片只擷取報告第 28、34、35 頁所選活動畫面。不得將完整 PDF、抽獎資料、簽到表加入 repo、assets 或建置產物。`stories.json` 保留日期、圖號及替代文字。自製成果圖卡不是廠商核定定稿。

首頁預覽由 `node scripts/render-model-preview.mjs` 將同一份 Three.js 地標網格離線投影產生，**不是 WebGL 執行截圖**，也不提前啟動遊戲。

## 測試與限制

`npm test` 包含現行共用邏輯、資料、實際場景模型 CPU 建構、碰撞取樣及通用地圖模組測試。CPU 測試以替身貼圖，不測 GPU、畫質、FPS 或手機觸控。舊 demo 測試另列 `npm run test:legacy`，不納入現行 3D 驗收宣告。

詳見 [修正對照](docs/audit.md)、[來源表](docs/sources.md)、[測試紀錄](docs/testing.md)。完整驗收仍未完成，主要缺項：地理主線逐段核對後的 GeoJSON、素材分段串流，以及支援 WebGL 的桌機／手機實測。本版地理地圖顯示有來源的地標與活動點，不用任意直線拼出可通行軌跡；報告原圖仍保留完整活動路線。
