import {createFileRoute} from '@tanstack/react-router'
import {authenticate,makeEditorCookie,secret,timingEqual,cleanStr,validLang,validType,validURL,database,listArticles,listAdminMedia} from '../../lib/ica.server'
import {isRegion,isEditorDesk} from '../../lib/ica-desks'
import {listAdminWire,refreshWireNow} from '../../lib/ica-wire.server'
function safeWebURL(raw:string):boolean{
 try{
  const url=new URL(raw)
  return url.protocol==='https:'&&!url.username&&!url.password&&url.hostname.includes('.')&&!/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)
 }catch{return false}
}
const isId=(s:string)=>/^[a-z0-9-]{15,100}$/i.test(s)
export const Route=createFileRoute('/api/ica-studio')({
 server:{handlers:{
  GET:async({request}:{request:Request})=>{
   const active=await authenticate(request)
   if(!active)return Response.json({active:false,configured:secret().length>=24},{headers:{'Cache-Control':'no-store'}})
   const db=database()
   const [articles,media,msgs,wire]=await Promise.all([
    listArticles(undefined,'en','',100,false),listAdminMedia(),
    db?.prepare('SELECT id,name,email,topic,message,status,created_at FROM ica_messages ORDER BY created_at DESC LIMIT 60').all(),
    listAdminWire()
   ])
   return Response.json({active:true,configured:true,articles,media,messages:msgs?.results||[],wire},{headers:{'Cache-Control':'no-store'}})
  },
  POST:async({request}:{request:Request})=>{
   if((request.headers.get('content-type')||'').split(';')[0]!=='application/json')return Response.json({ok:false,error:'JSON required'},{status:415})
   if(Number(request.headers.get('content-length')||0)>45000)return Response.json({ok:false,error:'Request too large'},{status:413})
   const origin=request.headers.get('Origin')
   if(origin&&new URL(origin).origin!==new URL(request.url).origin)return Response.json({ok:false,error:'Cross-origin requests not allowed'},{status:403})
   let d:Record<string,unknown>
   try{d=await request.json() as Record<string,unknown>}catch{return Response.json({ok:false,error:'Malformed JSON'},{status:400})}
   const action=cleanStr(d.action,35)
   if(action==='login'){
    if(secret().length<24)return Response.json({ok:false,error:'Editorial access is not yet configured'},{status:503})
    if(!timingEqual(cleanStr(d.key,200),secret()))return Response.json({ok:false,error:'Access denied'},{status:401})
    return Response.json({ok:true},{headers:{'Set-Cookie':await makeEditorCookie(),'Cache-Control':'no-store'}})
   }
   if(!await authenticate(request))return Response.json({ok:false,error:'Unauthorized'},{status:401})
   if(action==='logout')return Response.json({ok:true},{headers:{'Set-Cookie':'__Host-ica_editor=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0','Cache-Control':'no-store'}})
   const db=database();if(!db)return Response.json({ok:false,error:'Database not configured'},{status:503})
   if(action==='upsert_article'){
    const id=cleanStr(d.id,90)||crypto.randomUUID()
    const title=cleanStr(d.title,180),body=cleanStr(d.body,24000),excerpt=cleanStr(d.excerpt,400)
    const slug=cleanStr(d.slug,110).toLowerCase(),type=cleanStr(d.type,30),lang=cleanStr(d.lang,5)
    const author=cleanStr(d.author,120)||'ICA Editorial Desk',image=cleanStr(d.image_url,600)||null,status=cleanStr(d.status,20)
    const desk=cleanStr(d.desk,30)||'news',region=cleanStr(d.region,30)||'bilateral'
    const featured=d.featured===true?1:0,trending=d.trending===true?1:0
    const priority=Math.max(0,Math.min(99,Number.isFinite(Number(d.priority))?Math.floor(Number(d.priority)):0))
    if(!isId(id)||!/^[a-z0-9-]{3,110}$/.test(slug)||!validType(type)||!validLang(lang)||!isRegion(region)||!isEditorDesk(desk)||title.length<5||excerpt.length<12||body.length<30||!['draft','published','archived'].includes(status)||(image&&!validURL(image)))return Response.json({ok:false,error:'Invalid article fields'},{status:400})
    const now=new Date().toISOString(),published=status==='published'
    try{
     await db.prepare("INSERT INTO ica_articles(id,slug,type,status,lang,title,excerpt,body,author,image_url,published_at,updated_at,desk,region,featured,trending,priority) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,type=excluded.type,status=excluded.status,lang=excluded.lang,title=excluded.title,excerpt=excluded.excerpt,body=excluded.body,author=excluded.author,image_url=excluded.image_url,published_at=CASE WHEN excluded.status='published' THEN COALESCE(ica_articles.published_at,excluded.published_at) ELSE NULL END,updated_at=excluded.updated_at,desk=excluded.desk,region=excluded.region,featured=excluded.featured,trending=excluded.trending,priority=excluded.priority")
      .bind(id,slug,type,status,lang,title,excerpt,body,author,image,published?now:null,now,desk,region,published?featured:0,published?trending:0,priority).run()
     return Response.json({ok:true,id})
    }catch{return Response.json({ok:false,error:'Article slug must be unique or the record is invalid'},{status:409})}
   }
   if(action==='archive_article'){
    const id=cleanStr(d.id,90)
    if(!isId(id))return Response.json({ok:false,error:'Invalid article ID'},{status:400})
    await db.prepare("UPDATE ica_articles SET status='archived',featured=0,trending=0,published_at=NULL,updated_at=? WHERE id=?").bind(new Date().toISOString(),id).run()
    return Response.json({ok:true})
   }
   if(action==='delete_draft'){
    const id=cleanStr(d.id,90)
    if(!isId(id))return Response.json({ok:false,error:'Invalid article ID'},{status:400})
    const r=await db.prepare("DELETE FROM ica_articles WHERE id=? AND status='draft'").bind(id).run()
    if(!(r.meta?.changes||0))return Response.json({ok:false,error:'Only unpublished drafts may be permanently deleted'},{status:409})
    return Response.json({ok:true})
   }
   if(action==='upsert_media'){
    const id=cleanStr(d.id,90)||crypto.randomUUID(),title=cleanStr(d.title,160)
    const kind=cleanStr(d.kind,20),category=cleanStr(d.category,50)||'editorial',description=cleanStr(d.description,1200)
    const url=cleanStr(d.url,700),poster=cleanStr(d.poster_url,700)||null,published=d.published===true?1:0
    if(!isId(id)||title.length<3||!['video','audio','photo'].includes(kind)||!validURL(url)||(poster&&!validURL(poster)))return Response.json({ok:false,error:'Invalid media fields'},{status:400})
    await db.prepare("INSERT INTO ica_media(id,title,kind,category,description,url,poster_url,published) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,kind=excluded.kind,category=excluded.category,description=excluded.description,url=excluded.url,poster_url=excluded.poster_url,published=excluded.published").bind(id,title,kind,category,description,url,poster,published).run()
    return Response.json({ok:true,id})
   }
   if(action==='delete_media'){
    const id=cleanStr(d.id,90)
    if(!isId(id))return Response.json({ok:false,error:'Invalid media ID'},{status:400})
    await db.prepare('DELETE FROM ica_media WHERE id=?').bind(id).run()
    return Response.json({ok:true})
   }
   if(action==='upsert_wire'){
    const id=cleanStr(d.id,90)||crypto.randomUUID(),title=cleanStr(d.headline,220)
    const url=cleanStr(d.source_url,700),source=cleanStr(d.source_name,120)
    const region=cleanStr(d.region,30),desk=cleanStr(d.desk,30),summary=cleanStr(d.summary,450)
    const date=cleanStr(d.published_at,40),status=cleanStr(d.status,20),pinned=d.pinned===true?1:0
    const epoch=Date.parse(date)
    if(!isId(id)||title.length<11||source.length<3||!safeWebURL(url)||!isRegion(region)||!isEditorDesk(desk)||!['linked','hidden'].includes(status)||!Number.isFinite(epoch)||epoch>Date.now()+86400000||epoch<Date.now()-86400000*3650)return Response.json({ok:false,error:'Invalid external source link or editorial fields'},{status:400})
    try{
     const now=new Date().toISOString()
     await db.prepare("INSERT INTO ica_wire_items(id,source_id,source_url,headline,source_name,region,desk,summary,published_at,added_at,updated_at,status,pinned,origin) VALUES(?,NULL,?,?,?,?,?,?,?,?,?,?,?,'editor') ON CONFLICT(id) DO UPDATE SET source_url=excluded.source_url,headline=excluded.headline,source_name=excluded.source_name,region=excluded.region,desk=excluded.desk,summary=excluded.summary,published_at=excluded.published_at,updated_at=excluded.updated_at,status=excluded.status,pinned=excluded.pinned")
      .bind(id,url,title,source,region,desk,summary,new Date(epoch).toISOString(),now,now,status,pinned).run()
     return Response.json({ok:true,id})
    }catch{return Response.json({ok:false,error:'This source URL is already catalogued or the record is invalid'},{status:409})}
   }
   if(action==='wire_visibility'){
    const id=cleanStr(d.id,90),status=cleanStr(d.status,20)
    if(!isId(id)||!['linked','hidden'].includes(status))return Response.json({ok:false,error:'Invalid status change'},{status:400})
    await db.prepare('UPDATE ica_wire_items SET status=?,pinned=CASE WHEN ? = ? THEN 0 ELSE pinned END,updated_at=? WHERE id=?').bind(status,status,'hidden',new Date().toISOString(),id).run()
    return Response.json({ok:true})
   }
   if(action==='delete_wire'){
    const id=cleanStr(d.id,90)
    if(!isId(id))return Response.json({ok:false,error:'Invalid wire ID'},{status:400})
    // Imported items are hidden instead of deleted, preventing silent re-import.
    await db.prepare("DELETE FROM ica_wire_items WHERE id=? AND origin='editor'").bind(id).run()
    await db.prepare("UPDATE ica_wire_items SET status='hidden',pinned=0,updated_at=? WHERE id=? AND origin='feed'").bind(new Date().toISOString(),id).run()
    return Response.json({ok:true})
   }
   if(action==='toggle_source'){
    const id=cleanStr(d.id,90)
    if(!/^[a-z0-9-]{2,90}$/.test(id)||typeof d.enabled!=='boolean')return Response.json({ok:false,error:'Invalid source'},{status:400})
    const r=await db.prepare('UPDATE ica_wire_sources SET enabled=? WHERE id=?').bind(d.enabled?1:0,id).run()
    if(!(r.meta?.changes||0))return Response.json({ok:false,error:'Source not found'},{status:404})
    return Response.json({ok:true})
   }
   if(action==='refresh_sources'){
    const stats=await refreshWireNow()
    return Response.json({ok:true,stats})
   }
   if(action==='message_read'){
    const id=cleanStr(d.id,100)
    if(!isId(id))return Response.json({ok:false},{status:400})
    await db.prepare("UPDATE ica_messages SET status='read' WHERE id=?").bind(id).run()
    return Response.json({ok:true})
   }
   return Response.json({ok:false,error:'Unsupported action'},{status:400})
  }
 }}} as any)
