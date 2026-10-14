/* blocks.js — Expandable Near-Me Blocks (SKM pattern) — CARD grid + detail modal.
 * 3-6 blocks; each block = a titled card grid of real locations. Preview shows a
 * few cards; "Read more" expands the block to ~50 cards in a scrollable grid.
 * Clicking a card opens a POPUP (modal) with the full details for that city.
 * Keeps the long-tail city keywords ON the page so the page ranks / gets canonicalised.
 */
(function () {
  var CAT = (window.CAT && window.CAT.label) || 'Near Me';
  var short = CAT.replace(/\s*Near Me\s*$/i, '').trim() || 'places';
  var lower = short.toLowerCase();
  var ICON = '📍';

  var GROUPS = [
    { title: 'Metro cities', cities: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad'] },
    { title: 'North India', cities: ['Jaipur', 'Lucknow', 'Kanpur', 'Chandigarh', 'Ludhiana', 'Amritsar', 'Dehradun', 'Shimla', 'Jammu', 'Srinagar', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Gorakhpur', 'Bareilly', 'Moradabad'] },
    { title: 'West & Central India', cities: ['Surat', 'Vadodara', 'Rajkot', 'Nashik', 'Nagpur', 'Thane', 'Aurangabad', 'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Raipur'] },
    { title: 'South India', cities: ['Coimbatore', 'Madurai', 'Kochi', 'Thiruvananthapuram', 'Mysuru', 'Mangaluru', 'Visakhapatnam', 'Vijayawada', 'Tirupati', 'Warangal', 'Salem', 'Tiruchirappalli', 'Hubballi', 'Belagavi'] },
    { title: 'East India', cities: ['Patna', 'Ranchi', 'Jamshedpur', 'Bhubaneswar', 'Cuttack', 'Guwahati', 'Siliguri', 'Dhanbad', 'Gaya', 'Muzaffarpur', 'Agartala', 'Imphal', 'Shillong'] }
  ];

  var PREVIEW = 6;
  var CAP = 50;

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
    /* modal */
    '.nb-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:1rem}' +
    '.nb-modal.open{display:flex}' +
    '.nb-modal .box{background:#fff;border-radius:16px;max-width:460px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.35);overflow:hidden;animation:nbpop .18s ease}' +
    '@keyframes nbpop{from{transform:scale(.96);opacity:.6}to{transform:none;opacity:1}}' +
    '.nb-modal .hd{background:linear-gradient(135deg,#12263f,#2563eb);color:#fff;padding:1rem 1.1rem;display:flex;justify-content:space-between;align-items:flex-start;gap:.6rem}' +
    '.nb-modal .hd h3{margin:0;font-size:1.15rem}' +
    '.nb-modal .hd .x{background:none;border:0;color:#fff;font-size:1.4rem;line-height:1;cursor:pointer;opacity:.85}' +
    '.nb-modal .bd{padding:1rem 1.1rem}' +
    '.nb-modal .bd p{margin:.3rem 0;color:#243141;font-size:.92rem;line-height:1.6}' +
    '.nb-modal .kv{display:flex;gap:.4rem;flex-wrap:wrap;margin:.6rem 0}' +
    '.nb-modal .kv span{background:#eef3fa;border:1px solid #e3e8f0;border-radius:999px;padding:.25rem .6rem;font-size:.78rem;color:#1a5fb4}' +
    '.nb-modal .acts{display:flex;gap:.5rem;margin-top:.9rem}' +
    '.nb-modal .acts a,.nb-modal .acts button{flex:1;text-align:center;border:0;border-radius:10px;padding:.7rem;font-weight:700;font-size:.9rem;cursor:pointer;text-decoration:none;font-family:inherit}' +
    '.nb-modal .acts .go{background:#2563eb;color:#fff}' +
    '.nb-modal .acts .gm{background:#eef3fa;color:#12263f;border:1px solid #e3e8f0}' +
    '@media(max-width:520px){.nb-grid{grid-template-columns:1fr 1fr}.nb-card{padding:.6rem}}' +
    '</style>';

  var modalEl = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement('div');
    modalEl.className = 'nb-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.innerHTML = '<div class="box"><div class="hd"><h3></h3><button class="x" aria-label="Close">×</button></div><div class="bd"></div></div>';
    document.body.appendChild(modalEl);
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl || e.target.classList.contains('x')) closeModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    return modalEl;
  }

  function closeModal() { if (modalEl) modalEl.classList.remove('open'); }

  function openModal(city) {
    var m = ensureModal();
    var gm = 'https://www.google.com/maps/search/' + encodeURIComponent(short + ' near ' + city);
    m.querySelector('.hd h3').textContent = city;
    m.querySelector('.bd').innerHTML =
      '<p><strong>' + short + ' near me in ' + city + '</strong> — see the nearest ' + lower + ' around ' + city + ' on the live map, sorted by distance.</p>' +
      '<div class="kv"><span>📍 ' + city + '</span><span>' + short + '</span><span>Live map</span><span>Free</span></div>' +
      '<p>Tap <em>Show on map</em> to plot ' + lower + ' around ' + city + ', or open Google Maps for directions.</p>' +
      '<div class="acts"><button class="go" type="button">Show on map</button><a class="gm" href="' + gm + '" target="_blank" rel="noopener">Google Maps</a></div>';
    m.querySelector('.go').onclick = function () { closeModal(); runSearch(city); };
    m.classList.add('open');
  }

  function runSearch(city) {
    var inp = document.getElementById('city'), go = document.getElementById('go');
    if (!inp || !go) return;
    inp.value = city; go.click();
    var mp = document.getElementById('map');
    if (mp && mp.scrollIntoView) mp.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function card(city) {
    return '<div class="nb-card" data-city="' + city + '" tabindex="0">' +
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
      if (cardEl) { openModal(cardEl.getAttribute('data-city')); return; }
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
    host.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('nb-card')) {
        openModal(e.target.getAttribute('data-city'));
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
