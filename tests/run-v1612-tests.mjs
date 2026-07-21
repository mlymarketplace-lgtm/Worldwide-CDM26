import {spawnSync} from 'node:child_process';
const files=['lot-a-home-cms-navigation-v1612.test.mjs','lot-b-team-archives-v1612.test.mjs'];
for(const file of files){
  const run=spawnSync(process.execPath,[new URL(file,import.meta.url).pathname],{stdio:'inherit'});
  if(run.status!==0) process.exit(run.status || 1);
}
console.log('PASS V16.1.2 — Lot A préservé + Lot B archives figées');
