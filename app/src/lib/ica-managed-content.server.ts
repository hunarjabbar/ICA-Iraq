// Public-only, immutable ICA editorial snapshots. No staff credentials or write verbs.
// The Central Command Centre is the sole source of authored page/section/card changes.
export type ICAManagedBlock={
 id:string;page:string;section:string;block_key:string;lang:string;sort_order:number;
 published_document:Record<string,string>;published_at:string|null;
};
const PAGES=new Set(['home','news','topics','newsroom','culture','video','entertainment','about','contact']);
const LANGS=new Set(['en','ar','ckb','zh']);
type Row=Record<string,unknown>;
const fields=['title','eyebrow','summary','body','cta_label','cta_href','image_url','image_alt'];
function validatePage(page:string){
 return PAGES.has(page)||/^desk-[a-z0-9-]{2,40}$/.test(page);
}
function config(){
 const base=process.env.ICA_SUPABASE_URL||process.env.VITE_ICA_SUPABASE_URL;
 const key=process.env.ICA_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_ICA_SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key||!/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(base))return null;
 return {base,key};
}
function fromRow(row:Row):ICAManagedBlock|null{
 const doc=row.published_document;
 if(!doc||typeof doc!=='object'||Array.isArray(doc))return null;
 const values=doc as Record<string,unknown>;
 if(typeof values.title!=='string'||values.title.trim().length<3)return null;
 const published_document:Record<string,string>={};
 for(const f of fields)if(typeof values[f]==='string')published_document[f]=(values[f] as string).slice(0,f==='body'?8000:1200);
 const href=published_document.cta_href||'';
 const image=published_document.image_url||'';
 if(href&&!(/^\//.test(href)||/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(href)))published_document.cta_href='';
 if(image&&!(/^\/assets\//.test(image)||/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(image)))published_document.image_url='';
 if(typeof row.id!=='string'||typeof row.page!=='string'||typeof row.section!=='string'||
    typeof row.lang!=='string'||typeof row.block_key!=='string')return null;
 return {id:row.id,page:row.page,section:row.section,block_key:row.block_key,
  lang:row.lang,sort_order:typeof row.sort_order==='number'?row.sort_order:100,
  published_document,published_at:typeof row.published_at==='string'?row.published_at:null};
}
export async function readManagedBlocks(page:string,lang:string):Promise<ICAManagedBlock[]>{
 if(!validatePage(page))return [];
 const requested=LANGS.has(lang)?lang:'en';
 const env=config();if(!env)return [];
 const url=new URL('/rest/v1/ica_site_blocks',env.base);
 url.searchParams.set('select','id,page,section,block_key,lang,sort_order,published_document,published_at');
 url.searchParams.set('page','eq.'+page);
 url.searchParams.set('lang',requested==='en'?'eq.en':'in.(en,'+requested+')');
 url.searchParams.set('published_document','not.is.null');
 url.searchParams.set('archived_at','is.null');
 url.searchParams.set('order','sort_order.asc');
 url.searchParams.set('limit','160');
 try{
  const response=await fetch(url.toString(),{
   headers:{apikey:env.key,accept:'application/json'},signal:AbortSignal.timeout(6500),cache:'no-store'
  });
  if(!response.ok)return [];
  const raw:unknown=await response.json();
  if(!Array.isArray(raw))return [];
  const blocks=raw.filter((r):r is Row=>!!r&&typeof r==='object'&&!Array.isArray(r))
   .map(fromRow).filter((x):x is ICAManagedBlock=>!!x);
  // Prefer the approved local-language snapshot, fallback to English when none exists.
  const keyed=new Map<string,ICAManagedBlock>();
  for(const b of blocks){
   const key=b.section+'/'+b.block_key;
   const old=keyed.get(key);
   if(!old||b.lang===requested&&old.lang!==requested)keyed.set(key,b);
  }
  return [...keyed.values()].sort((a,b)=>a.sort_order-b.sort_order||a.block_key.localeCompare(b.block_key));
 }catch{return []}
}
