# 十站連續步行的圖資

十個停靠點依使用者分享的 Google 地圖行程排序。路人咖啡五號店在不同路段各經過一次。九段步行路網以 OpenStreetMap 計算，與 Google 地圖當次選路可能略有差異。

* 道路、原有建物、街道設施與部分植栽來自 [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)，適用 [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)。地面場景依物件的 layer、location 與用途排除地下站體，並以開放式結構顯示有記錄的候車亭與入口。
* 補充建物外框來自 Qian Shi、Jiajun Zhu、Zhengyu Liu、Haonan Guo、Mengxi Liu、Zihong Liu、Xiaoping Liu 的 [East Asian buildings](https://doi.org/10.5281/zenodo.8174931)，經 [Overture Maps buildings 向量圖磚](https://docs.overturemaps.org/examples/overture-tiles/) 2026-11-18.0 取得，依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 改作。僅採用標記此資料集為幾何來源的圖徵，合併分片、裁選沿線、去除重疊與侵入步行線的外框，再投影並取整至本地座標。檔案為 data/walking-infill.js。建物可能已改建。
* 壽山一帶的遠景山形來自 [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)，於 2026-11-25 取得。Global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey. Global ETOPO1 terrain data courtesy of NOAA/NESDIS/NCEI. [各地形來源與授權](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)。data/walking-relief.js 儲存以 75 公尺網格重新取樣的高程；建模時另行設定低地遮罩、植被色與遠景霧。此資料僅用於山景，無法判定人行道坡度。
* [高雄展覽館](https://khh.travel/zh-tw/attractions/detail/67/) 的鋼構波浪外型依公開介紹與外觀照片解讀。倉庫、庭園宿舍、路旁街屋與站口的立面參考對應路段街景。檐口、吧檯、座椅、柱距、層數與材質為原創示意建模。有定位的部分是建物外框或設施點位，精度隨來源而異。

實景參考可在遊戲下方開啟 Google 街景。遊戲使用自建模型及 README 所列 Poly Haven 材質。

## 九段步行中點的參照

2026-11-25 依各路段的累積步行長度定位中點，按前進方向檢視 Google 地圖全景。資料來源連結開啟 Google 地圖。遊戲採自建模型，保留 OSM 步行線；全景取像車道與步行線的位置有時相差數公尺。棚架尺寸、立面色彩、停放車船與攤位陳設採視覺近似，無即時營業或停泊資訊。

| 路段 | 現場參照與影像年月 | 建模參考 |
| --- | --- | --- |
| 1 | [永興街口](https://www.google.com/maps/@22.6127942,120.2983442,6a,90y,339.86h,90t/data=!3m7!1e1!3m5!1sEfTr98uWfoaHs-Mwe3SsCQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DEfTr98uWfoaHs-Mwe3SsCQ%26yaw%3D339.86!7i16384!8i8192)（2024-04） | 路角的鐵皮門面、洗車棚、突出式招牌、紅線及穿越線。另比對 2018 年街口夜間全景。 |
| 2 | [新光路](https://www.google.com/maps/@22.6112461,120.301297,7a,90y,71.11h,90t/data=!3m7!1e1!3m5!1sGds5dGydWjffGEr9fLpnFQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DGds5dGydWjffGEr9fLpnFQ%26yaw%3D71.11!7i16384!8i8192)（2026-06） | 建物下方的退縮店面、遮棚、路旁機車與植栽分隔帶。 |
| 3 | [時代大道](https://www.google.com/maps/@22.597978,120.3122343,5a,90y,249.68h,90t/data=!3m7!1e1!3m5!1sbVw4Lv_8zTxnNWzI0kHc1Q!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DbVw4Lv_8zTxnNWzI0kHc1Q%26yaw%3D249.68!7i16384!8i8192)（2026-06） | 車行大道與旁側步道的寬度差、紅色路緣、路燈及兩側林帶。 |
| 4 | [中華五路周邊步道](https://www.google.com/maps/@22.6031793,120.3042086,3a,85y,249.91h,90t/data=!3m8!1e1!3m6!1sCIABIhDFdur-VWl8xfjiJukPXmFw!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAM4Q-U_6yuUSFoGXlv2fC67xeYv1LiSLBwZWnBo8wtuyA2QA0rVQK__3dcY_9bm9mnVn3mVFy81bagaJB_VsalJv022Tg7cthAwJQlv81ACdya9NRfY7dGK8tGx8PGXA4ogAKQ1M23Vlx_3P2sKe%3Dw900-h600-k-no-pi90-ya301.30278396606445-ro0-fo100!7i5760!8i2880)（2026-07） | 將使用者提供的全景旋至平視，核對粉紅磁磚住宅、鐵窗、白色橫帶及綠帶。另以鄰近林蔭帶 2017 年全景參照座椅。 |
| 5 | [昇平街139巷](https://www.google.com/maps/@22.6164415,120.29511,6a,90y,249.44h,90t/data=!3m7!1e1!3m5!1s045JovPEXZn34NB1I43c_Q!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3D045JovPEXZn34NB1I43c_Q%26yaw%3D249.44!7i16384!8i8192)（2024-08） | 彎道端牆、窗柵、雨棚、盆栽和管線。另核對轉角後的淺色鐵皮與住宅後牆。 |
| 6 | [哈瑪星鐵道綠地](https://www.google.com/maps/@22.6215164,120.2776309,5a,90y,305.54h,90t/data=!3m7!1e1!3m5!1sLTAUOTuk-_xRRuZje03zpQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DLTAUOTuk-_xRRuZje03zpQ%26yaw%3D305.54!7i13312!8i6656)（2011-06） | 早期影像可見步道分岔、草地、車擋與金屬棚。保留股道與草坪特徵另參照高雄旅遊網的園區介紹。 |
| 7 | [濱海一路](https://www.google.com/maps/@22.619795,120.2706177,6a,90y,260.54h,90t/data=!3m7!1e1!3m5!1sFRIgsbAXVDmXG42tZvGpMw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DFRIgsbAXVDmXG42tZvGpMw%26yaw%3D260.54!7i16384!8i8192)（2026-06） | 沿用已建模的冰店、騎樓、渡輪站街口，作為九段中點的對照。 |
| 8 | [濱海二路](https://www.google.com/maps/@22.6216369,120.2700249,6a,90y,5.31h,90t/data=!3m7!1e1!3m5!1sKPHpCcf5OFgH0x7tHw5CJQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DKPHpCcf5OFgH0x7tHw5CJQ%26yaw%3D5.31!7i16384!8i8192)（2024-08） | 遊戲沿港邊步道，參照影像位於旁側車道。以水岸鋪面、遊艇、棚架和街角陽台區分港池與街屋。 |
| 9 | [臨海二路街口](https://www.google.com/maps/@22.6227516,120.2724587,6a,90y,122.15h,90t/data=!3m7!1e1!3m5!1skNBIEVTOduaf8k_GL9XfFg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DkNBIEVTOduaf8k_GL9XfFg%26yaw%3D122.15!7i16384!8i8192)（2026-06） | 紅磚色轉角樓、騎樓、茶攤和穿越線，並參照同向前一個位置的遮陽棚及機車。 |

另參照[哈瑪星鐵道文化園區](https://khh.travel/zh-tw/attractions/detail/206/)、[高雄市海洋局鼓山漁港資料](https://kcmb.kcg.gov.tw/cp.aspx?n=12DBDF1D77EBD03A)、[昇平街轉角後方](https://www.google.com/maps/@22.6162642,120.2949242,6a,90y,249.44h,90t/data=!3m7!1e1!3m5!1st4DTXSQ2RVjMObHr5GLJ8g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3Dt4DTXSQ2RVjMObHr5GLJ8g%26yaw%3D249.44!7i16384!8i8192)與[鄰近林蔭帶](https://www.google.com/maps/@22.6034145,120.3044739,3a,90y,249.91h,90t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgIDqxenEwwE!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAM4Q-U_9GWKztZuSNpOckRkCwy9qNvN8rfDzj3ndoQ21WKsV3ab1J5FjB9ldq4x5s2Jmp6ZorvLdcMD-9mTt9GbREoxVmsLWzc1MRrQ95YYbuhS6-NJfl0Er8kyFeQ5XAsoBFHEGbUP7%3Dw900-h600-k-no-pi0-ya54.91-ro0-fo100!7i7680!8i3840)。
## 捷運出口與街口

3D 的捷運入口使用高捷公布的站名、出口編號及出口方向。座標及站體外框取自 OpenStreetMap。入口相對於幹道的位置、棚架形狀、玻璃與斜撐、前方階梯及周圍街廓參考各出口的 Google 實景。幾何、站牌圖面、門窗、家具與植栽均為自行建模。街景分別拍攝於不同年份，現況可能已變動。

| 車站 | 在街上可辨認的差異 | 核對資料 |
| --- | --- | --- |
| 哈瑪星 O1 | 1 號的高牆及磚紅色曲簷。2 號的寬平頂棚、弧形階梯、舊打狗驛與 C14 轉乘環境。 | [高捷兩個出入口](https://www.krtc.com.tw/Guide/station_info?n=O1) · [舊打狗驛文化資產](https://nchdb.boch.gov.tw/assets/overview/historicalBuilding/20100729000001) |
| 凱旋 R6 | 1 號往 C3，2 號位在另一側街角，3 號往時代大道。綠玻璃、傾斜白色端板、1 號旁獨立電梯，以及前鎮之星分岔的自行車高架橋。 | [高捷三個出入口](https://www.krtc.com.tw/Guide/station_info?n=R6) · [前鎮之星自行車橋](https://www.krtc.com.tw/Information/travel_more?id=52626547ca5640fbb822ad77cde7807a) |
| 獅甲 R7 | 1 號往國中，2 號前鎮游泳池，3 號勞工公園及獨立電梯，4 號國小街口。玻璃外側斜撐、圓接頭與白色斜棚呈現同站的建築語彙。 | [高捷四個出入口](https://www.krtc.com.tw/Guide/station_info?n=R7) |

每個出口的「對照這個出口的 Google 街景」都有獨立街面座標和朝向，記錄於 `data/station-exits.js`。街景由 Google Maps 開啟。十站步行使用原有步行線，轉入出口才進入前庭接近動線。

沿線輕軌使用 C3、C7、C8、C10、C11、C12、C13、C14 的月台外框。C11 是高架側式月台，其餘七站為地面側式月台。資料取自[高雄輕軌各站資訊](https://www.krtc.com.tw/KLRT/)與 [OpenStreetMap 貢獻者，ODbL](https://www.openstreetmap.org/copyright)。幹道與渡輪街段的地面材質、騎樓、招牌、車輛和商業陳設皆為場景表現，不能據以推定店家合作或服務狀態。

共同日光天空使用 Poly Haven 的 [Kloofendal 48d Partly Cloudy (Pure Sky)](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky)，依 [CC0](https://polyhaven.com/license) 將 2K HDR 轉為小型 JPEG，作為天空與反光素材。街景內容由 3D 地形、建築與街道模型即時渲染。
