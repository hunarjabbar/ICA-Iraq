import { readFileSync, writeFileSync } from 'node:fs'
const lock = readFileSync('bun.lock')
writeFileSync('.vercel/output/static/ica-regenerated-bun-lock.txt', lock)
console.log('ICA_REGENERATED_LOCK_ARTIFACT_SIZE='+lock.length)
