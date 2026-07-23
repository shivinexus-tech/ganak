/* Calendar labels are an interpretation-only layer. They consume the canonical
   Panchang result and never feed a value back into astronomy or festival rules. */
import { solveCross, sunEvents, sunSidMs, zoneOffset } from "./panchang";

export type CalendarConventionId = "canonical" | "gregorian" | "amanta" | "north-purnimanta" | "tamil-solar" | "bengali-solar";
export type RegionalCalendarFlags = { tamilSolar: boolean; bengaliSolar: boolean };
export type CalendarConvention = {
  id: CalendarConventionId;
  en: string;
  hi: string;
  native?: string;
  region: string;
  enabled: boolean;
  flag?: keyof RegionalCalendarFlags;
  policy?: string;
};

export const DEFAULT_REGIONAL_CALENDAR_FLAGS: RegionalCalendarFlags = { tamilSolar:true, bengaliSolar:true };

/* Retired convention ids that still resolve, so old links keep working.
   "amanta" was a separate switch that produced output identical to the default
   (both read months.amanta and render the same string), so it was merged away
   2026-07-22 rather than left as a duplicate choice. It maps SILENTLY — no
   "unsupported mode" warning — because the user sees exactly what they asked for. */
const CONVENTION_ALIASES: Record<string, CalendarConventionId> = { amanta: "canonical" };

export const CALENDAR_CONVENTIONS: CalendarConvention[] = [
  /* "Ganak default" alone told users nothing — it named the app, not the reckoning.
     The default IS the amanta lunar month, so the label now says so and keeps the
     "(Ganak default)" tag to mark which option is selected out of the box. */
  { id:"canonical", en:"Amanta lunar (Ganak default)", hi:"अमान्त चान्द्र (गणक मानक)", region:"Pan-Indian", enabled:true },
  { id:"gregorian", en:"Gregorian", hi:"ग्रेगोरियन", region:"Civil calendar", enabled:true },
  { id:"north-purnimanta", en:"Purnimanta lunar", hi:"पूर्णिमान्त चान्द्र", region:"Northern India", enabled:true },
  { id:"tamil-solar", en:"Tamil solar · Thirukanitha", hi:"तमिल सौर · तिरुकणित", native:"தமிழ் சூரிய · திருக்கணிதம்", region:"Tamil Nadu", enabled:true, flag:"tamilSolar", policy:"Lahiri sidereal ingress; Tamil sunset rule" },
  { id:"bengali-solar", en:"Bengali solar · Vishuddha Siddhanta", hi:"बंगाली सौर · विशुद्ध सिद्धान्त", native:"বাংলা সৌর · বিশুদ্ধ সিদ্ধান্ত", region:"West Bengal", enabled:true, flag:"bengaliSolar", policy:"Lahiri sidereal ingress; Bengal next-sunrise rule" },
];

const TAMIL_EN = ["Chithirai","Vaikasi","Aani","Aadi","Avani","Purattasi","Aippasi","Karthigai","Margazhi","Thai","Maasi","Panguni"];
const TAMIL_HI = ["चित्तिरै","वैकासी","आनि","आडि","आवणि","पुरट्टासि","ऐप्पसि","कार्त्तिकै","मार्गळि","तै","मासि","पङ्गुनि"];
const TAMIL_NATIVE = ["சித்திரை","வைகாசி","ஆனி","ஆடி","ஆவணி","புரட்டாசி","ஐப்பசி","கார்த்திகை","மார்கழி","தை","மாசி","பங்குனி"];
const BENGALI_EN = ["Boishakh","Joishtho","Asharh","Shrabon","Bhadro","Ashwin","Kartik","Ogrohayon","Poush","Magh","Falgun","Choitro"];
const BENGALI_HI = ["बैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्र","आश्विन","कार्तिक","अग्रहायण","पौष","माघ","फाल्गुन","चैत्र"];
const BENGALI_NATIVE = ["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];
const TAMIL_YEARS_EN = ["Prabhava","Vibhava","Shukla","Pramodoota","Prajotpatti","Angirasa","Shrimukha","Bhava","Yuva","Dhata","Ishvara","Bahudhanya","Pramathi","Vikrama","Vrisha","Chitrabhanu","Svabhanu","Tarana","Parthiva","Vyaya","Sarvajit","Sarvadhari","Virodhi","Vikriti","Khara","Nandana","Vijaya","Jaya","Manmatha","Durmukhi","Hevilambi","Vilambi","Vikari","Sharvari","Plava","Shubhakrit","Shobhakrit","Krodhi","Vishvavasu","Parabhava","Plavanga","Kilaka","Saumya","Sadharana","Virodhikrit","Paridhavi","Pramadicha","Ananda","Rakshasa","Nala","Pingala","Kalayukti","Siddharthi","Raudra","Durmati","Dundubhi","Rudhirodgari","Raktakshi","Krodhana","Akshaya"];

type Place = { lat:number; lon:number; zone:string };
export type RegionalCalendarDate = { id:"tamil-solar"|"bengali-solar"; monthIndex:number; monthEn:string; monthHi:string; monthNative:string; day:number; year:number|string; yearName?:string; convention:string; startMs:number };

const DAY=86400000;
const civilParts=(ms:number,zone:string)=>{
  const probe=new Date(ms), off=zoneOffset(zone,probe.getUTCFullYear(),probe.getUTCMonth()+1,probe.getUTCDate()) ?? 0;
  const d=new Date(ms+off*3600000);
  return { y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),ordinal:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()) };
};
const addCivil=(x:{y:number;m:number;d:number},days:number)=>{ const d=new Date(Date.UTC(x.y,x.m-1,x.d+days)); return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),ordinal:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())}; };

const ingressCache=new Map<string,number>();
function ingressForSign(sign:number,atMs:number,direction:"current"|"next"="current"){
  const d=new Date(atMs),currentMonth=d.getUTCMonth(),expectedMonth=(sign+3)%12;
  let year=d.getUTCFullYear();
  if(direction==="current"&&expectedMonth>currentMonth+2)year--;
  if(direction==="next"&&expectedMonth+2<currentMonth)year++;
  const key=`${year}:${sign}`;
  const cached=ingressCache.get(key);if(cached!=null)return cached;
  const approximate=Date.UTC(year,expectedMonth,14,0);
  const value=solveCross(sunSidMs,approximate-6*DAY,sign*30,16);
  ingressCache.set(key,value);return value;
}

function regionalMonthStart(id:"tamil-solar"|"bengali-solar",sign:number,ingress:number,place:Place){
  const local=civilParts(ingress,place.zone);
  const tz=zoneOffset(place.zone,local.y,local.m,local.d) ?? 0;
  const events=sunEvents(local.y,local.m,local.d,tz,place.lat,place.lon);
  if(id==="bengali-solar"){
    // Vishuddha Siddhanta's Bengal rule: the month begins at sunrise after
    // the ingress day; an ingress after sunset is assigned to the following
    // Panchang day, so its month begins one further civil sunrise later.
    return addCivil(local,events.set != null && ingress < events.set ? 1 : 2);
  }
  // Tamil Thirukanitha: an ingress before local sunset gives day 1 on that
  // civil date; an ingress after sunset gives day 1 on the following date.
  return events.set != null && ingress < events.set ? local : addCivil(local,1);
}

export function regionalCalendarDate(id:"tamil-solar"|"bengali-solar",panchang:any,atMs:number,place:Place):RegionalCalendarDate {
  const current=civilParts(atMs,place.zone);
  let sign=Math.floor(sunSidMs(atMs)/30);
  let ingress=ingressForSign(sign,atMs);
  let start=regionalMonthStart(id,sign,ingress,place);
  const nextSign=(sign+1)%12;
  const nextIngress=ingressForSign(nextSign,atMs,"next");
  const nextStart=regionalMonthStart(id,nextSign,nextIngress,place);
  // Tamil day 1 can begin at sunrise before a later same-day ingress. Prefer
  // the newest traditional boundary that has begun, not merely Sun's sign at
  // the requested instant.
  if(nextStart.ordinal<=current.ordinal){ sign=nextSign; ingress=nextIngress; start=nextStart; }
  else if(current.ordinal<start.ordinal){
    sign=(sign+11)%12;
    ingress=ingressForSign(sign,ingress-60000,"current");
    start=regionalMonthStart(id,sign,ingress,place);
  }
  const day=Math.floor((current.ordinal-start.ordinal)/DAY)+1;
  if(!Number.isFinite(day)||day<1||day>33) throw new Error(`regional-calendar-impossible-day:${id}:${day}`);
  if(id==="tamil-solar"){
    const cycleYear=start.y-(sign>=9?1:0);
    const yearIndex=((cycleYear-1987)%60+60)%60;
    return {id,monthIndex:sign,monthEn:TAMIL_EN[sign],monthHi:TAMIL_HI[sign],monthNative:TAMIL_NATIVE[sign],day,year:TAMIL_YEARS_EN[yearIndex],yearName:TAMIL_YEARS_EN[yearIndex],convention:"Thirukanitha · Tamil sunset rule",startMs:ingress};
  }
  const cycleYear=start.y-(sign>=9?1:0);
  const bangabda=cycleYear-593;
  return {id,monthIndex:sign,monthEn:BENGALI_EN[sign],monthHi:BENGALI_HI[sign],monthNative:BENGALI_NATIVE[sign],day,year:bangabda,convention:"Vishuddha Siddhanta · Bengal next-sunrise rule",startMs:ingress};
}

export function conventionIsEnabled(id:CalendarConventionId,flags:RegionalCalendarFlags=DEFAULT_REGIONAL_CALENDAR_FLAGS){
  const mode=CALENDAR_CONVENTIONS.find(x=>x.id===id);
  return !!mode?.enabled && (!mode.flag || flags[mode.flag]);
}

export function calendarLabel(id: CalendarConventionId, panchang: any, atMs: number, lang: "hi" | "en", place?:Place) {
  if (id === "gregorian") return new Date(atMs+(panchang.tz||0)*3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day:"numeric", month:"long", year:"numeric", timeZone:"UTC" });
  const lunarDay=`${panchang.paksha} ${panchang.tithiNum}`;
  if (id === "north-purnimanta") return lang === "hi" ? `पूर्णिमान्त · ${panchang.months.purnimanta} · ${lunarDay}` : `Purnimanta · ${panchang.months.purnimanta} · ${lunarDay}`;
  if((id==="tamil-solar"||id==="bengali-solar")&&place){
    const d=regionalCalendarDate(id,panchang,atMs,place);
    const month=lang==="hi"?d.monthHi:d.monthEn;
    const suffix=id==="tamil-solar"?(lang==="hi"?"तिरुकणित तमिल सौर":"Tamil solar · Thirukanitha"):(lang==="hi"?"विशुद्ध सिद्धान्त बंगाली सौर":"Bengali solar · Vishuddha Siddhanta");
    return `${d.monthNative} · ${month} ${d.day}, ${d.year} · ${suffix}`;
  }
  /* Default = amanta (month + paksha + tithi). The old short form said
     "Ganak default · Ashadha", which led with branding and dropped the lunar day.
     The separate "amanta" switch rendered this identical string and was merged
     into the default; its id still resolves here via CONVENTION_ALIASES. */
  return lang === "hi" ? `अमान्त · ${panchang.months.amanta} · ${lunarDay}` : `Amanta · ${panchang.months.amanta} · ${lunarDay}`;
}

export function safeConvention(value: string | null,flags:RegionalCalendarFlags=DEFAULT_REGIONAL_CALENDAR_FLAGS): CalendarConventionId { return resolveConvention(value,flags).id; }

export function resolveConvention(value: string | null,flags:RegionalCalendarFlags=DEFAULT_REGIONAL_CALENDAR_FLAGS): { id:CalendarConventionId; recoveredFrom:string | null; reason:"unknown" | "disabled" | null } {
  const resolved = value && CONVENTION_ALIASES[value] ? CONVENTION_ALIASES[value] : value;
  if (!resolved || resolved === "canonical") return { id:"canonical", recoveredFrom:null, reason:null };
  const match=CALENDAR_CONVENTIONS.find(x=>x.id===resolved);
  if (match && conventionIsEnabled(match.id,flags)) return { id:match.id, recoveredFrom:null, reason:null };
  return { id:"canonical", recoveredFrom:value, reason:match ? "disabled" : "unknown" };
}
