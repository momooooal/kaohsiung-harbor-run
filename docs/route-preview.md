六個推薦體驗共用 recommendations.json 的 geometry、stopIds 和 variantId。點選開始才載入周邊街廓。水平座標依起點換算公尺，圖片熱區只用於二維原圖。路面寬度、建物高度、植栽與橋體尺度為示意。自由探索沿路徑前後及左右移動，有側向邊界；不提供整區離線導航。

2026-11-25 透過 Google Maps 在愛河之心讀到 2021 年 5 月的使用者環景，可見低岸平台、欄杆、樹列和對岸樓房。總館、大港橋定位點回報沒有影像，中央公園、願景橋與河東路定位點當次未取得可辨識的環景，影像日期未知。公園棚頂、願景橋拱形與大港橋橋塔採用路線原圖照片作外觀參考。捷運出口沿用既有站體資料。沒有使用街景截圖作貼圖。

data/preview-context.js 為 2026-11-25 自 OpenStreetMap API 0.6 map 取得的路線鄰近建物、綠地、道路與水域。邊界為西南至東北經緯度 120.284,22.647–120.304,22.655；120.286,22.617–120.299,22.630；120.295,22.605–120.305,22.614。資料 © OpenStreetMap contributors，ODbL。與舊港灣 walking-blocks 使用相同局部坐標。建模時略去擋住預覽路徑的建物量體，地面採用既有 Poly Haven CC0 材質。未進行沿線實測。

本機 HTTP 伺服器開啟後，設定 TEST_URL 與 TEST_OUT，執行 node scripts/browser-preview.cjs。需 Playwright 與 Edge。桌機加速前進測試六線到終點；手機以觸控視窗模擬。此測試不量測實機效能。

愛河水域採用 OpenStreetMap 關係 3125300 的完整外環，保存在 data/preview-river.js。
