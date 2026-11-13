'use strict';
const fs=require('node:fs'),path=require('node:path');
const [output,project]=process.argv.slice(2);
if(!output||!project)throw Error('Output directory and project required');
const sha=process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||'';
const release={schema:1,project,commit:/^[a-f0-9]{40}$/.test(sha)?sha:null,built_at:new Date().toISOString()};
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'release.json'),JSON.stringify(release)+'\n');
