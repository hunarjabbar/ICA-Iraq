import {createFileRoute} from '@tanstack/react-router'
import {listArticles} from '../lib/ica.server'
import {topics} from '../data/ica-topics'
import {ICA_DESKS} from '../lib/ica-desks'
/** Robots and search crawlers must see the actual escaped-dot route. */
export const Route=createFileRoute('/sitemap.xml')({
 server:{handlers:{GET:async()=>{
  const origin='https://ica-iraqi-chinese-agency.higgsfield.app'
  const fixed=['/','/news','/topics','/newsroom','/culture','/entertainment','/video','/about','/contact']
  const articles=await listArticles(undefined,'all','',100).catch(()=>[])
  const locations=[...new Set([...fixed,...ICA_DESKS.map(x=>'/desk/'+x.slug),...topics.map(x=>'/topics/'+x.slug),...articles.map(x=>'/news/'+x.slug)])]
  const xml='<?xml version="1.0" encoding="UTF-8"?>'+'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+locations.map(x=>'<url><loc>'+origin+x+'</loc></url>').join('')+'</urlset>'
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=1800','X-Content-Type-Options':'nosniff'}})
 }}}} as any)
