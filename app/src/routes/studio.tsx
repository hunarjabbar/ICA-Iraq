import {createFileRoute} from '@tanstack/react-router'
import {useEffect} from 'react'
import {icaStaffHandoff} from '../lib/central-workspace'

/** The old independent ICA access-key studio has no active CRUD backend.
 * Never revive it or display a second staff credential form. */
function StudioHandoff(){
 const target=icaStaffHandoff('editorial')
 useEffect(()=>{window.location.replace(target)},[target])
 return <main className="ica-notfound" aria-live="polite">
  <h1>ICA editorial operations</h1>
  <p>Editorial submissions, reviews, publication decisions and the newsroom inbox are managed inside the single CCC Central Command Centre with verified staff authentication.</p>
  <a href={target}>Continue to secure Central Command Centre</a>
 </main>
}
export const Route=createFileRoute('/studio')({
 head:()=>({meta:[{title:'ICA editorial — Central Command Centre'},{name:'robots',content:'noindex,nofollow'}]}),
 component:StudioHandoff
})
