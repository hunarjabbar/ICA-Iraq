import {createFileRoute} from '@tanstack/react-router'
import {localizedAlternates} from '@/lib/ica-i18n'
import {TopicsIndex} from '@/components/ica/topics'
export const Route=createFileRoute('/topics')({
 head:()=>({meta:[{title:'72 Research Topics | ICA Editorial Atlas'},{name:'description',content:'Explore 72 source-linked editorial research ideas across Iraq-China diplomacy, economy, culture, heritage, climate and society.'}],links:[{rel:'canonical',href:'https://ica-iraqi-chinese-agency.higgsfield.app/topics'},...localizedAlternates('/topics')]}),
 component:TopicsIndex
})
