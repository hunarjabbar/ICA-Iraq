import {useMemo,useState} from 'react'
import {Shell,Newsletter,useICA} from './site'
import {ICA_DESKS,deskBySlug} from '../../lib/ica-desks'
import {deskName,deskDescription,formatLocalDate} from '../../lib/ica-i18n'
import type {WireItem} from '../../lib/ica-wire.server'
import type {ICAArticle} from '../../lib/ica.server'

const primaryDeskKeys=['hong-kong','asean','business','finance','china','world'] as const
export const sourceCatalog=[
 {name:'ASEAN Secretariat',category:'Asia / ASEAN',categoryDesk:'asean',url:'https://asean.org/news/'},
 {name:'ASEANstats Data Portal',category:'Business / Statistics',categoryDesk:'business',url:'https://data.aseanstats.org/'},
 {name:'Hong Kong Monetary Authority',category:'Finance',categoryDesk:'finance',url:'https://www.hkma.gov.hk/eng/news-and-media/press-releases/'},
 {name:'Hong Kong Exchanges',category:'Markets',categoryDesk:'markets',url:'https://www.hkex.com.hk/Services/RSS-Feeds?sc_lang=en'},
 {name:'Hong Kong Government News',category:'Hong Kong',categoryDesk:'hong-kong',url:'https://www.news.gov.hk/eng/'},
 {name:'RTHK News',category:'Hong Kong / World',categoryDesk:'world',url:'https://news.rthk.hk/rthk/en/'},
 {name:'Central Bank of Iraq',category:'Iraq / Finance',categoryDesk:'finance',url:'https://cbi.iq/page/144'},
 {name:'Ministry of Foreign Affairs of China',category:'China / Bilateral',categoryDesk:'bilateral',url:'https://www.fmprc.gov.cn/mfa_eng/'},
 {name:'Iraqi News Agency',category:'Iraq',categoryDesk:'iraq',url:'https://ina.iq/en/lastnews'},
 {name:'World Bank Iraq',category:'Development',categoryDesk:'business',url:'https://www.worldbank.org/en/country/iraq'},
 {name:'United Nations News',category:'World',categoryDesk:'world',url:'https://news.un.org/en/'},
]
function safeHref(url:string,internal=false){
 if(internal)return url
 try{const u=new URL(url);return u.protocol==='https:'?u.href:'#'}catch{return '#'}
}
function splitStories(articles:ICAArticle[],wire:WireItem[],path:(p:string)=>string){
 const a=articles.filter(x=>x.status==='published').map(x=>({
  id:'ica-'+x.id,kind:'ica' as const,title:x.title,summary:x.excerpt,source:x.author||'ICA Editorial Desk',
  url:path('/news/'+x.slug),date:x.published_at||x.created_at,region:x.region,desk:x.desk,
  featured:!!x.featured,trending:!!x.trending,image:x.image_url||'',language:x.lang
 }))
 const b=wire.filter(x=>x.status==='linked').map(x=>({
  id:'external-'+x.id,kind:'external' as const,title:x.headline,summary:x.summary||'',source:x.source_name,
  url:safeHref(x.source_url),date:x.published_at,region:x.region,desk:x.desk,
  featured:!!x.pinned,trending:!!x.pinned,image:'',language:'en'
 }))
 return [...a,...b].sort((x,y)=>Date.parse(y.date)-Date.parse(x.date))
}
type Story=ReturnType<typeof splitStories>[number]
export function WireHeadline({story,variation='regular',number=0}:{story:Story;variation?:'regular'|'lead'|'compact';number?:number}){
 const {L,lang}=useICA()
 return <article className={'ica-wire-story ica-wire-story-'+variation}>
  <a href={story.url} target={story.kind==='external'?'_blank':undefined} rel={story.kind==='external'?'noopener noreferrer':undefined}>
   {variation==='lead'&&<div className="ica-wire-lead-art" aria-hidden="true"><span className="ica-wire-art-lines"/><strong>{story.region==='hong-kong'?'HONG KONG':story.region==='asean'?'ASEAN':story.region==='china'?'CHINA':story.region==='world'?'WORLD':'ICA'}</strong><small>{L('globalDesk')}</small></div>}
   <div className="ica-wire-info">
    <div className="ica-wire-story-meta"><span>{story.kind==='external'?L('externalSource'):L('originalReport')}</span><span>{formatLocalDate(story.date,lang)}</span></div>
    <span className="ica-wire-section">{deskName(lang,story.region)} / {deskName(lang,story.desk)}</span>
    <h3 lang={story.language} dir="auto">{number>0&&variation==='compact'&&<span className="ica-wire-index">{String(number).padStart(2,'0')}</span>}{story.title}</h3>
    {story.kind==='external'&&lang!=='en'&&<span className="ica-source-language">{L('sourceLanguage')}</span>}
    {variation!=='compact'&&<p lang={story.summary?story.language:lang} dir="auto">{story.summary||L('originalNotice')}</p>}
    <div className="ica-wire-story-foot"><span>{story.source}</span><strong>{story.kind==='external'?L('readOriginal')+' ↗':L('fullStory')+' ↗'}</strong></div>
   </div>
  </a>
 </article>
}
export function LiveTicker({wire}:{wire:WireItem[]}){
 const {path,L,lang}=useICA()
 const items=wire.slice(0,8)
 if(!items.length)return null
 return <aside className="ica-live-ticker" aria-label={L('externalHeadlines')}>
  <a href={path('/desk/latest')} className="ica-ticker-key">{L('sourceWire')} <span aria-hidden="true">●</span></a>
  <div className="ica-ticker-scroll">{items.map(item=><a key={item.id} href={safeHref(item.source_url)} target="_blank" rel="noopener noreferrer">
   <span>{item.source_name}</span><span lang="en" dir="auto">{item.headline}</span></a>)}</div>
  <a href={path('/desk/latest')} className="ica-ticker-more">{L('latestLabel')} ↗</a>
 </aside>
}
export function PortalLead({articles,wire}:{articles:ICAArticle[];wire:WireItem[]}){
 const {path,L,lang}=useICA()
 const stories=splitStories(articles,wire,path)
 const picks=[...stories.filter(s=>s.featured),...stories.filter(s=>!s.featured)].filter((s,i,a)=>a.findIndex(x=>x.id===s.id)===i).slice(0,5)
 return <section className="ica-intl-hero" aria-labelledby="ica-global-headlines">
  <div className="ica-intl-hero-title"><div><span className="ica-intl-kicker" >{L('globalEdition')}</span><h1 id="ica-global-headlines">{L('worldPerspective')}<span className="ica-intl-red-dot">.</span></h1><p>{L('heroDescription')}</p></div><div className="ica-intl-edition"><span>{L('dailyEdition')}</span><strong>{L('globalDesk')}</strong><small>{formatLocalDate(new Date(),lang,{day:'numeric',month:'long',year:'numeric'})}</small></div></div>
  {picks.length? <div className="ica-intl-hero-grid">
   <WireHeadline story={picks[0]} variation="lead"/>
   <div className="ica-intl-hero-secondary">{picks.slice(1,3).map(x=><WireHeadline story={x} key={x.id}/>)}</div>
   <aside className="ica-intl-hero-side"><div className="ica-intl-side-title"><span>{L('newsList')}</span><a href={path('/desk/latest')}>{L('allLatest')} ↗</a></div>{picks.slice(3).map((s,i)=><WireHeadline key={s.id} story={s} variation="compact" number={i+1}/>)}<div className="ica-intl-hero-source-note">{L('sourceNote')}</div></aside>
  </div> : <div className="ica-intl-empty"><div><strong>{L('connecting')}</strong><p>{L('connectingDetails')}</p></div><a href={path('/desk/latest')}>{L('viewWire')} ↗</a></div>}
 </section>
}
export function TrendingDesk({articles,wire}:{articles:ICAArticle[];wire:WireItem[]}){
 const {path,L,lang}=useICA()
 const all=splitStories(articles,wire,path)
 const editorPicks=all.filter(x=>x.trending)
 const cards=[...editorPicks,...all.filter(x=>!x.trending)].slice(0,7)
 return <section className="ica-intl-trending" aria-labelledby="ica-trending-title">
  <div className="ica-intl-trending-top"><div><span className="ica-intl-kicker">{L('curated')}</span><h2 id="ica-trending-title">{L('trendingFocus')}<span className="ica-intl-red-dot">.</span></h2></div><a href={path('/desk/trending')}>{L('exploreTrending')} ↗</a></div>
  <p className="ica-intl-explain">{L('trendingDisclaimer')}</p>
  {cards.length?<div className="ica-intl-trending-rail">{cards.map((s,i)=><a key={s.id} href={s.url} target={s.kind==='external'?'_blank':undefined} rel={s.kind==='external'?'noopener noreferrer':undefined} className="ica-trending-tile"><span className="ica-trending-number">{String(i+1).padStart(2,'0')}</span><span className="ica-trending-topic">{deskName(lang,s.region)} / {deskName(lang,s.desk)}</span><h3 lang={s.language} dir="auto">{s.title}</h3><div><span>{s.source}</span><span>{formatLocalDate(s.date,lang)}</span></div></a>)}</div>:<p className="ica-intl-placeholder">{L('noSourceYet')}</p>}
 </section>
}
export function SectionMosaic({articles,wire}:{articles:ICAArticle[];wire:WireItem[]}){
 const {path,L,lang}=useICA()
 const all=splitStories(articles,wire,path)
 return <section className="ica-intl-mosaic" aria-labelledby="ica-desks-title">
  <div className="ica-intl-section-heading"><div><span className="ica-intl-kicker">{L('internationalRegional')}</span><h2 id="ica-desks-title">{L('acrossDesks')}<span className="ica-intl-red-dot">.</span></h2></div><a href={path('/desk/latest')}>{L('allCoverage')} ↗</a></div>
  <div className="ica-intl-mosaic-grid">{primaryDeskKeys.map((key,index)=>{
   const desk=deskBySlug(key)
   const hits=all.filter(x=>desk?.region?x.region===desk.region:x.desk===desk?.desk).slice(0,4)
   return <section key={key} className={'ica-intl-desk-card ica-intl-desk-card-'+key}>
    <div className="ica-intl-desk-header"><div><span>{String(index+1).padStart(2,'0')} / {L('deskLabel')}</span><h3>{deskName(lang,key)}</h3></div><a href={path('/desk/'+key)} aria-label={L('expand')+' '+deskName(lang,key)}>↗</a></div>
    <p>{deskDescription(lang,key)}</p>
    <div className="ica-intl-desk-list">{hits.length?hits.map(x=><a key={x.id} href={x.url} target={x.kind==='external'?'_blank':undefined} rel={x.kind==='external'?'noopener noreferrer':undefined}><strong lang={x.language} dir="auto">{x.title}</strong><span>{x.source} · {formatLocalDate(x.date,lang)} ↗</span></a>):<span className="ica-intl-desk-empty">{L('noDeskCoverage')}</span>}</div>
    <a className="ica-intl-desk-footer" href={path('/desk/'+key)}>{L('openDesk')} {deskName(lang,key)} <span aria-hidden="true">→</span></a>
   </section>
  })}</div>
 </section>
}
export function MarketSourceStrip(){
 const {path,L,lang}=useICA()
 return <section className="ica-intl-market-strip" aria-label={L('economicIntelligence')}>
  <div><span>{L('economicIntelligence')}</span><h2>{L('marketsContext')}</h2><p>{L('marketsDetails')}</p><a href={path('/desk/markets')}>{L('visitMarkets')} ↗</a></div>
  <div className="ica-intl-market-resources">
   {[sourceCatalog[1],sourceCatalog[2],sourceCatalog[3],sourceCatalog[6]].map(s=><a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"><span>{deskName(lang,s.categoryDesk)}</span><strong>{s.name}</strong><small>{L('officialData')} ↗</small></a>)}
  </div>
 </section>
}
export function RegionNavigation(){
 const {path,L,lang}=useICA()
 return <nav className="ica-desk-nav" aria-label={L('globalDesks')}><span>{L('expand')}</span><div>
  {ICA_DESKS.filter(x=>x.slug!=='latest').map(x=><a key={x.slug} href={path('/desk/'+x.slug)}>{deskName(lang,x.slug)}</a>)}
 </div></nav>
}
const bilateralCopy={
 en:{label:'IRAQ × CHINA / BILATERAL DESK',title:'The Bilateral Briefing',intro:'A dedicated editorial desk for verified Iraq–China reporting, interviews and explainers across commerce, education and culture. This is ICA reporting, not an official CCC event bulletin.',weekly:'Weekly briefing',awaiting:'No weekly briefing is published in this desk yet. Subscribe for editorial updates rather than treating a draft as current news.',topics:'Explore the context',topicsText:'Filter published articles and attributed source links. These themes are editorial directions, not claims of a current briefing.',topicNames:['Trade and sourcing','Education and learning','Culture and exchange'],keywords:['trade','education','culture'],official:'Official CCC Expo information',officialText:'For the Economic Summit & Bilateral Expo, CCC controls event status and the interest-enquiry process; ICA handles reporting and interviews. Read the story here, then use CCC to enquire.',officialLink:'View CCC Expo and register interest',policy:'How we report'},
 zh:{label:'伊拉克 × 中国 / 双边新闻',title:'双边新闻简报',intro:'关于伊中贸易、教育和文化的核实报道、采访和背景解读。ICA 新闻不等于 CCC 官方活动公告。',weekly:'每周简报',awaiting:'尚无本栏已发表的每周简报；请订阅编辑动态，不应将草稿视为新闻。',topics:'理解背景',topicsText:'筛选已发表文章和注明来源的外部链接。主题仅为编辑方向。',topicNames:['贸易与采购','教育与学习','文化交流'],keywords:['trade','education','culture'],official:'CCC 博览会官方信息',officialText:'CCC 发布活动状态及意向申请，ICA 负责报道与采访。',officialLink:'了解博览会并登记意向',policy:'我们的报道原则'},
 ar:{label:'العراق × الصين / المكتب الثنائي',title:'الموجز الثنائي',intro:'تقارير ومقابلات وشروح متحقّق منها حول التجارة والتعليم والثقافة بين العراق والصين. هذه الصحافة ليست إعلاناً رسمياً لفعالية CCC.',weekly:'الموجز الأسبوعي',awaiting:'لم يُنشر موجز أسبوعي بعد. اشترك للتحديثات ولا تتعامل مع المسودات كأخبار منشورة.',topics:'استكشف السياق',topicsText:'صفّ التقارير المنشورة وروابط المصادر المنسوبة. هذه موضوعات تحريرية وليست نشرات حالية.',topicNames:['التجارة والتوريد','التعليم واللغة','الثقافة والتبادل'],keywords:['trade','education','culture'],official:'المعلومات الرسمية لمعرض CCC',officialText:'تتولى CCC حالة المعرض وتسجيل الاهتمام، بينما تغطي ICA الأخبار والمقابلات.',officialLink:'استكشف المعرض وسجّل اهتمامك',policy:'كيف نعمل صحفياً'},
 ckb:{label:'عێراق × چین / مێزی دوولایەنە',title:'پوختەی دوولایەنە',intro:'ڕاپۆرت و چاوپێکەوتن و ڕوونکردنەوەی پشتڕاستکراو دەربارەی بازرگانی و خوێندن و کەلتووری عێراق و چین.',weekly:'پوختەی هەفتانە',awaiting:'هێشتا هیچ پوختەی هەفتانەی بڵاوکراوە نییە. بۆ نوێکارییەکان بەشداربە، نەک وەرگرتنی ڕەشنووس وەک هەواڵ.',topics:'پاشبنەمای بابەتەکان',topicsText:'وتارە بڵاوکراوەکان و بەستەری سەرچاوە دیاریکراوەکان پاڵاوتن بکە.',topicNames:['بازرگانی و دابینکردن','خوێندن و زمان','کەلتوور و ئاڵوگۆڕ'],keywords:['trade','education','culture'],official:'زانیاری فەرمی پێشانگای CCC',officialText:'CCC دۆخی پێشانگا و پرسیارەکان بەڕێوە دەبات؛ ICA ڕووماڵی هەواڵ و چاوپێکەوتن دەکات.',officialLink:'پێشانگای CCC و تۆمارکردنی ئارەزوو',policy:'چۆن ڕاپۆرت دەکەین'}
} as const

export function DeskPage({desk,wire,articles,refreshedAt}:{desk:string;wire:WireItem[];articles:ICAArticle[];refreshedAt:string|null}){
 const {path,L,lang}=useICA()
 const current=deskBySlug(desk)||ICA_DESKS[0]
 const [active,setActive]=useState<'all'|'ica'|'external'>('all')
 const [search,setSearch]=useState('')
 const [items,setItems]=useState(wire)
 const [date,setDate]=useState(refreshedAt)
 const [syncing,setSyncing]=useState(false)
 const [error,setError]=useState('')
 const b=bilateralCopy[lang]
 const weekly=desk==='bilateral'?articles.find(a=>a.type==='analysis'&&/weekly|أسبوعي|هەفتانە|每周/i.test(a.title)&&a.status==='published'&&a.published_at):undefined
 const all=useMemo(()=>splitStories(articles,items,path),[articles,items,path])
 const filtered=all.filter(s=>(active==='all'||s.kind===active)&&[s.title,s.summary,s.source,s.region,s.desk].join(' ').toLowerCase().includes(search.toLowerCase()))
 async function sync(){
  setSyncing(true);setError('')
  try{
   const r=await fetch('/api/ica-wire?desk='+encodeURIComponent(current.slug),{cache:'no-store'})
   const data=await r.json() as {ok:boolean;items?:WireItem[];refreshedAt?:string|null}
   if(!r.ok||!data.ok)throw new Error(L('feedUnavailable'))
   setItems(data.items||[]);setDate(data.refreshedAt||null)
  }catch(e){setError(e instanceof Error?e.message:L('refreshFailed'))}
  finally{setSyncing(false)}
 }
 return <Shell><main className="ica-page-content ica-desk-page">
  <div className="ica-desk-intro"><span className="ica-intl-kicker">{L('internationalNewsroom')}</span><h1>{deskName(lang,current.slug)}<span className="ica-intl-red-dot">.</span></h1><p>{deskDescription(lang,current.slug)}</p><div className="ica-desk-updated"><span>{L('attributedDisclaimer')}</span><span>{L('sourceSync')}: {date?formatLocalDate(date,lang):L('awaitingSync')}</span></div></div>
  <RegionNavigation/>
  {desk==='bilateral'&&<section className="ica-desk-verify" aria-labelledby="ica-bilateral-briefing-title">
   <span>{b.label}</span><h2 id="ica-bilateral-briefing-title">{b.title}</h2><p>{b.intro}</p>
   <h3>{b.weekly}</h3>
   {weekly?<p><a href={path('/news/'+weekly.slug)}>{weekly.title} · {formatLocalDate(weekly.published_at||'',lang)} ↗</a></p>:
    <p>{b.awaiting} <a href={path('/newsroom')}>ICA Newsroom ↗</a></p>}
   <h3>{b.topics}</h3><p>{b.topicsText}</p>
   <div className="ica-desk-controls"><div role="group" aria-label={b.topics}>
    {b.topicNames.map((name,i)=><button key={b.keywords[i]} type="button" onClick={()=>{setActive('all');setSearch(b.keywords[i])}}>{name}</button>)}
   </div></div>
   <h3>{b.official}</h3><p>{b.officialText}</p>
   <p><a href="https://ccc-iraq-cultural-centre.vercel.app/summit" target="_blank" rel="noopener noreferrer">{b.officialLink} ↗</a> · <a href={path('/newsroom#how-we-report')}>{b.policy} ↗</a></p>
  </section>}
  <div className="ica-desk-filter-header"><div><h2>{L('coverageSources')}</h2><p>{L('originalLinks')}</p></div><button type="button" onClick={()=>void sync()} disabled={syncing}>{syncing?L('checkingFeeds'):L('refreshHeadlines')+' ↻'}</button></div>
  {error&&<p className="ica-intl-error" role="status">{error}</p>}
  <div className="ica-desk-controls"><div role="group" aria-label={L('publishingOrigin')}>
   {([['all',L('allCoverage')],['ica',L('icaReporting')],['external',L('externalHeadlines')]] as const).map(([key,label])=><button key={key} type="button" aria-pressed={active===key} onClick={()=>setActive(key)}>{label}</button>)}
   </div><label><span className="sr-only">{L('searchDesk')}</span><input type="search" placeholder={L('searchDesk')} value={search} onChange={e=>setSearch(e.target.value)}/></label>
  </div>
  <p className="ica-desk-results-count" role="status">{filtered.length} {filtered.length===1?L('result'):L('results')} · {deskName(lang,current.slug)}</p>
  {filtered.length?<div className="ica-desk-story-grid">{filtered.map(x=><WireHeadline story={x} key={x.id}/>)}</div>:<div className="ica-intl-empty"><div><strong>{L('noMatching')}</strong><p>{L('noMatchingDescription')}</p></div><a href={path('/topics')}>{L('browseTopics')} ↗</a></div>}
  <div className="ica-desk-verify"><span>{L('editorialPolicy')}</span><p>{L('policyDetails')}</p></div>
  <section className="ica-intl-source-directory"><div><h2>{L('sourceDirectory')}</h2><p>{L('sourceDirectoryDetails')}</p></div><div>{sourceCatalog.map(s=><a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"><span>{deskName(lang,s.categoryDesk)}</span><strong>{s.name}</strong><span aria-hidden="true">↗</span></a>)}</div></section>
  <Newsletter/>
 </main></Shell>
}
