import { readFileSync } from 'node:fs'
const content = readFileSync('bun.lock').toString('base64')
const chunk = 2400
console.log('ICA_LOCK_META='+JSON.stringify({chunks:Math.ceil(content.length/chunk),base64Chars:content.length}))
for(let i=0;i<content.length;i+=chunk) console.log('ICA_LOCK_CHUNK_'+Math.floor(i/chunk)+'='+content.slice(i,i+chunk))
