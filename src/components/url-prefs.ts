/* URL query prefs — replacement for banned browser storage. */

function urlPrefGet(k) { try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; } }
function urlPrefSet(k, v) { try { const q = new URLSearchParams(window.location.search); q.set(k, v); window.history.replaceState(null, "", "?" + q.toString() + window.location.hash); } catch (e) {} }

export { urlPrefGet, urlPrefSet };
