import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const STORE='qg-news-v16';
const COOKIE='qg_gaindes_owner';
const VALID_STATUS=new Set(['draft','published','unpublished','archived']);
const VALID_SECTION=new Set(['world','gaindes']);
const VALID_RELIABILITY=new Set(['official','credible','rumor','unlikely']);
const H={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(d,s=200,x={})=>new Response(JSON.stringify(d),{status:s,headers:{...H,...x}});
const secret=()=>String(process.env.QG_GAINDES_ADMIN_PASSWORD||'');
const eq=(a,b)=>{const x=crypto.createHash('sha256').update(String(a||'')).digest(),y=crypto.createHash('sha256').update(String(b||'')).digest();return crypto.timingSafeEqual(x,y)};
function cookie(req,name){const raw=req.headers.get('cookie')||'';const p=raw.split(/;\s*/).find(v=>v.startsWith(name+'='));return p?decodeURIComponent(p.slice(name.length+1)):''}
function signed(exp){return `${exp}.`+crypto.createHmac('sha256',secret()).update(`${exp}:qg-gaindes-owner`).digest('hex')}
function owner(req){const t=cookie(req,COOKIE),[e]=t.split('.');return !!t&&!!secret()&&Number(e)>Date.now()/1000&&eq(t,signed(e))}
const clean=s=>String(s||'').replace(/<[^>]*>/g,'').trim();
const slugify=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90);
async function listAll(store){const out=[];for await(const item of store.list({prefix:'article:'})){const a=await store.get(item.key,{type:'json',consistency:'strong'});if(a)out.push(a)}return out}
function publicArticle(a){return {id:a.id,slug:a.slug,title:a.title,excerpt:a.excerpt,body:a.body,analysis:a.analysis||'',section:a.section,reliability:a.reliability,sources:a.sources||'',author:a.author||'QualifGaïndé',image:a.imageId?`/.netlify/functions/news-cms?action=image&id=${encodeURIComponent(a.imageId)}`:'',imageAlt:a.imageAlt||a.title,publishedAt:a.publishedAt,updatedAt:a.updatedAt,status:a.status,priority:0,langs:{fr:{title:a.title,body:a.excerpt,article:[a.excerpt,a.body].filter(Boolean),tag:a.tag||'Brève'}}}}
export default async req=>{
 const url=new URL(req.url), action=url.searchParams.get('action')||'';
 const store=getStore(STORE);
 if(req.method==='GET'&&action==='image'){
   const id=url.searchParams.get('id')||''; const meta=await store.get('image-meta:'+id,{type:'json'}).catch(()=>null); const bytes=await store.get('image:'+id,{type:'arrayBuffer'}).catch(()=>null);
   if(!meta||!bytes)return new Response('Not found',{status:404}); return new Response(bytes,{headers:{'Content-Type':meta.type,'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}})
 }
 if(req.method==='GET'&&action==='public'){
   const slug=url.searchParams.get('slug'); const all=(await listAll(store)).filter(a=>a.status==='published'&&a.publishedAt&&new Date(a.publishedAt)<=new Date()).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
   if(slug){const a=all.find(x=>x.slug===slug||x.id===slug);return a?json({ok:true,article:publicArticle(a)},200,{'Cache-Control':'public,max-age=30'}):json({ok:false,error:'not_found'},404)}
   return json({ok:true,articles:all.map(publicArticle)},200,{'Cache-Control':'public,max-age=30'});
 }
 if(!owner(req))return json({ok:false,error:'unauthorized',message:'Connecte-toi d’abord dans la console propriétaire.'},401);
 if(req.method==='GET'&&action==='admin-list'){return json({ok:true,articles:(await listAll(store)).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))})}
 if(req.method!=='POST')return json({ok:false,error:'method_not_allowed'},405);
 let body={};try{body=await req.json()}catch{return json({ok:false,error:'invalid_json'},400)}
 if(body.action==='save'){
   const now=new Date().toISOString(), old=body.id?await store.get('article:'+body.id,{type:'json',consistency:'strong'}).catch(()=>null):null;
   const title=clean(body.title), section=clean(body.section), status=clean(body.status||'draft'), reliability=clean(body.reliability||'rumor');
   if(!title||!VALID_SECTION.has(section)||!VALID_STATUS.has(status)||!VALID_RELIABILITY.has(reliability))return json({ok:false,error:'validation',message:'Titre, rubrique, statut ou fiabilité invalide.'},400);
   const id=old?.id||`news_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`; let slug=slugify(body.slug||title)||id;
   const all=await listAll(store); if(all.some(a=>a.id!==id&&a.slug===slug))slug+=`-${Date.now().toString().slice(-5)}`;
   const article={id,slug,title,excerpt:clean(body.excerpt),body:clean(body.body),analysis:clean(body.analysis),section,status,reliability,sources:clean(body.sources),tag:clean(body.tag||'Mercato'),author:clean(body.author||'QualifGaïndé'),imageId:old?.imageId||null,imageAlt:clean(body.imageAlt||title),createdAt:old?.createdAt||now,updatedAt:now,publishedAt:status==='published'?(old?.publishedAt||now):old?.publishedAt||null,version:(old?.version||0)+1};
   if(body.imageData&&body.imageType){const allowed=['image/jpeg','image/png','image/webp'];if(!allowed.includes(body.imageType))return json({ok:false,error:'image_type'},400);const buf=Buffer.from(String(body.imageData).split(',').pop(),'base64');if(buf.length>3*1024*1024)return json({ok:false,error:'image_too_large',message:'Image limitée à 3 Mo.'},413);const iid=`img_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;await store.set('image:'+iid,buf);await store.setJSON('image-meta:'+iid,{type:body.imageType,size:buf.length});article.imageId=iid}
   await store.setJSON('article:'+id,article);return json({ok:true,article});
 }
 if(body.action==='archive'){const a=await store.get('article:'+body.id,{type:'json',consistency:'strong'}).catch(()=>null);if(!a)return json({ok:false,error:'not_found'},404);a.status='archived';a.updatedAt=new Date().toISOString();await store.setJSON('article:'+a.id,a);return json({ok:true})}
 if(body.action==='export'){return json({ok:true,version:'16.0.0',exportedAt:new Date().toISOString(),articles:await listAll(store)})}
 return json({ok:false,error:'unknown_action'},400)
}
