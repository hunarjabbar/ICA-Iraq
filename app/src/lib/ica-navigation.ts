import type {Language} from './ica-i18n'

/** Internal canonical ICA paths only; never wrap external URLs or open redirects. */
export function localizedIcaRoute(target:string,lang:Language):string{
 if(!target.startsWith('/')||target.startsWith('//'))return target
 const hashIndex=target.indexOf('#')
 const base=hashIndex>=0?target.slice(0,hashIndex):target
 const hash=hashIndex>=0?target.slice(hashIndex):''
 const question=base.indexOf('?')
 const pathname=question>=0?base.slice(0,question):base
 const params=new URLSearchParams(question>=0?base.slice(question+1):'')
 if(lang==='en')params.delete('lang')
 else params.set('lang',lang)
 const search=params.toString()
 return pathname+(search?'?'+search:'')+hash
}
export function isActiveIcaHeaderRoute(pathname:string,href:string):boolean{
 const normalize=(value:string)=>{
  const noQuery=value.split(/[?#]/,1)[0]
  return noQuery.replace(/\/+$/,'')||'/'
 }
 const current=normalize(pathname),target=normalize(href)
 return current===target||(target==='/news'&&current.startsWith('/news/'))
}
