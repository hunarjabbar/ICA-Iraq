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
writeFileSync(join(target,'index.mjs'), "import { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nexport default async function handler(req, res) {\n  const pathname = new URL(req.url || '/', 'https://local.invalid').pathname;\n  console.log('ICA_SSR_WRAPPER_ENTER', String(req.method), pathname);\n  try {\n    const module = await import('./index-original.mjs');\n    const original = module.default ?? module.handler;\n    console.log('ICA_SSR_EXPORT_SHAPE', typeof original, Object.keys(original || {}).slice(0,12).join(','));\n    if (typeof original === 'function') return await original(req, res);\n    if (!original || typeof original.fetch !== 'function') throw new Error('No supported server entry interface');\n    const host = String(req.headers.host || 'localhost');\n    const scheme = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();\n    const url = new URL(req.url || '/', scheme + '://' + host);\n    const headers = new Headers();\n    for (const [key, value] of Object.entries(req.headers)) { if (typeof value === 'string') headers.set(key, value); else if (Array.isArray(value)) for (const x of value) headers.append(key,x); }\n    const method = req.method || 'GET';\n    const opts = { method, headers };\n    if (method !== 'GET' && method !== 'HEAD') { opts.body = Readable.toWeb(req); opts.duplex = 'half'; }\n    const reply = await original.fetch(new Request(url.toString(), opts));\n    if (!(reply instanceof Response)) throw new Error('Fetch handler did not return Response');\n    res.statusCode = reply.status;\n    for (const [k,v] of reply.headers) { if (k.toLowerCase() !== 'set-cookie') res.setHeader(k,v); }\n    const cookies = reply.headers.getSetCookie?.(); if (cookies?.length) res.setHeader('set-cookie',cookies);\n    if (reply.body) await pipeline(Readable.fromWeb(reply.body),res); else res.end();\n  } catch (error) {\n    console.error('ICA_SSR_WRAPPER_ERROR', error);\n    if (!res.headersSent) { res.statusCode = 500; res.setHeader('content-type','text/plain'); }\n    if (!res.writableEnded) res.end('ICA_SSR_INTERNAL_ERROR');\n  }\n}\n");
fallback[0].dest = '/ica-ssr';
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('ICA_NITRO_ROUTING_PATCH=' + JSON.stringify({dest:'/ica-ssr',function:'ica-ssr.func'}));

// Preview-only sentinel function isolates filesystem routing from application SSR.
const probe = join(root, 'functions', 'ica-health.func');
mkdirSync(probe, { recursive: false });
writeFileSync(join(probe, '.vc-config.json'), JSON.stringify(functionConfig));
writeFileSync(join(probe, 'index.mjs'), "export default function handler(_req, res) { res.statusCode=200; res.setHeader('Content-Type', 'text/plain'); res.end('ICA_FUNCTION_HEALTH_OK'); }");
console.log('ICA_PROBE_ADDED=/ica-health');
