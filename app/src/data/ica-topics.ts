/**
 * ICA Research Atlas: source-linked editorial research leads, NOT published news.
 * Source documents checked November 4, 2026. No article is represented as independently reported.
 * Questions and hypotheses require individual ICA newsroom verification prior to publication.
 */
export type ICATopic = {
  id:string;slug:string;title:string;summary:string;category:string;categoryDescription:string;
  sourceName:string;sourceUrl:string;publisher:string;state:'research-lead';
}
const references={
  fm2026:{name:'China-Iraq Bilateral Relations (July 2026)',publisher:'Ministry of Foreign Affairs of China',url:'https://www.mfa.gov.cn/gjhdq_676201/gj_676203/yz_676205/1206_677148/sbgx_677152/'},
  fmEnglish:{name:'Iraq Country Profile and Cooperation',publisher:'Ministry of Foreign Affairs of China',url:'https://www.fmprc.gov.cn/mfa_eng/gjhdq_665435/2675_665437/2823_663636/'},
  worldbank:{name:'Iraq Macro Poverty Outlook, October 2026',publisher:'World Bank',url:'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099744010152630926'},
  energy:{name:'Iraq Energy Profile',publisher:'International Energy Agency',url:'https://www.iea.org/countries/iraq'},
  reutersOil:{name:'Chinese Refiners and Iraqi Oil, October 2026',publisher:'Reuters',url:'https://www.reuters.com/business/energy/chinese-independent-refiners-boost-iraqi-oil-purchases-iranian-flows-fall-2026-10-06/'},
  visaErbil:{name:'China Visa Policy and Procedures, Erbil',publisher:'Chinese Consulate-General in Erbil',url:'https://erbil.china-consulate.gov.cn/eng/lsfw/visas/202312/t20231223_11210116.htm'},
  visaBaghdad:{name:'China Visa Procedures, Baghdad',publisher:'Embassy of China in Iraq',url:'https://iq.china-embassy.gov.cn/eng/lsyw/qz/202410/t20241022_11511448.htm'},
  iraqHeritage:{name:'Iraq World Heritage Properties',publisher:'UNESCO',url:'https://whc.unesco.org/en/statesparties/iq'},
  chinaHeritage:{name:'China World Heritage Properties',publisher:'UNESCO',url:'https://whc.unesco.org/en/statesparties/cn'},
  erbil:{name:'Reviving the World Heritage Site of Erbil Citadel',publisher:'UNESCO',url:'https://www.unesco.org/en/articles/reviving-world-heritage-site-erbil-citadel'},
  babylon:{name:'Babylon: World Heritage Site',publisher:'UNESCO',url:'https://whc.unesco.org/en/list/278'},
  iraqICH:{name:'Living Intangible Cultural Heritage in Iraq',publisher:'UNESCO',url:'https://ich.unesco.org/en/state/iraq-IQ'},
  iraqMaqam:{name:'Iraqi Maqam',publisher:'UNESCO',url:'https://ich.unesco.org/en/RL/iraqi-maqam-00076'},
  chineseTea:{name:'Traditional Chinese Tea Culture and Processing',publisher:'UNESCO',url:'https://ich.unesco.org/en/RL/traditional-tea-processing-techniques-and-associated-social-practices-in-china-01884'},
  agriculture:{name:'Iraq Food Security Country Brief, September 2026',publisher:'FAO',url:'https://cb.apps.fao.org/country.jsp?code=IRQ'},
  climate:{name:'Iraq Nationally Determined Contribution, October 2026',publisher:'UNDP',url:'https://www.undp.org/iraq/publications/iraq-nationally-determined-contribution'},
  development:{name:'UNDP Iraq Annual Report 2025',publisher:'UNDP',url:'https://www.undp.org/arab-states/publications/undp-iraq-annual-report-2025'},
  iom:{name:'Iraq Crisis Response Plan 2026',publisher:'IOM',url:'https://crisisresponse.iom.int/index.php/response/iraq-crisis-response-plan-2026'},
  iomClimate:{name:'Climate-Induced Displacement, September 2025',publisher:'IOM Displacement Tracking Matrix',url:'https://dtm.iom.int/reports/iraq-climate-induced-displacement-central-and-southern-iraq-september-2025?close=true'},
  who:{name:'Iraq Health Indicators',publisher:'World Health Organization',url:'https://data.who.int/countries/368'},
  whoPolicy:{name:'Iraq Health Policy 2026-2035',publisher:'World Health Organization',url:'https://extranet.who.int/uhcpartnershiplivemonitoring/activity/iraq-revise-and-finalize-national-health-policy-2026-2035-align-phc-uhc-and-health-system'},
} as const;
type SourceId=keyof typeof references;
type Row=readonly [title:string,summary:string,sourceId:SourceId];
type Desk=readonly [category:string,description:string,rows:readonly Row[]];
const desks:Desk[]=[
 ['Diplomacy & Relations','Diplomatic milestones, institutions and official bilateral dialogue.',[
 ['How Iraq-China diplomatic relations began','Trace the formal history from the establishment of relations and cross-check pivotal dates in official records.','fm2026'],
 ['The 2015 strategic partnership explained','Investigate what the partnership declaration established and distinguish commitments from measurable outcomes.','fm2026'],
 ['Inside a bilateral ministerial visit','Build a reporting checklist for meetings, memoranda and follow-up commitments across ministries.','fm2026'],
 ['What diplomatic statements really mean','Compare official readouts to understand the difference between proposals, agreements and completed actions.','fmEnglish'],
 ['Culture as a diplomatic bridge','Examine how delegations, festivals and cultural exchanges figure in Iraq-China relations.','fmEnglish'],
 ['Following policy changes without rumours','Explore reliable ways to check government announcements before they become breaking headlines.','fm2026']
 ]],
 ['Trade & Markets','Bilateral commerce, imports, trade figures and market access.',[
 ['The story behind Iraq-China trade figures','Review the latest available bilateral totals and investigate discrepancies between sources and reporting periods.','fm2026'],
 ['What Iraq imports from China','Map potential product sectors, customs categories and the evidence needed for an import analysis.','fmEnglish'],
 ['What Chinese buyers import from Iraq','Explore the composition of Iraqi exports to China and how to verify it using official data.','fm2026'],
 ['A small importer’s guide to trade data','Develop questions business owners should ask about product classification, prices and delivery terms.','fmEnglish'],
 ['Trade beyond petroleum','Identify the sectors worth investigating as Iraq seeks to broaden its economic base.','worldbank'],
 ['Understanding trade changes year to year','Learn how exchange rates, quantities, commodity prices and reporting methods shape bilateral comparisons.','fm2026']
 ]],
 ['Energy & Infrastructure','Oil, electricity, investment and the energy transition.',[
 ['Why Iraqi crude matters to Chinese refiners','Use reported purchasing trends as a starting point for verified oil market interviews and analysis.','reutersOil'],
 ['How oil demand shifts affect Iraq','Investigate the relationship among Chinese refinery demand, export volumes and Iraqi public revenues.','energy'],
 ['Iraq’s electricity reliability challenge','Map how energy generation, transmission and demand feature in Iraq’s national energy profile.','energy'],
 ['What would reduce gas flaring?','Examine methane management and associated-gas recovery as potential infrastructure reporting topics.','energy'],
 ['Solar electricity for Iraqi communities','Develop a reporting plan for renewable-energy pilots, maintenance and grid integration.','climate'],
 ['Can infrastructure investment diversify the economy?','Explore public development priorities and how to evaluate project delivery against official goals.','development']
 ]],
 ['Business & Logistics','Sourcing, trade operations, financing and enterprise development.',[
 ['Verifying an overseas supplier','Design a practical checklist for company registration, product specifications and third-party inspection.','fmEnglish'],
 ['International shipping documents explained','Examine which trade documents importers should obtain and how to verify requirements with authorities.','fmEnglish'],
 ['How importers manage currency exposure','Develop a fact-checking guide for quotation currency, settlement timing and payment-provider risks.','worldbank'],
 ['The hidden cost of delayed cargo','Look at how freight timing, storage and customs uncertainties affect small businesses.','worldbank'],
 ['What economic diversification means for entrepreneurs','Report on the opportunities and limitations identified in Iraq development assessments.','development'],
 ['How to measure a bilateral project’s impact','Build an editorial checklist for jobs, procurement, delivery milestones and independent verification.','development']
 ]],
 ['Education & Language','Mandarin, translation, universities and educational exchange.',[
 ['Mandarin learning in the Kurdistan Region','Investigate the Chinese language teaching initiatives noted by the foreign ministry and speak to educators.','fmEnglish'],
 ['How to evaluate a language course','Compare curriculum, assessment claims and teacher qualifications before recommending programmes.','fmEnglish'],
 ['Studying China through cultural heritage','Explore how shared heritage themes can enrich educational partnerships and student exchanges.','chinaHeritage'],
 ['Translating historical names responsibly','Develop principles for Kurdish, Arabic, English and Chinese proper names in multilingual reporting.','iraqHeritage'],
 ['Media literacy across four languages','Examine how translation, context and original-source checking improve cross-border journalism.','fmEnglish'],
 ['Education exchange announcements: what to verify','Distinguish prospective programmes from confirmed scholarships, institutional agreements and placements.','fm2026']
 ]],
 ['Visa & Travel','Consular procedures, visitor access and responsible tourism.',[
 ['China visa applications from Erbil','Review the consulate’s current procedures and identify what applicants must check directly before travel.','visaErbil'],
 ['Visa applications through Baghdad','Compare official embassy procedures and highlight the importance of source dates and consular jurisdictions.','visaBaghdad'],
 ['Business visits and invitation letters','Investigate documentation, company identity and verification questions in the official visa process.','visaErbil'],
 ['Consular updates without misinformation','Create an editor’s process for verifying new requirements directly with consular websites.','visaBaghdad'],
 ['A cultural visitor’s guide to Iraq’s heritage','Explore how historic sites can be interpreted for Chinese-speaking travellers responsibly.','iraqHeritage'],
 ['The case for sustainable heritage tourism','Report on conservation objectives that must accompany increases in visitor activity.','erbil']
 ]],
 ['History & Heritage','Archaeological places, preservation and civilizational perspectives.',[
 ['Inside the Erbil Citadel restoration','Follow UNESCO’s conservation programme and ask how residents and heritage professionals are involved.','erbil'],
 ['Babylon’s conservation challenges','Examine the responsibilities involved in safeguarding an internationally listed archaeological landscape.','babylon'],
 ['The many layers of Ashur','Discover what official World Heritage documentation reveals and what remains for specialists to interpret.','iraqHeritage'],
 ['Hatra and the preservation of ancient cities','Explore archaeological conservation themes while avoiding unsupported claims about current site access.','iraqHeritage'],
 ['The Mesopotamian Marshes as mixed heritage','Examine why culture, biodiversity and landscape preservation need to be assessed together.','iraqHeritage'],
 ['China’s Silk Roads heritage network','Investigate historical trade corridors and the limits of drawing direct modern diplomatic parallels.','chinaHeritage']
 ]],
 ['Living Culture & Arts','Music, crafts, rituals and the continuity of traditions.',[
 ['Iraqi Maqam as living musical heritage','Explore performance traditions, historic recordings and contemporary transmission with qualified musicians.','iraqMaqam'],
 ['Newroz and shared cultural celebration','Examine the heritage and communities behind UNESCO-listed spring traditions.','iraqICH'],
 ['Copper engraving and craftsmanship in Iraq','Look at workshops, apprenticeships and how traditional metalworking skills are transmitted.','iraqICH'],
 ['Reed architecture and the Iraqi Mudhif','Understand the skills and social practices behind this distinctive building tradition.','iraqICH'],
 ['How tea connects communities in China','Investigate the social role of tea processing and hospitality in different Chinese regions.','chineseTea'],
 ['Calligraphy as a living craft','Compare artistic transmission and material practices while recognizing differences among traditions.','iraqICH']
 ]],
 ['Entertainment & Media','Film, performance, creative industries and responsible storytelling.',[
 ['Documenting classical music for new audiences','Explore ethical audio archives and interviews that help audiences understand Iraqi Maqam.','iraqMaqam'],
 ['From cultural performance to documentary','Develop a film treatment grounded in living heritage rather than reconstructed spectacle.','iraqICH'],
 ['A journalist’s guide to cultural festivals','Ask who organizes events, how performers are credited and how audiences are represented.','fmEnglish'],
 ['How a newsroom checks viral videos','Create a production guide for original footage, provenance, consent and translation.','development'],
 ['Portraying historical places on screen','Examine the difference between archival imagery, reconstructions and verified site documentation.','iraqHeritage'],
 ['The cultural interview: questions worth asking','Design interviews with artists, curators and educators about cooperation and artistic independence.','chineseTea']
 ]],
 ['Climate, Water & Food','Water security, agriculture, climate response and resilience.',[
 ['Iraq’s updated climate commitments','Read the latest national climate submission and distinguish goals from funded implementation.','climate'],
 ['Why water security shapes communities','Explore how changing water conditions affect agriculture, livelihoods and public services.','climate'],
 ['Checking Iraq’s cereal harvest estimates','Use FAO monitoring to ask how weather, irrigation and forecasts change from season to season.','agriculture'],
 ['Practical questions about modern irrigation','Investigate what evidence farmers need before adopting water-saving technologies.','agriculture'],
 ['Understanding climate-related displacement','Review migration tracking methods, definitions and the experience of affected families.','iomClimate'],
 ['How climate finance reaches local projects','Trace planning, transparency and delivery questions in climate investment announcements.','climate']
 ]],
 ['Society & Public Health','Health, displacement, equity and public-service reporting.',[
 ['What Iraq’s health policy seeks to change','Examine WHO-supported priorities for primary health care and health system reform.','whoPolicy'],
 ['How to report health data responsibly','Learn to interpret denominators, uncertainty intervals and coverage measures in official datasets.','who'],
 ['Digital systems and better patient care','Investigate the potential and practical challenges of interoperable health information.','whoPolicy'],
 ['The challenge of sustainable return','Follow the conditions identified in humanitarian and migration recovery planning.','iom'],
 ['Youth opportunity and public services','Identify programmes and evidence relevant to young people’s economic participation.','development'],
 ['Women’s participation in development','Explore documented inclusion programmes and the questions journalists should ask about outcomes.','development']
 ]],
 ['Cities, Innovation & Future','Urban heritage, technology, local economies and new forms of exchange.',[
 ['Can historic cities support new livelihoods?','Examine the relationship between heritage conservation, local enterprise and sustainable tourism.','erbil'],
 ['How cities explain their heritage to visitors','Study interpretive plans and the role of public history in places such as Erbil Citadel.','erbil'],
 ['Using public data to report urban change','Explore reliable indicators for services, investment, mobility and residents’ needs.','development'],
 ['Digital tools for cultural preservation','Consider archival standards and how technology can support heritage documentation responsibly.','chinaHeritage'],
 ['Food security from farm to city','Look at rural production, supply chains and household access to staple foods.','agriculture'],
 ['What makes cross-border reporting trustworthy?','Develop a framework for independent sources, open corrections and clearly labelled editorial genres.','fmEnglish']
 ]]
]
function slugify(text:string){return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,105)}
let count=0;
export const topics:ICATopic[]=desks.flatMap(([category,categoryDescription,rows])=>rows.map(([title,summary,sourceId])=>{
 const src=references[sourceId]
 count+=1
 return {id:String(count).padStart(3,'0'),slug:slugify(title),title,summary,category,categoryDescription,sourceName:src.name,sourceUrl:src.url,publisher:src.publisher,state:'research-lead' as const}
}))
export const topicCategories=desks.map(([name,description])=>({name,description,count:6}))
export const topicSources=references
export const researchReviewedOn='4 November 2026'
export function findTopic(slug:string){return topics.find(t=>t.slug===slug)}
