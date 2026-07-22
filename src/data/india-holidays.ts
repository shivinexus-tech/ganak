// 2026 Central Government gazetted holidays for offices in Delhi/New Delhi.
// Source inventory and scope: plans/india-holiday-overlay-sources.md.
// This is deliberately not labelled as a universal state or bank-holiday list.

const h = (date, en, hi, kind = "gazetted", lunarNotice = false) =>
  Object.freeze({ date, name: Object.freeze({ en, hi }), kind, lunarNotice });

export const INDIA_HOLIDAY_DATASET = Object.freeze({
  jurisdiction: "IN-CENTRAL-DELHI",
  year: 2026,
  sourceUpdated: "2026-02-11",
  holidays: Object.freeze([
    h("2026-01-26", "Republic Day", "गणतंत्र दिवस", "national"),
    h("2026-03-04", "Holi", "होली"),
    h("2026-03-21", "Id-ul-Fitr", "ईद-उल-फ़ित्र", "gazetted", true),
    h("2026-03-26", "Ram Navami", "राम नवमी"),
    h("2026-03-31", "Mahavir Jayanti", "महावीर जयंती"),
    h("2026-04-03", "Good Friday", "गुड फ्राइडे"),
    h("2026-05-01", "Buddha Purnima", "बुद्ध पूर्णिमा"),
    h("2026-05-27", "Id-ul-Zuha (Bakrid)", "ईद-उल-जुहा (बकरीद)", "gazetted", true),
    h("2026-06-26", "Muharram", "मुहर्रम", "gazetted", true),
    h("2026-08-15", "Independence Day", "स्वतंत्रता दिवस", "national"),
    h("2026-08-26", "Milad-un-Nabi / Id-e-Milad", "मिलाद-उन-नबी / ईद-ए-मिलाद", "gazetted", true),
    h("2026-09-04", "Janmashtami (Vaishnava)", "जन्माष्टमी (वैष्णव)"),
    h("2026-10-02", "Mahatma Gandhi's Birthday", "महात्मा गांधी जयंती", "national"),
    h("2026-10-20", "Dussehra", "दशहरा"),
    h("2026-11-08", "Diwali (Deepavali)", "दीपावली"),
    h("2026-11-24", "Guru Nanak's Birthday", "गुरु नानक जयंती"),
    h("2026-12-25", "Christmas Day", "क्रिसमस"),
  ]),
});

export const HOLIDAY_OVERLAY_MODES = Object.freeze([
  Object.freeze({ id: "off", en: "Hide holidays", hi: "अवकाश छिपाएँ" }),
  Object.freeze({ id: "national", en: "National holidays", hi: "राष्ट्रीय अवकाश" }),
  Object.freeze({ id: "gazetted", en: "Central gazetted holidays", hi: "केंद्रीय राजपत्रित अवकाश" }),
]);

export function resolveHolidayMode(value) {
  return HOLIDAY_OVERLAY_MODES.some((mode) => mode.id === value) ? value : "national";
}

export function holidaysForDate(isoDate, mode = "national") {
  const resolved = resolveHolidayMode(mode);
  if (resolved === "off") return [];
  return INDIA_HOLIDAY_DATASET.holidays.filter((holiday) =>
    holiday.date === isoDate && (resolved === "gazetted" || holiday.kind === "national"));
}

export function holidayDatesForYear(year, mode = "national") {
  const resolved = resolveHolidayMode(mode);
  if (resolved === "off" || year !== INDIA_HOLIDAY_DATASET.year) return new Set();
  return new Set(INDIA_HOLIDAY_DATASET.holidays
    .filter((holiday) => resolved === "gazetted" || holiday.kind === "national")
    .map((holiday) => holiday.date));
}
