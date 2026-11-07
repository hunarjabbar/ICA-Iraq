import {useState} from 'react'
import {Shell,Intro,StoryCard,EmptyEditorial,MediaItems,ContactForm,Newsletter,useICA} from './site'
import {deskName} from '../../lib/ica-i18n'
import type {ICAArticle,ICAMedia} from '../../lib/ica.server'

const howWeReport={
 en:{title:'How We Report',intro:'A transparent distinction between ICA journalism, external-source links and official CCC programme information.',sections:[['Sourcing and verification','Original ICA reporting identifies its sources and checks claims against documents and direct testimony where possible. External-source headlines remain attributed and link to their publishers.'],['Corrections and updates','Readers can request a correction through the newsroom contact channel. Material corrections should be acknowledged on the relevant article.'],['Commercial and institutional labels','CCC programme notices are identified as official CCC information. Paid, sponsored or partner-produced material must be labelled distinctly; commercial support does not turn a notice into independent reporting.']],contact:'Request a correction'},
 zh:{title:'我们如何报道',intro:'明确区分 ICA 原创新闻、外部来源链接和 CCC 官方项目公告。',sections:[['来源与核实','ICA 原创报道标明资料来源，尽可能核查文件和直接证言。外部标题注明发布机构并链接原文。'],['更正与更新','读者可以通过新闻中心联系渠道申请更正。重大更正应在相关文章中说明。'],['商业与机构标注','CCC 项目通知明确标识为 CCC 官方信息。付费、赞助或合作伙伴内容须明确标注，不作为独立新闻。']],contact:'申请更正'},
 ar:{title:'كيف نعمل صحفياً',intro:'نميّز بوضوح بين صحافة ICA وروابط المصادر الخارجية وإعلانات برامج CCC الرسمية.',sections:[['المصادر والتحقق','توضح تقارير ICA الأصلية مصادرها وتراجع الوثائق والشهادات المباشرة متى أمكن. تُنسب العناوين الخارجية إلى ناشريها مع رابط المصدر.'],['التصحيحات والتحديثات','يمكن للقراء طلب تصحيح عبر التواصل مع غرفة الأخبار، مع توضيح التصحيحات الجوهرية على المقال المعني.'],['الإعلانات والرعاية','تُعرّف إعلانات برامج CCC بأنها معلومات رسمية من CCC. يجب تمييز المواد المدفوعة أو الممولة أو التي ينتجها الشركاء عن الصحافة المستقلة.']],contact:'طلب تصحيح'},
 ckb:{title:'چۆن ڕاپۆرت دەکەین',intro:'جیاوازییەکی ڕوون لەنێوان ڕاپۆرتی ICA و سەرچاوەی دەرەکی و ڕاگەیاندنی فەرمیی CCC.',sections:[['سەرچاوە و پشتڕاستکردنەوە','ڕاپۆرتی ڕەسەنی ICA سەرچاوەکانی دیاری دەکات و تا دەتوانێت بەڵگە و گێڕانەوە ڕاست دەکاتەوە. هەواڵی دەرەکی بە ناوی بڵاوکەرەوەی خۆیەوە دێت.'],['ڕاستکردنەوە و نوێکردنەوە','خوێنەران دەتوانن داوای ڕاستکردنەوە بکەن و گۆڕانکاریی گرنگ لە وتارەکە ڕوون دەکرێتەوە.'],['ناساندنی سپۆنسەر و دامەزراوە','ئاگادارییەکانی CCC وەک زانیاری فەرمی CCC نیشان دەدرێن؛ ناوەڕۆکی پارەدراو یان سپۆنسەرکراو جیاواز دیاری دەکرێت.']],contact:'داوای ڕاستکردنەوە'}
} as const

export function CoveragePage({type,stories=[]}:{type:string;stories?:ICAArticle[]}){
 const {t,L,path,lang}=useICA()
 const [term,setTerm]=useState('')
 const [category,setCategory]=useState('all')
 const actual=stories.filter(a=>(category==='all'||a.type===category)&&(!term||[a.title,a.excerpt,a.author].join(' ').toLowerCase().includes(term.toLowerCase())))
 const configs:Record<string,{label:string;title:string;description:string;image?:string}>={
 news:{label:'ICA / '+deskName(lang,'news'),title:t.news,description:L('newsDesc')},
 culture:{label:'ICA / '+deskName(lang,'culture'),title:t.culture,description:L('cultureDesc'),image:'/assets/ica-culture.png'},
 entertainment:{label:'ICA / '+deskName(lang,'entertainment'),title:t.entertainment,description:L('entertainmentDesc'),image:'/assets/ica-entertainment.png'},
 newsroom:{label:'ICA / '+t.newsroom,title:t.newsroom,description:L('newsroomDesc')}
 }
 const c=configs[type]||configs.news
 return <Shell><main className="ica-page-content"><Intro {...c}/>
  {type==='newsroom'&&<div className="ica-newsroom-top">
   <article><span>{L('pressFor')}</span><h2>{L('pressRelations')}</h2><p>{L('pressText')}</p><a href={path('/contact')}>{L('pressRequest')} ↗</a></article>
   <article><span>{L('sourcesFor')}</span><h2>{L('submitTip')}</h2><p>{L('tipText')}</p><a href={path('/contact')}>{L('contactNewsroom')} ↗</a></article>
   <article><span>{L('readersFor')}</span><h2>{L('correctionTitle')}</h2><p>{L('correctionText')}</p><a href={path('/contact')}>{L('requestCorrection')} ↗</a></article>
  </div>}
  {type==='newsroom'&&<section id="how-we-report" className="ica-newsroom-policy" aria-labelledby="ica-reporting-principles-title">
   <h2 id="ica-reporting-principles-title">{howWeReport[lang].title}</h2>
   <p>{howWeReport[lang].intro}</p>
   <div className="ica-newsroom-top">{howWeReport[lang].sections.map(([heading,body])=><article key={heading}>
    <h3>{heading}</h3><p>{body}</p>
   </article>)}</div>
   <p><a href={path('/contact')}>{howWeReport[lang].contact} ↗</a></p>
  </section>}
  <section className="ica-coverage-list"><div className="ica-coverage-header"><h2>{type==='culture'?L('culturalStories'):type==='entertainment'?L('artsScreen'):type==='newsroom'?L('pressReleases'):L('latestCoverage')}</h2>
   <div className="ica-coverage-filters">
    <label><span className="sr-only">{L('searchCoverage')}</span><input type="search" value={term} onChange={e=>setTerm(e.target.value)} placeholder={L('searchArchive')}/></label>
    {type==='news'&&<label><span className="sr-only">{L('filterCategory')}</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">{L('allCategories')}</option>{['news','analysis','press','culture','entertainment'].map(x=><option key={x} value={x}>{deskName(lang,x)}</option>)}</select></label>}
   </div></div>
  {actual.length?<div className="ica-story-grid">{actual.map(a=><StoryCard key={a.id} story={a}/>)}</div>:<EmptyEditorial filter={term?L('noMatches'):undefined}/>}
  </section><Newsletter/>
 </main></Shell>
}
export function VideoPage({media}:{media:ICAMedia[]}){
 const {L}=useICA()
 return <Shell><main className="ica-page-content">
  <Intro label="ICA / MEDIA" title={L('videoTitle')} description={L('videoDesc')} image="/assets/ica-entertainment.png"/>
  <div className="ica-channel-strip"><span>{L('documentaries')}</span><span>{L('interviews')}</span><span>{L('cultureTopic')}</span><span>{L('editorialSeries')}</span></div>
  <section className="ica-media-archive"><h2>{L('mediaArchive')}</h2><MediaItems media={media}/></section><Newsletter/>
 </main></Shell>
}
export function AboutPage(){
 const {path,L}=useICA()
 const values=[['verifyTitle','verifyDesc'],['contextTitle','contextDesc'],['transparentTitle','transparentDesc'],['correctionValue','correctionValueDesc']] as const
 return <Shell><main className="ica-page-content">
  <Intro label={L('aboutAgency')} title={L('aboutTitle')} description={L('aboutDesc')}/>
  <section className="ica-about-layout"><div className="ica-about-manifesto"><h2>{L('twoSocieties')}</h2><p>{L('aboutFirst')}</p><p>{L('aboutSecond')}</p></div><div className="ica-about-photo"><img src="/assets/ica-cover-scene.png" alt="ICA editorial photography and cultural exchange"/></div></section>
  <div className="ica-values">{values.map(([heading,body],i)=><article key={heading}><strong>{String(i+1).padStart(2,'0')}</strong><h3>{L(heading)}</h3><p>{L(body)}</p></article>)}</div>
  <div className="ica-about-outro"><h2>{L('tellMatters')}</h2><a href={path('/contact')}>{L('connectICA')} ↗</a></div>
 </main></Shell>
}
export function ContactPage(){
 const {L}=useICA()
 return <Shell><main className="ica-page-content">
  <Intro label={L('contactLabel')} title={L('contactTitle')} description={L('contactDesc')}/>
  <div className="ica-contact-layout"><div><h2>{L('getInTouch')}</h2><p>{L('contactInstructions')}</p>
   <div className="ica-contact-detail"><strong>{L('email')}</strong><a href="mailto:info@Iraqi-chineseagency.com">info@Iraqi-chineseagency.com</a></div>
   <div className="ica-contact-detail"><strong>{L('location')}</strong><span>{L('locationValue')}</span></div>
   <div className="ica-contact-detail"><strong>{L('editorialNotice')}</strong><span>{L('editorialNoticeText')}</span></div>
  </div><ContactForm/></div>
 </main></Shell>
}
