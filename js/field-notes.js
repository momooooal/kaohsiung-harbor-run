/** Editorial excerpts keyed by page. Page numbers refer to the printed report. */
export const fieldNotes = {
  map: {
    title: '讀懂地圖上的服務資訊',
    lead: '踩線活動記錄了兩個體驗點。出發前，請另行確認目前的服務時間及使用條件。',
    rows: [
      ['哈瑪星站 2 號出口｜集合與寄物', '從南鼓山聯合里活動中心步行約 400 公尺到集合點。參加者在此體驗收費置物櫃。','第 33 頁，表 19'],
      ['路人咖啡 5 號店｜活動補給', '踩線當日提供食物與飲水。報告記載的是這次活動服務，店家常態服務與合作狀態仍待查核。','第 33 頁，表 19'],
      ['下一步要盤點哪些點位？','報告建議優先盤點公園、河堤與校園附近的公廁、飲水機及可借用廁所的店家，另追蹤夜間照明與人行道品質。','第 16 頁']
    ], link:['#/community','查看跑者最想找的設施']
  },
  explore:{
    title:'跟著踩線紀錄觀察港灣',
    lead:'2026 年 10 月 26 日 16:40 至 17:30，座談後的 Social Run 共記錄 105 人次。你可以沿活動次序，在模型裡找出不同的觀察重點。',
    rows:[
      ['從哪裡出發？','先在南鼓山聯合里活動中心集合，再步行至哈瑪星站 2 號出口寄物。3D 從哈瑪星段開始。','第 3、33 頁'],
      ['沿路看什麼？','去程由鹽埕綠廊道前往真愛碼頭及高雄流行音樂中心，沿輕軌大義一帶返回哈瑪星。這次踩線約 4.5 公里。','第 33 頁，圖 46'],
      ['換個視角觀察','座談參與者關心路面高低差、人車分流、照明和休息空間。可切換輪椅或輔具視角，比較同一段路的可見範圍。實際寬度、坡度與通行許可仍需現勘。','第 25–26 頁；互動場景為示意']
    ],link:['#/map','對照報告原始踩線圖']
  },
  about:{
    title:'這份計畫如何辦理？',lead:'「走跑高雄 3.0」涵蓋全市 38 個行政區、70 處運動熱點。這次公民參與蒐集市民與店家意見，作為日後盤點熱點周邊服務的依據。',
    rows:[
      ['辦理單位','主辦機關為高雄市政府運動發展局，執行單位為三恆一樹行銷有限公司，合作跑團為靠南越野／DOMA club。','第 4、6 頁'],
      ['問卷與座談','線上問卷自 2026 年 7 月 10 日至 11 月 4 日。10 月 26 日在南鼓山聯合里活動中心舉辦世界咖啡館座談，39 人報名、32 人實際參與，三桌換桌討論後票選共識。','第 8、19 頁'],
      ['誰的使用經驗需要被看見？','跑者端 494 份回覆中包含 277 位女性與 37 位 60 歲以上跑者。報告也記錄偏遠地區女性及視障、聽障跑步團體的需求，提醒規劃者留意照明、安全與固定路線。','第 7、16 頁']
    ],link:['#/community','閱讀問卷與三桌共識']
  }
};

export function notesSection(key){
 const entry=fieldNotes[key];
 const section=document.createElement('section');section.className='wrap report-notes';
 const title=document.createElement('h2');title.textContent=entry.title;
 const lead=document.createElement('p');lead.textContent=entry.lead;section.append(title,lead);
 for(const [heading,copy,source] of entry.rows){
   const row=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');
   summary.textContent=heading;text.textContent=copy+" 來源："+source;row.append(summary,text);section.append(row);
 }
 const link=document.createElement('a');link.className='link-arrow';[link.href,link.textContent]=entry.link;section.append(link);return section;
}
