import {createFileRoute} from '@tanstack/react-router'
import {localizedAlternates} from '@/lib/ica-i18n'
import {AboutPage} from '@/components/ica/pages'
export const Route=createFileRoute('/about')({head:()=>({meta:[{title:'About | Iraqi-Chinese Agency'},{name:'description',content:'About the ICA editorial mission and media network.'}] ,links:[{rel:'canonical',href:'https://ica-international-portal.vercel.app/about'},...localizedAlternates('/about')]}),component:AboutPage})
