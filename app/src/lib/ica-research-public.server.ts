// Canonical published ICA Research Atlas source, read with anon key only.
// All mutations are made inside Central Command through the MFA/reviewer/CEO RPC.
import type {ICATopic} from '../data/ica-topics'
const URL_RE=/^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i
type Raw=Record<string,unknown>
const str=(x:unknown,max:number)=>typeof x==='string'?x.slice(0,max):''
export async function readResearchAtlas():Promise<{available:boolean;items:ICATopic[]}>{
 const base=process.env.ICA_SUPABASE_URL||process.env.VITE_ICA_SUPABASE_URL
 const key=process.env.ICA_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_ICA_SUPABASE_PUBLISHABLE_KEY
 if(!base||!key||!/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(base))
  return {available:false,items:[]}
 const url=new URL('/rest/v1/ica_research_topics',base)
 url.searchParams.set('select','id,slug,title,summary,category,category_description,source_name,source_url,publisher,status')
 url.searchParams.set('status','eq.research-lead')
 url.searchParams.set('order','category.asc,title.asc')
 url.searchParams.set('limit','300')
 try{
  const response=await fetch(url.toString(),{
   headers:{apikey:key,accept:'application/json'},signal:AbortSignal.timeout(7500),cache:'no-store'
  })
  if(!response.ok)return {available:false,items:[]}
  const result:unknown=await response.json()
  if(!Array.isArray(result))return {available:false,items:[]}
  const items=result.filter((r):r is Raw=>!!r&&typeof r==='object'&&!Array.isArray(r))
   .map((r)=>{
    const sourceUrl=str(r.source_url,700)
    if(!URL_RE.test(sourceUrl)||r.status!=='research-lead')return null
    const slug=str(r.slug,120),title=str(r.title,220),summary=str(r.summary,1200)
    if(!/^[a-z0-9][a-z0-9-]{2,119}$/.test(slug)||title.length<10||summary.length<10)return null
    return {
     id:str(r.id,36),
     slug,title,summary,
     category:str(r.category,90),categoryDescription:str(r.category_description,500),
     sourceName:str(r.source_name,250),sourceUrl,
     publisher:str(r.publisher,190),state:'research-lead' as const
    }
   }).filter((x):x is ICATopic=>!!x)
  return {available:true,items}
 }catch{return {available:false,items:[]}}
}
