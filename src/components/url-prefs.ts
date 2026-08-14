/* URL query prefs — replacement for banned browser storage. */

function urlPrefGet(k) { try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; } }
function urlPrefSet(k, v) { try { const q = new URLSearchParams(window.location.search); q.set(k, v); window.history.replaceState(null, "", "?" + q.toString() + window.location.hash); } catch (e) {} }
function urlPrefPush(k, v) { try { const q = new URLSearchParams(window.location.search); q.set(k, v); window.history.pushState(null, "", "?" + q.toString() + window.location.hash); } catch (e) {} }
function urlPrefsPush(values) { try { const q = new URLSearchParams(window.location.search); Object.entries(values).forEach(([k,v])=>{ if(v==null||v==="")q.delete(k);else q.set(k,String(v)); }); window.history.pushState(null,"","?"+q.toString()+window.location.hash); } catch(e){} }
/* Replace-in-place variant: updates the URL (so reload still restores the value)
   without adding a history entry — use for preference-style changes like city so the
   Back button returns to the previous screen instead of stepping through prior cities. */
function urlPrefsSet(values) { try { const q = new URLSearchParams(window.location.search); Object.entries(values).forEach(([k,v])=>{ if(v==null||v==="")q.delete(k);else q.set(k,String(v)); }); window.history.replaceState(null,"","?"+q.toString()+window.location.hash); } catch(e){} }

/* Build an internal route without dropping the shared Panchang context. This is
   intentionally explicit instead of copying the whole current query: a festival
   page should inherit place/date/calendar choices, not unrelated Muhurat or chart
   inputs that happen to be present on the origin URL. */
function sharedContextHref(path, { lang, place, date, calendarMode, holidayMode, extra = {} } = {}) {
  const q = new URLSearchParams();
  if (lang) q.set("lang", String(lang));
  if (place && place.label) {
    q.set("city", String(place.label));
    q.set("lat", String(place.lat));
    q.set("lon", String(place.lon));
    if (place.zone) q.set("zone", String(place.zone));
  }
  if (date) q.set("date", String(date));
  if (calendarMode) q.set("cal", String(calendarMode));
  if (holidayMode) q.set("hol", String(holidayMode));
  Object.entries(extra).forEach(([key, value]) => {
    if (value != null && value !== "") q.set(key, String(value));
  });
  const query = q.toString();
  return query ? `${path}?${query}` : path;
}

export { urlPrefGet, urlPrefSet, urlPrefPush, urlPrefsPush, urlPrefsSet, sharedContextHref };
