export const ICA_DESKS = [
 {slug:'latest',label:'Latest',description:'Recently published ICA reports and clearly attributed external source headlines.',region:'',desk:''},
 {slug:'trending',label:'Trending',description:'Editorial selections and recent developments across the ICA regional desk.',region:'',desk:''},
 {slug:'world',label:'World',description:'International developments from source-linked publishers and ICA reporters.',region:'world',desk:''},
 {slug:'iraq',label:'Iraq & Kurdistan',description:'Iraq, Kurdistan Region, Baghdad and national affairs with attention to bilateral interests.',region:'iraq',desk:''},
 {slug:'china',label:'China',description:'China affairs, policy, business and international relations.',region:'china',desk:''},
 {slug:'hong-kong',label:'Hong Kong',description:'Hong Kong politics, commerce, financial services and business regulation.',region:'hong-kong',desk:''},
 {slug:'asean',label:'Asia & ASEAN',description:'Southeast Asian institutions, partnerships, connectivity and regional growth.',region:'asean',desk:''},
 {slug:'bilateral',label:'Iraq-China Relations',description:'Diplomatic, commercial and cultural relations between Iraq and China.',region:'bilateral',desk:''},
 {slug:'business',label:'Business',description:'International enterprise, trade, investment and the regional business environment.',region:'',desk:'business'},
 {slug:'finance',label:'Finance',description:'Central banking, currencies, settlement and financial-sector developments.',region:'',desk:'finance'},
 {slug:'markets',label:'Markets',description:'Markets, investment, trade data and official financial releases.',region:'',desk:'markets'},
 {slug:'technology',label:'Technology',description:'Innovation, digital business, AI and technology-policy developments.',region:'',desk:'technology'},
 {slug:'energy',label:'Energy',description:'Oil, gas, power, renewables and energy investment.',region:'',desk:'energy'},
 {slug:'culture',label:'Culture & Society',description:'Communities, cultural exchange, education and heritage.',region:'',desk:'culture'},
] as const
export type DeskKey=typeof ICA_DESKS[number]['slug'];
export type FeedDeskKey=Extract<DeskKey,'world'|'iraq'|'china'|'hong-kong'|'asean'|'bilateral'|'business'|'finance'|'markets'|'technology'|'energy'|'culture'>|'news';
export const REGIONS=['world','iraq','china','hong-kong','asean','bilateral'] as const
export const EDITOR_DESKS=['news','business','finance','markets','technology','energy','culture'] as const
export const deskBySlug=(slug:string)=>ICA_DESKS.find(x=>x.slug===slug)
export const isDesk=(slug:string)=>ICA_DESKS.some(x=>x.slug===slug)
export const isRegion=(v:string)=>REGIONS.some(x=>x===v)
export const isEditorDesk=(v:string)=>EDITOR_DESKS.some(x=>x===v)
export function classifyFeedItem(title:string,fallback:string):string{
 const t=title.toLowerCase()
 if(/\b(oil|gas|electricity|energy|crude|solar|renewable|opec|petroleum)\b/.test(t))return 'energy'
 if(/\b(ai|artificial intelligence|semiconductor|chip|robot|tech|digital|cyber|satellite|quantum|fintech)\b/.test(t))return 'technology'
 if(/\b(stock|index|shares|trading|equities|bond|futures|ipo|market rally|share price)\b/.test(t))return 'markets'
 if(/\b(bank|interest rate|currency|dollar|yuan|rmb|liquidity|monetary|inflation|exchange fund|credit)\b/.test(t))return 'finance'
 if(/\b(economy|economic|trade|exports|imports|investment|business|manufactur|enterprise|tariff|commerce|development|growth)\b/.test(t))return 'business'
 if(/\b(culture|university|education|heritage|film|museum|tourism|arts|music)\b/.test(t))return 'culture'
 return fallback
}
