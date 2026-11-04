import {createFileRoute} from '@tanstack/react-router'
export const Route=createFileRoute('/robots.txt')({
 server:{handlers:{GET:async()=>{
  return new Response('User-agent: *\nAllow: /\nDisallow: /studio\nDisallow: /api/\nSitemap: https://ica-iraqi-chinese-agency.higgsfield.app/sitemap.xml\n',{
   headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}
  })
 }}}})
