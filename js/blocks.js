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

  /* Network footer cards + ItemList schema (15 Oct 2026) — every near-me page. */
  function netFooter(){
    try {
      if (document.getElementById('nnet')) return;
      var NET=[{"i": "\ud83c\udfe2", "l": "Businesses near me", "c": "Local", "h": "https://mapsnearme.pages.dev/"}, {"i": "\u26a1", "l": "EV chargers near me", "c": "Travel", "h": "https://evchargersnearme.pages.dev/"}, {"i": "\ud83d\udebb", "l": "Public toilets near me", "c": "Essentials", "h": "https://toiletsnearme.pages.dev/"}, {"i": "\ud83d\udee3\ufe0f", "l": "Highway rest areas", "c": "Travel", "h": "https://restareanearme.pages.dev/"}, {"i": "\u26fd", "l": "CNG pumps near me", "c": "Fuel", "h": "https://cngpumpsnearme.pages.dev/"}, {"i": "\u26fd", "l": "Petrol pumps near me", "c": "Fuel", "h": "https://petrolpumpsnearme.pages.dev/"}, {"i": "\ud83e\ude78", "l": "Blood banks near me", "c": "Health", "h": "https://bloodbanksnearme.pages.dev/"}, {"i": "\ud83c\udfe7", "l": "ATMs near me", "c": "Money", "h": "https://atmsnearme.pages.dev/"}, {"i": "\ud83c\udfe6", "l": "Banks near me", "c": "Money", "h": "https://banksnearme.pages.dev/"}, {"i": "\ud83c\udfe5", "l": "Hospitals near me", "c": "Health", "h": "https://hospitalsnearme-9cp.pages.dev/"}, {"i": "\ud83d\udc8a", "l": "Medical shops near me", "c": "Health", "h": "https://medicalshopnearme.pages.dev/"}, {"i": "\ud83e\uddb7", "l": "Dentists near me", "c": "Health", "h": "https://dentistsnearme.pages.dev/"}, {"i": "\ud83c\udfe8", "l": "Hotels near me", "c": "Stay", "h": "https://hotelnearme.pages.dev/"}, {"i": "\ud83d\udecf\ufe0f", "l": "Lodges near me", "c": "Stay", "h": "https://lodgenearme.pages.dev/"}, {"i": "\ud83c\udf5b", "l": "Dhabas near me", "c": "Food", "h": "https://dhabanearme.pages.dev/"}, {"i": "\u2615", "l": "Cafes near me", "c": "Food", "h": "https://cafenearme.pages.dev/"}, {"i": "\ud83e\udd50", "l": "Bakeries near me", "c": "Food", "h": "https://bakerynearme.pages.dev/"}, {"i": "\ud83d\ude8c", "l": "Bus stops near me", "c": "Transit", "h": "https://busstopnearme.pages.dev/"}, {"i": "\ud83d\ude8f", "l": "Bus stations near me", "c": "Transit", "h": "https://busstationnearme.pages.dev/"}, {"i": "\ud83d\udefa", "l": "Auto stands near me", "c": "Transit", "h": "https://autostandnearme.pages.dev/"}, {"i": "\ud83d\udefa", "l": "E-rickshaw stands", "c": "Transit", "h": "https://erickshawstandnearme.pages.dev/"}, {"i": "\ud83c\udfcd\ufe0f", "l": "Bike stands near me", "c": "Transit", "h": "https://bikestandnearme.pages.dev/"}, {"i": "\ud83d\udd27", "l": "Bike repairs near me", "c": "Auto", "h": "https://bikerepairsnearme.pages.dev/"}, {"i": "\ud83d\ude97", "l": "Car repairs near me", "c": "Auto", "h": "https://carrepairsnearme.pages.dev/"}, {"i": "\ud83d\udede", "l": "Tyre shops near me", "c": "Auto", "h": "https://tirenearme.pages.dev/"}, {"i": "\ud83c\udd7f\ufe0f", "l": "Car parking near me", "c": "Auto", "h": "https://carparkingnearme.pages.dev/"}, {"i": "\ud83d\udd28", "l": "Hardware shops near me", "c": "Shops", "h": "https://hardwareshopnearme.pages.dev/"}, {"i": "\ud83e\uddf5", "l": "Tailor shops near me", "c": "Shops", "h": "https://tailorshopnearme.pages.dev/"}, {"i": "\ud83d\udc87", "l": "Salons near me", "c": "Shops", "h": "https://salonnearme.pages.dev/"}, {"i": "\ud83e\uddfa", "l": "Laundry near me", "c": "Shops", "h": "https://laundrynearme.pages.dev/"}, {"i": "\ud83c\udfcb\ufe0f", "l": "Gyms near me", "c": "Shops", "h": "https://gymnearme.pages.dev/"}, {"i": "\u26ea", "l": "Churches near me", "c": "Faith", "h": "https://churchesnearme.pages.dev/"}, {"i": "\ud83d\udd4c", "l": "Mosques near me", "c": "Faith", "h": "https://mosquesnearme.pages.dev/"}, {"i": "\ud83d\uded5", "l": "Temples near me", "c": "Faith", "h": "https://templesnearme.pages.dev/"}, {"i": "\u2696\ufe0f", "l": "Courts near me", "c": "Civic", "h": "https://courtnearme.pages.dev/"}, {"i": "\ud83d\ude93", "l": "Police stations near me", "c": "Civic", "h": "https://policestationsnearme.pages.dev/"}, {"i": "\ud83c\udfe4", "l": "Post offices near me", "c": "Civic", "h": "https://postofficenearme.pages.dev/"}, {"i": "\ud83d\udca1", "l": "Electricity offices", "c": "Civic", "h": "https://electricityofficenearme.pages.dev/"}, {"i": "\ud83c\udd94", "l": "Aadhaar centres near me", "c": "Civic", "h": "https://aadhaarcenternearme.pages.dev/"}, {"i": "\ud83c\udd94", "l": "Aadhaar Seva Kendra", "c": "Civic", "h": "https://aadhaar-seva-kendra-near-me.pages.dev/"}, {"i": "\ud83c\udf2b\ufe0f", "l": "Air quality near me", "c": "Live", "h": "https://airqualitynearme.pages.dev/"}, {"i": "\ud83c\udf0d", "l": "Earthquakes near me", "c": "Live", "h": "https://earthquakenearme.pages.dev/"}, {"i": "\ud83c\udf0a", "l": "Floods near me", "c": "Live", "h": "https://floodsnearme.pages.dev/"}, {"i": "\ud83d\ude80", "l": "ISRO launches", "c": "Live", "h": "https://isrotracker.pages.dev/"}, {"i": "\ud83d\udef0\ufe0f", "l": "ISS spotter", "c": "Live", "h": "https://issspotter.pages.dev/"}, {"i": "\ud83c\uddee\ud83c\uddf3", "l": "Bharat live", "c": "Live", "h": "https://bharatlive.pages.dev/"}, {"i": "\ud83d\udee1\ufe0f", "l": "Safe alleys", "c": "Safety", "h": "https://safealleys.pages.dev/"}, {"i": "\ud83d\udcdd", "l": "Exam results", "c": "Info", "h": "https://examstatus.india-in.workers.dev/"}, {"i": "\ud83c\udf15", "l": "Karva Chauth 2026", "c": "Seasonal", "h": "https://karvachauth.pages.dev/"}, {"i": "\ud83c\udfc5", "l": "Asian Games tally", "c": "Seasonal", "h": "https://asiangamesmedaltally2026.pages.dev/"}, {"i": "\ud83d\udee0\ufe0f", "l": "SKM tools", "c": "Info", "h": "https://skmtools.pages.dev/"}, {"i": "\ud83e\udded", "l": "Near Me directory", "c": "Info", "h": "https://demo-vmv.pages.dev/"}];
      var css='<style>.nnet{margin:2.4rem 0 1rem}.nnet h2{font-size:1.05rem;margin:0 0 .6rem;color:#0f172a}'
        +'.nnet-grid{list-style:none;margin:0;padding:0;display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(clamp(120px,40vw,170px),1fr))}'
        +'.nnet-grid a{display:flex;flex-direction:column;gap:.12rem;padding:.6rem .7rem;border:1px solid #e7ebf0;border-radius:12px;background:#fff;text-decoration:none;color:#12263f;height:100%;transition:transform .15s ease,box-shadow .15s ease}'
        +'.nnet-grid a:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(15,23,42,.12)}'
        +'.nnet-grid .i{font-size:1.2rem}.nnet-grid .t{font-weight:600;font-size:.85rem}.nnet-grid .c{font-size:.66rem;color:#64748b;text-transform:uppercase}'
        +'@media (prefers-reduced-motion:reduce){.nnet-grid a{transition:none}}</style>';
      var wrap=document.createElement('section'); wrap.id='nnet'; wrap.className='nnet';
      wrap.innerHTML=css+'<h2>More near me &amp; our network ('+NET.length+')</h2><ul class="nnet-grid">'
        +NET.map(function(n){return '<li><a href="'+n.h+'" rel="noopener"><span class="i">'+n.i+'</span><span class="t">'+n.l+'</span><span class="c">'+n.c+'</span></a></li>';}).join('')+'</ul>';
      var foot=document.querySelector('.foot');
      if (foot && foot.parentNode) foot.parentNode.insertBefore(wrap, foot); else document.body.appendChild(wrap);
      var ld={'@context':'https://schema.org','@type':'ItemList',name:'SKM Studio Network — near-me directories',numberOfItems:NET.length,
        itemListElement:NET.map(function(n,i){return {'@type':'ListItem',position:i+1,item:{'@type':'WebSite',name:n.l,url:n.h}};})};
      var s=document.createElement('script'); s.type='application/ld+json'; s.textContent=JSON.stringify(ld); document.head.appendChild(s);
    } catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', netFooter); else netFooter();

})();
