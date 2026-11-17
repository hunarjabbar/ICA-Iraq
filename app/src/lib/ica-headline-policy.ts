/** Publisher-level availability for public linked headlines.
 * An offlined publisher is hidden from live strips; its attributed archive
 * remains preserved in the underlying source records.
 * Multiple feeds sharing one publisher require all feeds disabled to hide it:
 * wire items currently do not store their individual source IDs.
 */
export function filterEnabledWirePublishers<T extends {source_name:string}>(
 items:T[], sources:Array<{publisher:string;enabled:boolean}>
):T[]{
 const active=new Set(sources.filter(x=>x.enabled).map(x=>x.publisher.trim().toLowerCase()).filter(Boolean))
 return items.filter(item=>active.has(item.source_name.trim().toLowerCase()))
}
