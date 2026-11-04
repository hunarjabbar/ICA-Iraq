import * as workerRuntime from 'cloudflare:workers'
import {database} from './ica.server'
import {classifyFeedItem,deskBySlug,isDesk} from './ica-desks'

/** Publisher-linked external headlines. These are not ICA reporting. */
export type WireItem = {
 id:string;source_id:string|null;source_url:string;headline:string;source_name:string;
 region:string;desk:string;summary:string;published_at:string;added_at:string;
 updated_at:string;status:string;pinned:number;origin:string;
}
export type WireSource = {
 id:string;name:string;publisher:string;feed_url:string;source_type:'rss'|'hkma-json';
 region:string;desk:string;enabled:number;checked_at:string|null;last_success_at:string|null;
 last_error:string|null;imported_count:number;
}
export type EditorialBrief = {
 kind:'ica'|'external';id:string;title:string;url:string;source:string;section:string;
 region:string;summary:string;date:string;pinned:boolean;featured:boolean;language:string;
}
const FRESH_MS=20*60*1000
const MAX_SOURCE_ITEMS=14
const MAX_FETCH_BYTES=700000
const validHosts=['rthk.hk','news.gov.hk','asean.org','hkma.gov.hk','news.un.org','un.org']
export function isAllowedSourceLink(url:string){return Boolean(approvedLink(url))}
function approvedLink(raw:string):string|null{
 try{
  const u=new URL(raw.trim())
  if(u.protocol!=='https:')return null
  const host=u.hostname.toLowerCase()
  if(!validHosts.some(h=>host===h||host.endsWith('.'+h)))return null
  if(u.username||u.password)return null
  return u.href.slice(0,700)
 }catch{return null}
}
function xmlEntities(text:string):string{
 return text.replace(/&#(x[0-9a-f]+|\d+);/gi,(_,number:string)=>{
  try{const num=number[0].toLowerCase()==='x'?parseInt(number.slice(1),16):parseInt(number,10);return num<32||num>0x10ffff||num>=0xd800&&num<=0xdfff?' ':String.fromCodePoint(num)}catch{return ''}
 }).replace(/&(amp|quot|apos|lt|gt|nbsp);/gi,(_,x:string)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '}[x.toLowerCase()]||''))
}
function cleanXML(value:string,max=250):string{
 return xmlEntities(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()).replace(/\s+/g,' ').slice(0,max).trim()
}
function xmlField(item:string,key:string):string{
 return new RegExp('<'+key+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+key+'>','i').exec(item)?.[1]||''
}
type ExternalHeadline={title:string;url:string;published_at:string}
export function parsePublisherRSS(xml:string):ExternalHeadline[]{
 const result:ExternalHeadline[]=[]
 if(!/<(?:rss|feed)\b/i.test(xml))return result
 const items=xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi)||[]
 for(const item of items.slice(0,MAX_SOURCE_ITEMS+8)){
  const title=cleanXML(xmlField(item,'title'),220)
  const url=approvedLink(cleanXML(xmlField(item,'link'),700))
  const rawDate=cleanXML(xmlField(item,'pubDate')||xmlField(item,'dc:date'),100)
  const epoch=Date.parse(rawDate)
  if(title.length<11||!url||!Number.isFinite(epoch)||epoch>Date.now()+86400000||epoch<Date.now()-1000*60*60*24*120)continue
  if(result.some(x=>x.url===url))continue
  result.push({title,url,published_at:new Date(epoch).toISOString()})
  if(result.length>=MAX_SOURCE_ITEMS)break
 }
 return result
}
export function parseHKMAJSON(json:unknown):ExternalHeadline[]{
 if(!json||typeof json!=='object')return []
 const rows=(json as {result?:{records?:unknown}}).result?.records
 if(!Array.isArray(rows))return []
 const result:ExternalHeadline[]=[]
 for(const raw of rows.slice(0,MAX_SOURCE_ITEMS+6)){
  if(!raw||typeof raw!=='object')continue
  const r=raw as {title?:unknown;link?:unknown;date?:unknown}
  if(typeof r.title!=='string'||typeof r.link!=='string'||typeof r.date!=='string')continue
  const title=cleanXML(r.title,220),url=approvedLink(r.link),epoch=Date.parse(r.date+'T00:00:00Z')
  if(title.length<11||!url||!Number.isFinite(epoch)||epoch>Date.now()+86400000||epoch<Date.now()-1000*60*60*24*120)continue
  if(result.some(x=>x.url===url))continue
  result.push({title,url,published_at:new Date(epoch).toISOString()})
  if(result.length>=MAX_SOURCE_ITEMS)break
 }
 return result
}
let currentRefresh:Promise<void>|undefined
/** Opportunistic synchronization, at most once per 20 minutes per publisher.
 * A D1 conditional lock avoids repeated imports under concurrent requests. */
export async function ensureWireFresh():Promise<void>{
 if(currentRefresh)return currentRefresh
 currentRefresh=refreshInternal(false).then(()=>undefined).finally(()=>{currentRefresh=undefined})
 return currentRefresh
}
export async function refreshWireNow():Promise<{checked:number;imported:number;failed:number}>{
 return refreshInternal(true,true)
}
async function refreshInternal(force:boolean,manual=false):Promise<{checked:number;imported:number;failed:number}>{
 const db=database();if(!db)return {checked:0,imported:0,failed:0}
 const now=new Date().toISOString(),expiry=new Date(Date.now()-FRESH_MS).toISOString()
 const sources=await db.prepare('SELECT * FROM ica_wire_sources WHERE enabled = 1'+(force?'':' AND (checked_at IS NULL OR checked_at < ?)')+' ORDER BY id LIMIT 8').bind(...(force?[]:[expiry])).all<WireSource>()
 let checked=0,imported=0,failed=0
 await Promise.allSettled((sources.results||[]).map(async source=>{
  // Never fetch arbitrary URLs from mutable tables.
  if(!approvedLink(source.feed_url)){failed++;return}
  if(!force){
   const lock=await db.prepare('UPDATE ica_wire_sources SET checked_at = ? WHERE id = ? AND (checked_at IS NULL OR checked_at < ?)').bind(now,source.id,expiry).run()
   if(!(lock.meta?.changes||0))return
  }else await db.prepare('UPDATE ica_wire_sources SET checked_at=? WHERE id=?').bind(now,source.id).run()
  checked++
  try{
   const resp=await fetch(source.feed_url,{
    headers:{'Accept':'application/rss+xml, application/xml, text/xml, application/json','User-Agent':'ICA-Newsroom/2.0 (+https://ica-iraqi-chinese-agency.higgsfield.app; linked headlines)'},
    signal:AbortSignal.timeout(manual?7000:5000)
   })
   if(!resp.ok)throw new Error('Publisher returned HTTP '+resp.status)
   const len=Number(resp.headers.get('content-length')||0)
   if(len>MAX_FETCH_BYTES)throw new Error('Publisher response exceeds size limit')
   const body=await resp.text()
   if(body.length>MAX_FETCH_BYTES)throw new Error('Publisher response too large')
   const items=source.source_type==='hkma-json'?parseHKMAJSON(JSON.parse(body) as unknown):parsePublisherRSS(body)
   if(items.length===0)throw new Error('Feed returned no valid recent headlines')
   const statements=items.map(x=>db.prepare(
    "INSERT OR IGNORE INTO ica_wire_items(id,source_id,source_url,headline,source_name,region,desk,summary,published_at,status,pinned,origin) VALUES(?,?,?,?,?,?,?,?,?,'linked',0,'feed')"
   ).bind(crypto.randomUUID(),source.id,x.url,x.title,source.publisher,source.region,classifyFeedItem(x.title,source.desk),'',x.published_at))
   if(statements.length)await db.batch(statements)
   const stored=await db.prepare('SELECT COUNT(*) AS n FROM ica_wire_items WHERE source_id=?').bind(source.id).first<{n:number}>()
   await db.prepare('UPDATE ica_wire_sources SET last_success_at=?,last_error=NULL,imported_count=? WHERE id=?').bind(new Date().toISOString(),stored?.n||0,source.id).run()
   imported+=items.length
  }catch(e){
   failed++
   const message=e instanceof Error?e.message:'Unknown feed error'
   await db.prepare('UPDATE ica_wire_sources SET last_error=? WHERE id=?').bind(message.slice(0,180),source.id).run().catch(()=>undefined)
  }
 }))
 return {checked,imported,failed}
}
export async function listWireItems(desk='latest',search='',limit=72,publicOnly=true):Promise<WireItem[]>{
 const db=database();if(!db)return []
 const terms:string[]=[];const params:(string|number)[]=[]
 if(publicOnly)terms.push("status='linked'")
 const matched=deskBySlug(desk)
 if(matched&&desk!=='latest'&&desk!=='trending'){
  if(matched.region){terms.push('region=?');params.push(matched.region)}
  if(matched.desk){terms.push('desk=?');params.push(matched.desk)}
 }
 if(desk==='trending'){terms.push("(pinned=1 OR published_at>=?)");params.push(new Date(Date.now()-86400000*2).toISOString())}
 const q=search.trim().slice(0,80);if(q){terms.push('(headline LIKE ? OR source_name LIKE ?)');params.push('%'+q+'%','%'+q+'%')}
 const where=terms.length?' WHERE '+terms.join(' AND '):''
 const order=desk==='trending'?'pinned DESC, published_at DESC':'published_at DESC'
 const r=await db.prepare('SELECT * FROM ica_wire_items'+where+' ORDER BY '+order+' LIMIT ?').bind(...params,Math.min(200,Math.max(1,limit))).all<WireItem>()
 return r.results||[]
}
export async function listAdminWire():Promise<{items:WireItem[];sources:WireSource[]}>{
 const db=database();if(!db)return {items:[],sources:[]}
 const [a,b]=await Promise.all([
  db.prepare('SELECT * FROM ica_wire_items ORDER BY added_at DESC LIMIT 160').all<WireItem>(),
  db.prepare('SELECT * FROM ica_wire_sources ORDER BY id').all<WireSource>()
 ])
 return {items:a.results||[],sources:b.results||[]}
}
export function wireToBrief(w:WireItem):EditorialBrief{
 return {kind:'external',id:w.id,title:w.headline,url:w.source_url,source:w.source_name,section:w.desk,region:w.region,summary:w.summary||'',date:w.published_at,pinned:!!w.pinned,featured:!!w.pinned,language:'en'}
}
/**
 * Serve the stored, attributed wire immediately. Feed polling runs in the
 * Worker's background execution context so a slow/unavailable publisher cannot
 * hold the homepage open for five seconds or produce a blank SSR response.
 * Explicit reader refreshes can still request a blocking synchronization.
 */
export async function getWireBoard(
 desk='latest',limit=60,refresh:'background'|'blocking'|'none'='background'
):Promise<{items:WireItem[];refreshedAt:string|null}>{
 if(refresh==='background'){
  try{
   const task=ensureWireFresh().catch(()=>undefined)
   const schedule=(workerRuntime as unknown as {waitUntil?:(work:Promise<void>)=>void}).waitUntil
   if(typeof schedule==='function')schedule(task)
   else await task // Compatible fallback for runtimes without module-scoped waitUntil.
  }catch{/* Publisher sync must never prevent readers accessing stored news. */}
 }else if(refresh==='blocking'){
  try{await ensureWireFresh()}catch{/* Keep cached headlines available on failure. */}
 }
 const db=database()
 const [items,last]=await Promise.all([
  listWireItems(isDesk(desk)?desk:'latest','',limit),
  db?.prepare('SELECT MAX(last_success_at) AS latest FROM ica_wire_sources').first<{latest:string|null}>()
 ])
 return {items,refreshedAt:last?.latest||null}
}
