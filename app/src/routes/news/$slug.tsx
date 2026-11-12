import {createFileRoute} from '@tanstack/react-router'
import {getArticleDetails} from '@/lib/ica.functions'
import {Shell,useICA} from '@/components/ica/site'
import {formatLocalDate} from '@/lib/ica-i18n'
export const Route=createFileRoute('/news/$slug')({
 loader:({params})=>getArticleDetails({data:{slug:params.slug}}),
 head:({loaderData})=>({meta:[{title:loaderData?loaderData.title+' | ICA':'Article not found | ICA'},{name:'description',content:loaderData?.excerpt||'ICA newsroom article'}]}),
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
 const article=Route.useLoaderData();const {path,L,lang}=useICA()
 const related=article?relatedCCCForArticle(article):null
 const cccCopy=cccRelatedLabels[lang]
 if(!article)return <Shell><main className="ica-article-notfound"><h1>{L('articleNotAvailable')}</h1><p>{L('articleUnavailableDetail')}</p><a href={path('/news')}>{L('backNewsroom')} ↗</a></main></Shell>
 return <Shell><main className="ica-article"><a href={path('/news')} className="ica-article-back">← {L('backNews')}</a><div className="ica-article-head"><span>{article.type.toUpperCase()} / ICA</span><h1 lang={article.lang} dir="auto">{article.title}</h1><p lang={article.lang} dir="auto">{article.excerpt}</p>
 {article.lang!==lang&&<p className="ica-translation-note">{L('englishContent')}</p>}<div className="ica-byline"><span>{L('by')} {article.author}</span><time dateTime={article.published_at||undefined}>{article.published_at?formatLocalDate(article.published_at,lang):''}</time></div></div>{article.image_url&&<img className="ica-article-cover" src={article.image_url} alt="" />}<div className="ica-article-content" lang={article.lang} dir={article.lang==='ar'||article.lang==='ckb'?'rtl':'ltr'}>{article.body.split(/\n\s*\n/).filter(Boolean).map((p:string,i:number)=><p key={i}>{p}</p>)}</div>{related&&<aside className="ica-article-related" aria-label={cccCopy.title}>
 <strong>{cccCopy.title}</strong><p>{cccCopy.message}</p>
 <a href={'https://ccc-iraq-cultural-centre.vercel.app'+related+'?lang='+encodeURIComponent(lang)} target="_blank" rel="noopener noreferrer">{cccCopy.action} ↗</a>
 </aside>}<div className="ica-article-end"><p>{L('corrections')}</p><a href={path('/contact')}>{L('contactEditors')} ↗</a></div></main></Shell>
}
