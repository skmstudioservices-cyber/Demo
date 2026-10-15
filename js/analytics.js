/* analytics.js — SKM first-party, anonymous analytics beacon (v2, 15 Oct 2026).
   No cookies, no PII, no precise location. Sends pageview + dwell + max scroll
   + the search keyword the user typed, tagged with hostname so events attribute
   to the right site. Plain-string beacon = CORS-simple, works cross-origin. */
(function () {
  var ENDPOINT = 'https://digipincode.india-in.workers.dev/api/collect';
  try {
    if (!navigator.sendBeacon) return;
    var t0 = Date.now(), maxScroll = 0, sent = false;
    window.addEventListener('scroll', function () {
      try {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var p = h > 0 ? Math.round((window.scrollY / h) * 100) : 0;
        if (p > maxScroll) maxScroll = p;
      } catch (e) {}
    }, { passive: true });
    function send(extra) {
      if (sent) return; sent = true;
      try {
        var payload = JSON.stringify(Object.assign({
          host: location.hostname, path: location.pathname,
          ref: document.referrer || '', event: 'view',
          dwell: Math.round((Date.now() - t0) / 1000), scroll: maxScroll
        }, extra || {}));
        navigator.sendBeacon(ENDPOINT, payload);
      } catch (e) {}
    }
    // keyword fuel: capture the city/search term the user actually searched
    function kwBeacon(v) {
      try {
        if (!v) return;
        navigator.sendBeacon(ENDPOINT, JSON.stringify({
          host: location.hostname, path: location.pathname, ref: '',
          event: 'search', kw: String(v).slice(0, 120), dwell: 0, scroll: maxScroll
        }));
      } catch (e) {}
    }
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.id === 'go') { var i = document.getElementById('city'); if (i) kwBeacon(i.value.trim()); }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target && e.target.id === 'city') kwBeacon(e.target.value.trim());
    }, true);
    window.addEventListener('pagehide', function () { send(); }, { once: true });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') send();
    });
  } catch (e) {}
})();
