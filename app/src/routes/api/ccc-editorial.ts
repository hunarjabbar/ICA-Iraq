import {createFileRoute} from '@tanstack/react-router'
import {listArticles} from '../../lib/ica.server'
import {isLanguage} from '../../lib/ica-i18n'

/** Public-only, cross-portal feed: published ICA editorial reports, never a simulated newswire. */
const headers={
 'Cache-Control':'public, max-age=60, stale-while-revalidate=180',
 'Access-Control-Allow-Origin':'*',
 'X-Content-Type-Options':'nosniff',
}
export const Route=createFileRoute('/api/ccc-editorial')({
 server:{handlers:{GET:async({request}:{request:Request})=>{
  const u=new URL(request.url)
  const raw=u.searchParams.get('lang')||'en'
  const lang=isLanguage(raw)?raw:'en'
  try{
   // listArticles applies status='published' and published_at IS NOT NULL.
   const published=await listArticles(undefined,lang,'',100,true)
   const items=published
    .filter(article=>(article.featured===1||article.region==='bilateral')&&
     article.status==='published'&&article.published_at&&
     /^[a-z0-9-]{3,110}$/.test(article.slug))
    .sort((a,b)=>Number(b.featured||0)-Number(a.featured||0)||
     Date.parse(b.published_at||'')-Date.parse(a.published_at||''))
    .slice(0,3)
    .map(article=>({
     slug:article.slug,
     title:article.title.trim().slice(0,230),
     excerpt:(article.excerpt||'').trim().slice(0,500),
     published_at:article.published_at,
     lang:article.lang,
     type:article.type,
     label:'Original ICA reporting',
    }))
   return Response.json({ok:true,items},{headers})
  }catch{
   return Response.json({ok:false,items:[]},{status:503,headers:{...headers,'Cache-Control':'no-store'}})
  }
 }}} as any)
