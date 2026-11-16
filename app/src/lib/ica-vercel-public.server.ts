// Read-only public ICA data adapter for Vercel SSR. Uses Supabase anon/publishable access,
// never service-role credentials; RLS restricts rows to published/linked content.
import type { ICAArticle, ICAMedia } from './ica.server'
import type { WireItem } from './ica-wire.server'
import { deskBySlug, isDesk } from './ica-desks'
import {filterEnabledWirePublishers} from './ica-headline-policy'

type Row = Record<string, unknown>
const validTypes = ['news','press','culture','entertainment','analysis']
const validLangs = ['en','ar','ckb','zh']
const value = (r: Row, k: string) => typeof r[k] === 'string' ? r[k] as string : ''
const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) ? v : 0
const bool = (v: unknown) => v === true || v === 1
function config() {
  const url = process.env.ICA_SUPABASE_URL || process.env.VITE_ICA_SUPABASE_URL
  const key = process.env.ICA_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_ICA_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key || !/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(url)) {
    console.error('ICA public Supabase connection not configured')
    return null
  }
  return { url, key }
}
type PublicTable='ica_news_articles'|'ica_wire_items'|'ica_wire_sources'|'ica_media_library'|'ica_live_updates_v42'|'rpc/ica_public_story_assets_v44'
const PUBLIC_CACHE_TTL:Record<PublicTable,number>={
 'ica_news_articles':10000,'ica_wire_items':3000,'ica_wire_sources':0,
 'ica_media_library':15000,'ica_live_updates_v42':2000,
 'rpc/ica_public_story_assets_v44':15000
}
// Bounded in-isolate cache: public RLS projections only, no staff JWT or drafts.
// Publisher switches always re-read the original register; breaking updates expire in 2s.
// TTL is not cross-region invalidation and is not used as a publication receipt.
const publicCache=new Map<string,{until:number;rows:Row[]}>()
const inFlightReads=new Map<string,Promise<Row[]>>()
const PUBLIC_CACHE_MAX=96
async function read(table:PublicTable, params:Record<string,string>):Promise<Row[]>{
 const env=config()
 if(!env)return []
 const target=new URL('/rest/v1/'+table,env.url)
 target.searchParams.set('select','*')
 for(const [k,v] of Object.entries(params))target.searchParams.set(k,v)
 const uri=target.toString(),ttl=PUBLIC_CACHE_TTL[table]
 if(ttl>0){
  const saved=publicCache.get(uri)
  if(saved&&saved.until>Date.now())return saved.rows
  const busy=inFlightReads.get(uri)
  if(busy)return busy
 }
 const work=(async():Promise<Row[]>=>{
  try{
   const response=await fetch(uri,{
    headers:{apikey:env.key,accept:'application/json'},
    signal:AbortSignal.timeout(8000),cache:'no-store'
   })
   if(!response.ok){console.error('ICA public read failed',table,response.status);return []}
   const data:unknown=await response.json()
   const rows=Array.isArray(data)?data.filter((r):r is Row=>!!r&&typeof r==='object'&&!Array.isArray(r)):[]
   if(ttl>0){
    publicCache.delete(uri)
    publicCache.set(uri,{until:Date.now()+ttl,rows})
    while(publicCache.size>PUBLIC_CACHE_MAX)publicCache.delete(publicCache.keys().next().value!)
   }
   return rows
  }catch(error){
   console.error('ICA public read unavailable',table,error instanceof Error?error.name:'unknown')
   return []
  }finally{if(ttl>0)inFlightReads.delete(uri)}
 })()
 if(ttl>0)inFlightReads.set(uri,work)
 return work
}
function article(row:Row): ICAArticle {
  return {
    id:value(row,'id'),slug:value(row,'slug'),type:value(row,'type'),status:value(row,'status'),lang:value(row,'lang'),
    title:value(row,'title'),excerpt:value(row,'excerpt'),body:value(row,'body'),author:value(row,'author'),
    image_url:value(row,'image_url')||null,published_at:value(row,'published_at')||null,
    created_at:value(row,'created_at'),updated_at:value(row,'updated_at'),desk:value(row,'desk'),region:value(row,'region'),
    featured:bool(row.featured)?1:0,trending:bool(row.trending)?1:0,priority:number(row.priority),
  }
}
function wire(row:Row): WireItem {
  return {
    id:value(row,'id'),source_id:null,source_url:value(row,'source_url'),headline:value(row,'headline'),
    source_name:value(row,'source_name'),region:value(row,'region'),desk:value(row,'desk'),
    summary:value(row,'summary'),published_at:value(row,'published_at'),added_at:value(row,'created_at'),
    updated_at:value(row,'updated_at'),status:value(row,'status'),pinned:bool(row.pinned)?1:0,
    origin:value(row,'origin'),
  }
}
export async function readArticles(type='', lang='en', search='', limit=60):Promise<ICAArticle[]> {
  const params:Record<string,string>={status:'eq.published',order:'published_at.desc',limit:String(Math.max(1,Math.min(limit,100)))}
  if(validTypes.includes(type))params.type='eq.'+type
  if(validLangs.includes(lang))params.or='(lang.eq.'+lang+',lang.eq.en)'
  if(search.trim()) { const q=search.trim().replace(/[*,()]/g,' ').slice(0,75); if(q) params['title']='ilike.*'+q+'*' }
  return (await read('ica_news_articles',params)).map(article)
}
export async function readArticle(slug:string):Promise<ICAArticle|null> {
  if(!/^[a-z0-9-]{3,110}$/.test(slug))return null
  const rows=await read('ica_news_articles',{slug:'eq.'+slug,status:'eq.published',limit:'1'})
  return rows[0]?article(rows[0]):null
}
/** Only publicly published members of the SAME canonical translation group.
 * No drafts or editorial notes. Each language has its own crawlable story URL.
 */
export async function readPublishedStoryEditions(slug:string):Promise<Array<{lang:string;slug:string}>>{
 if(!/^[a-z0-9-]{3,110}$/.test(slug))return []
 const source=(await read('ica_news_articles',{
  select:'id,slug,lang,translation_group',slug:'eq.'+slug,status:'eq.published',limit:'1'
 }))[0]
 if(!source)return []
 const group=value(source,'translation_group')||value(source,'id')
 if(!/^[a-f0-9-]{36}$/i.test(group))return []
 const rows=await read('ica_news_articles',{
  select:'id,slug,lang,translation_group',status:'eq.published',
  or:'(id.eq.'+group+',translation_group.eq.'+group+')',limit:'10'
 })
 const seen=new Set<string>()
 return rows.filter(row=>validLangs.includes(value(row,'lang'))&&/^[a-z0-9-]{3,110}$/.test(value(row,'slug')))
  .sort((a,b)=>validLangs.indexOf(value(a,'lang'))-validLangs.indexOf(value(b,'lang')))
  .filter(row=>{const lang=value(row,'lang');if(seen.has(lang))return false;seen.add(lang);return true})
  .map(row=>({lang:value(row,'lang'),slug:value(row,'slug')}))
}

export type PublicIcaLiveUpdate={
 id:string;article_id:string;lang:string;headline:string;body:string;
 source_url:string;urgency:string;published_at:string;
}
/** Public-only updates: RLS additionally blocks unpublished parent articles.
 * Keep a strict projection to prevent audit / editorial identities leaking.
 */
export async function readPublicLiveUpdates(articleId:string):Promise<PublicIcaLiveUpdate[]>{
 if(!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(articleId))return []
 const rows=await read('ica_live_updates_v42',{
  select:'id,article_id,lang,headline,body,source_url,urgency,published_at',
  article_id:'eq.'+articleId,status:'eq.published',
  order:'published_at.desc',limit:'40'
 })
 return rows.filter(x=>validLangs.includes(value(x,'lang'))&&
  /^https:\/\/[^ ]{5,900}$/.test(value(x,'source_url'))&&
  ['normal','breaking','critical'].includes(value(x,'urgency'))).
  map(x=>({id:value(x,'id'),article_id:value(x,'article_id'),lang:value(x,'lang'),
   headline:value(x,'headline'),body:value(x,'body'),source_url:value(x,'source_url'),
   urgency:value(x,'urgency'),published_at:value(x,'published_at')}))
}

export type PublicIcaStoryAsset={
 asset_id:string;article_id:string;placement:string;sort_order:number;
 lang:string;title:string;alt_text:string;caption:string;credit:string;
 focal_x:number;focal_y:number
}
/** Published-only DAM metadata. The private Storage path is never returned. */
export async function readPublicStoryAssets(articleId:string):Promise<PublicIcaStoryAsset[]>{
 if(!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(articleId))return []
 const rows=await read('rpc/ica_public_story_assets_v44',{p_article:articleId})
 return rows.filter(x=>
  value(x,'article_id')===articleId&&
  /^[0-9a-f-]{36}$/i.test(value(x,'asset_id'))&&
  ['hero','inline','gallery','thumbnail','social'].includes(value(x,'placement'))&&
  validLangs.includes(value(x,'lang'))&&
  value(x,'alt_text').length>0
 ).slice(0,40).map(x=>({
  asset_id:value(x,'asset_id'),article_id:value(x,'article_id'),
  placement:value(x,'placement'),sort_order:number(x.sort_order),
  lang:value(x,'lang'),title:value(x,'title'),alt_text:value(x,'alt_text'),
  caption:value(x,'caption'),credit:value(x,'credit'),
  focal_x:Math.min(1,Math.max(0,number(x.focal_x))),
  focal_y:Math.min(1,Math.max(0,number(x.focal_y)))
 }))
}

export async function readMedia():Promise<ICAMedia[]> {
  const rows = await read('ica_media_library',{published:'eq.true',order:'created_at.desc',limit:'60'})
  return rows.map(row=>({
    id:value(row,'id'),title:value(row,'title'),kind:value(row,'kind'),
    category:value(row,'category'),description:value(row,'description'),url:value(row,'url'),
    poster_url:value(row,'poster_url')||null,published:bool(row.published)?1:0,
    created_at:value(row,'created_at')
  }))
}
export async function readWire(desk='latest',limit=90):Promise<{items:WireItem[],refreshedAt:string|null}> {
  const params:Record<string,string>={status:'eq.linked',order:desk==='trending'?'pinned.desc,published_at.desc':'published_at.desc',limit:String(Math.max(1,Math.min(limit,200)))}
  const matched=deskBySlug(desk)
  if(matched && desk!=='latest' && desk!=='trending') {
    if(matched.region)params.region='eq.'+matched.region
    if(matched.desk)params.desk='eq.'+matched.desk
  }
  // Shared Supabase source register also serves the Central Command ICA editor.
  // Fail closed on unavailable publisher controls: do not leak paused sources
  // back into the scrolling public latest-news ribbon.
  const [rows,publishers]=await Promise.all([
   read('ica_wire_items',params),
   read('ica_wire_sources',{select:'publisher,enabled',enabled:'eq.true',limit:'100'})
  ])
  const enabled=publishers.map(s=>({publisher:value(s,'publisher'),enabled:bool(s.enabled)}))
  return {items:filterEnabledWirePublishers(rows.map(wire),enabled),refreshedAt:null}
}
export async function readHome(lang='en') {
  const [articles,media,wire]=await Promise.all([readArticles('',lang,'',24),readMedia(),readWire('latest',90)])
  return {articles,media:media.slice(0,6),wire}
}
export async function readDesk(desk:string,lang='en') {
  const safeDesk=isDesk(desk)?desk:'latest'
  const [wire,allArticles]=await Promise.all([readWire(safeDesk,100),readArticles('',lang,'',100)])
  const matched=deskBySlug(safeDesk)
  const articles=safeDesk==='latest'?allArticles:safeDesk==='trending'?allArticles.filter(a=>a.trending||a.featured):allArticles.filter(a=>(!!matched?.region&&a.region===matched.region)||(!!matched?.desk&&a.desk===matched.desk))
  return {desk:safeDesk,wire,articles}
}
