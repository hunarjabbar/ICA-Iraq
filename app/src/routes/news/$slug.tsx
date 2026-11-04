import {createFileRoute} from '@tanstack/react-router'
import {getArticleDetails} from '@/lib/ica.functions'
import {Shell,useICA} from '@/components/ica/site'
import {formatLocalDate} from '@/lib/ica-i18n'
export const Route=createFileRoute('/news/$slug')({
 loader:({params})=>getArticleDetails({data:{slug:params.slug}}),
 head:({loaderData})=>({meta:[{title:loaderData?loaderData.title+' | ICA':'Article not found | ICA'},{name:'description',content:loaderData?.excerpt||'ICA newsroom article'}]}),
 component:ArticleView,
})
function ArticleView(){
 const article=Route.useLoaderData();const {path,L,lang}=useICA()
 if(!article)return <Shell><main className="ica-article-notfound"><h1>{L('articleNotAvailable')}</h1><p>{L('articleUnavailableDetail')}</p><a href={path('/news')}>{L('backNewsroom')} ↗</a></main></Shell>
 return <Shell><main className="ica-article"><a href={path('/news')} className="ica-article-back">← {L('backNews')}</a><div className="ica-article-head"><span>{article.type.toUpperCase()} / ICA</span><h1 lang={article.lang} dir="auto">{article.title}</h1><p lang={article.lang} dir="auto">{article.excerpt}</p>
 {article.lang!==lang&&<p className="ica-translation-note">{L('englishContent')}</p>}<div className="ica-byline"><span>{L('by')} {article.author}</span><time dateTime={article.published_at||undefined}>{article.published_at?formatLocalDate(article.published_at,lang):''}</time></div></div>{article.image_url&&<img className="ica-article-cover" src={article.image_url} alt="" />}<div className="ica-article-content" lang={article.lang} dir={article.lang==='ar'||article.lang==='ckb'?'rtl':'ltr'}>{article.body.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div><div className="ica-article-end"><p>{L('corrections')}</p><a href={path('/contact')}>{L('contactEditors')} ↗</a></div></main></Shell>
}
