import { computeKundli } from "./kundli";
import { NAKSHATRAS, SIGNS, lunarMonthInfo, planetSidMs, sunEvents } from "./panchang";
import { rev } from "./ephemeris";
import { NAMING_SYLLABLES } from "../data/utility-calculators";

export type BirthInput = { y:number; m:number; day:number; hh:number; mi:number; tz:number; lat:number; lon:number };
const WESTERN_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const BIRDS = ["Vulture", "Owl", "Crow", "Cock", "Peacock"];
const BIRDS_HI:Record<string,string> = { Vulture:"गिद्ध", Owl:"उल्लू", Crow:"कौआ", Cock:"मुर्गा", Peacock:"मोर" };

export function quickBirth(input:BirthInput) {
  const chart = computeKundli({ ...input, ayanamsa:"lahiri" });
  const moon = chart.rows.find((p:any)=>p.name === "Moon")!;
  const sun = chart.rows.find((p:any)=>p.name === "Sun")!;
  return { chart, moon, sun, rashi:SIGNS[moon.sign], sunSign:SIGNS[sun.sign], lagna:SIGNS[chart.ascSign], nakshatra:NAKSHATRAS[moon.nak], pada:moon.pada, syllable:NAMING_SYLLABLES[moon.nak][moon.pada-1] };
}

export function mangalDosha(input:BirthInput) {
  const { chart } = quickBirth(input); const mars = chart.rows.find((p:any)=>p.name === "Mars")!;
  const refs = [{key:"Lagna",sign:chart.ascSign},{key:"Moon",sign:chart.moon.sign},{key:"Venus",sign:chart.rows.find((p:any)=>p.name === "Venus")!.sign}]
    .map(r=>({ ...r, house:((mars.sign-r.sign+12)%12)+1 })).map(r=>({ ...r, counted:[1,2,4,7,8,12].includes(r.house) }));
  const count=refs.filter(r=>r.counted).length;
  const dignity=[0,7,9].includes(mars.sign) ? "Mars is in its own or exaltation sign; some traditions treat this as mitigation, not automatic cancellation." : null;
  return { present:count>0, strength:count===3?"strong":count===2?"moderate":count===1?"limited":"none", refs, dignity, marsSign:SIGNS[mars.sign] };
}

export function kalaSarpa(input:BirthInput) {
  const { chart }=quickBirth(input), rahu=chart.rows.find((p:any)=>p.name==="Rahu")!.lon;
  const classical=chart.rows.filter((p:any)=>!["Rahu","Ketu"].includes(p.name));
  const clockwise=classical.filter((p:any)=>rev(p.lon-rahu)>0.0001 && rev(p.lon-rahu)<179.9999);
  const other=classical.filter((p:any)=>rev(rahu-p.lon)>0.0001 && rev(rahu-p.lon)<179.9999);
  const present=clockwise.length===7||other.length===7;
  return { present, enclosed:Math.max(clockwise.length,other.length), outside:classical.filter((p:any)=>!(clockwise.length>=other.length?clockwise:other).includes(p)).map((p:any)=>p.name), boundary:"Nodes are excluded; all seven classical planets must lie strictly within one node semicircle." };
}

export function sadeSati(input:BirthInput, asOfMs:number) {
  const { moon }=quickBirth(input); const saturnSign=Math.floor(planetSidMs("Saturn",asOfMs)/30);
  const relation=(saturnSign-moon.sign+12)%12;
  const active=[11,0,1].includes(relation), phase=relation===11?"rising":relation===0?"middle":relation===1?"setting":"not active";
  return { active, phase, moonSign:SIGNS[moon.sign], saturnSign:SIGNS[saturnSign], relation };
}

export function shraddhaTithi(input:BirthInput) {
  const { chart }=quickBirth(input), t=chart.panchang.tithiNum, fortnight=t<15?"Shukla":"Krishna";
  const month=lunarMonthInfo(chart.birthMs, fortnight==="Krishna");
  const occurrence=(year:number)=>{for(let n=0;n<370;n++){const d=new Date(Date.UTC(year,0,1+n)),y=d.getUTCFullYear(),m=d.getUTCMonth()+1,day=d.getUTCDate();if(y!==year)break;const ev=sunEvents(y,m,day,input.tz,input.lat,input.lon);if(ev.rise==null||ev.set==null)continue;const ap=ev.rise+.7*(ev.set-ev.rise),el=((planetSidMs("Moon",ap)-planetSidMs("Sun",ap))%360+360)%360,tn=Math.floor(el/12),lm=lunarMonthInfo(ap,tn>=15);if(lm.idx===month.idx&&(tn<15?"Shukla":"Krishna")===fortnight&&(tn%15)===(t%15))return {year,month:m,day,apMid:ap};}return null;};
  const nowYear=new Date().getUTCFullYear();
  return { tithi:chart.panchang.tithiName, number:(t%15)+1, fortnight, amanta:month.amanta, purnimanta:month.purnimanta, adhik:month.adhik, annual:[occurrence(nowYear),occurrence(nowYear+1)].filter(Boolean) };
}

export function panchaPakshi(input:BirthInput) {
  const { moon, chart }=quickBirth(input), group=Math.min(4,Math.floor(moon.nak/5));
  const waxing=chart.panchang.paksha==="Shukla", bird=BIRDS[waxing?group:4-group];
  return { bird, birdHi:BIRDS_HI[bird], nakshatra:NAKSHATRAS[moon.nak], paksha:chart.panchang.paksha, convention:"Five equal nakshatra groups (the final group has seven); the waning fortnight reverses the bird order." };
}

function tropical(chart:any, name:string) { const p=chart.rows.find((r:any)=>r.name===name); return rev(p.lon+chart.ayan); }
function aspect(a:number,b:number) { const d=Math.min(rev(a-b),rev(b-a)); const defs=[[0,8,"Conjunction"],[60,5,"Sextile"],[90,6,"Square"],[120,6,"Trine"],[180,8,"Opposition"]] as const; const hit=defs.find(([x,o])=>Math.abs(d-x)<=o); return hit?{name:hit[2],orb:Math.abs(d-hit[0])}:null; }
export function westernNatal(input:BirthInput) {
  const { chart }=quickBirth(input); const asc=rev(chart.ascSid+chart.ayan), sun=tropical(chart,"Sun"), moon=tropical(chart,"Moon");
  const planets=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"].map(name=>({name,lon:tropical(chart,name)}));
  const aspects:any[]=[]; for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){const a=aspect(planets[i].lon,planets[j].lon);if(a)aspects.push({...a,one:planets[i].name,two:planets[j].name});}
  return { bigThree:{sun:WESTERN_SIGNS[Math.floor(sun/30)],moon:WESTERN_SIGNS[Math.floor(moon/30)],ascendant:WESTERN_SIGNS[Math.floor(asc/30)]}, planets, aspects:aspects.sort((a,b)=>a.orb-b.orb), system:"Tropical zodiac; major Ptolemaic aspects with stated orbs." };
}
export function westernRelationship(one:BirthInput,two:BirthInput) {
  const a=westernNatal(one),b=westernNatal(two), contacts:any[]=[];
  for(const p of a.planets)for(const q of b.planets){const hit=aspect(p.lon,q.lon);if(hit&&["Sun","Moon","Venus","Mars"].includes(p.name)&&["Sun","Moon","Venus","Mars"].includes(q.name))contacts.push({...hit,one:p.name,two:q.name});}
  const composite=a.planets.map((p,i)=>{const q=b.planets[i],delta=((q.lon-p.lon+540)%360)-180;return {name:p.name,lon:rev(p.lon+delta/2),sign:WESTERN_SIGNS[Math.floor(rev(p.lon+delta/2)/30)]};});
  return { contacts:contacts.sort((x,y)=>x.orb-y.orb), composite, system:"Tropical midpoint composite; cross-chart major aspects." };
}

export { WESTERN_SIGNS, BIRDS };
