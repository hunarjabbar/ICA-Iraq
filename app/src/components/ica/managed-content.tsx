import {useEffect,useMemo,useState} from 'react'
import {useLocation} from '@tanstack/react-router'
import {getManagedPageBlocks} from '@/lib/ica.functions'
import {useICA} from './site'
import './managed-content.css'

type Block={
 id:string;page:string;section:string;block_key:string;lang:string;sort_order:number;
 published_document:Record<string,string>;published_at:string|null;
}
const SINGLE=new Set(['news','topics','newsroom','culture','video','entertainment','about','contact'])
const PAGE=/^\/desk\/([a-z0-9-]{2,40})(?:\/|$)/
const isSafeLink=(href:string)=>href.startsWith('/')&&!href.startsWith('//')||
 /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(href)
const isSafeImage=(href:string)=>href.startsWith('/assets/')||
 /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(href)
function pageFromRoute(pathname:string):string|null{
 if(pathname==='/'||pathname==='')return 'home'
 const m=PAGE.exec(pathname)
 if(m)return 'desk-'+m[1]
 const first=pathname.replace(/^\/+/,'').split('/')[0]
 return SINGLE.has(first)?first:null
}
/** A public render surface for published content only. No authoring API or staff links. */
export function ManagedICAContent(){
 const location=useLocation()
 const {lang,path}=useICA()
 const page=useMemo(()=>pageFromRoute(location.pathname),[location.pathname])
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
    {c.body&&<div className="ica-managed-body">{c.body.split(/\n{2,}/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>}
    {c.cta_label&&cta&&<a className="ica-managed-cta" href={cta}>{c.cta_label}<span aria-hidden="true"> ↗</span></a>}
   </div>
  </article>
 }
 return <aside className="ica-managed-sections" aria-label="ICA reviewed page content" data-managed-page={page}>
  {feature.length>0&&<div className="ica-managed-feature-list">{feature.map(item)}</div>}
  {other.length>0&&<div className="ica-managed-card-grid">{other.map(item)}</div>}
 </aside>
}
