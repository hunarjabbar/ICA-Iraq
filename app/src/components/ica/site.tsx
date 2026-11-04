import {useLocation} from '@tanstack/react-router'
import {useState,useEffect,type FormEvent,type ReactNode} from 'react'
import type {ICAArticle,ICAMedia} from '../../lib/ica.server'
import {ICA_DESKS} from '../../lib/ica-desks'
import {isLanguage,rtlLanguage,deskName,formatLocalDate,getI18n,type Language} from '../../lib/ica-i18n'

export type {Language} from '../../lib/ica-i18n'
const labels={
 en:{home:'Home',news:'News',topics:'Topics',trending:'Trending',hongKong:'Hong Kong',asean:'Asia / ASEAN',business:'Business',finance:'Finance',markets:'Markets',newsroom:'Newsroom',culture:'Culture',video:'Video',entertainment:'Entertainment',about:'About ICA',contact:'Contact',title:'Reporting that connects',tag:'Independent perspectives on the Iraq-China relationship.',read:'Read news',latest:'Latest reporting',recent:'Editorial desk',all:'All coverage',empty:'No verified articles have been published in this channel yet.',view:'Read story',submit:'Submit a story',subscribe:'Get the ICA briefing',subHelp:'Editorial updates, cultural stories, and coverage announcements.',email:'Email address',join:'Subscribe',success:'Thank you. Your request was recorded.',error:'Something went wrong. Please check your details and try again.',editor:'Editorial studio',language:'Language'},
 ar:{home:'الرئيسية',news:'الأخبار',topics:'المواضيع',trending:'الرائج',hongKong:'هونغ كونغ',asean:'آسيا / آسيان',business:'الأعمال',finance:'المال',markets:'الأسواق',newsroom:'غرفة الأخبار',culture:'الثقافة',video:'الفيديو',entertainment:'الترفيه',about:'عن الوكالة',contact:'اتصل بنا',title:'صحافة تربط المجتمعات',tag:'رؤى مستقلة حول العلاقات العراقية الصينية.',read:'اقرأ الأخبار',latest:'آخر التقارير',recent:'مكتب التحرير',all:'كل التغطيات',empty:'لم تُنشر بعد مقالات موثقة في هذا القسم.',view:'اقرأ التقرير',submit:'أرسل قصة',subscribe:'اشترك في موجز ICA',subHelp:'مستجدات تحريرية وقصص ثقافية وإعلانات التغطية.',email:'البريد الإلكتروني',join:'اشتراك',success:'شكراً لك. تم تسجيل الطلب.',error:'حدث خطأ. يرجى التحقق من البيانات والمحاولة مجدداً.',editor:'لوحة التحرير',language:'اللغة'},
 ckb:{home:'سەرەکی',news:'هەواڵەکان',topics:'بابەتەکان',trending:'بابەتە گرنگەکان',hongKong:'هۆنگ کۆنگ',asean:'ئاسیا / ئاسیان',business:'بازرگانی',finance:'دارایی',markets:'بازاڕەکان',newsroom:'ژووری هەواڵ',culture:'کەلتوور',video:'ڤیدیۆ',entertainment:'کات بەسەربردن',about:'دەربارەی ICA',contact:'پەیوەندی',title:'ڕاگەیاندنێک کە پەیوەندی دروست دەکات',tag:'دیدگای سەربەخۆ دەربارەی پەیوەندیی عێراق و چین.',read:'هەواڵەکان بخوێنەوە',latest:'نوێترین ڕاپۆرتەکان',recent:'دەستەی نووسین',all:'هەموو بابەتەکان',empty:'هێشتا هیچ بابەتێکی پشتڕاستکراو لەم بەشەدا بڵاو نەکراوەتەوە.',view:'بابەت بخوێنەوە',submit:'بابەت بنێرە',subscribe:'بەشداری لە هەواڵنامەی ICA بکە',subHelp:'نوێکارییەکانی دەستەی نووسین و چیرۆکە کەلتوورییەکان.',email:'ئیمەیڵ',join:'بەشداربە',success:'سوپاس. داواکارییەکەت تۆمارکرا.',error:'هەڵەیەک ڕوویدا. زانیارییەکانت بپشکنە و دووبارە هەوڵبدەرەوە.',editor:'پانێڵی دەستەی نووسین',language:'زمان'},
 zh:{home:'首页',news:'新闻',topics:'研究选题',trending:'焦点',hongKong:'香港',asean:'亚洲／东盟',business:'商业',finance:'金融',markets:'市场',newsroom:'新闻中心',culture:'文化',video:'视频',entertainment:'文娱',about:'关于ICA',contact:'联系我们',title:'连接两地的报道',tag:'独立呈现伊拉克与中国之间的交流。',read:'浏览新闻',latest:'最新报道',recent:'编辑部',all:'全部报道',empty:'此栏目尚未发布经核实的报道。',view:'阅读报道',submit:'提供新闻线索',subscribe:'订阅 ICA 简报',subHelp:'获取编辑动态、文化报道及新闻专题。',email:'电子邮箱',join:'订阅',success:'谢谢。我们已收到您的请求。',error:'出现错误，请检查信息后重试。',editor:'编辑工作台',language:'语言'}
}
export function useICA(){
 const location=useLocation()
 const query=(location.href||'').split('?')[1]||''
 const p=new URLSearchParams(query)
 const raw=p.get('lang')
 const lang:Language=isLanguage(raw)?raw:'en'
 const path=(target:string)=>{
  if(lang==='en')return target
  const [base,hash]=target.split('#',2)
  const sep=base.includes('?')?'&':'?'
  return base+sep+'lang='+encodeURIComponent(lang)+(hash===undefined?'':'#'+hash)
 }
 return {lang,t:labels[lang],L:getI18n(lang),rtl:rtlLanguage(lang),path}
}
export function Brand({inverse=false}:{inverse?:boolean}){
 const {path}=useICA()
 return <a className={'ica-brand '+(inverse?'ica-brand-inverse':'')} href={path('/')} aria-label="Iraqi-Chinese Agency home">
  <span className="ica-symbol" aria-hidden="true"><b>ICA</b><i/></span>
  <span className="ica-brand-name"><strong>IRAQI-CHINESE<br/>AGENCY</strong><small>ئـاژانسی عێراقی - چینی</small></span>
 </a>
}
export function Header(){
 const {lang,t,L,rtl,path}=useICA()
 const nav=[['/desk/latest',t.news],['/desk/trending',t.trending],['/desk/hong-kong',t.hongKong],['/desk/asean',t.asean],['/desk/business',t.business],['/desk/finance',t.finance],['/topics',t.topics]]
 const mobileNav=[...nav,...ICA_DESKS.filter(x=>!['latest','trending','hong-kong','asean','business','finance'].includes(x.slug)).map(x=>['/desk/'+x.slug,deskName(lang,x.slug)]),['/newsroom',t.newsroom],['/culture',t.culture],['/video',t.video],['/entertainment',t.entertainment],['/about',t.about]]
 return <header className="ica-header">
  <div className="ica-topline"><span>ICA | IRAQ × CHINA</span><span>{L('topline')}</span></div>
  <div className="ica-nav">
   <Brand/>
   <nav className="ica-nav-links" aria-label="Primary navigation">{nav.map(([url,label])=><a key={url} href={path(url)}>{label}</a>)}</nav>
   <div className="ica-nav-actions">
    <label className="ica-language"><span className="sr-only">{t.language}</span><select value={lang} aria-label={t.language} onChange={e=>{const selected=e.target.value;if(!isLanguage(selected))return;try{window.localStorage.setItem('ica-language',selected)}catch{}const u=new URL(window.location.href);if(selected==='en')u.searchParams.delete('lang');else u.searchParams.set('lang',selected);window.location.assign(u.toString())}}><option value="en">EN</option><option value="ar">عربي</option><option value="ckb">کوردی</option><option value="zh">中文</option></select></label>
    <a className="ica-nav-contact" href={path('/contact')}>{t.contact}</a>
   </div>
  </div>
  <MobileNavigation items={mobileNav} rtl={rtl} path={path} close={L('closeMenu')} browse={L('browseSections')} contact={L('contactICA')} />
  <nav className="ica-header-topicline" aria-label={L('globalDesks')}><span>{L('globalDesks')}</span><div>{ICA_DESKS.filter(x=>!['latest','trending'].includes(x.slug)).map(x=><a key={x.slug} href={path('/desk/'+x.slug)}>{deskName(lang,x.slug)}</a>)}</div></nav>
 </header>
}
function MobileNavigation({items,rtl,path,close,browse,contact}:{items:string[][];rtl:boolean;path:(p:string)=>string;close:string;browse:string;contact:string}){
 const [open,setOpen]=useState(false)
 return <div className="ica-mobile-nav"><button type="button" aria-expanded={open} aria-controls="ica-mobile-drawer" onClick={()=>setOpen(!open)}>{open?close:browse} <span aria-hidden="true">{open?'×':'☰'}</span></button>{open&&<nav id="ica-mobile-drawer" dir={rtl?'rtl':'ltr'} aria-label="Mobile navigation">{items.map(([url,name])=><a href={path(url)} key={url}>{name}</a>)}<a href={path('/contact')}>{contact}</a></nav>}</div>
}
export function Footer(){
 const {t,L,path}=useICA()
 return <footer className="ica-footer"><div className="ica-footer-upper"><div><Brand inverse/><p>{L('footerDesc')}</p></div><div><h4>{L('discover')}</h4><a href={path('/desk/latest')}>{t.news}</a><a href={path('/desk/trending')}>{t.trending}</a><a href={path('/desk/hong-kong')}>{t.hongKong}</a><a href={path('/desk/asean')}>{t.asean}</a><a href={path('/topics')}>{t.topics}</a><a href={path('/culture')}>{t.culture}</a><a href={path('/video')}>{t.video}</a><a href={path('/entertainment')}>{t.entertainment}</a></div><div><h4>{L('agency')}</h4><a href={path('/newsroom')}>{t.newsroom}</a><a href={path('/about')}>{t.about}</a><a href={path('/contact')}>{t.contact}</a><a href={path('/studio')}>{t.editor}</a></div><div className="ica-footer-news"><h4>{L('partCCC')}</h4><p>{L('footerCCC')}</p><a href="https://ccc-iraq-cultural-centre.vercel.app/" target="_blank" rel="noopener noreferrer">{L('visitCCC')} ↗</a></div></div><div className="ica-footer-lower"><span>© {new Date().getUTCFullYear()} Iraqi-Chinese Agency. {L('allRights')}</span><span>{L('integrity')}</span></div></footer>
}
export function Shell({children,mainClass=''}:{children:ReactNode;mainClass?:string}){
 const {rtl,lang}=useICA()
 useEffect(()=>{
  try{
   const u=new URL(window.location.href)
   const explicit=u.searchParams.get('lang')
   if(isLanguage(explicit)){window.localStorage.setItem('ica-language',explicit);return}
   const saved=window.localStorage.getItem('ica-language')
   if(isLanguage(saved)&&saved!=='en'){u.searchParams.set('lang',saved);window.location.replace(u.toString())}
  }catch{}
 },[lang])
 return <div dir={rtl?'rtl':'ltr'} lang={lang} className={'ica-site '+mainClass}><Header/>{children}<Footer/></div>
}
export function StoryCard({story,feature=false}:{story:ICAArticle;feature?:boolean}){
 const {t,L,lang,path}=useICA()
 return <article className={'ica-story-card '+(feature?'ica-story-feature':'')}>
 <a href={path('/news/'+story.slug)} className="ica-story-link">
 <div className="ica-story-image">{story.image_url?<img src={story.image_url} alt="" loading="lazy"/>:<span className="ica-story-placeholder" aria-hidden="true">ICA <i>PRESS</i></span>}</div>
 <div className="ica-story-text"><div className="ica-story-meta"><span>{story.type.toUpperCase()}</span><time dateTime={story.published_at||undefined}>{story.published_at?formatLocalDate(story.published_at,lang):'ICA'}</time></div><h3 lang={story.lang}>{story.title}</h3><p lang={story.lang}>{story.excerpt}</p><span className="ica-story-read">{t.view} <span aria-hidden="true">↗</span></span></div>
 </a></article>
}
export function EmptyEditorial({filter}:{filter?:string}){
 const {t,L,path}=useICA()
 return <div className="ica-editorial-empty"><div className="ica-editorial-empty-icon" aria-hidden="true">ICA</div><h3>{filter?filter:t.recent}</h3><p>{t.empty}</p><a href={path('/newsroom')}>{L('editorialStandards')} <span aria-hidden="true">↗</span></a></div>
}
export function NewsSection({articles,title,tag}:{articles:ICAArticle[];title?:string;tag?:string}){
 const {t,L,path}=useICA()
 return <section className="ica-news-section"><div className="ica-section-heading"><div><span className="ica-eyebrow">{tag||L('editorialDesk')}</span><h2>{title||t.latest}</h2></div><a className="ica-section-action" href={path('/news')}>{t.all}<span aria-hidden="true">↗</span></a></div>
 {articles.length?<div className="ica-story-grid">{articles.slice(0,6).map((a,i)=><StoryCard story={a} feature={i===0} key={a.id}/>)}</div>:<EmptyEditorial/>}
 </section>
}
export function Newsletter(){
 const {lang,t,L}=useICA()
 const [state,setState]=useState<'idle'|'pending'|'success'|'error'>('idle')
 async function send(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);setState('pending')
  try{const r=await fetch('/api/ica',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',email:fd.get('email'),lang,website:fd.get('website')})});const d=await r.json();setState(r.ok&&d.ok?'success':'error');if(d.ok)form.reset()}catch{setState('error')}
 }
 return <section className="ica-newsletter" aria-labelledby="ica-subscribe-title"><div className="ica-newsletter-art" aria-hidden="true"><span>ICA</span><i/></div><div className="ica-newsletter-copy"><h2 id="ica-subscribe-title">{t.subscribe}</h2><p>{t.subHelp}</p></div><form onSubmit={send} className="ica-newsletter-form"><label htmlFor="ica-email">{t.email}</label><div className="ica-newsletter-entry"><input type="email" name="email" id="ica-email" placeholder="reader@example.com" required maxLength={240}/><button type="submit" disabled={state==='pending'}>{state==='pending'?'…':t.join} <span aria-hidden="true">↗</span></button></div><input className="ica-trap" type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true"/><p aria-live="polite">{state==='success'?t.success:state==='error'?t.error:L('newsletterPrivacy')}</p></form></section>
}
export function Intro({label,title,description,image}:{label:string;title:string;description:string;image?:string}){
 return <div className={'ica-page-intro '+(image?'ica-page-intro-image':'')}><div><span className="ica-intro-label">{label}</span><h1>{title}</h1><p>{description}</p></div>{image&&<img src={image} alt="" />}</div>
}
export function MediaItems({media}:{media:ICAMedia[]}){
 const {path,L,lang}=useICA()
 return media.length?<div className="ica-media-grid">{media.map(m=><article key={m.id} className="ica-media-tile"><a href={m.url} target="_blank" rel="noreferrer"><div className="ica-media-poster">{m.poster_url?<img src={m.poster_url} alt="" loading="lazy"/>:<span className="ica-media-symbol" aria-hidden="true">▶</span>}<span className="ica-play-symbol" aria-hidden="true">▶</span></div><span className="ica-media-category">{m.kind.toUpperCase()} / {m.category}</span><h3 lang="auto">{m.title}</h3><p>{m.description}</p></a></article>)}</div>:<div className="ica-media-empty"><img src="/assets/ica-entertainment.png" alt="Recording studio with cameras and film production equipment"/><div><h3>{L('mediaArchive')}</h3><p>{L('mediaPending')}</p><a href={path('/contact')}>{L('suggestProduction')} ↗</a></div></div>
}
export function ContactForm(){
 const {t,L}=useICA()
 const location=useLocation()
 const subject=(new URLSearchParams((location.href||'').split('?')[1]||'')).get('subject')?.slice(0,160)||''
 const [state,setState]=useState<'idle'|'pending'|'success'|'error'>('idle')
 async function send(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form).entries());setState('pending')
  try{const r=await fetch('/api/ica',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,action:'contact'})});const res=await r.json();setState(r.ok&&res.ok?'success':'error');if(res.ok)form.reset()}catch{setState('error')}
 }
 return <form onSubmit={send} className="ica-contact-form"><div className="ica-form-row"><label>{L('name')}<input name="name" minLength={2} maxLength={120} required autoComplete="name"/></label><label>{L('email')}<input name="email" type="email" maxLength={240} required autoComplete="email"/></label></div><label>{L('topic')}<select name="topic" required defaultValue={subject?"News tip":""}><option value="" disabled>{L('selectTopic')}</option><option value="News tip">{L('tip')}</option><option value="Press enquiry">{L('enquiry')}</option><option value="Cultural collaboration">{L('collab')}</option><option value="Corrections request">{L('correctionRequest')}</option><option value="Other request">{L('other')}</option></select></label><label>{L('message')}<textarea name="message" minLength={12} maxLength={4000} rows={7} required defaultValue={subject?L('regardingResearch')+" "+subject+"\n\n":""} placeholder={L('messagePlaceholder')} /></label><input name="website" className="ica-trap" tabIndex={-1} autoComplete="off" aria-hidden="true"/><button type="submit" disabled={state==='pending'}>{state==='pending'?L('sending'):L('send')}<span aria-hidden="true">↗</span></button><p className="ica-form-response" role="status" aria-live="polite">{state==='success'?t.success:state==='error'?t.error:L('contactPrivacy')}</p></form>
}
