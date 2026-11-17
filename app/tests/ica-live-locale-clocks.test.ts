import {describe,expect,test} from 'bun:test'
import {formatLocalDate,isLanguage,rtlLanguage,localeCodes} from '../src/lib/ica-i18n'
describe('ICA synchronized live time and language editions',()=>{
 test('each script has an explicit canonical locale and writing direction',()=>{
  expect(Object.values(localeCodes)).toEqual(['en-GB','ar-IQ','ckb-IQ','zh-CN'])
  expect(rtlLanguage('ar')).toBe(true)
  expect(rtlLanguage('ckb')).toBe(true)
  expect(rtlLanguage('zh')).toBe(false)
  expect(isLanguage('zh')).toBe(true)
 })
 test('Sorani date and live timestamp preserve UTC time without hydration drift',()=>{
  const when='2026-11-16T12:34:00Z'
  const date=formatLocalDate(when,'ckb')
  const clock=formatLocalDate(when,'ckb',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  expect(clock).toStartWith(date)
  expect(clock).toContain('١٢:٣٤ UTC')
  expect(clock).toBe(formatLocalDate(new Date(when),'ckb',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}))
 })
})
