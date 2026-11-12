import {createFileRoute} from '@tanstack/react-router'
import {createServerOnlyFn} from '@tanstack/react-start'
import {topics} from '../data/ica-topics'
import {ICA_DESKS} from '../lib/ica-desks'
/** Robots and search crawlers must see the actual escaped-dot route. */
const handleGet=createServerOnlyFn(async()=>{
 const articles=typeof process!=='undefined'&&process.env.VERCEL
  ?await import('../lib/ica-vercel-public.server').then(m=>m.readArticles('', 'all', '', 100))
  :await import('../lib/ica.server').then(m=>m.listArticles(undefined, 'all', '', 100))
  const origin='https://ica-international-portal.vercel.app'
  const fixed=['/','/news','/topics','/newsroom','/culture','/entertainment','/video','/about','/contact']
  const locations=[...new Set([...fixed,...ICA_DESKS.map(x=>'/desk/'+x.slug),...topics.map(x=>'/topics/'+x.slug),...articles.map(x=>'/news/'+x.slug)])]
  const xml='<?xml version="1.0" encoding="UTF-8"?>'+'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+locations.map(x=>'<url><loc>'+origin+x+'</loc></url>').join('')+'</urlset>'
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=1800','X-Content-Type-Options':'nosniff'}})
})
export const Route=createFileRoute('/sitemap.xml')({server:{handlers:{GET:()=>handleGet()}}} as any)
