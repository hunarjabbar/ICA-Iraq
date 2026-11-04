import {createFileRoute} from '@tanstack/react-router'
import {getNewsFeed} from '@/lib/ica.functions'
import {CoveragePage} from '@/components/ica/pages'
import {languageFromHref,localizedAlternates} from '@/lib/ica-i18n'
export const Route=createFileRoute('/news')({loader:({location})=>getNewsFeed({data:{type:'',lang:languageFromHref(location.href),search:''}}),head:()=>({meta:[{title:'News | Iraqi-Chinese Agency'},{name:'description',content:'Verified Iraq-China news, analysis and editorial coverage.'}] ,links:[{rel:'canonical',href:'https://ica-iraqi-chinese-agency.higgsfield.app/news'},...localizedAlternates('/news')]}),component:()=> <CoveragePage type="news" stories={Route.useLoaderData()}/>})
