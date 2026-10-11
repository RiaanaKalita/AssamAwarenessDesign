/* Tide Turn — interactive school project. Live data layers require an internet connection. */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

function showPage(name) {
  const target = $(`#page-${name}`);
  if (!target) return;
  $$('.page').forEach(p => p.classList.toggle('active', p === target));
  $$('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.page === name));
  if (name === 'tracker' && floodMap) setTimeout(() => floodMap.invalidateSize(), 180);
  if (name === 'help' && clinicMap) setTimeout(() => clinicMap.invalidateSize(), 180);
  if (name === 'information' && populationChart) setTimeout(() => populationChart.resize(), 180);
}
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-page]');
  if (btn) showPage(btn.dataset.page);
});

/* Safety steps */
const safetySteps = {
  before: [
    ['Know your risk','Learn whether your home, school or route is in a flood-prone area.'],
    ['Follow official alerts','Check ASDMA and district administration updates; do not rely on rumours.'],
    ['Plan where to go','Agree on a safe meeting place and evacuation route with your family.'],
    ['Pack essentials','Prepare water, food, medicines, torch, batteries and a first-aid kit.'],
    ['Protect documents','Place copies of IDs, prescriptions and medical details in a waterproof pouch.'],
    ['Charge devices','Charge phones and power banks; keep important contacts written on paper.']
  ],
  during: [
    ['Move when told','Evacuate promptly if authorities instruct you to leave.'],
    ['Reach safer ground','Move to designated shelters or higher ground away from rivers and drains.'],
    ['Never cross floodwater','Do not walk, swim or drive through moving or unknown-depth water.'],
    ['Avoid electricity hazards','Stay away from fallen power lines and electrical equipment in wet areas.'],
    ['Keep drinking water safe','Use sealed or officially treated water; follow public-health guidance.'],
    ['Keep in contact','Tell a trusted person where you are when it is safe to do so.']
  ],
  after: [
    ['Wait for clearance','Return only when local authorities say the area is safe.'],
    ['Avoid standing water','It may hide open drains, sharp debris, sewage or electrical hazards.'],
    ['Check water safety','Do not drink tap or well water unless authorities confirm it is safe.'],
    ['Use protective gear','Wear sturdy shoes and gloves when cleaning up.'],
    ['Watch for health risks','Seek medical advice for injuries, fever or contact with contaminated water.'],
    ['Document damage safely','Take photos only from a safe location and report urgent hazards.']
  ]
};
function renderSteps(stage) {
  $$('.stage-tab').forEach(b => {
    const active = b.dataset.stage === stage;
    b.classList.toggle('selected', active);
    b.setAttribute('aria-selected', String(active));
  });
  $('#stageContent').innerHTML = safetySteps[stage].map((s,i) =>
    `<article class="step-card"><span class="step-number">${i+1}</span><div><strong>${s[0]}</strong><p>${s[1]}</p></div></article>`
  ).join('');
}
$$('.stage-tab').forEach(b => b.addEventListener('click', () => renderSteps(b.dataset.stage)));
renderSteps('before');

const kitItems = ['Drinking water','Non-perishable food','Regular medicines','First-aid supplies','Torch and spare batteries','Power bank and phone charger','Copies of key documents','Soap, masks and hygiene items'];
const kitList = $('#kitList');
kitList.innerHTML = kitItems.map((item,i)=>`<label class="kit-item"><input type="checkbox" data-kit="${i}"><span>${item}</span></label>`).join('');
function updateKit() {
  const checked = $$('[data-kit]:checked').length;
  $('#kitProgress').style.width = `${checked/kitItems.length*100}%`;
  $('#kitCount').textContent = `${checked} of ${kitItems.length} packed`;
}
kitList.addEventListener('change', updateKit);

/* Verified historical figures from ASDMA reports, not live/current readings. */
let populationChart;
function initChart() {
  if (!window.Chart || populationChart) return;
  const ctx = $('#populationChart');
  populationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['2020','2021','2022','2023','2024'],
      datasets: [{
        label: 'People affected (lakh)',
        data: [57.8913, 9.09718, 88.5, 13.47, 42.95],
        backgroundColor: ['#9bcfdd','#9bcfdd','#0E4C92','#9bcfdd','#FA6C5D'],
        borderRadius: 6, borderSkipped: false, maxBarThickness: 46
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: {duration: 450},
      plugins: {
        legend: {display:false},
        tooltip: {callbacks:{label: c => `${c.raw.toLocaleString('en-IN',{maximumFractionDigits:2})} lakh people affected`}}
      },
      scales: {
        x: {grid:{display:false}, ticks:{color:'#637d88',font:{family:'Nunito Sans',weight:'700'}}, border:{display:false}},
        y: {beginAtZero:true, suggestedMax:100, grid:{color:'#e9f0f2'}, border:{display:false},
          title:{display:true,text:'People affected (lakh)',color:'#5c7682',font:{family:'Nunito Sans',size:10,weight:'700'}},
          ticks:{color:'#718691',stepSize:20,callback:v=>`${v}L`}}
      }
    }
  });
}
initChart();

/* Interactive map. Street map works independently of optional NASA imagery. */
let floodMap, baseLayer, satelliteLayer, satelliteOn=false;
function initFloodMap() {
  if (!window.L || floodMap) return;
  floodMap = L.map('floodMap', {scrollWheelZoom:true}).setView([26.2,92.9],5);
  baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19, attribution:'&copy; OpenStreetMap contributors'
  }).addTo(floodMap);
  L.marker([26.2,92.9]).addTo(floodMap).bindPopup('<strong>Assam, India</strong><br>Check official state and district flood reports for current warnings.');
  // NASA GIBS daily true-colour imagery; an imagery overlay, not an automated flood detector.
  const today = new Date();
  const day = new Date(today.getTime() - 2*24*60*60*1000);
  const date = `${day.getUTCFullYear()}-${String(day.getUTCMonth()+1).padStart(2,'0')}-${String(day.getUTCDate()).padStart(2,'0')}`;
  satelliteLayer = L.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,{
    maxZoom:9, opacity:.82, attribution:'Imagery: NASA GIBS / MODIS'
  });
  $('#satelliteBtn').addEventListener('click',()=>{
    satelliteOn=!satelliteOn;
    if(satelliteOn) satelliteLayer.addTo(floodMap); else floodMap.removeLayer(satelliteLayer);
    $('#satelliteBtn').classList.toggle('active',satelliteOn);
    $('#baseMapBtn').classList.toggle('active',!satelliteOn);
  });
  $('#baseMapBtn').addEventListener('click',()=>{
    satelliteOn=false; floodMap.removeLayer(satelliteLayer);
    $('#satelliteBtn').classList.remove('active'); $('#baseMapBtn').classList.add('active');
  });
  $('#assamView').addEventListener('click',()=>floodMap.setView([26.2,92.9],7));
}
initFloodMap();

/* Clinic locator: geocode a typed place, then query mapped health facilities. */
let clinicMap, clinicMarkers;
function initClinicMap() {
  if (!window.L || clinicMap) return;
  clinicMap=L.map('clinicMap').setView([26.1445,91.7362],11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,attribution:'&copy; OpenStreetMap contributors'
  }).addTo(clinicMap);
  clinicMarkers=L.layerGroup().addTo(clinicMap);
}
initClinicMap();
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function findClinics(place) {
  const status=$('#clinicStatus'), results=$('#clinicResults');
  status.textContent='Searching map data…'; results.innerHTML=''; clinicMarkers.clearLayers();
  try {
    const geoUrl=`https://nominatim.openstreetmap.org/search?format=json&limit=1&country=India&q=${encodeURIComponent(place+', Assam, India')}`;
    const geoRes=await fetch(geoUrl,{headers:{'Accept':'application/json'}});
    if(!geoRes.ok) throw new Error('Place search is temporarily unavailable.');
    const geos=await geoRes.json();
    if(!geos.length) {status.textContent='Could not find that place. Try a town or district name in Assam.';return;}
    const loc=geos[0], lat=Number(loc.lat), lon=Number(loc.lon);
    clinicMap.setView([lat,lon],12);
    L.marker([lat,lon]).addTo(clinicMarkers).bindPopup(`<strong>${escapeHtml(loc.display_name.split(',').slice(0,2).join(','))}</strong><br>Search location`).openPopup();
    const q=`[out:json][timeout:20];(node["amenity"~"hospital|clinic|doctors"](around:12000,${lat},${lon});way["amenity"~"hospital|clinic|doctors"](around:12000,${lat},${lon});relation["amenity"~"hospital|clinic|doctors"](around:12000,${lat},${lon}););out center tags;`;
    const overpass=await fetch('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q));
    if(!overpass.ok) throw new Error('The facility database is busy. Please try again in a little while.');
    const data=await overpass.json();
    const facilities=(data.elements||[]).map(el=>{
      const la=el.lat ?? el.center?.lat, lo=el.lon ?? el.center?.lon;
      return {lat:la,lon:lo,name:el.tags?.name||'Unnamed medical facility',type:el.tags?.amenity||'medical facility',address:[el.tags?.['addr:street'],el.tags?.['addr:city']].filter(Boolean).join(', ')};
    }).filter(f=>Number.isFinite(f.lat)&&Number.isFinite(f.lon)).sort((a,b)=>distanceKm(lat,lon,a.lat,a.lon)-distanceKm(lat,lon,b.lat,b.lon)).slice(0,18);
    facilities.forEach(f=>{
      L.marker([f.lat,f.lon]).addTo(clinicMarkers).bindPopup(`<strong>${escapeHtml(f.name)}</strong><br>${escapeHtml(f.type)}${f.address?'<br>'+escapeHtml(f.address):''}`);
    });
    if(!facilities.length) {
      status.textContent='No mapped clinics or hospitals were returned nearby. Try a larger town; map data may be incomplete.';
      results.innerHTML='';
    } else {
      status.textContent=`Found ${facilities.length} mapped medical facilities within approximately 12 km. Listings may be incomplete; call ahead.`;
      results.innerHTML=facilities.slice(0,6).map(f=>`<div class="clinic-result"><strong>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.type)}</span></div>`).join('');
    }
  } catch(err) {
    status.textContent=(err && err.message) ? err.message : 'Could not load facility data. Check your connection and try again.';
  }
}
function distanceKm(a,b,c,d) {const r=Math.PI/180, x=(c-a)*r,y=(d-b)*r;return 6371*2*Math.asin(Math.sqrt(Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2));}
$('#clinicForm').addEventListener('submit', e=>{e.preventDefault();const q=$('#clinicQuery').value.trim();if(q)findClinics(q);});
findClinics('Guwahati, Assam');

/* Five-question safety quiz */
const questions=[
 {q:'What should you do if officials tell your neighbourhood to evacuate?',a:['Wait until water reaches your home','Leave promptly using the advised route','Go to the river to check the level','Drive through the fastest-looking water'],correct:1,why:'Follow evacuation instructions promptly and use the route advised by local authorities.'},
 {q:'Why should you never walk or drive through floodwater?',a:['It always contains salt','It may hide depth, currents and hazards','It is only dangerous at night','It makes shoes dirty'],correct:1,why:'Floodwater can be deeper or faster than it looks and may hide drains, debris or electrical hazards.'},
 {q:'Which is best to keep important medical information safer?',a:['Leave papers beside a window','Take only photos of medicine packets','Keep copies in a waterproof pouch','Post medical details publicly'],correct:2,why:'A waterproof pouch can help protect paper copies of prescriptions and key medical details.'},
 {q:'After a flood, when should you return to a damaged area?',a:['As soon as the rain stops','Only when authorities say it is safe','When neighbours start cleaning','Whenever the water looks shallow'],correct:1,why:'Floodwater can leave hidden structural, electrical and contamination risks even after it recedes.'},
 {q:'Which is a reliable source for Assam flood situation reports?',a:['An unverified forwarded message','A random social media comment','Assam State Disaster Management Authority','A guess based on yesterday’s weather'],correct:2,why:'Use official ASDMA and district administration reports for warnings and current situation updates.'}
];
let quizIndex=0, quizScore=0, quizAnswered=false;
function renderQuestion(){
 const q=questions[quizIndex]; quizAnswered=false;
 $('#quizQuestionNumber').textContent=`QUESTION ${quizIndex+1} OF ${questions.length}`;
 $('#quizQuestion').textContent=q.q; $('#quizFeedback').textContent='';
 $('#nextQuestion').disabled=true; $('#nextQuestion').textContent=quizIndex===questions.length-1?'See results →':'Next question →';
 $('#quizAnswers').innerHTML=q.a.map((a,i)=>`<button class="quiz-answer" data-answer="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join('');
 $('#quizScore').textContent=`${quizScore} / ${questions.length}`;
 $('#quizProgress').style.width=`${quizIndex/questions.length*100}%`;
}
$('#quizAnswers').addEventListener('click',e=>{
 const b=e.target.closest('[data-answer]'); if(!b||quizAnswered)return;
 quizAnswered=true;const q=questions[quizIndex],picked=Number(b.dataset.answer);
 $$('.quiz-answer').forEach(x=>{x.disabled=true;const i=Number(x.dataset.answer);if(i===q.correct)x.classList.add('correct');else if(i===picked)x.classList.add('wrong');});
 if(picked===q.correct)quizScore++;
 $('#quizFeedback').textContent=(picked===q.correct?'Correct! ':'Not quite. ')+q.why;
 $('#quizScore').textContent=`${quizScore} / ${questions.length}`;
 $('#quizProgress').style.width=`${(quizIndex+1)/questions.length*100}%`;
 $('#nextQuestion').disabled=false;
});
$('#nextQuestion').addEventListener('click',()=>{
 if(!quizAnswered)return;
 if(quizIndex<questions.length-1){quizIndex++;renderQuestion();}
 else {
  $('#quizQuestionNumber').textContent='QUIZ COMPLETE';
  $('#quizQuestion').textContent=quizScore>=4?'Great work — you know the key safety basics!':'Good effort — review the safety steps and try again.';
  $('#quizAnswers').innerHTML='';$('#quizFeedback').textContent=`You scored ${quizScore} out of ${questions.length}. Remember: official local guidance comes first.`;
  $('#nextQuestion').disabled=true;$('#nextQuestion').textContent='Completed';
 }
});
$('#resetQuiz').addEventListener('click',()=>{quizIndex=0;quizScore=0;renderQuestion();});
renderQuestion();

/* Ensure maps resize correctly when sections open. */
window.addEventListener('resize',()=>{
 if(floodMap)floodMap.invalidateSize();
 if(clinicMap)clinicMap.invalidateSize();
 if(populationChart)populationChart.resize();
});

// Resize map canvases after their hidden sections become visible.
document.addEventListener('click', e => {
 const btn=e.target.closest('[data-page]');
 if(!btn) return;
 const page=btn.dataset.page;
 requestAnimationFrame(()=>{
   if(page==='tracker' && floodMap) floodMap.invalidateSize();
   if(page==='help' && clinicMap) clinicMap.invalidateSize();
   if(page==='information' && populationChart) populationChart.resize();
 });
});
