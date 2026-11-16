import {useEffect,useMemo,useState} from 'react'
import {useLocation} from '@tanstack/react-router'
import {getManagedPageBlocks} from '@/lib/ica.functions'
import {isLanguage} from '@/lib/ica-i18n'
import {managedPageForPathname,localizedManagedHref} from '@/lib/ica-managed-routes'
import {EditorialBody} from './editorial-body'
import './managed-content.css'

type Block={
 id:string;page:string;section:string;block_key:string;lang:string;sort_order:number;
 published_document:Record<string,string>;published_at:string|null;
}
const isSafeLink=(href:string)=>href.startsWith('/')&&!href.startsWith('//')||
 /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(href)
const isSafeImage=(href:string)=>href.startsWith('/assets/')||
 /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(href)
/** A public render surface for published content only. No authoring API or staff links. */
export function ManagedICAContent(){
 const location=useLocation()
 const query=location.href.split('?')[1]?.split('#')[0]||''
 const raw=new URLSearchParams(query).get('lang')
 const lang=isLanguage(raw)?raw:'en'
 const path=(target:string)=>localizedManagedHref(target,lang)
 const page=useMemo(()=>managedPageForPathname(location.pathname),[location.pathname])
 const [blocks,setBlocks]=useState<Block[]>([])
 useEffect(()=>{
  let active=true
  setBlocks([])
  if(!page)return
  getManagedPageBlocks({data:{page,lang}})
   .then(value=>{if(active)setBlocks(Array.isArray(value)?value:[])})
   .catch(()=>{if(active)setBlocks([])})
  return ()=>{active=false}
 },[page,lang])
 if(!page||!blocks.length)return null
 const feature=blocks.filter(b=>b.section==='hero'||b.section==='feature'||b.section==='intro')
 const other=blocks.filter(b=>!feature.includes(b))
 const href=(input:string)=>{
  if(!isSafeLink(input))return null
  return input.startsWith('/')?path(input):input
 }
 const item=(b:Block)=>{
  const c=b.published_document,cta=c.cta_href?href(c.cta_href):null
  const hero=b.section==='hero'
  return <article key={b.id} className={'ica-managed-card ica-managed-'+b.section} data-managed-key={b.block_key}>
   {c.image_url&&isSafeImage(c.image_url)&&c.image_alt&&<div className="ica-managed-image"><img src={c.image_url} alt={c.image_alt} loading="lazy" decoding="async"/></div>}
   <div className="ica-managed-copy">
    {c.eyebrow&&<span className="ica-managed-eyebrow">{c.eyebrow}</span>}
    {hero?<h2>{c.title}</h2>:<h3>{c.title}</h3>}
    {c.summary&&<p className="ica-managed-summary">{c.summary}</p>}
    {c.body&&<EditorialBody body={c.body} className="ica-managed-body"/>}
    {c.cta_label&&cta&&<a className="ica-managed-cta" href={cta}>{c.cta_label}<span aria-hidden="true"> ↗</span></a>}
   </div>
  </article>
 }
 return <aside className="ica-managed-sections" aria-label="ICA reviewed page content" data-managed-page={page}>
  {feature.length>0&&<div className="ica-managed-feature-list">{feature.map(item)}</div>}
  {other.length>0&&<div className="ica-managed-card-grid">{other.map(item)}</div>}
 </aside>
}
