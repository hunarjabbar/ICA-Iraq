import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react'
import {useLocation} from '@tanstack/react-router'
import {getManagedPageBlocks} from '@/lib/ica.functions'
import {isLanguage} from '@/lib/ica-i18n'
import {managedPageForPathname,localizedManagedHref} from '@/lib/ica-managed-routes'
import {EditorialBody} from './editorial-body'
import './managed-content.css'

export type ICAManagedBlock={
 id:string;page:string;section:string;block_key:string;lang:string;sort_order:number;
 published_document:Record<string,string>;published_at:string|null;
}
type Source={page:string|null;blocks:ICAManagedBlock[];lang:string}
const Context=createContext<Source>({page:null,blocks:[],lang:'en'})
export const ICA_NATIVE_HOME_ZONES=Object.freeze({
 hero:'home-headline',
 featureStrip:'feature-strip',
 culture:'culture-spotlight',
 video:'video-stage'
})
const nativeSlotSections=new Map<string,string>([
 [ICA_NATIVE_HOME_ZONES.hero,'hero'],
 [ICA_NATIVE_HOME_ZONES.featureStrip,'intro'],
 [ICA_NATIVE_HOME_ZONES.culture,'feature'],
 [ICA_NATIVE_HOME_ZONES.video,'feature']
])
const safeHttp=(s:string)=>/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(s)
export const safeManagedHref=(href:string,lang:string):string|null=>{
 if(!href||!(href.startsWith('/')&&!href.startsWith('//')||safeHttp(href)))return null
 return href.startsWith('/')?localizedManagedHref(href,lang):href
}
export const safeManagedImage=(href:string)=>href.startsWith('/assets/')||safeHttp(href)

/** Shared published snapshot for native page placements and additional custom cards.
 * The context contains PUBLIC approved documents only, never the protected draft register.
 */
export function ICAContentProvider({children}:{children:ReactNode}){
 const location=useLocation()
 const query=location.href.split('?')[1]?.split('#')[0]||''
 const raw=new URLSearchParams(query).get('lang')
 const lang=isLanguage(raw)?raw:'en'
 const page=useMemo(()=>managedPageForPathname(location.pathname),[location.pathname])
 const key=(page||'none')+':'+lang
 const [published,setPublished]=useState<{key:string;blocks:ICAManagedBlock[]}>({key:'',blocks:[]})
 useEffect(()=>{
  let active=true
  setPublished({key,blocks:[]})
  if(!page)return ()=>{active=false}
  getManagedPageBlocks({data:{page,lang}})
   .then(value=>{if(active)setPublished({key,blocks:Array.isArray(value)?value:[]})})
   .catch(()=>{if(active)setPublished({key,blocks:[]})})
  return ()=>{active=false}
 },[page,lang,key])
 const blocks=published.key===key?published.blocks:[]
 return <Context.Provider value={{page,blocks,lang}}>{children}</Context.Provider>
}
export function useManagedICAZone(section:string,blockKey:string):Record<string,string>|null{
 const {blocks}=useContext(Context)
 return blocks.find(b=>b.section===section&&b.block_key===blockKey)?.published_document||null
}
/** Extra editor-created sections; reserved home native zones render in their original positions. */
export function ManagedICAContent(){
 const {page,blocks,lang}=useContext(Context)
 if(!page||!blocks.length)return null
 const included=blocks.filter(b=>!(page==='home'&&nativeSlotSections.get(b.block_key)===b.section||
  page!=='home'&&b.section==='hero'&&b.block_key==='page-headline'))
 if(!included.length)return null
 const feature=included.filter(b=>b.section==='hero'||b.section==='feature'||b.section==='intro')
 const other=included.filter(b=>!feature.includes(b))
 const item=(b:ICAManagedBlock)=>{
  const c=b.published_document,cta=c.cta_href?safeManagedHref(c.cta_href,lang):null
  const hero=b.section==='hero'
  return <article key={b.id} className={'ica-managed-card ica-managed-'+b.section}
    data-managed-key={b.block_key}>
   {c.image_url&&safeManagedImage(c.image_url)&&c.image_alt&&
    <div className="ica-managed-image"><img src={c.image_url} alt={c.image_alt}
      loading="lazy" decoding="async"/></div>}
   <div className="ica-managed-copy">
    {c.eyebrow&&<span className="ica-managed-eyebrow">{c.eyebrow}</span>}
    {hero?<h2>{c.title}</h2>:<h3>{c.title}</h3>}
    {c.summary&&<p className="ica-managed-summary">{c.summary}</p>}
    {c.body&&<EditorialBody body={c.body} className="ica-managed-body"/>}
    {c.cta_label&&cta&&<a className="ica-managed-cta" href={cta}>{c.cta_label}
      <span aria-hidden="true"> ↗</span></a>}
   </div>
  </article>
 }
 return <aside className="ica-managed-sections" aria-label="ICA reviewed page content"
  data-managed-page={page}>
  {feature.length>0&&<div className="ica-managed-feature-list">{feature.map(item)}</div>}
  {other.length>0&&<div className="ica-managed-card-grid">{other.map(item)}</div>}
 </aside>
}
