# 十站連續步行的圖資

十個停靠點依使用者分享的 Google 地圖行程排序。路人咖啡五號店在不同路段各經過一次。九段步行路網以 OpenStreetMap 計算，與 Google 地圖當次選路可能略有差異。

* 道路、原有建物、街道設施與部分植栽來自 [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)，適用 [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)。地面場景依物件的 layer、location 與用途排除地下站體，並以開放式結構顯示有記錄的候車亭與入口。
* 補充建物外框來自 Qian Shi、Jiajun Zhu、Zhengyu Liu、Haonan Guo、Mengxi Liu、Zihong Liu、Xiaoping Liu 的 [East Asian buildings](https://doi.org/10.5281/zenodo.8174931)，經 [Overture Maps buildings 向量圖磚](https://docs.overturemaps.org/examples/overture-tiles/) 2026-11-18.0 取得，依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 改作。僅採用標記此資料集為幾何來源的圖徵，合併分片、裁選沿線、去除重疊與侵入步行線的外框，再投影並取整至本地座標。檔案為 data/walking-infill.js 及 data/route-infill.js。後者補上推薦路線周邊街廓，近路線 4.5 公尺以內及與既有模型重疊的外框不重複建模。門窗、樓高與外牆色彩為示意。建物可能已改建。
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

## 六條推薦路線的 3D 場景維護（2026-11-25）

正式入口由 route-preview 建立場景，使用 recommendations 的分段幾何與地點次序。walking-city 提供港區建築、車站、既有店面和街具，route-landmarks 放置具地理定位的地標。自由探索與導覽共用地面和碰撞，模型比例為公尺。地圖圖卡座標獨立保存。

街廓來自 OpenStreetMap，見 [ODbL 署名](https://www.openstreetmap.org/copyright)。scripts/extract-street-context.py 整理路面與地物，scripts/compile-preview-clearance.cjs 從場景網格產生局部淨空修正。調整建築或路徑後須重跑淨空檢查與瀏覽器全程通行測試。

以下為六條路線各五個實際開啟的 Google Maps 街景位置，方位由北順時針算起。座標是街景相機位置，可能與步道分處道路兩側。影像只用於對照。場景的車流、樹冠、店招、窗內陳設、坡度與橋面高度仍有簡化，並非現況測量。沿路商家服務依友善地圖的文字資料為準。

| 路線 | 街景相機座標 | 朝向 | 街景拍攝年月 |
|---|---|---:|---|
| 「公民參與討論」最推薦的跑步路線 | [22.5983711, 120.3139651](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.598377,120.31397&heading=233.8&pitch=0) | 233.8° | 2026年7月 |
| 「公民參與討論」最推薦的跑步路線 | [22.605653, 120.3024683](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.605692,120.302511&heading=250.8&pitch=0) | 250.8° | 2026年6月 |
| 「公民參與討論」最推薦的跑步路線 | [22.6100133, 120.2966042](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.610049,120.296668&heading=296.8&pitch=0) | 296.8° | 2011年6月 |
| 「公民參與討論」最推薦的跑步路線 | [22.6178921, 120.2858142](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.617897,120.285799&heading=295.1&pitch=0) | 295.1° | 2020年1月 |
| 「公民參與討論」最推薦的跑步路線 | [22.6235194, 120.2709254](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.623552,120.270959&heading=120.5&pitch=0) | 120.5° | 2019年8月 |
| 港灣景觀線 | [22.6092312, 120.3025234](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.609213,120.302558&heading=250.4&pitch=0) | 250.4° | 2026年6月 |
| 港灣景觀線 | [22.604715, 120.2972713](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.604699,120.297255&heading=332.1&pitch=0) | 332.1° | 2022年7月 |
| 港灣景觀線 | [22.6116146, 120.2931335](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.611606,120.2931&heading=335.1&pitch=0) | 335.1° | 2011年6月 |
| 港灣景觀線 | [22.6117832, 120.2927658](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.611814,120.292863&heading=211.9&pitch=0) | 211.9° | 2011年6月 |
| 港灣景觀線 | [22.6105959, 120.2993306](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.610598,120.299312&heading=163.2&pitch=0) | 163.2° | 2026年6月 |
| 愛河綠園道線 | [22.611912, 120.2983191](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.611886,120.298349&heading=250.1&pitch=0) | 250.1° | 2024年10月 |
| 愛河綠園道線 | [22.6137611, 120.2915698](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.613767,120.291617&heading=11.4&pitch=0) | 11.4° | 2024年8月 |
| 愛河綠園道線 | [22.62385, 120.2901767](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.62383,120.29015&heading=345.1&pitch=0) | 345.1° | 2016年7月 |
| 愛河綠園道線 | [22.6169591, 120.2933565](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.616938,120.293384&heading=206.0&pitch=0) | 206.0° | 2025年11月 |
| 愛河綠園道線 | [22.6120099, 120.298582](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.611944,120.298531&heading=160.8&pitch=0) | 160.8° | 2026年6月 |
| 駁二大港橋線 | [22.6113153, 120.2966616](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.611327,120.296667&heading=250.8&pitch=0) | 250.8° | 2024年5月 |
| 駁二大港橋線 | [22.6167469, 120.2932892](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.616764,120.293292&heading=26.0&pitch=0) | 26.0° | 2020年10月 |
| 駁二大港橋線 | [22.6183338, 120.2847519](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.618342,120.284762&heading=295.0&pitch=0) | 295.0° | 2020年11月 |
| 駁二大港橋線 | [22.6180784, 120.2930724](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.618053,120.293016&heading=73.7&pitch=0) | 73.7° | 2025年11月 |
| 駁二大港橋線 | [22.6114383, 120.2969072](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.61141,120.296921&heading=70.1&pitch=0) | 70.1° | 2024年10月 |
| 愛河中央公園線 | [22.6100133, 120.2966042](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.610049,120.296668&heading=296.8&pitch=0) | 296.8° | 2011年6月 |
| 愛河中央公園線 | [22.6169591, 120.2933565](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.616938,120.293384&heading=292.1&pitch=0) | 292.1° | 2025年11月 |
| 愛河中央公園線 | [22.6239228, 120.2918809](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.623859,120.291862&heading=252.1&pitch=0) | 252.1° | 2026年6月 |
| 愛河中央公園線 | [22.6238832, 120.2987095](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.623751,120.298642&heading=153.0&pitch=0) | 153.0° | 2015年11月 |
| 愛河中央公園線 | [22.6124171, 120.3048259](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.612437,120.304784&heading=161.0&pitch=0) | 161.0° | 2024年10月 |
| 愛河之心願景橋線 | [22.6544123, 120.3033017](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.654321,120.303371&heading=130.1&pitch=0) | 130.1° | 2026年1月 |
| 愛河之心願景橋線 | [22.6525189, 120.3013243](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.652497,120.301332&heading=0.0&pitch=0) | 0.0° | 2024年7月 |
| 愛河之心願景橋線 | [22.6496915, 120.2894705](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.649652,120.289431&heading=284.8&pitch=0) | 284.8° | 2024年4月 |
| 愛河之心願景橋線 | [22.6510048, 120.2987292](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.651391,120.298718&heading=98.8&pitch=0) | 98.8° | 2024年7月 |
| 愛河之心願景橋線 | [22.6544274, 120.3033951](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=22.654525,120.303361&heading=16.7&pitch=0) | 16.7° | 2026年1月 |
