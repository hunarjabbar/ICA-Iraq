import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, useRouter, useLocation, HeadContent, Scripts } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import appCss from '../styles.css?url'
import {ICA_THEME_COLOR} from '../lib/ica-theme'
import {languageFromHref,rtlLanguage} from '../lib/ica-i18n'
import appMetaJson from '../app-meta.json'
import { reportHiggsfieldError } from '../lib/higgsfield-error-reporting'
declare const __HF_DESIGN_INSPECTOR__:boolean
const appMeta=appMetaJson as {og_title?:string|null;og_description?:string|null;og_image_url?:string|null;favicon_url?:string|null;og_video_url?:string|null;marketplace_cover_url?:string|null}
export const Route=createRootRouteWithContext<{queryClient:QueryClient}>()({
 head:()=>({
  meta:[
   {title:appMeta.og_title||'ICA | Iraqi-Chinese Agency'},
   {name:'description',content:appMeta.og_description||'Independent news, newsroom and culture connecting Iraq and China.'},
   {name:'viewport',content:'width=device-width,initial-scale=1'},
   {name:'theme-color',content:ICA_THEME_COLOR},
   {property:'og:type',content:'website'},
   {property:'og:title',content:appMeta.og_title||'Iraqi-Chinese Agency'},
   {property:'og:description',content:appMeta.og_description||'Independent editorial reporting across Iraq and China'},
   {name:'twitter:card',content:'summary_large_image'},
   ...(appMeta.og_image_url?[{property:'og:image',content:appMeta.og_image_url},{name:'twitter:image',content:appMeta.og_image_url}]:[]),
  ],
  links:[{rel:'stylesheet',href:appCss},{rel:'icon',href:appMeta.favicon_url||'/favicon.svg'},{rel:'manifest',href:'/site.webmanifest'},{rel:'apple-touch-icon',href:'/apple-touch-icon.png'}]
 }),
 shellComponent:RootShell,component:RootComponent,
 notFoundComponent:()=> <div className="ica-notfound"><h1>404</h1><p>This ICA page is not available.</p><a href="/">Return to ICA homepage ↗</a></div>,
 errorComponent:({error,reset})=>{const router=useRouter();useEffect(()=>{reportHiggsfieldError(error,{boundary:'ica_root'})},[error]);return <div className="ica-notfound"><h1>Unable to load</h1><p>There was an issue loading this page.</p><button onClick={()=>{router.invalidate();reset()}}>Try again</button></div>}
})
function RootShell({children}:{children:ReactNode}){const location=useLocation();const lang=languageFromHref(location.href);return <html lang={lang} dir={rtlLanguage(lang)?'rtl':'ltr'}><head><HeadContent/></head><body>{children}<Scripts/></body></html>}
function RootComponent(){
 const {queryClient}=Route.useRouteContext()
 useEffect(()=>{if(!__HF_DESIGN_INSPECTOR__)return;void import('../module/design-inspector/runtime').then(({installHiggsfieldDesignInspector})=>installHiggsfieldDesignInspector()).catch(e=>reportHiggsfieldError(e instanceof Error?e:new Error('ICA inspector unavailable'),{boundary:'ica_inspector'}))},[])
 return <QueryClientProvider client={queryClient}><Outlet/></QueryClientProvider>
}
