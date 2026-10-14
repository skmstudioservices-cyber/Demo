const QS=id=>document.getElementById(id);
let map, layer, here=null;
function initMap(lat=22.97,lng=78.66,z=5){
  if(map) return; map=L.map('map').setView([lat,lng],z);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  layer=L.layerGroup().addTo(map);
}
function dist(a,b,c,d){const R=6371,r=x=>x*Math.PI/180;const dl=r(c-a),dn=r(d-b);
  const h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
async function overpass(tags,lat,lng,radius){
  const parts=tags.map(([k,v])=>`node["${k}"="${v}"](around:${radius},${lat},${lng});way["${k}"="${v}"](around:${radius},${lat},${lng});`).join('');
  const q=`[out:json][timeout:25];(${parts});out center 60;`;
  const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q)});
  return (await r.json()).elements;
}
function render(el,lat,lng){
  const name=el.tags?.name||el.tags?.operator||CAT.label;
  const d=dist(lat,lng,el.lat||el.center.lat,el.lon||el.center.lon);
  const clat=el.lat||el.center.lat, clon=el.lon||el.center.lon;
  const dir=`https://www.google.com/maps/dir/
  const tel=el.tags?.phone?`<a href="tel:${el.tags.phone}">Call</a>`:'';
  const web=el.tags?.website?`<a href="${el.tags.website}" target="_blank" rel="noopener">Website</a>`:'';
  return `<article class="card"><h3>${name}</h3>
    <div class="meta">${d.toFixed(2)} km away</div>
    <div class="meta">${el.tags?.['addr:full']||el.tags?.['addr:street']||''}</div>
    <div class="row"><a class="p" href="${dir}" target="_blank" rel="noopener">Directions</a>${tel}${web}</div></article>`;
}
async function search(lat,lng,label){
  here=[lat,lng]; initMap(lat,lng,13); layer.clearLayers();
  QS('status').textContent='Searching OpenStreetMap…';
  try{
    const els=await overpass(CAT.tags,lat,lng,QS('radius').value*1000);
    const withC=els.map(e=>({e,la:e.lat||e.center?.lat,lo:e.lon||e.center?.lon})).filter(x=>x.la&&x.lo)
      .sort((a,b)=>dist(lat,lng,a.la,a.lo)-dist(lat,lng,b.la,b.lo));
    QS('out').innerHTML=withC.length?withC.map(x=>render(x.e,lat,lng)).join(''):'<p class="status">Nothing found in this radius. Try a bigger radius.</p>';
    withC.forEach(x=>L.marker([x.la,x.lo]).addTo(layer).bindPopup(html(x.e)));
    QS('status').textContent=withC.length+' places found near '+(label||'you');
  }catch(e){ QS('status').textContent='Could not reach OpenStreetMap. Try again.'; }
}
function html(e){return (e.tags?.name||'Unnamed')+'<br>'+(e.tags?.['addr:street']||'');}
QS('geo').onclick=()=>{
  QS('status').textContent='Getting your location…';
  if(!navigator.geolocation){ QS('status').textContent='Geolocation not supported. Type a city.'; return; }
  navigator.geolocation.getCurrentPosition(
    p=>search(p.coords.latitude,p.coords.longitude,'you'),
    ()=>QS('status').textContent='Location blocked. Type a city instead.'
  );
};
QS('go').onclick=async()=>{const c=QS('city').value.trim();if(!c)return;
  QS('status').textContent='Locating '+c+'…';
  try{const r=await fetch('https://nominatim.openstreetmap.org/search'+encodeURIComponent(c));
    const j=await r.json(); if(j[0]) search(parseFloat(j[0].lat),parseFloat(j[0].lon),c); else QS('status').textContent='City not found.';}
  catch{QS('status').textContent='Geocoder unavailable.';}};
initMap();
