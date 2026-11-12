// Apply a narrow Vercel Build Output API workaround for a recursive Nitro SSR fallback.
// Preview validation must prove requests reach the function before production promotion.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = join(process.cwd(), '.vercel', 'output');
const configPath = join(root, 'config.json');
const original = join(root, 'functions', '__fallback.func');
const target = join(root, 'functions', 'ica-ssr.func');
if (!existsSync(configPath) || !existsSync(original) || existsSync(target)) {
  throw new Error('Unexpected Nitro output structure: refusing to change routing');
}
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const fallback = config.routes?.filter((r) => r.dest === '/__fallback');
if (config.version !== 3 || !Array.isArray(fallback) || fallback.length !== 1 || fallback[0].src !== '/(.*)') {
  throw new Error('Unexpected Nitro fallback routing: refusing to change routing');
}
const functionConfigPath = join(original, '.vc-config.json');
if (!existsSync(functionConfigPath)) throw new Error('Missing function configuration');
const functionConfig = JSON.parse(readFileSync(functionConfigPath, 'utf8'));
const entrySource = readFileSync(join(original, 'index.mjs'), 'utf8');
console.log('ICA_SSR_ENTRY_MIN=' + JSON.stringify(entrySource.slice(0, 700)));
console.log('ICA_FUNCTION_DEBUG=' + JSON.stringify({runtime:functionConfig.runtime,handler:functionConfig.handler,launcherType:functionConfig.launcherType,route:config.routes}));
renameSync(original, target);
// Trace the real Nitro entry without exposing credentials or user data.
renameSync(join(target, 'index.mjs'), join(target, 'index-original.mjs'));
writeFileSync(join(target,'index.mjs'), "import { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nexport default async function handler(req,res) {\n  const path = new URL(req.url || '/', 'https://local.invalid').pathname;\n  console.log('ICA_SSR_ENTER',path);\n  try {\n    const module = await import('./index-original.mjs');\n    const app = module.default ?? module.handler;\n    if (!app || typeof app.fetch !== 'function') throw Error('Expected Nitro fetch entry');\n    const host=String(req.headers.host||'localhost');\n    const scheme=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();\n    const url=new URL(req.url || '/',scheme+'://'+host);\n    const h=new Headers(); for(const [k,v] of Object.entries(req.headers)){if(typeof v==='string')h.set(k,v); else if(Array.isArray(v))for(const x of v)h.append(k,x)}\n    const method=req.method||'GET';\n    const opts={method,headers:h}; if(!['GET','HEAD'].includes(method)){opts.body=Readable.toWeb(req);opts.duplex='half'}\n    const oldFetch=globalThis.fetch;\n    let hits=0;\n    globalThis.fetch=async (input,init)=>{\n      try { const str=typeof input==='string'?input:input instanceof URL?input.href:input?.url;\n        const u=new URL(str,url);\n        if (u.host===url.host) { hits++; console.error('ICA_SELF_FETCH_BLOCKED',hits,u.pathname,new Error('self fetch').stack?.slice(0,950)); return new Response('Self-fetch blocked for diagnosis',{status:502}); }\n      }catch(e){console.warn('ICA_FETCH_INSPECTION_ERROR',e?.name)}\n      return oldFetch(input,init);\n    };\n    let reply;\n    try { reply=await app.fetch(new Request(url.toString(),opts)); }\n    finally { globalThis.fetch=oldFetch; }\n    console.log('ICA_SSR_RESULT',reply?.status,'selfFetches='+hits);\n    if(!(reply instanceof Response))throw Error('Unexpected response');\n    res.statusCode=reply.status;for(const [k,v] of reply.headers){if(k.toLowerCase()!=='set-cookie')res.setHeader(k,v)}\n    const cookies=reply.headers.getSetCookie?.();if(cookies?.length)res.setHeader('set-cookie',cookies);\n    if(reply.body)await pipeline(Readable.fromWeb(reply.body),res);else res.end();\n  } catch(err){console.error('ICA_SSR_ERROR',err);if(!res.headersSent){res.statusCode=500;res.setHeader('content-type','text/plain')}if(!res.writableEnded)res.end('ICA_SSR_ERROR')}\n}\n");
fallback[0].dest = '/ica-ssr';
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('ICA_NITRO_ROUTING_PATCH=' + JSON.stringify({dest:'/ica-ssr',function:'ica-ssr.func'}));

// Preview-only sentinel function isolates filesystem routing from application SSR.
const probe = join(root, 'functions', 'ica-health.func');
mkdirSync(probe, { recursive: false });
writeFileSync(join(probe, '.vc-config.json'), JSON.stringify(functionConfig));
writeFileSync(join(probe, 'index.mjs'), "export default function handler(_req, res) { res.statusCode=200; res.setHeader('Content-Type', 'text/plain'); res.end('ICA_FUNCTION_HEALTH_OK'); }");
console.log('ICA_PROBE_ADDED=/ica-health');
