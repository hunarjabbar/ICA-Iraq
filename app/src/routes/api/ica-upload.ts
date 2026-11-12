import {createFileRoute} from '@tanstack/react-router'
import {authenticate} from '../../lib/ica.server'
import {bindings} from '../../lib/bindings.server'
export const Route=createFileRoute('/api/ica-upload')({server:{handlers:{POST:async({request}:{request:Request})=>{
 if(!await authenticate(request))return Response.json({ok:false,error:'Unauthorized'},{status:401})
 const origin=request.headers.get('Origin')
 if(origin&&new URL(origin).origin!==new URL(request.url).origin)return Response.json({ok:false,error:'Cross-origin'},{status:403})
 const storage=bindings().STORAGE;if(!storage)return Response.json({ok:false,error:'Storage unavailable'},{status:503})
 if(Number(request.headers.get('content-length')||0)>11_000_000)return Response.json({ok:false,error:'File too large'},{status:413})
 let form:FormData;try{form=await request.formData()}catch{return Response.json({ok:false,error:'Invalid upload'},{status:400})}
 const file=form.get('file')
 if(!(file instanceof File)||file.size>10_000_000||file.size<100)return Response.json({ok:false,error:'Upload a file below 10 MB'},{status:400})
 const allowed:{[key:string]:string}={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','application/pdf':'pdf','video/mp4':'mp4'}
 const ext=allowed[file.type]
 if(!ext)return Response.json({ok:false,error:'Unsupported media type'},{status:415})
 const bytes=new Uint8Array(await file.arrayBuffer())
 const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71
 const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'
 const pdf=String.fromCharCode(...bytes.slice(0,4))==='%PDF'
 const mp4=String.fromCharCode(...bytes.slice(4,8))==='ftyp'
 if(!({png,jpg,webp,pdf,mp4}[ext]))return Response.json({ok:false,error:'File contents do not match type'},{status:415})
 const id=crypto.randomUUID()+'.'+ext
 await storage.put('ica/'+id,bytes,{httpMetadata:{contentType:file.type,contentDisposition:'inline'}})
 return Response.json({ok:true,url:'/api/media/'+id,id})
}}} as any)
