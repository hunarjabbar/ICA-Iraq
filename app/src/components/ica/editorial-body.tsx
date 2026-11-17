// Public presentation of independently released ICA editorial Markdown.
// No raw HTML, script injection, or public authoring endpoint.
import type {ReactNode} from 'react'
const TOKEN=/(\[[^\]\n]{1,200}\]\([^) \n]{1,600}\)|\*\*[^\n*]+\*\*|\*[^\n*]+\*)/g
export function safeEditorialLink(url:string):boolean{
 return /^(?:https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?|\/(?!\/)[^\s]*)$/i.test(url)
}
function inline(content:string,key:string):ReactNode[]{
 const nodes:ReactNode[]=[];let cursor=0
 for(const match of content.matchAll(TOKEN)){
  const i=match.index||0,raw=match[0]
  if(i>cursor)nodes.push(content.slice(cursor,i))
  if(raw.startsWith('**'))nodes.push(<strong key={key+'-'+i}>{raw.slice(2,-2)}</strong>)
  else if(raw.startsWith('*'))nodes.push(<em key={key+'-'+i}>{raw.slice(1,-1)}</em>)
  else{
   const end=raw.indexOf(']('),label=raw.slice(1,end),href=raw.slice(end+2,-1)
   nodes.push(safeEditorialLink(href)?<a key={key+'-'+i} href={href}
    rel={href.startsWith('/')?undefined:'noopener noreferrer'}
    target={href.startsWith('/')?undefined:'_blank'}>{label}</a>:raw)
  }
  cursor=i+raw.length
 }
 if(cursor<content.length)nodes.push(content.slice(cursor))
 return nodes.length?nodes:[content]
}
type Block={kind:'p'|'h2'|'h3'|'h4'|'quote'|'ul'|'ol'|'hr'|'table';text?:string;items?:string[];rows?:string[][]}
export function parseEditorialBlocks(source:string):Block[]{
 const result:Block[]=[],lines=(source||'').replace(/\r\n?/g,'\n').split('\n')
 let pending:string[]=[],list:string[]=[],listKind:'ul'|'ol'|null=null,table:string[][]=[]
 const flushText=()=>{
  if(listKind&&list.length)result.push({kind:listKind,items:[...list]})
  list=[];listKind=null
  if(pending.length)result.push({kind:'p',text:pending.join('\n')})
  pending=[]
 }
 const flushTable=()=>{
  if(table.length){
   const rows=table.filter(row=>!row.every(cell=>/^:?-{3,}:?$/.test(cell)))
   if(rows.length)result.push({kind:'table',rows})
   table=[]
  }
 }
 const flush=()=>{flushText();flushTable()}
 for(const raw of lines){const line=raw.trim();let hit:RegExpExecArray|null
  if(!line){flush();continue}
  if(line.startsWith('|')&&line.endsWith('|')){
   flushText()
   table.push(line.slice(1,-1).split('|').slice(0,12).map(cell=>cell.trim()))
   continue
  }
  if(table.length)flushTable()
  if((hit=/^(#{1,3})\s+(.+)$/.exec(line))){flushText();result.push({kind:('h'+Math.max(2,Math.min(4,hit[1].length))) as 'h2'|'h3'|'h4',text:hit[2]});continue}
  if((hit=/^[-*]\s+(.+)$/.exec(line))){if(listKind!=='ul'||pending.length)flushText();listKind='ul';list.push(hit[1]);continue}
  if((hit=/^\d+\.\s+(.+)$/.exec(line))){if(listKind!=='ol'||pending.length)flushText();listKind='ol';list.push(hit[1]);continue}
  if((hit=/^>\s+(.+)$/.exec(line))){flushText();result.push({kind:'quote',text:hit[1]});continue}
  if(/^---+$/.test(line)){flushText();result.push({kind:'hr'});continue}
  if(list.length)flushText()
  pending.push(line)
 }
 flush();return result
}
export function EditorialBody({body,className=''}:{body:string;className?:string}){
 return <div className={className}>
  {parseEditorialBlocks(body).map((block,i)=>{
   const key=String(i)
   if(block.kind==='hr')return <hr key={key}/>
   if(block.kind==='table'){
    const rows=block.rows||[],head=rows[0]||[],bodyRows=rows.slice(1)
    return <table key={key} className="ica-editorial-table">
     <thead><tr>{head.map((value,j)=><th key={j} scope="col">{inline(value,key+'-head-'+j)}</th>)}</tr></thead>
     <tbody>{bodyRows.map((cells,j)=><tr key={j}>{head.map((_,k)=><td key={k}>{inline(cells[k]||'',key+'-'+j+'-'+k)}</td>)}</tr>)}</tbody>
    </table>
   }
   if(block.kind==='ul')return <ul key={key}>{block.items?.map((v,j)=><li key={j}>{inline(v,key+'-'+j)}</li>)}</ul>
   if(block.kind==='ol')return <ol key={key}>{block.items?.map((v,j)=><li key={j}>{inline(v,key+'-'+j)}</li>)}</ol>
   const text=inline(block.text||'',key)
   if(block.kind==='h2')return <h2 key={key}>{text}</h2>
   if(block.kind==='h3')return <h3 key={key}>{text}</h3>
   if(block.kind==='h4')return <h4 key={key}>{text}</h4>
   if(block.kind==='quote')return <blockquote key={key}>{text}</blockquote>
   return <p key={key}>{text}</p>
  })}
 </div>
}
