import {createFileRoute} from '@tanstack/react-router'
import {getNewsFeed} from '@/lib/ica.functions'
import {CoveragePage} from '@/components/ica/pages'
import {languageFromHref,localizedAlternates} from '@/lib/ica-i18n'
export const Route=createFileRoute('/entertainment')({loader:({location})=>getNewsFeed({data:{type:'entertainment',lang:languageFromHref(location.href),search:''}}),head:()=>({meta:[{title:'Entertainment | ICA'},{name:'description',content:'Iraqi-Chinese Agency film, entertainment and cultural production stories.'}] ,links:[{rel:'canonical',href:'https://ica-international-portal.vercel.app/entertainment'},...localizedAlternates('/entertainment')]}),component:()=> <CoveragePage type="entertainment" stories={Route.useLoaderData()}/>})
