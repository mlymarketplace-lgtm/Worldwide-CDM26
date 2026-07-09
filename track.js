exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}};
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    console.log('[qg-event]', JSON.stringify({event:body.event, team:body.team, lang:body.lang, path:body.path, ts:body.ts}));
  } catch (e) { console.log('[qg-event-parse-error]', e.message); }
  return {statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'},body:JSON.stringify({ok:true})};
};
