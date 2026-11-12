#!/usr/bin/env node
// Read-only repository origin audit. This script never modifies source files.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const skip=new Set(['.git','node_modules','.vercel','dist','build','coverage','docs','operations','archive','archives','vendor']);
const exts=new Set(['.js','.cjs','.mjs','.ts','.tsx','.jsx','.json','.html','.css','.yaml','.yml']);
const retired=/github\.com[/:]hunarjabbar\/(?:ChinQ|odoo|ICA-new-|ica|Ica\.-Iq)(?=[\/#?\s"'\x60]|$)/gi;
let checked=0;const findings=[];
function visit(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  if(ent.name.startsWith('.')||skip.has(ent.name))continue;
  const full=path.join(dir,ent.name);
  if(ent.isDirectory()){visit(full);continue;}
  if(!ent.isFile()||!exts.has(path.extname(ent.name)))continue;
  const rel=path.relative(root,full).replaceAll(path.sep,'/');
  if(rel==='scripts/check-source-origins.cjs')continue;
  checked++;retired.lastIndex=0;
  if(retired.test(fs.readFileSync(full,'utf8')))findings.push(rel);
 }
}
visit(root);
if(findings.length){console.error('Retired GitHub origins:\n'+findings.join('\n'));process.exitCode=1;}
else console.log('PASS: '+checked+' source files contain no retired GitHub repository origin URLs.');
