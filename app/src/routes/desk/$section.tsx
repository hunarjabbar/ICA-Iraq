import {createFileRoute,notFound} from '@tanstack/react-router'
import {getPortalDesk} from '@/lib/ica.functions'
import {deskBySlug} from '@/lib/ica-desks'
import {languageFromHref,localizedAlternates} from '@/lib/ica-i18n'
import {DeskPage} from '@/components/ica/international'
export const Route=createFileRoute('/desk/$section')({
 loader:({params,location})=>{if(!deskBySlug(params.section))throw notFound();return getPortalDesk({data:{desk:params.section,lang:languageFromHref(location.href)}})},
 head:({params})=>{
  const desk=deskBySlug(params.section)
  return {meta:[{title:(desk?.label||'News')+' | ICA International Newsroom'},{name:'description',content:desk?.description||'Iraqi-Chinese Agency international and regional news'}],
   links:[{rel:'canonical',href:'https://ica-iraqi-chinese-agency.higgsfield.app/desk/'+encodeURIComponent(params.section)},...localizedAlternates('/desk/'+encodeURIComponent(params.section))]}
 },
 component:()=>{const r=Route.useLoaderData();return <DeskPage key={r.desk} desk={r.desk} wire={r.wire.items} articles={r.articles} refreshedAt={r.wire.refreshedAt}/>}
})
