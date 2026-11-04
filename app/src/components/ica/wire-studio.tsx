import {useState,type FormEvent} from 'react'
import {REGIONS,EDITOR_DESKS} from '../../lib/ica-desks'
import {useICA} from './site'
import {studioText} from '../../lib/ica-studio-i18n'
import {deskName,formatLocalDate} from '../../lib/ica-i18n'
import type {WireItem,WireSource} from '../../lib/ica-wire.server'
type Action=(input:Record<string,unknown>)=>Promise<boolean>
const blank={id:'',headline:'',source_url:'',source_name:'',region:'world',desk:'news',summary:'',published_at:new Date().toISOString().slice(0,16),status:'linked',pinned:false}
export function WireStudio({items,sources,busy,action}:{items:WireItem[];sources:WireSource[];busy:boolean;action:Action}){
 const {lang}=useICA()
 const S=(key:string)=>studioText(lang,key)
 const [form,setForm]=useState({...blank})
 const [filter,setFilter]=useState('all')
 const [search,setSearch]=useState('')
 const [showCount,setShowCount]=useState(30)
 const [message,setMessage]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const when=new Date(form.published_at)
  if(!Number.isFinite(when.getTime())){setMessage(S('publishDateRequired'));return}
  const ok=await action({action:'upsert_wire',...form,published_at:when.toISOString()})
  if(ok){setForm({...blank});setMessage(S('linkSaved'))}
 }
 async function perform(input:Record<string,unknown>,success:string){
  setMessage('')
  if(await action(input))setMessage(success)
 }
 const filtered=items.filter(x=>(filter==='all'||x.region===filter||x.desk===filter)&&[x.headline,x.source_name].join(' ').toLowerCase().includes(search.trim().toLowerCase()))
 return <section className="ica-studio-wire">
  <div className="ica-studio-wide-header"><div><h2>{S('wireTitle')}</h2><p>{S('wireDescription')}</p></div><button type="button" disabled={busy} onClick={()=>void perform({action:'refresh_sources'},S('sourceChecked'))}>{S('refreshFeeds')} ↻</button></div>
  <div className="ica-studio-source-strip">{sources.map(s=><article key={s.id} className="ica-studio-source">
   <div><strong>{s.publisher}</strong><span>{s.region} / {s.desk}</span></div>
   <p>{s.last_error?<span className="ica-source-error">{S('lastCheck')}: {s.last_error}</span>:s.last_success_at?S('lastSync')+': '+formatLocalDate(s.last_success_at,lang):S('firstSync')}</p>
   <div><span>{s.imported_count} {S('catalogued')}</span><button type="button" disabled={busy} aria-label={(s.enabled?S('paused'):S('enabled'))+' '+s.name} onClick={()=>void perform({action:'toggle_source',id:s.id,enabled:!s.enabled},S('sourceUpdated'))}>{s.enabled?S('enabled')+' ✓':S('paused')+' ○'}</button></div>
  </article>)}</div>
  <div className="ica-admin-columns">
   <div><h2>{S('curatedLink')}</h2><form className="ica-studio-form" onSubmit={save}>
    <label>{S('headline')}<input value={form.headline} minLength={11} maxLength={220} required onChange={e=>setForm({...form,headline:e.target.value})}/></label>
    <label>{S('originalUrl')}<input value={form.source_url} type="url" pattern="https://.*" maxLength={700} required placeholder="https://publisher.example/story" onChange={e=>setForm({...form,source_url:e.target.value})}/></label>
    <label>{S('publisher')}<input value={form.source_name} maxLength={120} minLength={3} required onChange={e=>setForm({...form,source_name:e.target.value})}/></label>
    <div className="ica-form-row">
     <label>{S('region')}<select value={form.region} onChange={e=>setForm({...form,region:e.target.value})}>{REGIONS.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
     <label>{S('newsDesk')}<select value={form.desk} onChange={e=>setForm({...form,desk:e.target.value})}>{EDITOR_DESKS.map(x=><option key={x} value={x}>{deskName(lang,x)}</option>)}</select></label>
    </div>
    <label>{S('contextNote')}<textarea value={form.summary} rows={3} maxLength={450} onChange={e=>setForm({...form,summary:e.target.value})}/></label>
    <div className="ica-form-row"><label>{S('publicationDate')}<input type="datetime-local" required value={form.published_at} onChange={e=>setForm({...form,published_at:e.target.value})}/></label>
     <label>{S('visibility')}<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="linked">{S('publicLink')}</option><option value="hidden">{S('hidden')}</option></select></label>
    </div>
    <label className="ica-checked"><input type="checkbox" checked={form.pinned} onChange={e=>setForm({...form,pinned:e.target.checked})}/> {S('highlight')}</label>
    <div className="ica-studio-actions"><button disabled={busy} type="submit">{busy?S('saving'):form.id?S('updateLink'):S('saveLink')}</button><button type="button" className="ica-studio-clear" onClick={()=>setForm({...blank})}>{S('newEntry')}</button></div>
    <p className="ica-studio-hint">{S('linkHint')}</p>
   </form></div>
   <aside className="ica-studio-wire-inventory"><h2>{S('syncedHeadlines')}</h2>
    <div className="ica-studio-wire-controls"><label><span className="sr-only">{S('searchSources')}</span><input value={search} placeholder={S('searchSources')} onChange={e=>setSearch(e.target.value)}/></label><label><span className="sr-only">{S('filterDesk')}</span><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">{S('allCategories')}</option>{REGIONS.map(x=><option key={x} value={x}>{deskName(lang,x)}</option>)}{EDITOR_DESKS.map(x=><option key={x} value={x}>{deskName(lang,x)}</option>)}</select></label></div>
    <p className="ica-studio-hint">{filtered.length} {S('sourceLinks')}. {S('showing')} {Math.min(filtered.length,showCount)}.</p>
    {filtered.slice(0,showCount).map(x=><article key={x.id} className="ica-wire-admin-item">
      <span>{x.source_name} · {deskName(lang,x.region)} / {deskName(lang,x.desk)} · {x.origin==='feed'?S('feed'):S('manual')}</span>
      <strong>{x.headline}</strong><small>{formatLocalDate(x.published_at,lang)} / {x.status==='linked'?S('linked'):S('hidden')}{x.pinned?' / '+S('featured'):''}</small>
      <div><button type="button" onClick={()=>setForm({id:x.id,headline:x.headline,source_url:x.source_url,source_name:x.source_name,region:x.region,desk:x.desk,summary:x.summary||'',published_at:new Date(x.published_at).toISOString().slice(0,16),status:x.status,pinned:!!x.pinned})}>{S('edit')}</button>
       <button disabled={busy} type="button" onClick={()=>void perform({action:'wire_visibility',id:x.id,status:x.status==='linked'?'hidden':'linked'},S('visibilityUpdated'))}>{x.status==='linked'?S('hide'):S('show')}</button>
       <button disabled={busy} type="button" onClick={()=>{if(confirm(x.origin==='feed'?S('confirmHide'):S('confirmRemove')))void perform({action:'delete_wire',id:x.id},S('removed'))}}>{S('remove')}</button></div>
    </article>)}
    {showCount<filtered.length&&<button type="button" className="ica-studio-show-more" onClick={()=>setShowCount(v=>v+30)}>{S('showMore')} ↓</button>}
    {!filtered.length&&<p>{S('noLinks')}</p>}
   </aside>
  </div>
  {message&&<p className="ica-studio-result" role="status">{message}</p>}
 </section>
}
