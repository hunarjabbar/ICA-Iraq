import { env } from 'cloudflare:workers'
import { bindings } from './bindings.server'

export type ICAArticle = {
 id: string; slug: string; type: string; status: string; lang: string;
 title: string; excerpt: string; body: string; author: string;
 image_url: string | null; published_at: string | null; created_at: string; updated_at: string;
 desk:string;region:string;featured:number;trending:number;priority:number;
}
export type ICAMedia = {id:string;title:string;kind:string;category:string;description:string;url:string;poster_url:string|null;published:number;created_at:string}
const TYPES = ['news','press','culture','entertainment','analysis']
const LANGS = ['en','ar','ckb','zh']

export function database() { return bindings().DB }
export async function listArticles(type?:string, lang='en', search='', limit=36, publicOnly=true):Promise<ICAArticle[]> {
 const db=database(); if(!db) return []
 const conditions:string[]=[];const values:(string|number)[]=[]
 if(publicOnly) {conditions.push("status = 'published'");conditions.push('published_at IS NOT NULL')}
 if(type && TYPES.includes(type)){conditions.push('type = ?');values.push(type)}
 if(publicOnly&&LANGS.includes(lang)){conditions.push("(lang = ? OR lang = 'en')");values.push(lang)}
 if(search.trim()){conditions.push('(title LIKE ? OR excerpt LIKE ?)');const q='%'+search.trim().slice(0,100)+'%';values.push(q,q)}
 const where=conditions.length?' WHERE '+conditions.join(' AND '):''
 const sql='SELECT id,slug,type,status,lang,title,excerpt,body,author,image_url,published_at,created_at,updated_at,desk,region,featured,trending,priority FROM ica_articles'+where+' ORDER BY '+(publicOnly?'published_at':'updated_at')+' DESC LIMIT ?'
 const result=await db.prepare(sql).bind(...values,Math.min(100,Math.max(1,limit))).all<ICAArticle>()
 return result.results || []
}
export async function getArticle(slug:string):Promise<ICAArticle|null> {
 if(!/^[a-z0-9-]{3,110}$/.test(slug))return null
 const db=database(); if(!db)return null
 return await db.prepare("SELECT * FROM ica_articles WHERE slug = ? AND status = 'published' LIMIT 1").bind(slug).first<ICAArticle>()
}
export async function listMedia():Promise<ICAMedia[]>{
 const db=database();if(!db)return []
 const result=await db.prepare('SELECT * FROM ica_media WHERE published = 1 ORDER BY created_at DESC LIMIT 60').all<ICAMedia>()
 return result.results||[]
}
export async function listAdminMedia():Promise<ICAMedia[]>{
 const db=database();if(!db)return []
 const result=await db.prepare('SELECT * FROM ica_media ORDER BY created_at DESC LIMIT 100').all<ICAMedia>()
 return result.results||[]
}
export async function hmac(value:string,secret:string):Promise<string>{
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign'])
 const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)))
 return Array.from(sig,x=>x.toString(16).padStart(2,'0')).join('')
}
export function secret():string{
 const e=env as unknown as {ICA_EDITOR_KEY?:string};return e.ICA_EDITOR_KEY||''
}
export function timingEqual(a:string,b:string):boolean{
 const aa=new TextEncoder().encode(a);const bb=new TextEncoder().encode(b)
 let diff=aa.length^bb.length;for(let i=0;i<Math.max(aa.length,bb.length);i++)diff|=(aa[i]||0)^(bb[i]||0)
 return diff===0
}
export async function authenticate(request:Request):Promise<boolean>{
 const password=secret();if(password.length<24)return false
 const raw=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-ica_editor='))
 if(!raw)return false
 const value=raw.slice('__Host-ica_editor='.length)
 const [payload,signature]=value.split('.')
 if(!payload||!signature||!/^[0-9a-f]{64}$/.test(signature))return false
 const [role,expiry]=payload.split('_')
 if(role!=='staff'||!Number.isFinite(Number(expiry))||Number(expiry)<Date.now()||Number(expiry)>Date.now()+12*3600000)return false
 return timingEqual(signature,await hmac(payload,password))
}
export async function makeEditorCookie():Promise<string>{
 const payload='staff_'+String(Date.now()+12*3600000)
 return '__Host-ica_editor='+payload+'.'+await hmac(payload,secret())+'; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200'
}
export async function consumeRateLimit(key:string,max=6,windowMs=3600000):Promise<boolean>{
 const db=database();if(!db)return false
 const now=Date.now();const old=await db.prepare('SELECT requests,expires_at FROM ica_rate_limits WHERE id = ?').bind(key).first<{requests:number;expires_at:number}>()
 if(!old||old.expires_at<now){
  await db.prepare('INSERT INTO ica_rate_limits(id,requests,expires_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET requests=1,expires_at=excluded.expires_at').bind(key,now+windowMs).run()
  return true
 }
 if(old.requests>=max)return false
 await db.prepare('UPDATE ica_rate_limits SET requests=requests+1 WHERE id=? AND requests<?').bind(key,max).run()
 return true
}
export function cleanStr(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
export function validURL(url:string){return url.startsWith('/api/media/')||/^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(url)}
export function validType(v:string){return TYPES.includes(v)}
export function validLang(v:string){return LANGS.includes(v)}
