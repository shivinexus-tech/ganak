import { DEFAULT_REGIONAL_CALENDAR_FLAGS, type RegionalCalendarFlags } from "./calendar-conventions";

export type RegionalCalendarFlagResponse = RegionalCalendarFlags & { revision:string; source:"kv"|"default"|"client-fallback" };

const FALLBACK:RegionalCalendarFlagResponse={...DEFAULT_REGIONAL_CALENDAR_FLAGS,revision:"bundled-2026-07-22",source:"client-fallback"};

/** Runtime rollout flags. No browser storage: every page load revalidates the
 * edge value, so either regional convention can be disabled independently
 * without rebuilding or redeploying the application bundle. */
export async function loadRegionalCalendarFlags():Promise<RegionalCalendarFlagResponse>{
  try{
    const response=await fetch("/api/regional-calendar-flags",{cache:"no-store",credentials:"omit",headers:{Accept:"application/json"}});
    if(!response.ok) return FALLBACK;
    const value=await response.json();
    if(typeof value?.tamilSolar!=="boolean"||typeof value?.bengaliSolar!=="boolean") return FALLBACK;
    return {tamilSolar:value.tamilSolar,bengaliSolar:value.bengaliSolar,revision:String(value.revision||"runtime"),source:value.source==="kv"?"kv":"default"};
  }catch{return FALLBACK;}
}
