// Read-only public ICA data adapter for Vercel SSR. Uses Supabase anon/publishable access,
// never service-role credentials; RLS restricts rows to published/linked content.
import type { ICAArticle, ICAMedia } from './ica.server'
import type { WireItem } from './ica-wire.server'
import { deskBySlug, isDesk } from './ica-desks'

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
async function read(table: 'ica_news_articles' | 'ica_wire_items' | 'ica_wire_sources' | 'ica_media_library', params: Record<string,string>): Promise<Row[]> {
  const env = config()
  if (!env) return []
  const target = new URL('/rest/v1/' + table, env.url)
  target.searchParams.set('select','*')
  for (const [k,v] of Object.entries(params)) target.searchParams.set(k,v)
  try {
    const response = await fetch(target.toString(), {
      headers: { apikey: env.key, accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!response.ok) { console.error('ICA public read failed', table, response.status); return [] }
    const result: unknown = await response.json()
    return Array.isArray(result) ? result.filter((r): r is Row => !!r && typeof r === 'object' && !Array.isArray(r)) : []
  } catch (error) { console.error('ICA public read unavailable', table, error instanceof Error ? error.name : 'unknown'); return [] }
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
  const rows=await read('ica_wire_items',params)
  return {items:rows.map(wire),refreshedAt:null}
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
