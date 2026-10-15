const QS = id => document.getElementById(id);
let map, layer, here = null;
function initMap(lat, lng, z) {
  if (map) return;
  map = L.map('map').setView([lat || 22.97, lng || 78.66], z || 5);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  layer = L.layerGroup().addTo(map);
}
function dist(a, b, c, d) {
  const R = 6371, r = x => x * Math.PI / 180;
  const dl = r(c - a), dn = r(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
async function overpass(tags, lat, lng, radius) {
  const parts = tags.map(function (kv) {
    const k = kv[0], v = kv[1];
    return 'node["' + k + '"="' + v + '"](around:' + radius + ',' + lat + ',' + lng + ');' +
           'way["' + k + '"="' + v + '"](around:' + radius + ',' + lat + ',' + lng + ');';
  }).join('');
  const q = '[out:json][timeout:25];(' + parts + ');out center 60;';
  const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) });
  return (await r.json()).elements;
}
function render(el, lat, lng) {
  const t = el.tags || {};
  const name = t.name || t.operator || (window.CAT && CAT.label) || 'Place';
  const clat = el.lat || (el.center && el.center.lat), clon = el.lon || (el.center && el.center.lon);
  const d = dist(lat, lng, clat, clon);
  const dir = 'https://www.google.com/maps/dir/' + clat + ',' + clon;
  const tel = t.phone ? '<a href="tel:' + t.phone + '">Call</a>' : '';
  const web = t.website ? '<a href="' + t.website + '" target="_blank" rel="noopener">Website</a>' : '';
  return '<article class="card"><h3>' + name + '</h3>' +
    '<div class="meta">' + d.toFixed(2) + ' km away</div>' +
    '<div class="meta">' + (t['addr:full'] || t['addr:street'] || '') + '</div>' +
    '<div class="row"><a class="p" href="' + dir + '" target="_blank" rel="noopener">Directions</a>' + tel + web + '</div></article>';
}
async function search(lat, lng, label) {
  here = [lat, lng]; initMap(lat, lng, 13); if (layer) layer.clearLayers();
  QS('status').textContent = 'Searching OpenStreetMap...';
  try {
    const els = await overpass(CAT.tags, lat, lng, QS('radius').value * 1000);
    const withC = els.map(function (e) { return { e: e, la: e.lat || (e.center && e.center.lat), lo: e.lon || (e.center && e.center.lon) }; })
      .filter(function (x) { return x.la && x.lo; })
      .sort(function (a, b) { return dist(lat, lng, a.la, a.lo) - dist(lat, lng, b.la, b.lo); });
    QS('out').innerHTML = withC.length ? withC.map(function (x) { return render(x.e, lat, lng); }).join('') : '<p class="status">Nothing found in this radius. Try a bigger radius.</p>';
    withC.forEach(function (x) { L.marker([x.la, x.lo]).addTo(layer).bindPopup(html(x.e)); });
    try {
      var old = document.getElementById('ld-results'); if (old) old.remove();
      var ld = { '@context':'https://schema.org','@type':'ItemList',
        name:((window.CAT&&CAT.label)||'Near me')+' — results',
        numberOfItems: withC.length,
        itemListElement: withC.slice(0,50).map(function (x,i) { var t=x.e.tags||{};
          return { '@type':'ListItem', position:i+1, item:{ '@type':(t.amenity||t.shop)?'LocalBusiness':'Place',
            name:(t.name||t.operator||'Place'), url:t.website||undefined, telephone:t.phone||undefined,
            geo:{ '@type':'GeoCoordinates', latitude:x.la, longitude:x.lo },
            address:{ '@type':'PostalAddress', streetAddress:t['addr:street']||undefined, addressLocality:t['addr:city']||undefined, addressCountry:'IN' } } }; }) };
      var s=document.createElement('script'); s.type='application/ld+json'; s.id='ld-results'; s.textContent=JSON.stringify(ld); document.head.appendChild(s);
    } catch(e){}

    QS('status').textContent = withC.length + ' places found near ' + (label || 'you');
  } catch (e) { QS('status').textContent = 'Could not reach OpenStreetMap. Try again.'; }
}
function html(e) { const t = e.tags || {}; return (t.name || 'Unnamed') + '<br>' + (t['addr:street'] || ''); }
QS('geo').onclick = function () {
  QS('status').textContent = 'Getting your location...';
  if (!navigator.geolocation) { QS('status').textContent = 'Geolocation not supported. Type a city.'; return; }
  navigator.geolocation.getCurrentPosition(
    function (p) { search(p.coords.latitude, p.coords.longitude, 'you'); },
    function () { QS('status').textContent = 'Location blocked. Type a city instead.'; }
  );
};
QS('go').onclick = async function () {
  const c = QS('city').value.trim();
  if (!c) return;
  QS('status').textContent = 'Locating ' + c + '...';
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search' + encodeURIComponent(c));
    const j = await r.json();
    if (j[0]) search(parseFloat(j[0].lat), parseFloat(j[0].lon), c);
    else QS('status').textContent = 'City not found.';
  } catch (e) { QS('status').textContent = 'Geocoder unavailable.'; }
};
initMap();
