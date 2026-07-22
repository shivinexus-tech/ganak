type Env={ REGIONAL_CALENDAR_FLAGS?:{get:(key:string)=>Promise<string|null>} };
const DEFAULTS={tamilSolar:true,bengaliSolar:true,revision:"bundled-2026-07-22",source:"default"};

export const onRequestGet=async({env}:{env:Env})=>{
  let body:any=DEFAULTS;
  try{
    const raw=await env.REGIONAL_CALENDAR_FLAGS?.get("production");
    if(raw){
      const value=JSON.parse(raw);
      if(typeof value.tamilSolar==="boolean"&&typeof value.bengaliSolar==="boolean") body={tamilSolar:value.tamilSolar,bengaliSolar:value.bengaliSolar,revision:String(value.revision||"kv"),source:"kv"};
    }
  }catch{/* A malformed/unavailable kill switch must not make the endpoint fail. */}
  return new Response(JSON.stringify(body),{headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store, max-age=0"}});
};
