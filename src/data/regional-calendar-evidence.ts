/* Frozen 2026 regional-calendar evidence.
 *
 * These are reference facts, not inputs to Ganak's astronomy. Exact ingress
 * moments are the 2026 Lahiri nirayana Sankranti moments published by Drik
 * Panchang (New Delhi/IST). The two month-start series are independently
 * published as complete daily calendars by Drik Panchang and Prokerala / the
 * cited native-calendar sources in plans/regional-calendar-source-register.md.
 */

export const PUBLISHED_2026_SANKRANTI_UTC=[
  [9,"2026-01-14T09:43:00Z"],[10,"2026-02-12T22:44:00Z"],[11,"2026-03-14T19:38:00Z"],
  [0,"2026-04-14T04:08:00Z"],[1,"2026-05-15T00:58:00Z"],[2,"2026-06-15T07:29:00Z"],
  [3,"2026-07-16T18:15:00Z"],[4,"2026-08-17T02:34:00Z"],[5,"2026-09-17T02:28:00Z"],
  [6,"2026-10-17T14:27:00Z"],[7,"2026-11-16T14:18:00Z"],[8,"2026-12-16T04:59:00Z"],
] as const;
export const TAMIL_2026_MONTH_STARTS=[
  [9,"2026-01-14","Thai"],[10,"2026-02-13","Maasi"],[11,"2026-03-15","Panguni"],
  [0,"2026-04-14","Chithirai"],[1,"2026-05-15","Vaikasi"],[2,"2026-06-15","Aani"],
  [3,"2026-07-17","Aadi"],[4,"2026-08-17","Avani"],[5,"2026-09-17","Purattasi"],
  [6,"2026-10-18","Aippasi"],[7,"2026-11-17","Karthigai"],[8,"2026-12-16","Margazhi"],
] as const;

export const BENGALI_2026_MONTH_STARTS=[
  [9,"2026-01-15","Magh"],[10,"2026-02-14","Falgun"],[11,"2026-03-16","Choitro"],
  [0,"2026-04-15","Boishakh"],[1,"2026-05-16","Joishtho"],[2,"2026-06-16","Asharh"],
  [3,"2026-07-18","Shrabon"],[4,"2026-08-18","Bhadro"],[5,"2026-09-18","Ashwin"],
  [6,"2026-10-19","Kartik"],[7,"2026-11-18","Ogrohayon"],[8,"2026-12-17","Poush"],
] as const;

export const REGIONAL_TERMINOLOGY={
  tamil:{
    convention:["Thirukanitha","திருக்கணிதம்","तिरुकणित"],
    months:["சித்திரை","வைகாசி","ஆனி","ஆடி","ஆவணி","புரட்டாசி","ஐப்பசி","கார்த்திகை","மார்கழி","தை","மாசி","பங்குனி"],
    sources:["Tamil Virtual Academy Tamil calendar terminology","Drik Panchang Tamil calendar"],
  },
  bengali:{
    convention:["Vishuddha Siddhanta","বিশুদ্ধ সিদ্ধান্ত","विशुद्ध सिद्धान्त"],
    months:["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"],
    sources:["Prokerala Bisuddha Siddhanta calendar","West Bengal Bangla calendar references"],
  },
} as const;

// Calendar-date coverage includes these 25 independently dated observances,
// while their ritual rules remain owned by the canonical festival engine.
export const REGIONAL_OBSERVANCE_ANCHORS_2026=[
  ["Pongal","2026-01-14"],["Thai Pusam","2026-02-01"],["Maha Shivaratri","2026-02-15"],
  ["Masi Magam","2026-03-03"],["Karadaiyan Nombu","2026-03-14"],["Puthandu","2026-04-14"],
  ["Pohela Boishakh","2026-04-15"],["Chitra Pournami","2026-05-01"],["Rabindra Jayanti","2026-05-09"],
  ["Vaikasi Visakam","2026-05-30"],["Ratha Yatra","2026-07-16"],["Aadi Perukku","2026-08-03"],
  ["Aadi Amavasai","2026-08-12"],["Andal Jayanthi","2026-08-14"],["Mahalaya","2026-10-10"],
  ["Durga Shashthi","2026-10-16"],["Durga Saptami","2026-10-17"],["Durga Ashtami","2026-10-19"],
  ["Durga Navami","2026-10-20"],["Vijaya Dashami","2026-10-20"],["Kali Puja","2026-11-08"],
  ["Deepavali","2026-11-08"],["Soora Samharam","2026-11-15"],["Karthigai Deepam","2026-11-24"],
  ["Arudra Darshan","2026-12-24"],
] as const;
