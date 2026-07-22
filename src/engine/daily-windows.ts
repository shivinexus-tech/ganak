/* Daily Panchang windows and regional day-quality helpers.
   Pure interpretation layer: never mutates ephemeris/ayanamsa state. */

import {
  KARANAS_MOV, NAKSHATRAS, YOGAS, elongMs, lunYogaMs, moonSidMs,
  solveCross, sunEvents, sunSidMs, zoneOffset,
} from "./panchang";
import { rev } from "./ephemeris";

const DAY = 86400000;
const NW = 360 / 27;
const NAK_HI = ["अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशिरा","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा","मघा","पूर्वाफाल्गुनी","उत्तराफाल्गुनी","हस्त","चित्रा","स्वाति","विशाखा","अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा","पूर्वाभाद्रपदा","उत्तराभाद्रपदा","रेवती"];
const SIGN_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGN_HI = ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुंभ","मीन"];

const karanaName = (halfTithi: number) => {
  const k = ((halfTithi % 60) + 60) % 60;
  return k === 0 ? "Kimstughna" : k >= 57 ? ["Shakuni", "Chatushpada", "Naga"][k - 57] : KARANAS_MOV[(k - 1) % 7];
};

function intersect(start: number, end: number, lo: number, hi: number) {
  const s = Math.max(start, lo), e = Math.min(end, hi);
  return e > s ? { start: s, end: e } : null;
}

function nakshatraSpanAt(ms: number) {
  const moon = moonSidMs(ms), idx = Math.floor(moon / NW);
  const start = solveCross(moonSidMs, ms - 30 * 3600000, idx * NW, 4);
  const end = solveCross(moonSidMs, ms, ((idx + 1) * NW) % 360, 4);
  return { idx, start, end };
}

/* Classical Nakshatra Tyajya offsets, in ghatis of an ideal 60-ghati star.
   The actual offset/window are scaled to the measured nakshatra duration. */
const VARJYA_GHATI = [50,24,30,40,14,21,30,20,32,30,20,18,21,20,14,14,10,14,20,24,20,10,10,18,16,24,30];
const AMRIT_SHIFT_GHATI = 24;

function nakshatraWindows(lo: number, hi: number) {
  const out: Array<{ kind: "varjyam" | "amrit"; start: number; end: number; nak: number }> = [];
  let cursor = lo - DAY;
  for (let guard = 0; guard < 4 && cursor < hi + DAY; guard++) {
    const span = nakshatraSpanAt(cursor + 12 * 3600000);
    const dur = span.end - span.start;
    const unit = dur / 60;
    const offset = VARJYA_GHATI[span.idx] * unit;
    const length = 4 * unit; // four ghatis, scaled to actual nakshatra length
    const v = intersect(span.start + offset, span.start + offset + length, lo, hi);
    if (v) out.push({ kind: "varjyam", ...v, nak: span.idx });
    const aOffset = ((VARJYA_GHATI[span.idx] + AMRIT_SHIFT_GHATI) % 60) * unit;
    const a = intersect(span.start + aOffset, span.start + aOffset + length, lo, hi);
    if (a) out.push({ kind: "amrit", ...a, nak: span.idx });
    cursor = span.end + 60000;
  }
  return out.sort((a, b) => a.start - b.start);
}

/* Dur Muhurta slots in the 15 equal daytime muhurtas. A second Tuesday window
   belongs to the night and is represented separately. Slot values are 1-based. */
const DUR_DAY_SLOTS: Record<number, number[]> = {
  0: [14], 1: [7, 9], 2: [4], 3: [5], 4: [6, 12], 5: [4, 9], 6: [1],
};
const DUR_NIGHT_SLOTS: Record<number, number[]> = { 2: [7] };

function splitSlots(start: number, end: number, slots: number[]) {
  const unit = (end - start) / 15;
  return slots.map((slot) => ({ start: start + (slot - 1) * unit, end: start + slot * unit }));
}

function bhadraWindows(anchor: number, end: number) {
  const out: Array<{ start: number; end: number }> = [];
  let cursor = anchor;
  let half = Math.floor(rev(elongMs(cursor)) / 6);
  for (let guard = 0; guard < 8 && cursor < end; guard++, half++) {
    const boundary = solveCross(elongMs, cursor, ((half + 1) * 6) % 360, 3);
    if (karanaName(half) === "Vishti") {
      const w = intersect(cursor, boundary, anchor, end);
      if (w) out.push(w);
    }
    cursor = boundary + 1000;
  }
  return out;
}

const SARVARTHA: Record<number, number[]> = {
  0:[0,7,12,18,11,20,25], 1:[21,3,4,7,16], 2:[0,2,8,25],
  3:[3,16,12,2,4], 4:[26,16,0,6,7], 5:[26,16,0,6,21], 6:[21,3,14],
};
const AMRITA_SIDDHI: Record<number, number> = { 0:12, 1:4, 2:0, 3:16, 4:7, 5:26, 6:21 };
const GANDA_MOOLA = new Set([0,8,9,17,18,26]);
const RAVI_YOGA_SEPARATION = new Set([4,6,9,10,13,20]);
const ANANDADI_NAMES = [
  ["Ananda","आनन्द",true],["Kaladanda","कालदण्ड",false],["Dhumra","धूम्र",false],["Dhatri","धात्री",true],
  ["Saumya","सौम्य",true],["Dhwanksha","ध्वांक्ष",false],["Dhwaja","ध्वज",true],["Srivatsa","श्रीवत्स",true],
  ["Vajra","वज्र",false],["Mudgara","मुद्गर",false],["Chhatra","छत्र",true],["Mitra","मित्र",true],
  ["Manasa","मानस",true],["Padma","पद्म",true],["Lumbaka","लुम्बक",false],["Utpata","उत्पात",false],
  ["Mrityu","मृत्यु",false],["Kana","काण",false],["Siddhi","सिद्धि",true],["Shubha","शुभ",true],
  ["Amrita","अमृत",true],["Musala","मुसल",false],["Gada","गदा",false],["Matanga","मातङ्ग",true],
  ["Rakshasa","राक्षस",false],["Chara","चर",true],["Sthira","स्थिर",true],["Pravardhamana","प्रवर्धमान",true],
] as const;
const GOWRI = [
  {key:"uthi",en:"Uthi",hi:"उथि",good:true},{key:"amridha",en:"Amridha",hi:"अमृत",good:true},
  {key:"rogam",en:"Rogam",hi:"रोगम्",good:false},{key:"labam",en:"Labam",hi:"लाभम्",good:true},
  {key:"dhanam",en:"Dhanam",hi:"धनम्",good:true},{key:"sugam",en:"Sugam",hi:"सुखम्",good:true},
  {key:"visham",en:"Visham",hi:"विषम्",good:false},{key:"soram",en:"Soram",hi:"चोरम्",good:false},
];
const GOWRI_BY_KEY=Object.fromEntries(GOWRI.map(x=>[x.key,x]));
const GOWRI_DAY_KEYS = [
  ["uthi","amridha","rogam","labam","dhanam","sugam","soram","visham"],
  ["amridha","visham","rogam","labam","dhanam","sugam","soram","uthi"],
  ["rogam","labam","dhanam","sugam","soram","uthi","visham","amridha"],
  ["labam","dhanam","sugam","soram","visham","uthi","amridha","rogam"],
  ["dhanam","sugam","soram","uthi","amridha","visham","rogam","labam"],
  ["sugam","soram","uthi","visham","amridha","rogam","labam","dhanam"],
  ["soram","uthi","visham","amridha","rogam","labam","dhanam","sugam"],
];
const GOWRI_NIGHT_KEYS = [
  ["dhanam","sugam","soram","visham","uthi","amridha","rogam","labam"],
  ["sugam","soram","uthi","amridha","visham","rogam","labam","dhanam"],
  ["soram","uthi","visham","amridha","rogam","labam","dhanam","sugam"],
  ["uthi","amridha","rogam","labam","dhanam","sugam","soram","visham"],
  ["amridha","visham","rogam","labam","dhanam","sugam","soram","uthi"],
  ["rogam","labam","dhanam","sugam","soram","uthi","visham","amridha"],
  ["labam","dhanam","sugam","soram","uthi","visham","amridha","rogam"],
];

function anandadiYoga(dow:number, moon:number) {
  // The 28-star convention inserts Abhijit between Uttara Ashadha and Shravana.
  let mansion=Math.floor(moon/NW);
  if (moon>=276+40/60 && moon<280+53/60) mansion=21;
  else if (mansion>=21) mansion+=1;
  const item=ANANDADI_NAMES[(mansion+((7-dow)%7)*4)%28];
  return { key:item[0].toLowerCase(), en:item[0], hi:item[1], auspicious:item[2] };
}

function gowriWindows(rise:number,set:number,dow:number,night=false) {
  const unit=(set-rise)/8, keys=(night?GOWRI_NIGHT_KEYS:GOWRI_DAY_KEYS)[dow];
  return keys.map((key,i)=>({ ...GOWRI_BY_KEY[key], part:night?"night":"day", start:rise+i*unit, end:rise+(i+1)*unit }));
}

function specialYogas(dow: number, nak: number, sunNak: number, tithiNum: number) {
  const result: Array<{ key:string; en:string; hi:string; auspicious:boolean }> = [];
  if ((SARVARTHA[dow] || []).includes(nak)) result.push({ key:"sarvartha", en:"Sarvartha Siddhi Yoga", hi:"सर्वार्थ सिद्धि योग", auspicious:true });
  if (AMRITA_SIDDHI[dow] === nak) result.push({ key:"amritaSiddhi", en:"Amrita Siddhi Yoga", hi:"अमृत सिद्धि योग", auspicious:true });
  if (dow === 0 && nak === 7) result.push({ key:"raviPushya", en:"Ravi Pushya Yoga", hi:"रवि पुष्य योग", auspicious:true });
  if (dow === 4 && nak === 7) result.push({ key:"guruPushya", en:"Guru Pushya Yoga", hi:"गुरु पुष्य योग", auspicious:true });
  if (RAVI_YOGA_SEPARATION.has((nak - sunNak + 27) % 27)) result.push({ key:"raviYoga", en:"Ravi Yoga", hi:"रवि योग", auspicious:true });
  if (GANDA_MOOLA.has(nak)) result.push({ key:"gandaMoola", en:"Ganda Moola", hi:"गण्ड मूल", auspicious:false });
  const repeatDow = [0,2,6].includes(dow);
  if (repeatDow && [2,7,12].includes(tithiNum) && [4,13,22].includes(nak)) result.push({ key:"dwipushkar", en:"Dwipushkar Yoga", hi:"द्विपुष्कर योग", auspicious:true });
  if (repeatDow && [3,8,13].includes(tithiNum) && [2,6,11,15,20,24].includes(nak)) result.push({ key:"tripushkar", en:"Tripushkar Yoga", hi:"त्रिपुष्कर योग", auspicious:true });
  return result;
}

function specialYogaWindows(anchor:number,end:number,dow:number) {
  const points=[anchor,end];
  let cursor=anchor, nak=Math.floor(moonSidMs(cursor)/NW);
  for(let i=0;i<3;i++) { const b=solveCross(moonSidMs,cursor,((nak+1)*NW)%360,4); if(b==null||b>=end) break; points.push(b); cursor=b+1000; nak=(nak+1)%27; }
  cursor=anchor; let tn=Math.floor(rev(elongMs(cursor))/12);
  for(let i=0;i<4;i++) { const b=solveCross(elongMs,cursor,((tn+1)*12)%360,3); if(b==null||b>=end) break; points.push(b); cursor=b+1000; tn=(tn+1)%30; }
  points.sort((a,b)=>a-b);
  const out:Array<{key:string;en:string;hi:string;auspicious:boolean;start:number;end:number}>=[];
  for(let i=0;i<points.length-1;i++) {
    const start=points[i], finish=points[i+1], mid=(start+finish)/2;
    const n=Math.floor(moonSidMs(mid)/NW), sn=Math.floor(sunSidMs(mid)/NW), t=(Math.floor(rev(elongMs(mid))/12)%15)+1;
    for(const y of specialYogas(dow,n,sn,t)) {
      let prev; for(let j=out.length-1;j>=0;j--) if(out[j].key===y.key&&Math.abs(out[j].end-start)<2){prev=out[j];break;}
      if(prev) prev.end=finish; else out.push({...y,start,end:finish});
    }
  }
  return out.sort((a,b)=>a.start-b.start);
}

const DISHA: Record<number, { en:string; hi:string }> = {
  0:{en:"West",hi:"पश्चिम"}, 1:{en:"East",hi:"पूर्व"}, 2:{en:"North",hi:"उत्तर"},
  3:{en:"North",hi:"उत्तर"}, 4:{en:"South",hi:"दक्षिण"}, 5:{en:"West",hi:"पश्चिम"}, 6:{en:"East",hi:"पूर्व"},
};

function chandraBala(currentSign: number, waxing: boolean) {
  const base = new Set([1,3,6,7,10,11]);
  const extra = waxing ? [2,5,9] : [4,8,12];
  return SIGN_EN.map((en, birthSign) => {
    const distance = ((currentSign - birthSign + 12) % 12) + 1;
    return { birthSign, en, hi:SIGN_HI[birthSign], good:base.has(distance) || extra.includes(distance), distance };
  });
}

function taraBala(currentNak: number) {
  return NAKSHATRAS.map((en, birthNak) => {
    const tara = ((currentNak - birthNak + 27) % 9) + 1;
    return { birthNak, en, hi:NAK_HI[birthNak], good:![1,3,5,7].includes(tara), tara };
  });
}

function computeDailyWindows(place: any, atMs: number) {
  const probe = new Date(atMs);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth()+1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(atMs + tz * 3600000);
  const y=local.getUTCFullYear(), m=local.getUTCMonth()+1, d=local.getUTCDate();
  const ev = sunEvents(y,m,d,tz,place.lat,place.lon);
  if (ev.rise == null || ev.set == null) return null;
  const next = sunEvents(y,m,d+1,tz,place.lat,place.lon);
  if (next.rise == null) return null;
  const anchor=ev.rise, end=next.rise, dow=new Date(anchor+tz*3600000).getUTCDay();
  const dayUnit=(ev.set-ev.rise)/15, nightUnit=(next.rise-ev.set)/15;
  const nishitaMid=ev.set+(next.rise-ev.set)/2;
  const nak=Math.floor(moonSidMs(anchor)/NW), sunNak=Math.floor(sunSidMs(anchor)/NW);
  const moonAtRise=moonSidMs(anchor);
  const tn=Math.floor(rev(elongMs(anchor))/12), tithiNum=(tn%15)+1;
  const nkWindows=nakshatraWindows(anchor,end);
  const yogaWindows=specialYogaWindows(anchor,end,dow);
  const gowriDay=gowriWindows(ev.rise,ev.set,dow), gowriNight=gowriWindows(ev.set,next.rise,dow,true);
  return {
    anchor,end,tz,dow,
    bhadra:bhadraWindows(anchor,end),
    dur:[...splitSlots(ev.rise,ev.set,DUR_DAY_SLOTS[dow]||[]),...splitSlots(ev.set,next.rise,DUR_NIGHT_SLOTS[dow]||[])],
    varjyam:nkWindows.filter(x=>x.kind==="varjyam"),
    amrit:nkWindows.filter(x=>x.kind==="amrit"),
    brahma:{start:next.rise-2*nightUnit,end:next.rise-nightUnit},
    nishita:{start:nishitaMid-nightUnit/2,end:nishitaMid+nightUnit/2},
    godhuli:{start:ev.set-dayUnit/4,end:ev.set+nightUnit/4},
    // Three-muhurta twilight centred on sunset, matching the festival
    // deciding-kala convention already used by Ganak.
    pradosha:{start:ev.set-(ev.set-ev.rise)/10,end:ev.set+(next.rise-ev.set)/10},
    dishaShool:DISHA[dow],
    chandraBala:chandraBala(Math.floor(moonSidMs(anchor)/30),tn<15),
    taraBala:taraBala(nak),
    specialYogas:[...new Map(yogaWindows.map(y=>[y.key,{key:y.key,en:y.en,hi:y.hi,auspicious:y.auspicious}])).values()],
    specialYogaWindows:yogaWindows,
    anandadi:anandadiYoga(dow,moonAtRise),
    gowriDay,gowriNight,gowri:[...gowriDay,...gowriNight],
    nallaNeram:[...gowriDay,...gowriNight].filter(x=>x.good),
  };
}

function scanSpecialYogaCalendar(place: any, atMs: number, days = 60) {
  const out: Array<{ ms:number; tz:number; yogas:ReturnType<typeof specialYogas>; windows:any[] }> = [];
  for (let i=0;i<days;i++) {
    const day=computeDailyWindows(place,atMs+i*DAY);
    if (day && day.specialYogas.length) out.push({ ms:day.anchor, tz:day.tz, yogas:day.specialYogas, windows:day.specialYogaWindows });
  }
  return out;
}

export { computeDailyWindows, scanSpecialYogaCalendar, specialYogas, specialYogaWindows, anandadiYoga, gowriWindows, chandraBala, taraBala, VARJYA_GHATI };
