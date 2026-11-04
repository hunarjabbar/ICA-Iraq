import {useMemo,useState} from 'react'
import {Shell,Intro,useICA,Newsletter} from './site'
import {topics,topicCategories,findTopic,researchReviewedOn,type ICATopic} from '../../data/ica-topics'
import {atlasExtra,atlasCategory} from '../../lib/ica-atlas-i18n'

const copy={
 en:{title:'The ICA Research Atlas',intro:'72 source-linked story ideas across diplomacy, culture, business, heritage and society. Topics to investigate, not published news.',topic:'Topics',categories:'Research desks',sources:'Verified starting sources',filter:'Filter by desk',search:'Search subjects, questions or sources',all:'All research desks',surprise:'Surprise me',status:'Research lead',read:'Explore topic',source:'Primary research source',show:'Show more topics',count:'Showing',of:'of',empty:'No topics match your search.',disclaimer:'Research leads only. These are editorial story proposals, not ICA reporting or confirmed news. Sources provide context; each idea requires verification before publication.',next:'Reporting questions',related:'More from this desk',back:'Back to topics',pitch:'Suggest reporting',updated:'Source review'},
 ar:{title:'أطلس أبحاث ICA',intro:'٧٢ فكرة صحفية مرتبطة بمصادر حول العلاقات الدبلوماسية والثقافة والأعمال والتراث والمجتمع. موضوعات للبحث وليست أخباراً منشورة.',topic:'المواضيع',categories:'الأقسام البحثية',sources:'مصادر مرجعية',filter:'تصفية حسب القسم',search:'ابحث عن موضوع أو مصدر',all:'جميع الأقسام',surprise:'موضوع عشوائي',status:'فكرة بحثية',read:'استكشف الموضوع',source:'مصدر البحث الأساسي',show:'عرض المزيد',count:'عرض',of:'من',empty:'لا توجد نتائج مطابقة.',disclaimer:'هذه أفكار أولية للبحث وليست أخباراً منشورة باسم ICA. يجب التحقق والتحرير قبل النشر.',next:'أسئلة للبحث',related:'المزيد من هذا القسم',back:'العودة إلى المواضيع',pitch:'اقترح تغطية',updated:'تاريخ مراجعة المصادر'},
 ckb:{title:'ئەڵفوبێی توێژینەوەی ICA',intro:'٧٢ بیرۆکەی ڕاپۆرتی سەرچاوەدار لەبارەی دیپلۆماسی و کەلتوور و بازرگانی و کۆمەڵگا. ئەمانە هەواڵی بڵاوکراوە نین.',topic:'بابەتەکان',categories:'بەشەکانی توێژینەوە',sources:'سەرچاوەکان',filter:'پاڵاوتن بەپێی بەش',search:'گەڕان بۆ بابەت و سەرچاوە',all:'هەموو بەشەکان',surprise:'بابەتێکی هەڕەمەکی',status:'بیرۆکەی توێژینەوە',read:'بینینی بابەت',source:'سەرچاوەی سەرەکی',show:'بابەتی زیاتر',count:'پیشاندانی',of:'لە',empty:'هیچ ئەنجامێکی گونجاو نەدۆزرایەوە.',disclaimer:'ئەم بابەتانە پێشنیاری توێژینەوەن نەک هەواڵی پشتڕاستکراوەی ICA. پێویستیان بە پشتڕاستکردنەوە هەیە.',next:'پرسیارەکانی توێژینەوە',related:'بابەتی هاوشێوە',back:'گەڕانەوە بۆ بابەتەکان',pitch:'پێشنیاری ڕاپۆرت',updated:'بەرواری پشکنینی سەرچاوە'},
 zh:{title:'ICA 选题研究图谱',intro:'72 个附有来源的选题构想，涵盖外交、文化、商业、遗产与社会。它们是待调查的选题，并非已发布新闻。',topic:'研究选题',categories:'编辑专题',sources:'研究来源',filter:'按专题筛选',search:'搜索话题或资料',all:'全部专题',surprise:'随机发现',status:'待研究选题',read:'了解选题',source:'研究参考来源',show:'查看更多',count:'显示',of:'共',empty:'未找到匹配的选题。',disclaimer:'此处仅为编辑研究选题，不代表 ICA 已核实并发布的新闻。正式报道需要进一步查证。',next:'调查问题',related:'相关选题',back:'返回选题',pitch:'建议报道',updated:'来源核查日期'}
} as const
function useCopy(){const {lang}=useICA();return copy[lang]}
export function TopicCard({item,numbered=false}:{item:ICATopic;numbered?:boolean}){
 const {path,lang}=useICA(),c=useCopy(),extra=atlasExtra[lang]
 return <article className="ica-topic-card">
   <div className="ica-topic-card-top"><span className="ica-topic-card-number">{numbered?item.id:extra.researchLabel}</span><span className="ica-topic-card-status">{c.status}</span></div>
   <span className="ica-topic-card-desk">{atlasCategory(lang,item.category)}</span>
   <h3 lang="en" dir="auto"><a href={path('/topics/'+item.slug)}>{item.title}</a></h3>
   <p lang="en" dir="auto">{item.summary}</p>
   <div className="ica-topic-card-bottom"><span>{item.publisher}</span><a href={path('/topics/'+item.slug)} aria-label={c.read+': '+item.title}>{c.read} <span aria-hidden="true">↗</span></a></div>
 </article>
}
export function TopicsHomePreview(){
 const {path,lang}=useICA(),c=useCopy(),extra=atlasExtra[lang]
 const chosen=[topics[0],topics[14],topics[29],topics[37],topics[51],topics[67]]
 return <section className="ica-topics-home" aria-labelledby="ica-topic-home-heading">
  <div className="ica-topics-home-title">
   <div><span className="ica-topics-home-eyebrow">{extra.homeEyebrow}</span><h2 id="ica-topic-home-heading">{c.title}</h2><p>{extra.homeIntro}</p></div>
   <a href={path('/topics')} className="ica-topics-home-link">{c.read} · {topics.length} <span aria-hidden="true">↗</span></a>
  </div>
  <div className="ica-topics-home-grid">{chosen.map(x=><TopicCard key={x.slug} item={x}/>)}</div>
  <p className="ica-topics-home-notice">{c.disclaimer}</p>
 </section>
}
export function TopicsIndex(){
 const {path,lang}=useICA(),c=useCopy(),extra=atlasExtra[lang]
 const [search,setSearch]=useState('')
 const [desk,setDesk]=useState('all')
 const [count,setCount]=useState(18)
 const visible=useMemo(()=>topics.filter(t=>(desk==='all'||t.category===desk)&&[t.title,t.summary,t.category,t.sourceName,t.publisher].join(' ').toLowerCase().includes(search.toLowerCase().trim())),[search,desk])
 const shown=visible.slice(0,count)
 function exploreRandom(){
  const list=desk==='all'?topics:topics.filter(t=>t.category===desk)
  const rand=new Uint32Array(1);crypto.getRandomValues(rand)
  window.location.assign(path('/topics/'+list[rand[0]%list.length].slug))
 }
 return <Shell><main className="ica-page-content ica-topic-directory">
   <Intro label={extra.introLabel} title={c.title} description={c.intro} image="/assets/ica-cover-scene.png"/>
   <div className="ica-topic-stats" aria-label={c.categories}><div><strong>{topics.length}</strong><span>{c.topic}</span></div><div><strong>{topicCategories.length}</strong><span>{c.categories}</span></div><div><strong>{new Set(topics.map(t=>t.sourceUrl)).size}</strong><span>{c.sources}</span></div><div><strong>2026</strong><span>{c.updated}</span></div></div>
   <p className="ica-research-disclaimer"><span aria-hidden="true">i</span>{c.disclaimer}</p>
   <div className="ica-topic-workbench">
    <div className="ica-topic-workbench-heading"><h2>{c.categories}</h2><button className="ica-topic-random" type="button" onClick={exploreRandom}>{c.surprise}<span aria-hidden="true">↗</span></button></div>
    <div className="ica-topic-search-row"><label><span className="sr-only">{c.search}</span><input type="search" value={search} onChange={e=>{setSearch(e.target.value);setCount(18)}} placeholder={c.search}/></label>
    <label><span className="sr-only">{c.filter}</span><select value={desk} onChange={e=>{setDesk(e.target.value);setCount(18)}}><option value="all">{c.all}</option>{topicCategories.map(x=><option key={x.name} value={x.name}>{atlasCategory(lang,x.name)}</option>)}</select></label></div>
    <div className="ica-topic-desk-filter" aria-label={c.filter}><button type="button" aria-pressed={desk==='all'} onClick={()=>{setDesk('all');setCount(18)}}>{c.all}<span>{topics.length}</span></button>{topicCategories.map(x=><button key={x.name} type="button" aria-pressed={desk===x.name} onClick={()=>{setDesk(x.name);setCount(18)}}>{atlasCategory(lang,x.name)}<span>{x.count}</span></button>)}</div>
   </div>
   <div className="ica-topic-results-count" role="status">{c.count} {shown.length} {c.of} {visible.length} {c.topic.toLowerCase()}</div>
   {shown.length?<div className="ica-topic-directory-grid">{shown.map(item=><TopicCard item={item} numbered key={item.id}/>)}</div>:<div className="ica-topic-zero"><h3>{c.empty}</h3><button type="button" onClick={()=>{setSearch('');setDesk('all')}}>{c.all}</button></div>}
   {shown.length<visible.length&&<div className="ica-topic-more"><button type="button" onClick={()=>setCount(n=>n+18)}>{c.show} <span aria-hidden="true">↓</span></button></div>}
   <div className="ica-source-notice"><h2>{c.source}</h2><p>{extra.sourceCaveat}</p><p><strong>{c.updated}:</strong> {researchReviewedOn}</p></div>
   <Newsletter/>
 </main></Shell>
}
export function TopicDetail({slug}:{slug:string}){
 const {path,lang}=useICA(),c=useCopy(),extra=atlasExtra[lang]
 const item=findTopic(slug)
 if(!item)return <Shell><main className="ica-article-notfound"><h1>{extra.notFound}</h1><p>{extra.notFoundDesc}</p><a href={path('/topics')}>{c.back} ↗</a></main></Shell>
 const related=topics.filter(x=>x.category===item.category&&x.slug!==item.slug).slice(0,3)
 const href=path('/contact')+(path('/contact').includes('?')?'&':'?')+'subject='+encodeURIComponent(item.title)
 return <Shell><main className="ica-topic-detail">
  <div className="ica-topic-crumb"><a href={path('/topics')}>← {c.back}</a><span>{atlasCategory(lang,item.category)}</span></div>
  <div className="ica-topic-detail-hero"><span className="ica-topic-detail-status">{c.status} / {item.id}</span><h1 lang="en" dir="auto">{item.title}</h1><p lang="en" dir="auto">{item.summary}</p><p className="ica-translation-note">{extra.originalLanguage}</p><div><span>{atlasCategory(lang,item.category)}</span><span>{c.updated}: {researchReviewedOn}</span></div></div>
  <div className="ica-topic-detail-body"><article><h2>{extra.reportingPrompt}</h2><p lang="en" dir="auto">{item.summary}</p><ol>{extra.verifySteps.map((step,i)=><li key={i}>{step}</li>)}</ol><div className="ica-topic-detail-editorial"><strong>{extra.editorialStatus}</strong><p>{extra.editorialCaution}</p></div><a className="ica-topic-pitch" href={href}>{c.pitch}<span aria-hidden="true">↗</span></a></article>
   <aside className="ica-topic-source"><span>{extra.readSource}</span><h3>{c.source}</h3><strong>{item.sourceName}</strong><p>{item.publisher}</p><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{extra.readSource} <span aria-hidden="true">↗</span></a><small>{extra.sourceDetail}</small></aside>
  </div>
  <section className="ica-topic-related"><div><h2>{c.related}</h2><a href={path('/topics')}>{c.back} ↗</a></div><div className="ica-topic-directory-grid">{related.map(x=><TopicCard key={x.slug} item={x}/>)}</div></section>
 </main></Shell>
}
