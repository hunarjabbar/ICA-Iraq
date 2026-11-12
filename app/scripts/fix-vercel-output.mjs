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
console.log('ICA_SSR_ENTRY_HEAD=' + readFileSync(join(original, 'index.mjs'), 'utf8').slice(0, 4000));
console.log('ICA_FUNCTION_DEBUG=' + JSON.stringify({runtime:functionConfig.runtime,handler:functionConfig.handler,launcherType:functionConfig.launcherType,route:config.routes}));
renameSync(original, target);
fallback[0].dest = '/ica-ssr';
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('ICA_NITRO_ROUTING_PATCH=' + JSON.stringify({dest:'/ica-ssr',function:'ica-ssr.func'}));

// Preview-only sentinel function isolates filesystem routing from application SSR.
const probe = join(root, 'functions', 'ica-health.func');
mkdirSync(probe, { recursive: false });
writeFileSync(join(probe, '.vc-config.json'), JSON.stringify(functionConfig));
writeFileSync(join(probe, 'index.mjs'), "export default function handler(_req, res) { res.statusCode=200; res.setHeader('Content-Type', 'text/plain'); res.end('ICA_FUNCTION_HEALTH_OK'); }");
console.log('ICA_PROBE_ADDED=/ica-health');
