/* URL query prefs — replacement for banned browser storage. */

function urlPrefGet(k) { try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; } }
function urlPrefSet(k, v) { try { const q = new URLSearchParams(window.location.search); q.set(k, v); window.history.replaceState(null, "", "?" + q.toString() + window.location.hash); } catch (e) {} }
function urlPrefPush(k, v) { try { const q = new URLSearchParams(window.location.search); q.set(k, v); window.history.pushState(null, "", "?" + q.toString() + window.location.hash); } catch (e) {} }
function urlPrefsPush(values) { try { const q = new URLSearchParams(window.location.search); Object.entries(values).forEach(([k,v])=>{ if(v==null||v==="")q.delete(k);else q.set(k,String(v)); }); window.history.pushState(null,"","?"+q.toString()+window.location.hash); } catch(e){} }

export { urlPrefGet, urlPrefSet, urlPrefPush, urlPrefsPush };
