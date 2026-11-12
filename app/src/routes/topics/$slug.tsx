import {createFileRoute} from '@tanstack/react-router'
import {TopicDetail} from '@/components/ica/topics'
import {findTopic} from '@/data/ica-topics'
export const Route=createFileRoute('/topics/$slug')({
 head:({params})=>{
  const topic=findTopic(params.slug)
  return {meta:[{title:topic?topic.title+' | ICA Research Atlas':'Research topic unavailable | ICA'},{name:'description',content:topic?.summary||'ICA source-linked editorial research topics.'}],
    links:[{rel:'canonical',href:'https://ica-international-portal.vercel.app/topics/'+encodeURIComponent(params.slug)}]}
 },
 component:()=>{const {slug}=Route.useParams();return <TopicDetail slug={slug}/>}
})
