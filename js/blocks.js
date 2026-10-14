/* blocks.js — Expandable Near-Me Blocks (SKM pattern)
 * Renders 3-6 homepage blocks, each with 3-5 real locations and a
 * "Read more" that expands the block (scrollable) to ~50.
 * Goal: keep long-tail city keywords ON the page itself so the page
 * (not thousands of thin near-me pages) is what ranks / gets canonicalised.
 * Data: city pools below (served from the static build = RAM/edge cache).
 *       Grown daily from GSC + GA + internal search into data/cities.json.
 */
(function () {
  var CAT = (window.CAT && window.CAT.label) || 'Near Me';
  var short = CAT.replace(/\s*Near Me\s*$/i, '').trim() || 'places';

  // ---- city pools (seed; extended daily from search data) ----
  var GROUPS = [
    { title: 'metro cities', cities: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad'] },
    { title: 'North India', cities: ['Jaipur', 'Lucknow', 'Kanpur', 'Chandigarh', 'Ludhiana', 'Amritsar', 'Dehradun', 'Shimla', 'Jammu', 'Srinagar', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Gorakhpur', 'Bareilly', 'Moradabad'] },
    { title: 'West & Central India', cities: ['Surat', 'Vadodara', 'Rajkot', 'Nashik', 'Nagpur', 'Thane', 'Aurangabad', 'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Raipur'] },
    { title: 'South India', cities: ['Coimbatore', 'Madurai', 'Kochi', 'Thiruvananthapuram', 'Mysuru', 'Mangaluru', 'Visakhapatnam', 'Vijayawada', 'Tirupati', 'Warangal', 'Salem', 'Tiruchirappalli', 'Hubballi', 'Belagavi'] },
    { title: 'East India', cities: ['Patna', 'Ranchi', 'Jamshedpur', 'Bhubaneswar', 'Cuttack', 'Guwahati', 'Siliguri', 'Dhanbad', 'Gaya', 'Muzaffarpur', 'Agartala', 'Imphal', 'Shillong'] }
  ];

  var PREVIEW = 5;   // items shown before "Read more"
  var CAP = 50;      // items after expand

  var css =
    '<style>' +
    '.nblocks{margin:2rem 0 1rem}' +
    '.nblocks h2{font-size:1.05rem;margin:1.2rem 0 .5rem;color:#12263f}' +
    '.nchips{display:flex;flex-wrap:wrap;gap:.4rem}' +
    '.nchips .c{background:#eef3fa;border:1px solid #e3e8f0;border-radius:999px;padding:.3rem .7rem;font-size:.85rem;color:#1a5fb4;cursor:pointer}' +
    '.nchips .c:hover{background:#dde9f7;border-color:#1a5fb4}' +
    '.nchips.expanded{max-height:14rem;overflow:auto;padding-right:.4rem}' +
    '.nmore{margin:.5rem 0 0;background:none;border:none;color:#1a5fb4;font-weight:600;cursor:pointer;font-size:.85rem;padding:0}' +
    '</style>';

  function runSearch(city) {
    var inp = document.getElementById('city');
    var go = document.getElementById('go');
    if (!inp || !go) return;
    inp.value = city;
    go.click();
    var m = document.getElementById('map');
    if (m && m.scrollIntoView) m.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function build() {
    var host = document.getElementById('nblocks');
    if (!host) return;
    var html = css + '<h2>Browse ' + short + ' near me, by city</h2>';
    GROUPS.forEach(function (g, gi) {
      var all = g.cities.slice(0, CAP);
      var head = '<h2>' + short + ' near me in ' + g.title + '</h2>';
      var chips = all.map(function (c) {
        return '<span class="c" data-city="' + c + '">' + c + '</span>';
      }).join('');
      var more = all.length > PREVIEW
        ? '<button class="nmore" data-more="' + gi + '">Read more ▾ (' + all.length + ')</button>'
        : '';
      html += '<div class="nblock" data-g="' + gi + '">' + head +
        '<div class="nchips" id="nchips-' + gi + '">' + chips + '</div>' + more + '</div>';
    });
    host.innerHTML = html;

    // show only PREVIEW chips until expanded
    GROUPS.forEach(function (g, gi) {
      var box = document.getElementById('nchips-' + gi);
      if (!box) return;
      var kids = box.querySelectorAll('.c');
      for (var i = PREVIEW; i < kids.length; i++) kids[i].style.display = 'none';
    });

    host.addEventListener('click', function (e) {
      var t = e.target;
      if (t.classList.contains('c')) { runSearch(t.getAttribute('data-city')); return; }
      if (t.classList.contains('nmore')) {
        var gi = t.getAttribute('data-more');
        var box = document.getElementById('nchips-' + gi);
        var kids = box.querySelectorAll('.c');
        var open = box.classList.toggle('expanded');
        for (var i = PREVIEW; i < kids.length; i++) kids[i].style.display = open ? '' : 'none';
        t.textContent = open ? 'Show less ▴' : 'Read more ▾ (' + kids.length + ')';
      }
    });

    // JSON-LD ItemList of the cities (helps search + AI understand the page)
    try {
      var names = [];
      GROUPS.forEach(function (g) { g.cities.forEach(function (c) { if (names.indexOf(c) < 0) names.push(c); }); });
      var ld = { '@context': 'https://schema.org', '@type': 'ItemList',
        name: short + ' near me — cities covered',
        itemListElement: names.map(function (c, i) { return { '@type': 'ListItem', position: i + 1, name: c }; }) };
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
