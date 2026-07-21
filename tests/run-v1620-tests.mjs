import {spawnSync} from 'node:child_process';
const files=['lot-a-home-brand-console-v1620.test.mjs','lot-b-team-archives-v1620.test.mjs'];
for(const file of files){
  const run=spawnSync(process.execPath,[new URL(file,import.meta.url).pathname],{stdio:'inherit'});
  if(run.status!==0) process.exit(run.status || 1);
}
console.log('PASS V16.2.0 — identité, partage, visuel, console photo et archives figées');
