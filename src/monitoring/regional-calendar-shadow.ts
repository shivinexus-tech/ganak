import { regionalCalendarShadowResult } from "../engine/regional-calendar-shadow-check";

type Place={lat:number;lon:number;zone:string;label?:string};
const emit=(error:any,source:string,detail?:any)=>{try{window.dispatchEvent(new CustomEvent("ganak:regional-calendar-shadow-error",{detail:{message:String(error?.message||error),source,detail}}));}catch{/* shadow reporting must never affect the page */}};

/** Runs both regional modes invisibly on the canonical page. Only a mismatch
 * emits telemetry; normal users never see or depend on the shadow result. */
export function runRegionalCalendarShadow(panchang:any,atMs:number,place:Place){
  for(const mode of ["tamil-solar","bengali-solar"] as const){
    try{
      const result=regionalCalendarShadowResult(mode,panchang,atMs,place);
      if(result.checked&&!result.ok)emit(new Error(`regional-calendar-shadow-mismatch:${mode}`),`regional-shadow-${mode}`,result);
    }catch(error){emit(error,`regional-shadow-${mode}`);}
  }
}
