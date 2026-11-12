import {createFileRoute} from '@tanstack/react-router'
import {localizedAlternates} from '@/lib/ica-i18n'
import {ContactPage} from '@/components/ica/pages'
export const Route=createFileRoute('/contact')({head:()=>({meta:[{title:'Contact | ICA'},{name:'description',content:'Contact the ICA newsroom, send a story tip or request a correction.'}] ,links:[{rel:'canonical',href:'https://ica-international-portal.vercel.app/contact'},...localizedAlternates('/contact')]}),component:ContactPage})
