import {describe,expect,test} from 'bun:test'
import {filterEnabledWirePublishers} from '../src/lib/ica-headline-policy'
describe('ICA latest headline source controls',()=>{
 test('shows linked headlines only for enabled original ICA publishers',()=>{
  const rows=[{source_name:'RTHK',headline:'One'}, {source_name:'United Nations',headline:'Two'}, {source_name:'Unknown',headline:'Three'}]
  const active=[{publisher:'RTHK',enabled:true},{publisher:'United Nations',enabled:false}]
  expect(filterEnabledWirePublishers(rows,active).map(x=>x.headline)).toEqual(['One'])
 })
 test('fails closed if the original source register is unavailable',()=>{
  expect(filterEnabledWirePublishers([{source_name:'RTHK'}],[])).toEqual([])
 })
 test('multiple feeds from one publisher retain visibility only while one feed remains active',()=>{
  expect(filterEnabledWirePublishers([{source_name:'RTHK'}],[{publisher:'RTHK',enabled:false},{publisher:'rthk',enabled:true}])).toHaveLength(1)
  expect(filterEnabledWirePublishers([{source_name:'RTHK'}],[{publisher:'RTHK',enabled:false},{publisher:'RTHK',enabled:false}])).toHaveLength(0)
 })
})
