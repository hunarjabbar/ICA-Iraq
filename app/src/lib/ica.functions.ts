import { createServerFn } from '@tanstack/react-start'
import {isLanguage} from './ica-i18n'
export const getHomeFeed = createServerFn({method:'GET'}).validator((data:{lang?:string})=>({
 lang:isLanguage(data?.lang)?data.lang:'en'
})).handler(async({data})=>{
 if(typeof process!=='undefined' && process.env.VERCEL){const {readHome}=await import('./ica-vercel-public.server');return readHome(data.lang)}
 const [{listArticles,listMedia},{getWireBoard}]=await Promise.all([import('./ica.server'),import('./ica-wire.server')])
 const [articles,media,wire]=await Promise.all([listArticles(undefined,data.lang,'',24),listMedia(),getWireBoard('latest',90)])
 return {articles,media:media.slice(0,6),wire}
})
export const getNewsFeed = createServerFn({method:'GET'}).validator((arg:{type?:string;search?:string;lang?:string})=>({
 type:typeof arg?.type==='string'?arg.type.slice(0,30):'',
 search:typeof arg?.search==='string'?arg.search.slice(0,100):'',
 lang:isLanguage(arg?.lang)?arg.lang:'en'
})).handler(async({data})=>{
 if(typeof process!=='undefined' && process.env.VERCEL){const {readArticles}=await import('./ica-vercel-public.server');return readArticles(data.type,data.lang,data.search,60)}
 const {listArticles}=await import('./ica.server')
 return listArticles(data.type,data.lang,data.search,60)
})
export const getArticleDetails = createServerFn({method:'GET'}).validator((data:{slug:string})=>({slug:String(data?.slug||'').slice(0,110)})).handler(async({data})=>{
 if(typeof process!=='undefined' && process.env.VERCEL){const {readArticle}=await import('./ica-vercel-public.server');return readArticle(data.slug)}
 const {getArticle}=await import('./ica.server')
 return getArticle(data.slug)
})
export const getMediaFeed = createServerFn({method:'GET'}).handler(async()=>{
 if(typeof process!=='undefined' && process.env.VERCEL){const {readMedia}=await import('./ica-vercel-public.server');return readMedia()}
 const {listMedia}=await import('./ica.server');return listMedia()
})

export const getPortalDesk = createServerFn({method:'GET'}).validator((data:{desk:string;lang?:string})=>({
 desk:typeof data?.desk==='string'?data.desk.slice(0,30):'latest',
 lang:isLanguage(data?.lang)?data.lang:'en'
})).handler(async({data})=>{
 if(typeof process!=='undefined' && process.env.VERCEL){const {readDesk}=await import('./ica-vercel-public.server');return readDesk(data.desk,data.lang)}
 const [{listArticles},{getWireBoard},{deskBySlug}]=await Promise.all([import('./ica.server'),import('./ica-wire.server'),import('./ica-desks')])
 const desk=deskBySlug(data.desk)?data.desk:'latest'
 const [wire,allArticles]=await Promise.all([getWireBoard(desk,100),listArticles(undefined,data.lang,'',100)])
 const matched=deskBySlug(desk)
 const articles=desk==='latest'?allArticles:desk==='trending'?allArticles.filter(x=>x.trending||x.featured):allArticles.filter(a=>(!!matched?.region&&a.region===matched.region)||(!!matched?.desk&&a.desk===matched.desk))
 return {desk,wire,articles}
})
