/* content.js — Thick homepage content for near-me sites (SKM).
 * Adds real, rankable content to each category homepage: a query-rich intro,
 * "popular searches" headings (H2/H3 that match what people type), a how-to,
 * an FAQ block + FAQPage JSON-LD. Built from the page's own category label so
 * every near-me site gets thick, on-topic content — not a thin map-only shell.
 */
(function () {
  var CAT = (window.CAT && window.CAT.label) || 'Near Me';
  var short = CAT.replace(/\s*Near Me\s*$/i, '').trim() || 'places';
  var lower = short.toLowerCase();

  var MODS = ['near me', 'near me open now', '24 hour', 'nearest', 'open now', 'near me right now', 'in my city', 'on map', 'with directions', 'best', 'closest', 'free'];

  var css =
    '<style>' +
    '.nc{max-width:820px;margin:1.4rem 0}' +
    '.nc h2{font-size:1.15rem;margin:1.4rem 0 .5rem;color:#0f172a}' +
    '.nc h3{font-size:.98rem;margin:.9rem 0 .35rem;color:#12263f}' +
    '.nc p{line-height:1.65;color:#243141}' +
    '.nc .qchips{display:flex;flex-wrap:wrap;gap:.4rem;margin:.5rem 0 0}' +
    '.nc .qchips a{background:#eef3fa;border:1px solid #e3e8f0;border-radius:999px;padding:.32rem .7rem;font-size:.85rem;color:#1a5fb4;text-decoration:none}' +
    '.nc .qchips a:hover{background:#dde9f7;border-color:#1a5fb4}' +
    '.nc .steps{counter-reset:s;list-style:none;padding:0;margin:.5rem 0}' +
    '.nc .steps li{position:relative;padding:.5rem 0 .5rem 2.1rem;border-bottom:1px dashed #e7ebf0}' +
    '.nc .steps li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:.5rem;width:1.5rem;height:1.5rem;border-radius:50%;background:#2563eb;color:#fff;font-weight:700;font-size:.8rem;display:flex;align-items:center;justify-content:center}' +
    '.nc details{background:#fff;border:1px solid #e7ebf0;border-radius:10px;margin:.45rem 0}' +
    '.nc summary{cursor:pointer;font-weight:600;padding:.7rem .9rem;color:#0f172a}' +
    '.nc details p{padding:0 .9rem .8rem;margin:0}' +
    '</style>';

  var FAQ = [
    ['How do I find ' + lower + ' near me?', 'Open this page, tap “Find near me” to use your location, or type your city and pick a radius. The map shows the closest ' + lower + ' first, with distances and one-tap Google Maps directions.'],
    ['Is this ' + lower + ' finder free?', 'Yes — completely free, no signup and no API key. The map uses OpenStreetMap data and the free Overpass search.'],
    ['Which cities are covered?', 'The finder works anywhere in India — just type any city, town or area, or allow location access. You can also browse the city list below.'],
    ['Can I get directions to a ' + lower + '?', 'Yes. Every result has a “Directions” link that opens Google Maps navigation to that exact spot.'],
    ['How accurate is the data?', 'Results come from OpenStreetMap, which is community-maintained and updated continuously. Coverage is best in cities and along major roads.']
  ];

  function build() {
    var host = document.getElementById('ncontent');
    if (!host) return;
    var chips = MODS.map(function (m) { return '<a href="#nblocks">' + lower + ' ' + m + '</a>'; }).join('');
    var faqHtml = FAQ.map(function (qa) {
      return '<details><summary>' + qa[0] + '</summary><p>' + qa[1] + '</p></details>';
    }).join('');

    var html = css +
      '<div class="nc">' +
      '<h2>Find ' + short + ' near you — fast, free, on a live map</h2>' +
      '<p>Looking for ' + lower + ' near me? This free finder shows the closest ' + lower + ' to your current location or any Indian city on an interactive map. Tap <strong>Find near me</strong> to use your GPS, or type a city like Delhi, Mumbai or Patna and pick a radius (2–25 km). Results are sorted by distance, so the nearest ' + lower + ' always appear first — each with its address and a one-tap <strong>Directions</strong> link for Google Maps navigation.</p>' +
      '<p>Whether you need ' + lower + ' open right now, the nearest one in an emergency, or just the closest option while travelling, this page works on mobile and desktop with no signup, no account and no API key. Coverage spans India and is strongest in cities and along highways.</p>' +
      '<h2>Popular ' + lower + ' searches</h2>' +
      '<p>People most often search these variations — pick one to jump to the city list:</p>' +
      '<div class="qchips">' + chips + '</div>' +
      '<h2>How to find ' + lower + ' near me</h2>' +
      '<ol class="steps">' +
      '<li><strong>Use your location:</strong> tap “Find near me” and allow location access for instant, distance-sorted results.</li>' +
      '<li><strong>Or search a city:</strong> type any city or area and choose a radius (start at 5 km, widen to 25 km if needed).</li>' +
      '<li><strong>Pick the nearest:</strong> the list is sorted by distance — open <em>Directions</em> for turn-by-turn Google Maps navigation.</li>' +
      '<li><strong>Browse by city:</strong> use the city blocks below to explore ' + lower + ' in other cities.</li>' +
      '</ol>' +
      '<h2>Frequently asked questions</h2>' + faqHtml +
      '</div>';
    host.innerHTML = html;

    try {
      var ld = { '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(function (qa) {
          return { '@type': 'Question', name: qa[0], acceptedAnswer: { '@type': 'Answer', text: qa[1] } };
        }) };
      var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
