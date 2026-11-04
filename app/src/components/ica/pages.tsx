import {useState} from 'react'
import {Shell,Intro,StoryCard,EmptyEditorial,MediaItems,ContactForm,Newsletter,useICA} from './site'
import {deskName} from '../../lib/ica-i18n'
import type {ICAArticle,ICAMedia} from '../../lib/ica.server'

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
