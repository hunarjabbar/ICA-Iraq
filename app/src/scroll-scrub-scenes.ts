import type { ScrollScrubScene, ScrollScrubTheme } from '@/components/scroll-scrub/scroll-scrub'
export const scrollScrubTheme: ScrollScrubTheme = {
 accent:'#E3001B',background:'#190E12',ink:'#FFFFFF',muted:'#EAD7DD'
}
export const scrollScrubScenes:ScrollScrubScene[]=[
 {id:'ica-story',label:'ICA',title:'Stories across borders',body:'Reporting, culture and creative perspectives connecting Iraq and China.',
  clip:'/assets/world/ica-story.mp4',mobileClip:'/assets/world/ica-story-mobile.mp4',
  poster:'/assets/world/ica-story-poster.png',mobilePoster:'/assets/world/ica-story-mobile-poster.png',
  kicker:'IRAQI-CHINESE AGENCY',tags:[],align:'left',scroll:1.3,objectPosition:'60% 50%',mobileObjectPosition:'63% 50%'}
]
