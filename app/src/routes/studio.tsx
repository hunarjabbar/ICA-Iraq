import {createFileRoute} from '@tanstack/react-router'
import {EditorialStudio} from '@/components/ica/studio'
export const Route=createFileRoute('/studio')({head:()=>({meta:[{title:'Staff Editorial Studio | ICA'},{name:'robots',content:'noindex,nofollow'}]}),component:EditorialStudio})
