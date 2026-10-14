/* analytics.js — SKM first-party, anonymous analytics beacon.
   No cookies, no PII, no precise location. Sends one pageview + dwell per visit
   to the central collector, tagged with the hostname so events attribute to the
   right site. Sent as a plain string so sendBeacon makes a CORS-simple request
   (no preflight) and works cross-origin from every *.pages.dev site. */
(function () {
  var ENDPOINT = 'https://digipincode.india-in.workers.dev/api/collect';
  try {
    if (!navigator.sendBeacon) return;
    var t0 = Date.now();
    var sent = false;
    function send() {
      if (sent) return; sent = true;
      try {
        var payload = JSON.stringify({
          host: location.hostname,
          path: location.pathname,
          ref: document.referrer || '',
          event: 'view',
          dwell: Math.round((Date.now() - t0) / 1000)
        });
        navigator.sendBeacon(ENDPOINT, payload);
      } catch (e) {}
    }
    window.addEventListener('pagehide', send, { once: true });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') send();
    });
  } catch (e) {}
})();
