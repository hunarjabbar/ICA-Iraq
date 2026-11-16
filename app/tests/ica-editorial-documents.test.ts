import {describe,expect,test} from 'bun:test'
import {parseEditorialBlocks,safeEditorialLink} from '../src/components/ica/editorial-body'
describe('ICA published editorial documents',()=>{
 test('preserves structured sections and list order',()=>{
  const blocks=parseEditorialBlocks('Overview line\n\n## Analysis\n\n- Point one\n- Point two\n\n> Attributed quotation')
  expect(blocks.map(x=>x.kind)).toEqual(['p','h2','ul','quote'])
  expect(blocks[2].items).toEqual(['Point one','Point two'])
 })
 test('refuses unsafe publisher links and protocol-relative URLs',()=>{
  expect(safeEditorialLink('https://news.un.org/en/')).toBe(true)
  expect(safeEditorialLink('/desk/latest')).toBe(true)
  for(const input of ['javascript:alert(1)','data:text/html,evil','//example.org/path','http://unverified.test','https://attacker.test" onclick="alert(1)'])
   expect(safeEditorialLink(input)).toBe(false)
 })
 test('empty and plain articles do not introduce HTML or executable markup',()=>{
  expect(parseEditorialBlocks('')).toEqual([])
  expect(parseEditorialBlocks('<script>alert(1)</script>')).toEqual([{kind:'p',text:'<script>alert(1)</script>'}])
 })
})
