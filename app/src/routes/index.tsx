import {createFileRoute} from '@tanstack/react-router'
import {ScrollScrub} from '@/components/scroll-scrub/scroll-scrub'
import {scrollScrubScenes,scrollScrubTheme} from '@/scroll-scrub-scenes'
import {getHomeFeed} from '@/lib/ica.functions'
import {languageFromHref,localizedAlternates} from '@/lib/ica-i18n'
import {Shell,NewsSection,Newsletter,useICA,MediaItems} from '@/components/ica/site'
import {TopicsHomePreview} from '@/components/ica/topics'
import {LiveTicker,PortalLead,TrendingDesk,SectionMosaic,MarketSourceStrip} from '@/components/ica/international'
export const Route=createFileRoute('/')({loader:({location})=>getHomeFeed({data:{lang:languageFromHref(location.href)}}),head:()=>({links:[{rel:'canonical',href:'https://ica-international-portal.vercel.app/'},...localizedAlternates('/')]}),component:Index})
function Index(){
 const {articles,media,wire}=Route.useLoaderData()
 const {t,L,path}=useICA()
 return <Shell mainClass="ica-home">
 <main>
  <LiveTicker wire={wire.items}/>
  <div className="ica-content ica-global-content">
   <PortalLead articles={articles} wire={wire.items}/>
   <TrendingDesk articles={articles} wire={wire.items}/>
   <SectionMosaic articles={articles} wire={wire.items}/>
   <MarketSourceStrip/>
  </div>
  <section className="ica-film-intro" aria-label={L('cultureConversation')}>
   <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme} />
   <a className="ica-film-cta" href={path('/news')}>{t.read} <span aria-hidden="true">↗</span></a>
  </section>
  <div className="ica-feature-strip"><p>{L('featureIraqChina')}</p><strong>{L('featureSubtitle')}</strong><span>{L('featureLanguages')}</span></div>
  <div className="ica-content"><NewsSection articles={articles} tag={L('editorialDesk')}/>
   <TopicsHomePreview/>
   <section className="ica-culture-spotlight"><div className="ica-culture-image"><img src="/assets/ica-culture.png" alt="Editorial still life highlighting shared artistic traditions" loading="lazy"/></div><div className="ica-culture-description"><div className="ica-spotlight-bar" aria-hidden="true"/><span>{L('peoplePerspectives')}</span><h2>{L('cultureConversation')}</h2><p>{L('cultureDetails')}</p><a href={path('/culture')}>{L('exploreCulture')} <span aria-hidden="true">↗</span></a></div></section>
   <section className="ica-video-stage"><div><span>ICA / SCREEN</span><h2>{L('titleStories')}</h2><p>{L('videoDescription')}</p><a href={path('/video')}>{L('watchLibrary')} <span aria-hidden="true">▶</span></a></div><img src="/assets/ica-entertainment.png" alt="Professional film production studio" loading="lazy"/></section>
   {media.length>0&&<section className="ica-featured-media"><h2>{L('recentMedia')}</h2><MediaItems media={media}/></section>}
   <Newsletter/>
  </div>
 </main>
 </Shell>
}
