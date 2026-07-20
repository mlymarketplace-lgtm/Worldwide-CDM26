import {spawnSync} from 'node:child_process';
const files=['lot-a-home-cms-navigation-v1611.test.mjs','lot-b-team-renderer-v1611.test.mjs'];
for(const file of files){
  const run=spawnSync(process.execPath,[new URL(file,import.meta.url).pathname],{stdio:'inherit'});
  if(run.status!==0) process.exit(run.status || 1);
}
console.log('PASS V16.1.1 — Lot A + Lot B');
