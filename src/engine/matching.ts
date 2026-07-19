/* Ashtakoota Guna Milan (Kundali matching) — pure extraction (SPLIT-UI-MATCH-01).
   Tables and scoring unchanged. computeMatch needs a kundli builder injected
   until computeKundli itself is extracted (avoids circular imports with the shell). */

import { SIGN_LORD } from "./panchang";

const NF = {
  Sun: { F: ["Moon", "Mars", "Jupiter"], E: ["Venus", "Saturn"] },
  Moon: { F: ["Sun", "Mercury"], E: [] },
  Mars: { F: ["Sun", "Moon", "Jupiter"], E: ["Mercury"] },
  Mercury: { F: ["Sun", "Venus"], E: ["Moon"] },
  Jupiter: { F: ["Sun", "Moon", "Mars"], E: ["Mercury", "Venus"] },
  Venus: { F: ["Mercury", "Saturn"], E: ["Sun", "Moon"] },
  Saturn: { F: ["Mercury", "Venus"], E: ["Sun", "Moon", "Mars"] },
};

/* ---------------- Ashtakoota Guna Milan (Kundali matching) ----------------
   8 kootas, 36 points. Nakshatra/rashi-indexed tables validated standalone:
   Gana & Nadi distributions 9/9/9; Yoni matrix symmetric with same=4 and the
   7 sworn-enemy pairs=0 (universal); Bhakoot/Nadi dosha logic exact. */
const NAK_YONI = [0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1];
const NAK_GANA = [0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,1,0];
const NAK_NADI = [0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2];
const SIGN_VARNA = [3,2,1,4,3,2,1,4,3,2,1,4];
const SIGN_VASHYA = [0,0,1,2,3,1,1,4,1,2,1,2];
const YONI_NAMES = ["Horse","Elephant","Sheep","Serpent","Dog","Cat","Rat","Cow","Buffalo","Tiger","Deer","Monkey","Mongoose","Lion"];
const GANA_NAMES = ["Deva","Manushya","Rakshasa"];
const NADI_NAMES = ["Aadi","Madhya","Antya"];
const VARNA_NAMES = ["", "Shudra", "Vaishya", "Kshatriya", "Brahmin"];
const VASHYA_NAMES = ["Quadruped","Human","Waterborne","Wild","Insect"];
const _MORTAL=[[7,9],[1,13],[0,8],[4,10],[3,12],[11,2],[5,6]];
const _YFRI=[[8,7],[8,1],[8,2],[5,10],[5,11],[5,12],[7,10],[7,2],[1,11],[1,2],[1,3],[0,3]];
const _YENE=[[8,13],[8,3],[5,3],[5,9],[5,13],[7,0],[7,13],[7,3],[4,13],[4,12],[4,6],[4,2],[4,9],[1,9],[10,0],[10,13],[10,9]];
const YONI_MATRIX = (() => { const M=Array.from({length:14},()=>Array(14).fill(2)); for(let i=0;i<14;i++)M[i][i]=4;
  for(const[a,b]of _YFRI){M[a][b]=3;M[b][a]=3;} for(const[a,b]of _YENE){M[a][b]=1;M[b][a]=1;} for(const[a,b]of _MORTAL){M[a][b]=0;M[b][a]=0;} return M; })();
const GANA_MATRIX = [[6,6,1],[5,6,0],[1,0,6]];
const VASHYA_MATRIX = [[2,1,1,0,1],[0.5,2,0.5,0.5,1],[1,1,2,1,1],[1,0,1,2,0],[1,1,1,1,2]];
const MANGLIK_HOUSES = [1,2,4,7,8,12];
function _gmRel(a,b){ if(a===b)return"F"; if(NF[a].F.includes(b))return"F"; if(NF[a].E.includes(b))return"E"; return"N"; }
function _maitri(bl,gl){ if(bl===gl)return 5; const r1=_gmRel(bl,gl),r2=_gmRel(gl,bl);
  if(r1==="F"&&r2==="F")return 5; if((r1==="F"&&r2==="N")||(r1==="N"&&r2==="F"))return 4; if(r1==="N"&&r2==="N")return 3;
  if((r1==="F"&&r2==="E")||(r1==="E"&&r2==="F"))return 1; if((r1==="N"&&r2==="E")||(r1==="E"&&r2==="N"))return 0.5; return 0; }
function _taraFav(f,t){ const c=((t-f+27)%27)+1; return (c%9)%2===0; }
function gunaMilan(boy, girl) {
  const k = [
    { name:"Varna", got: SIGN_VARNA[boy.rashi]>=SIGN_VARNA[girl.rashi]?1:0, max:1,
      note: VARNA_NAMES[SIGN_VARNA[boy.rashi]]+" / "+VARNA_NAMES[SIGN_VARNA[girl.rashi]] },
    { name:"Vashya", got: SIGN_VASHYA[boy.rashi]===SIGN_VASHYA[girl.rashi]?2:VASHYA_MATRIX[SIGN_VASHYA[boy.rashi]][SIGN_VASHYA[girl.rashi]], max:2,
      note: VASHYA_NAMES[SIGN_VASHYA[boy.rashi]]+" / "+VASHYA_NAMES[SIGN_VASHYA[girl.rashi]] },
    { name:"Tara", got: (_taraFav(boy.nak,girl.nak)?1.5:0)+(_taraFav(girl.nak,boy.nak)?1.5:0), max:3, note:"birth-star harmony" },
    { name:"Yoni", got: YONI_MATRIX[NAK_YONI[boy.nak]][NAK_YONI[girl.nak]], max:4,
      note: YONI_NAMES[NAK_YONI[boy.nak]]+" / "+YONI_NAMES[NAK_YONI[girl.nak]] },
    { name:"Graha Maitri", got: _maitri(SIGN_LORD[boy.rashi],SIGN_LORD[girl.rashi]), max:5,
      note: SIGN_LORD[boy.rashi]+" / "+SIGN_LORD[girl.rashi] },
    { name:"Gana", got: GANA_MATRIX[NAK_GANA[boy.nak]][NAK_GANA[girl.nak]], max:6,
      note: GANA_NAMES[NAK_GANA[boy.nak]]+" / "+GANA_NAMES[NAK_GANA[girl.nak]] },
    { name:"Bhakoot", got: [2,5,6,8,9,12].includes(((girl.rashi-boy.rashi+12)%12)+1)?0:7, max:7, note:"emotional & prosperity axis" },
    { name:"Nadi", got: NAK_NADI[boy.nak]===NAK_NADI[girl.nak]?0:8, max:8,
      note: NADI_NAMES[NAK_NADI[boy.nak]]+" / "+NADI_NAMES[NAK_NADI[girl.nak]] },
  ];
  const total = k.reduce((s,x)=>s+x.got,0);
  return { kootas:k, total, max:36, nadiDosha:k[7].got===0, bhakootDosha:k[6].got===0 };
}

/** Build a match report using an injected kundli engine (usually shell computeKundli). */
export function computeMatch(computeKundli, boyDetails, girlDetails) {
  const cb = computeKundli(boyDetails), cg = computeKundli(girlDetails);
  const ex = (c) => { const mars=c.rows.find(p=>p.name==="Mars");
    const hL=((mars.sign-c.ascSign+12)%12)+1, hM=((mars.sign-c.moon.sign+12)%12)+1;
    return { nak:c.moon.nak, rashi:c.moon.sign, lord:SIGN_LORD[c.moon.sign], marsSign:mars.sign,
      marsHouseLagna:hL, marsHouseMoon:hM, manglikLagna:MANGLIK_HOUSES.includes(hL), manglikMoon:MANGLIK_HOUSES.includes(hM) }; };
  const boy=ex(cb), girl=ex(cg), gm=gunaMilan(boy,girl);
  const manglik = { boy:boy.manglikLagna, girl:girl.manglikLagna, boyMoon:boy.manglikMoon, girlMoon:girl.manglikMoon,
    cancelled: boy.manglikLagna===girl.manglikLagna };
  return { boy, girl, ...gm, manglik, charts:{ boy:cb, girl:cg } };
}

export { gunaMilan, NF, MANGLIK_HOUSES };
