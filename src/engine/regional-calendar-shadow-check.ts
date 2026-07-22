import { PUBLISHED_2026_SANKRANTI_UTC } from "../data/regional-calendar-evidence";
import { regionalCalendarDate } from "./calendar-conventions";
import { sunEvents, zoneOffset } from "./panchang";

const DAY=86400000;
const INGRESSES:[[number,string],...Array<[number,string]>]=[[8,"2025-12-15T22:54:00Z"],...PUBLISHED_2026_SANKRANTI_UTC.map(([s,x])=>[s,x] as [number,string])];
type Place={lat:number;lon:number;zone:string;label?:string};
const local=(ms:number,zone:string)=>{const d0=new Date(ms),off=zoneOffset(zone,d0.getUTCFullYear(),d0.getUTCMonth()+1,d0.getUTCDate())??0,d=new Date(ms+off*3600000);return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),ordinal:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};};

export function regionalCalendarShadowResult(mode:"tamil-solar"|"bengali-solar",panchang:any,atMs:number,place:Place){
  const current=local(atMs,place.zone);
  if(current.y!==2026)return {checked:false,reason:"outside-frozen-year"};
  const boundaries=INGRESSES.map(([sign,iso])=>{const ms=Date.parse(iso),x=local(ms,place.zone),tz=zoneOffset(place.zone,x.y,x.m,x.d)??0,ev=sunEvents(x.y,x.m,x.d,tz,place.lat,place.lon),before=ev.set!=null&&ms<ev.set,add=mode==="tamil-solar"?(before?0:1):(before?1:2);return {sign,start:x.ordinal+add*DAY};});
  let expected=boundaries[0];for(const b of boundaries)if(b.start<=current.ordinal)expected=b;
  const expectedDay=Math.floor((current.ordinal-expected.start)/DAY)+1;
  const actual=regionalCalendarDate(mode,panchang,atMs,place);
  return {checked:true,ok:actual.monthIndex===expected.sign&&actual.day===expectedDay,mode,actualSign:actual.monthIndex,actualDay:actual.day,expectedSign:expected.sign,expectedDay};
}
