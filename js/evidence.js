const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
export function sourceLine(item){return el('p','來源：'+(item.sourceLocator||item.source)+'。內容核對：'+(item.contentCheckedAt||item.verifiedAt||'2026-11-24'),'small muted')}
export function completeResults(data){
 const host=document.querySelector('#survey-results');host.replaceChildren();
 const method=el('details');method.append(el('summary','如何調查'));const m=data['survey-results'][0].method;method.append(el('p',`${m.type}，${m.period}，提供${m.incentive}。結果描述本次受訪者，不能推論全高雄人口比例。來源：${m.sourceLocator}。`));host.append(method);
 for(const q of data['survey-results']){
  const section=el('section',null,'chart');section.append(el('h3',q.title),el('p',q.source),sourceLine(q));
  const chart=el('div');chart.setAttribute('aria-label',q.title+'比較長條圖');
  const bar=(label,value,store=false)=>{const row=el('div',null,'evidence-bar');row.append(el('span',label));const track=el('span',null,'chart-track');const b=el('span',null,'chart-bar');b.style.width=Math.min(100,value)+'%';if(store)b.style.background='#bd6800';track.append(b);row.append(track,el('strong',value+'%'));return row};
  for(const i of q.items.slice(0,3)){if(q.unit==='%'){chart.append(bar(i.label+'（跑者）',i.value));if(i.storeValue!=null)chart.append(bar(i.label+'（店家）',i.storeValue,true))}else chart.append(el('p',i.label+'：'+i.value+' 份'))}section.append(chart);
  const details=el('details');details.append(el('summary','查看完整結果與文字表格'));const scroll=el('div',null,'table-scroll');const table=el('table');table.append(el('caption',`${q.question}。${q.sourceLocator}`));const head=el('tr');['項目',q.sampleSize?'跑者比例，n=494':q.unit==='%'?'比例':'份數',...(q.storeSampleSize?['店家比例，n=25']:q.items.some(i=>i.count!=null)?['人數']:[])].forEach(t=>head.append(el('th',t)));const thead=el('thead');thead.append(head);table.append(thead);const tbody=el('tbody');
  for(const i of q.items){const tr=el('tr');tr.append(el('th',i.label),el('td',i.value+q.unit));if(i.storeValue!=null)tr.append(el('td',i.storeValue+'%'));else if(i.count!=null)tr.append(el('td',String(i.count)));tbody.append(tr);if(i.storeValue!=null)details.append(bar(i.label+' 跑者',i.value),bar(i.label+' 店家',i.storeValue,true))}table.append(tbody);scroll.append(table);details.append(scroll);section.append(details);host.append(section);
 }
 const facts=el('article',null,'section-card');facts.append(el('h3','這次問卷還告訴我們什麼？'));
 ['84.6% 願為友善店家改變路線，平均 4.34 分。依報告原口徑，不推算確切人數。跑者端 n=494，第 13 頁。','跑友／跑團折扣 60.1%，跑者端 n=494，可複選，第 13 頁。','25 份店家回覆中有 21 份表達加入意願，意向不等於簽約，第 15 頁。','本次受訪者跑步行政區：鼓山 40.3%、苓雅 33.4%、三民 32.0%、左營 27.5%、鹽埕 21.7%。跑者端 n=494，可複選，第 12–13 頁。這不是友善程度排名。'].forEach(t=>facts.append(el('p',t)));host.append(facts);
}
export function servicesSection(data){
 const section=el('section',null,'wrap activity-guide');section.append(el('h2','服務紀錄與現況分開看'));
 for(const [key,title] of [['current','目前已確認的常態服務'],['activity','本次活動據點 · 2026/10/26'],['reference','報告介紹的服務參考 · 現況待查']]){
  const group=el('details');group.open=key!=='reference';group.append(el('summary',title));const items=[...data.facilities,...data.stores].filter(x=>x.published&&x.recordClass===key);if(!items.length)group.append(el('p','尚無可確認點位。以下活動及歷史紀錄仍可閱讀。'));
  const grid=el('div',null,'activity-services');for(const item of items){const card=el('article');card.dataset.poiId=item.id;if(item.poiId){const isMap=!!document.querySelector('[data-view=geo]');const focus=el(isMap?'button':'a',isMap?'在地圖定位':'查看活動地圖');if(isMap)focus.type='button';else focus.href='#/map';focus.className='btn outline';card.append(focus)}card.append(el('h3',item.name),el('p',`${item.serviceStatus} · ${item.cooperationStatus} · ${item.coordinateAccuracy}`));for(const s of item.services)card.append(el('p',`${s.name}。費用：${s.cost??'未知'}。時間：${s.hours??'未知'}。是否需消費：未知。`));card.append(sourceLine(item),el('p',`來源日期：${item.sourceDate}。網站更新：${item.updatedAt}。服務最後查核：尚未查核。`));grid.append(card)}group.append(grid);section.append(group);
 }return section;
}
export async function participationSection(){
 const d=await fetch('data/participation.json').then(r=>r.json());const section=el('section',null,'wrap activity-guide');
 section.append(el('h2','活動歷程與後續追蹤'));
 for(const t of ['2026/7/10–11/4，問卷調查已完成。','2026/10/26，公民座談已辦理，39 人報名、32 人實到。','同日 16:40–17:30，港灣踩線已辦理，105 人次。','成果報告已提供，網站依內容整理。報告第 8 頁仍有 11/30 前完成分析報告的規劃文字，不表示官方核定或驗收。','下一步，持續查核現行服務、合作與路況。'])section.append(el('p',t));
 for(const [title,list,format] of [['後續追蹤',d.followups,x=>`${x.topic}｜${x.status}。${x.basis}。來源：${x.sourceLocator}。更新：${x.updatedAt}`],['市民推薦路線',d.recommendations,x=>`${x.name}｜${x.status}。來源：${x.sourceLocator}`],['參與討論的單位',d.participants,x=>`${x.name}｜${x.status}。來源：${x.sourceLocator}`]]){const detail=el('details');detail.append(el('summary',title));list.forEach(x=>detail.append(el('p',format(x))));section.append(detail)}const stories=await fetch('data/stories.json').then(r=>r.json());const grid=el('div',null,'gallery-grid');for(const story of stories){const f=el('figure');const img=el('img');img.src=story.image;img.alt=story.alt;img.loading='lazy';img.style.width='100%';f.append(img,el('figcaption',`${story.title}。${story.description} ${story.date}，來源：${story.sourceLocator}。`));grid.append(f)}section.append(el('h2','從討論到港灣踩線'),grid);return section;
}
