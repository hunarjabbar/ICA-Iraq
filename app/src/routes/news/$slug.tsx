import {createFileRoute} from '@tanstack/react-router'
import {getArticleDetails,getPublishedStoryEditions,getPublicIcaLiveUpdates} from '@/lib/ica.functions'
import {useEffect,useState} from 'react'
import {Shell,useICA} from '@/components/ica/site'
import {formatLocalDate,localeCodes,languageNames,isLanguage} from '@/lib/ica-i18n'
import {EditorialBody} from '@/components/ica/editorial-body'
export const Route=createFileRoute('/news/$slug')({
 loader:async({params})=>{
  const article=await getArticleDetails({data:{slug:params.slug}})
  const [editions,live]=article?await Promise.all([
   getPublishedStoryEditions({data:{slug:article.slug}}),
   getPublicIcaLiveUpdates({data:{articleId:article.id}})
  ]):[[],[]]
  return {article,editions,live}
 },
 head:({loaderData})=>{
  const article=loaderData?.article
  const editions=loaderData?.editions||[]
  const base='https://ica-international-portal.vercel.app/news/'
  const href=(slug:string,lang:string)=>base+encodeURIComponent(slug)+(lang==='en'?'':'?lang='+encodeURIComponent(lang))
  const canonical=article?href(article.slug,article.lang):base
  const alternates=editions.filter(e=>isLanguage(e.lang)).map(e=>({
   rel:'alternate',hrefLang:localeCodes[e.lang as keyof typeof localeCodes],href:href(e.slug,e.lang)
  }))
  const fallback=editions.find(e=>e.lang==='en')||editions[0]
  if(fallback)alternates.push({rel:'alternate',hrefLang:'x-default',href:href(fallback.slug,fallback.lang)})
  return {meta:[{title:article?article.title+' | ICA':'Article not found | ICA'},
   {name:'description',content:article?.excerpt||'ICA newsroom article'},
   {name:'robots',content:article?'index,follow':'noindex,nofollow'},
   ...(article?.published_at?[{property:'article:published_time',content:article.published_at}]:[])],
   links:[...(article?[{rel:'canonical',href:canonical}]:[]),...alternates]}
 },
 component:ArticleView,
})
const cccRelatedLabels={
 en:{title:'Related CCC Service',message:'Official CCC service information and enquiries are provided separately from ICA editorial reporting.',action:'View service at CCC'},
 zh:{title:'相关 CCC 服务',message:'CCC 官方服务信息及咨询与 ICA 编辑报道分开提供。',action:'前往 CCC 查看服务'},
 ar:{title:'خدمة CCC ذات صلة',message:'معلومات خدمات CCC الرسمية واستفساراتها منفصلة عن تغطية ICA التحريرية.',action:'افتح الخدمة في CCC'},
 ckb:{title:'خزمەتگوزاری پەیوەندیداری CCC',message:'زانیاری و پرسیاری فەرمیی CCC جیاوازن لە ڕاپۆرتی دەستەی نووسینی ICA.',action:'خزمەتگوزاریی CCC ببینە'}
} as const
function relatedCCCForArticle(article:{title:string;excerpt:string;type:string;region:string}):string|null{
 if(article.type!=='analysis'&&article.region!=='bilateral')return null
 const topic=(article.title+' '+article.excerpt).toLowerCase()
 if(/expo|summit|exhibit|بوور|معرض|博览|峰会/.test(topic))return '/summit'
 if(/visa|tourism|travel|تأشير|ڤیزا|签证|旅游/.test(topic))return '/visa-centre'
 if(/sourcing|shipping|customs|freight|import|export|trade|تجارة|شحن|贸易|物流/.test(topic))return '/bilateral-logistics-sourcing'
 if(/hsk|yct|bct|mandarin|chinese language|中文|语言|زمانی چینی/.test(topic))return '/language-centre/courses'
 if(/investment|market.entry|استثمار|投资|وەبەرهێنان/.test(topic))return '/investment-consultancy'
 if(/university|education|cultural exchange|culture|education|جامعة|文化|教育|کەلتوور/.test(topic))return '/exchange-programs'
 return null
}

function ArticleView(){
 const {article,editions,live}=Route.useLoaderData();const {path,L,lang}=useICA()
 const [updates,setUpdates]=useState(live)
 useEffect(()=>{setUpdates(live)},[live])
 useEffect(()=>{
  if(!article?.id)return
  let active=true
  const update=async()=>{
   if(document.hidden)return
   try{
    const fresh=await getPublicIcaLiveUpdates({data:{articleId:article.id}})
    if(active&&Array.isArray(fresh))setUpdates(fresh)
   }catch{/* Keep the last server-verified updates if connectivity is interrupted. */}
  }
  const visible=()=>{if(!document.hidden)void update()}
  const interval=window.setInterval(()=>{void update()},30000)
  document.addEventListener('visibilitychange',visible)
  return ()=>{active=false;window.clearInterval(interval);document.removeEventListener('visibilitychange',visible)}
 },[article?.id])
 const related=article?relatedCCCForArticle(article):null
 const cccCopy=cccRelatedLabels[lang]
 if(!article)return <Shell><main className="ica-article-notfound"><h1>{L('articleNotAvailable')}</h1><p>{L('articleUnavailableDetail')}</p><a href={path('/news')}>{L('backNewsroom')} ↗</a></main></Shell>
 return <Shell><main className="ica-article"><a href={path('/news')} className="ica-article-back">← {L('backNews')}</a><div className="ica-article-head"><span>{article.type.toUpperCase()} / ICA</span><h1 lang={article.lang} dir="auto">{article.title}</h1><p lang={article.lang} dir="auto">{article.excerpt}</p>
 {article.lang!==lang&&<p className="ica-translation-note">{L('englishContent')}</p>}<div className="ica-byline"><span>{L('by')} {article.author}</span><time dateTime={article.published_at||undefined}>{article.published_at?formatLocalDate(article.published_at,lang):''}</time></div>{editions.length>1&&<nav className="ica-story-editions" aria-label="Published language editions">{editions.filter(e=>e.slug!==article.slug&&isLanguage(e.lang)).map(e=><a key={e.lang} href={'/news/'+encodeURIComponent(e.slug)+(e.lang==='en'?'':'?lang='+e.lang)} lang={e.lang} hrefLang={localeCodes[e.lang as keyof typeof localeCodes]}>{languageNames[e.lang as keyof typeof languageNames]}</a>)}</nav>}</div>{article.image_url&&<img className="ica-article-cover" src={article.image_url} alt="" />}<div className="ica-article-content" lang={article.lang} dir={article.lang==='ar'||article.lang==='ckb'?'rtl':'ltr'}><EditorialBody body={article.body}/></div>{updates.length>0&&<section className="ica-live-timeline" aria-labelledby="ica-breaking-timeline" lang={article.lang} dir={article.lang==='ar'||article.lang==='ckb'?'rtl':'ltr'}>
 <div className="ica-live-heading"><span className="ica-live-indicator" aria-hidden="true">●</span><h2 id="ica-breaking-timeline">{({en:'Live updates',ar:'تحديثات مباشرة',ckb:'نوێکارییە ڕاستەوخۆکان',zh:'实时更新'} as const)[lang]}</h2>
 <small>{({en:'Verified ICA reporting only',ar:'تقارير ICA المُتحقق منها فقط',ckb:'تەنها ڕاپۆرتی پشتڕاستکراوەی ICA',zh:'仅限经核实的 ICA 报道'} as const)[lang]}</small></div>
 <ol className="ica-live-items">{updates.map(update=><li key={update.id} className={'ica-live-item ica-live-'+update.urgency}>
  <div><span className="ica-live-urgency">{update.urgency}</span><time dateTime={update.published_at}>{formatLocalDate(update.published_at,lang,{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</time></div>
  <h3 lang={update.lang} dir="auto">{update.headline}</h3>
  <EditorialBody body={update.body} className="ica-live-copy"/>
  <a href={update.source_url} target="_blank" rel="noopener noreferrer">{({en:'Verified source',ar:'المصدر',ckb:'سەرچاوەی پشتڕاستکراوە',zh:'已核实来源'} as const)[lang]} ↗</a>
 </li>)}</ol>
 </section>}
 {related&&<aside className="ica-article-related" aria-label={cccCopy.title}>
 <strong>{cccCopy.title}</strong><p>{cccCopy.message}</p>
 <a href={'https://ccc-iraq-cultural-centre.vercel.app'+related+'?lang='+encodeURIComponent(lang)} target="_blank" rel="noopener noreferrer">{cccCopy.action} ↗</a>
 </aside>}<div className="ica-article-end"><p>{L('corrections')}</p><a href={path('/contact')}>{L('contactEditors')} ↗</a></div></main></Shell>
}
