/* blocks.js — Expandable Near-Me Blocks (SKM pattern) — CARD layout.
 * Renders 3-6 blocks; each block is a titled card grid of real locations.
 * Preview shows a few cards; "Read more" expands the block to ~50 cards in a
 * scrollable grid. Keeps the long-tail city keywords ON the page so the page
 * (not a farm of thin near-me pages) is what ranks / gets canonicalised.
 * Data: city pools below (served from the static build). Grown daily from GSC/GA/search.
 */
(function () {
  var CAT = (window.CAT && window.CAT.label) || 'Near Me';
  var short = CAT.replace(/\s*Near Me\s*$/i, '').trim() || 'places';
  var ICON = '📍';

  var GROUPS = [
    { title: 'Metro cities', cities: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad'] },
    { title: 'North India', cities: ['Jaipur', 'Lucknow', 'Kanpur', 'Chandigarh', 'Ludhiana', 'Amritsar', 'Dehradun', 'Shimla', 'Jammu', 'Srinagar', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Gorakhpur', 'Bareilly', 'Moradabad'] },
    { title: 'West & Central India', cities: ['Surat', 'Vadodara', 'Rajkot', 'Nashik', 'Nagpur', 'Thane', 'Aurangabad', 'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Raipur'] },
    { title: 'South India', cities: ['Coimbatore', 'Madurai', 'Kochi', 'Thiruvananthapuram', 'Mysuru', 'Mangaluru', 'Visakhapatnam', 'Vijayawada', 'Tirupati', 'Warangal', 'Salem', 'Tiruchirappalli', 'Hubballi', 'Belagavi'] },
    { title: 'East India', cities: ['Patna', 'Ranchi', 'Jamshedpur', 'Bhubaneswar', 'Cuttack', 'Guwahati', 'Siliguri', 'Dhanbad', 'Gaya', 'Muzaffarpur', 'Agartala', 'Imphal', 'Shillong'] }
  ];

  var PREVIEW = 6;   // cards shown before "Read more"
  var CAP = 50;      // cards after expand

  var css =
    '<style>' +
    '.nblocks{margin:2.2rem 0 1rem}' +
    '.nblocks .nb-lead{color:#5b6b80;font-size:.92rem;margin:.2rem 0 1.1rem}' +
    '.nblock{margin:0 0 1.6rem}' +
    '.nblock h2{font-size:1.08rem;margin:1.1rem 0 .6rem;color:#0f172a;display:flex;align-items:center;gap:.45rem}' +
    '.nblock h2 .n{background:#2563eb;color:#fff;border-radius:6px;font-size:.72rem;padding:.1rem .45rem;font-weight:700}' +
    '.nb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.7rem}' +
    '.nb-grid.expanded{max-height:20rem;overflow:auto;padding-right:.35rem}' +
    '.nb-card{display:flex;align-items:center;gap:.6rem;background:#fff;border:1px solid #e7ebf0;border-left:4px solid #2563eb;border-radius:12px;padding:.7rem .85rem;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-left-color .16s ease}' +
    '.nb-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(15,23,42,.12);border-left-color:#e85d04}' +
    '.nb-card .nb-ic{font-size:1.15rem;flex:0 0 auto}' +
    '.nb-card .nb-tx{min-width:0}' +
    '.nb-card .nb-t{display:block;font-weight:700;color:#0f172a;font-size:.95rem;line-height:1.2}' +
    '.nb-card .nb-m{display:block;color:#5b6b80;font-size:.78rem;margin-top:.12rem}' +
    '.nmore{margin:.7rem 0 0;background:#eef3fa;border:1px solid #dbe4f0;color:#1a5fb4;font-weight:700;cursor:pointer;font-size:.85rem;padding:.45rem .9rem;border-radius:999px}' +
    '.nmore:hover{background:#dde9f7;border-color:#1a5fb4}' +
    '@media(max-width:520px){.nb-grid{grid-template-columns:1fr 1fr}.nb-card{padding:.6rem}}' +
    '</style>';

  function runSearch(city) {
    var inp = document.getElementById('city'), go = document.getElementById('go');
    if (!inp || !go) return;
    inp.value = city; go.click();
    var m = document.getElementById('map');
    if (m && m.scrollIntoView) m.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function card(city) {
    return '<div class="nb-card" data-city="' + city + '">' +
      '<span class="nb-ic">' + ICON + '</span>' +
      '<span class="nb-tx"><span class="nb-t">' + city + '</span>' +
      '<span class="nb-m">' + short + ' near me</span></span></div>';
  }

  function build() {
    var host = document.getElementById('nblocks');
    if (!host) return;
    var html = css + '<h2>' + short + ' near me — browse by city</h2>' +
      '<p class="nb-lead">Pick your city to see ' + short.toLowerCase() + ' near you on the map. Expand any group for more cities.</p>';
    GROUPS.forEach(function (g, gi) {
      var all = g.cities.slice(0, CAP);
      var cards = all.map(card).join('');
      var more = all.length > PREVIEW
        ? '<button class="nmore" data-more="' + gi + '">Read more ▾ (' + all.length + ' cities)</button>' : '';
      html += '<div class="nblock"><h2><span class="n">' + (gi + 1) + '</span>' + short + ' near me in ' + g.title + '</h2>' +
        '<div class="nb-grid" id="nbg-' + gi + '">' + cards + '</div>' + more + '</div>';
    });
    host.innerHTML = html;

    GROUPS.forEach(function (g, gi) {
      var box = document.getElementById('nbg-' + gi);
      if (!box) return;
      var kids = box.querySelectorAll('.nb-card');
      for (var i = PREVIEW; i < kids.length; i++) kids[i].style.display = 'none';
    });

    host.addEventListener('click', function (e) {
      var cardEl = e.target.closest ? e.target.closest('.nb-card') : null;
      if (cardEl) { runSearch(cardEl.getAttribute('data-city')); return; }
      var btn = e.target.closest ? e.target.closest('.nmore') : null;
      if (btn) {
        var gi = btn.getAttribute('data-more');
        var box = document.getElementById('nbg-' + gi);
        var kids = box.querySelectorAll('.nb-card');
        var open = box.classList.toggle('expanded');
        for (var i = PREVIEW; i < kids.length; i++) kids[i].style.display = open ? '' : 'none';
        btn.textContent = open ? 'Show less ▴' : 'Read more ▾ (' + kids.length + ' cities)';
      }
    });

    try {
      var names = [];
      GROUPS.forEach(function (g) { g.cities.forEach(function (c) { if (names.indexOf(c) < 0) names.push(c); }); });
      var ld = { '@context': 'https://schema.org', '@type': 'ItemList', name: short + ' near me — cities covered',
        itemListElement: names.map(function (c, i) { return { '@type': 'ListItem', position: i + 1, name: c }; }) };
      var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
