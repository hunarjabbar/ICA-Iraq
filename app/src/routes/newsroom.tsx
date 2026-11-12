import {createFileRoute} from '@tanstack/react-router'
import {getNewsFeed} from '@/lib/ica.functions'
import {CoveragePage} from '@/components/ica/pages'
import {languageFromHref,localizedAlternates} from '@/lib/ica-i18n'
export const Route=createFileRoute('/newsroom')({loader:({location})=>getNewsFeed({data:{type:'press',lang:languageFromHref(location.href),search:''}}),head:()=>({meta:[{title:'Newsroom and Press Office | ICA'},{name:'description',content:'Press releases, editorial standards, source submissions and correction requests.'}] ,links:[{rel:'canonical',href:'https://ica-international-portal.vercel.app/newsroom'},...localizedAlternates('/newsroom')]}),component:()=> <CoveragePage type="newsroom" stories={Route.useLoaderData()}/>})
