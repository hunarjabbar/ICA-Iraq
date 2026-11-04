import {createFileRoute} from '@tanstack/react-router'
import {localizedAlternates} from '@/lib/ica-i18n'
import {getMediaFeed} from '@/lib/ica.functions'
import {VideoPage} from '@/components/ica/pages'
export const Route=createFileRoute('/video')({loader:()=>getMediaFeed(),head:()=>({meta:[{title:'Video and Audio | ICA'},{name:'description',content:'Interviews, films, documentaries and cultural media from ICA.'}] ,links:[{rel:'canonical',href:'https://ica-iraqi-chinese-agency.higgsfield.app/video'},...localizedAlternates('/video')]}),component:()=> <VideoPage media={Route.useLoaderData()}/>})
