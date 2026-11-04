import {createFileRoute} from '@tanstack/react-router'
import {getNewsFeed} from '@/lib/ica.functions'
import {CoveragePage} from '@/components/ica/pages'
import {languageFromHref,localizedAlternates} from '@/lib/ica-i18n'
export const Route=createFileRoute('/culture')({loader:({location})=>getNewsFeed({data:{type:'culture',lang:languageFromHref(location.href),search:''}}),head:()=>({meta:[{title:'Culture | ICA'},{name:'description',content:'Kurdish, Iraqi and Chinese cultural exchange, language and literature.'}] ,links:[{rel:'canonical',href:'https://ica-iraqi-chinese-agency.higgsfield.app/culture'},...localizedAlternates('/culture')]}),component:()=> <CoveragePage type="culture" stories={Route.useLoaderData()}/>})
