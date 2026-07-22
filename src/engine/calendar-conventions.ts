/* Calendar labels are an interpretation-only layer. They consume the canonical
   Panchang result and never feed a value back into astronomy or festival rules. */
import { solveCross, sunSidMs } from "./panchang";

export type CalendarConventionId = "canonical" | "gregorian" | "amanta" | "north-purnimanta" | "tamil-solar" | "bengali-solar";
export type CalendarConvention = {
  id: CalendarConventionId;
  en: string;
  hi: string;
  region: string;
  enabled: boolean;
};

export const CALENDAR_CONVENTIONS: CalendarConvention[] = [
  { id:"canonical", en:"Ganak default", hi:"गणक मानक", region:"Pan-Indian", enabled:true },
  { id:"gregorian", en:"Gregorian", hi:"ग्रेगोरियन", region:"Civil calendar", enabled:true },
  { id:"amanta", en:"Amanta lunar", hi:"अमान्त चान्द्र", region:"Western & Southern India", enabled:true },
  { id:"north-purnimanta", en:"Purnimanta lunar", hi:"पूर्णिमान्त चान्द्र", region:"Northern India", enabled:true },
  // These interpretation engines remain dark until the mandatory regional
  // anchor, differential, native-review and shadow-rollout contract is green.
  { id:"tamil-solar", en:"Tamil solar", hi:"तमिल सौर", region:"Tamil Nadu", enabled:false },
  { id:"bengali-solar", en:"Bengali solar", hi:"बंगाली सौर", region:"West Bengal", enabled:false },
];

const TAMIL = ["Chithirai","Vaikasi","Aani","Aadi","Avani","Purattasi","Aippasi","Karthigai","Margazhi","Thai","Maasi","Panguni"];
const TAMIL_HI = ["चित्तिरै","वैकासी","आनि","आडि","आवणि","पुरट्टासि","ऐप्पसि","कार्त्तिकै","मार्गळि","तै","मासि","पङ्गुनि"];
const BENGALI = ["Boishakh","Joishtho","Asharh","Shrabon","Bhadro","Ashwin","Kartik","Ogrohayon","Poush","Magh","Falgun","Choitro"];
const BENGALI_HI = ["बैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्र","आश्विन","कार्तिक","अग्रहायण","पौष","माघ","फाल्गुन","चैत्र"];

export function calendarLabel(id: CalendarConventionId, panchang: any, atMs: number, lang: "hi" | "en") {
  if (id === "gregorian") return new Date(atMs+(panchang.tz||0)*3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day:"numeric", month:"long", year:"numeric", timeZone:"UTC" });
  const lunarDay=`${panchang.paksha} ${panchang.tithiNum}`;
  if (id === "amanta") return lang === "hi" ? `अमान्त · ${panchang.months.amanta} · ${lunarDay}` : `Amanta · ${panchang.months.amanta} · ${lunarDay}`;
  if (id === "north-purnimanta") return lang === "hi" ? `पूर्णिमान्त · ${panchang.months.purnimanta} · ${lunarDay}` : `Purnimanta · ${panchang.months.purnimanta} · ${lunarDay}`;
  const sign = Math.floor(sunSidMs(atMs) / 30);
  const ingress=solveCross(sunSidMs,atMs-35*86400000,sign*30,45);
  const solarDay=ingress == null ? 1 : Math.max(1,Math.floor((atMs-ingress)/86400000)+1);
  if (id === "tamil-solar") return `${lang === "hi" ? TAMIL_HI[sign] : TAMIL[sign]} ${solarDay} · ${lang === "hi" ? "तमिल सौर" : "Tamil solar"}`;
  if (id === "bengali-solar") return `${lang === "hi" ? BENGALI_HI[sign] : BENGALI[sign]} ${solarDay} · ${lang === "hi" ? "बंगाली सौर" : "Bengali solar"}`;
  return lang === "hi" ? `गणक मानक · ${panchang.months.amanta}` : `Ganak default · ${panchang.months.amanta}`;
}

export function safeConvention(value: string | null): CalendarConventionId {
  return resolveConvention(value).id;
}

export function resolveConvention(value: string | null): { id:CalendarConventionId; recoveredFrom:string | null; reason:"unknown" | "not-reviewed" | null } {
  if (!value || value === "canonical") return { id:"canonical", recoveredFrom:null, reason:null };
  const match=CALENDAR_CONVENTIONS.find(x=>x.id===value);
  if (match?.enabled) return { id:match.id, recoveredFrom:null, reason:null };
  return { id:"canonical", recoveredFrom:value, reason:match ? "not-reviewed" : "unknown" };
}
