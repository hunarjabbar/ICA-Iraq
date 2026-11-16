import {createFileRoute} from '@tanstack/react-router'
import {ScrollScrub} from '@/components/scroll-scrub/scroll-scrub'
import {scrollScrubScenes,scrollScrubTheme} from '@/scroll-scrub-scenes'
import {getHomeFeed} from '@/lib/ica.functions'
import {languageFromHref,localizedAlternates} from '@/lib/ica-i18n'
import {Shell,NewsSection,Newsletter,useICA,MediaItems} from '@/components/ica/site'
import {TopicsHomePreview} from '@/components/ica/topics'
import {LiveTicker,PortalLead,TrendingDesk,SectionMosaic,MarketSourceStrip} from '@/components/ica/international'
import {useManagedICAZone,ICA_NATIVE_HOME_ZONES,safeManagedHref,safeManagedImage} from '@/components/ica/managed-content'
export const Route=createFileRoute('/')({loader:({location})=>getHomeFeed({data:{lang:languageFromHref(location.href)}}),head:()=>({links:[{rel:'canonical',href:'https://ica-international-portal.vercel.app/'},...localizedAlternates('/')]}),component:Index})
function Index(){
 return <Shell mainClass="ica-home"><HomeSections/></Shell>
}
function HomeSections(){
 const {articles,media,wire}=Route.useLoaderData()
 const {t,L,path,lang}=useICA()
 const feature=useManagedICAZone('intro',ICA_NATIVE_HOME_ZONES.featureStrip)
 const culture=useManagedICAZone('feature',ICA_NATIVE_HOME_ZONES.culture)
 const video=useManagedICAZone('feature',ICA_NATIVE_HOME_ZONES.video)
 const cultureHref=culture?.cta_href?safeManagedHref(culture.cta_href,lang):null
 const videoHref=video?.cta_href?safeManagedHref(video.cta_href,lang):null
 return <main className="ica-home-main">
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
  <div className="ica-feature-strip"><p>{feature?.eyebrow||L('featureIraqChina')}</p><strong>{feature?.title||L('featureSubtitle')}</strong><span>{feature?.summary||L('featureLanguages')}</span></div>
  <div className="ica-content"><NewsSection articles={articles} tag={L('editorialDesk')}/>
   <TopicsHomePreview/>
   <section className="ica-culture-spotlight"><div className="ica-culture-image"><img src={culture?.image_url&&safeManagedImage(culture.image_url)?culture.image_url:"/assets/ica-culture.png"} alt={culture?.image_alt||"Editorial still life highlighting shared artistic traditions"} loading="lazy" decoding="async"/></div><div className="ica-culture-description"><div className="ica-spotlight-bar" aria-hidden="true"/><span>{culture?.eyebrow||L('peoplePerspectives')}</span><h2>{culture?.title||L('cultureConversation')}</h2><p>{culture?.summary||L('cultureDetails')}</p><a href={cultureHref||path('/culture')}>{culture?.cta_label||L('exploreCulture')} <span aria-hidden="true">↗</span></a></div></section>
   <section className="ica-video-stage"><div><span>{video?.eyebrow||"ICA / SCREEN"}</span><h2>{video?.title||L('titleStories')}</h2><p>{video?.summary||L('videoDescription')}</p><a href={videoHref||path('/video')}>{video?.cta_label||L('watchLibrary')} <span aria-hidden="true">▶</span></a></div><img src={video?.image_url&&safeManagedImage(video.image_url)?video.image_url:"/assets/ica-entertainment.png"} alt={video?.image_alt||"Professional film production studio"} loading="lazy" decoding="async"/></section>
   {media.length>0&&<section className="ica-featured-media"><h2>{L('recentMedia')}</h2><MediaItems media={media}/></section>}
   <Newsletter/>
  </div>
 </main>
}
