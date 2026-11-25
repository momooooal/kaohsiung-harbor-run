# 推薦路線驗收紀錄

日期 2026-11-25。Edge Chromium，桌機 1440×1000、手機模擬 390×844（touch/mobile）。不是 Android / iOS 實機測試。

## 路線與地圖

- desktop harbor-108 select/card/hotspot/QR/reload/overflow OK
- desktop harbor-5 select/card/hotspot/QR/reload/overflow OK
- desktop love-21 select/card/hotspot/QR/reload/overflow OK
- desktop pier-22 select/card/hotspot/QR/reload/overflow OK
- desktop central-52 select/card/hotspot/QR/reload/overflow OK
- desktop heart-5 select/card/hotspot/QR/reload/overflow OK
- desktop filters/clear/denied-location OK
- mobile harbor-108 select/card/hotspot/QR/reload/overflow OK
- mobile harbor-5 select/card/hotspot/QR/reload/overflow OK
- mobile love-21 select/card/hotspot/QR/reload/overflow OK
- mobile pier-22 select/card/hotspot/QR/reload/overflow OK
- mobile central-52 select/card/hotspot/QR/reload/overflow OK
- mobile heart-5 select/card/hotspot/QR/reload/overflow OK
- mobile filters/clear/denied-location OK

Console pageerror 為空。另測原圖熱區正常點擊、OSM 候選幾何圖層、GitHub Pages 子路徑、六個固定網址重新整理。手機熱區曾有捲動點擊衝突，已修正並通過重跑；Leaflet 切換動畫曾產生錯誤，已停用相關動畫並重跑。

## 分享與故障處理

六個本站 SVG QR 在瀏覽器渲染後截圖，以 jsQR 解碼，逐一吻合指定固定網址。剪貼簿內容、手機清單切換、未定位節點無導航、定位拒絕均通過。阻擋 Leaflet、OSM 圖磚及 recommendations.json 三種請求後，替代資訊與錯誤介面通過。

## 舊功能

既有 npm test 的 3D 模型、邊界、五模式、捷運出口與輕軌資料測試通過。瀏覽器實測公民成果圖卡開啟／關閉及歷史約 4.5 公里頁面。本次沒有重跑全程 3D，也未修改 3D 場景。

## 外連

六個來源 Google 步行連結在桌機 Edge 開啟成功，見來源對照。未完成 Android / iOS Maps App 實機與逐段路徑一致性驗證；外部內容隨時間變動。

## 重跑

`npm ci`、`npm test`、`npm run validate`；安裝 Edge 後 `npm run test:browser`。亦可設定 TEST_URL 為正式網址重新驗收。截圖及 JSON 結果寫入 test-results/routes（不納入公開網站）。
