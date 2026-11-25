# 十站連續步行的圖資

十個停靠點依使用者分享的 Google 地圖行程排序。路人咖啡五號店在不同路段各經過一次。九段步行路網以 OpenStreetMap 計算，與 Google 地圖當次選路可能略有差異。

* 道路、原有建物、街道設施與部分植栽來自 [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)，適用 [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)。地面場景依物件的 layer、location 與用途排除地下站體，並以開放式結構顯示有記錄的候車亭與入口。
* 補充建物外框來自 Qian Shi、Jiajun Zhu、Zhengyu Liu、Haonan Guo、Mengxi Liu、Zihong Liu、Xiaoping Liu 的 [East Asian buildings](https://doi.org/10.5281/zenodo.8174931)，經 [Overture Maps buildings 向量圖磚](https://docs.overturemaps.org/examples/overture-tiles/) 2026-11-18.0 取得，依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 改作。僅採用標記此資料集為幾何來源的圖徵，合併分片、裁選沿線、去除重疊與侵入步行線的外框，再投影並取整至本地座標。檔案為 data/walking-infill.js。建物可能已改建。
* 壽山一帶的遠景山形來自 [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)，於 2026-11-25 取得。Global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey. Global ETOPO1 terrain data courtesy of NOAA/NESDIS/NCEI. [各地形來源與授權](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)。data/walking-relief.js 儲存以 75 公尺網格重新取樣的高程；建模時另行設定低地遮罩、植被色與遠景霧。此資料僅用於山景，無法判定人行道坡度。
* [高雄展覽館](https://khh.travel/zh-tw/attractions/detail/67/) 的鋼構波浪外型依公開介紹與外觀照片解讀。倉庫、庭園宿舍、路旁街屋與站口的立面參考對應路段街景。檐口、吧檯、座椅、柱距、層數與材質為原創示意建模。有定位的部分是建物外框或設施點位，精度隨來源而異。

實景參考可在遊戲下方開啟 Google 街景。遊戲使用自建模型及 README 所列 Poly Haven 材質。
