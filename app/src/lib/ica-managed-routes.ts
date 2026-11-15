// Routing scope for published ICA page blocks. Details and staff routes are never page zones.
const PUBLIC_PAGES=new Set(['news','topics','newsroom','culture','video','entertainment','about','contact'])
export function managedPageForPathname(pathname:string):string|null{
 const path=pathname.replace(/\/+$/,'')||'/'
 if(path==='/')return 'home'
 const desk=/^\/desk\/([a-z0-9-]{2,40})$/.exec(path)
 if(desk)return 'desk-'+desk[1]
 const section=/^\/([a-z]+)$/.exec(path)
 return section&&PUBLIC_PAGES.has(section[1])?section[1]:null
}
// Preserve internal URL fragments when adding the current language edition.
export function localizedManagedHref(target:string,lang:string):string{
 if(lang==='en'||!target.startsWith('/')||target.startsWith('//'))return target
 const i=target.indexOf('#')
 const base=i<0?target:target.slice(0,i),fragment=i<0?'':target.slice(i)
 return base+(base.includes('?')?'&':'?')+'lang='+encodeURIComponent(lang)+fragment
}
