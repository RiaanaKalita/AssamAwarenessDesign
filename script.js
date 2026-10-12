/* Tide Turn: navigation, flood guidance, maps, charts and the quiz. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let floodMap, clinicMap, clinicMarkers, populationChart, districtChart, satelliteLayer;
let satelliteOn = false;

function showPage(name, anchor) {
  const page = $(`#page-${name}`);
  if (!page) return;
  $$('.page').forEach(item => item.classList.toggle('active', item === page));
  $$('.nav-link').forEach(item => item.classList.toggle('active', item.dataset.page === name));
  page.scrollTop = 0;
  requestAnimationFrame(() => {
    if (name === 'safety') {
      floodMap?.invalidateSize();
      clinicMap?.invalidateSize();
    }
    if (name === 'information') {
      populationChart?.resize();
      districtChart?.resize();
    }
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-page]');
  if (button) showPage(button.dataset.page, button.dataset.scroll);
});

/* If a photo host is unavailable, show a bundled illustrated scene instead of a blank box. */
$$('img[data-fallback]').forEach(img => {
  img.addEventListener('error', () => {
    if (img.dataset.fallback && !img.dataset.fallbackUsed) {
      img.dataset.fallbackUsed = 'true';
      img.src = img.dataset.fallback;
    }
  });
  if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
});

/* Before / during / after flood guidance. */
const safetySteps = {
  before: [
    ['Know your risk', 'Learn whether your home, school or route is in a flood-prone area.'],
    ['Follow official alerts', 'Check ASDMA and district administration updates; do not rely on rumours.'],
    ['Plan where to go', 'Agree on a safe meeting place and evacuation route with your family.'],
    ['Pack essentials', 'Prepare water, food, medicines, a torch, batteries and first-aid supplies.'],
    ['Protect documents', 'Keep copies of IDs and medical details in a waterproof pouch.'],
    ['Charge devices', 'Charge phones and power banks; keep key contacts written on paper.']
  ],
  during: [
    ['Move when told', 'Evacuate promptly if authorities instruct you to leave.'],
    ['Reach safer ground', 'Use designated shelters or higher ground away from rivers and drains.'],
    ['Never cross floodwater', 'Do not walk, swim or drive through moving or unknown-depth water.'],
    ['Avoid electricity hazards', 'Stay away from fallen power lines and electrical equipment in wet areas.'],
    ['Keep water safe', 'Use sealed or officially treated drinking water and follow public-health guidance.'],
    ['Keep in contact', 'Tell a trusted person where you are when it is safe to do so.']
  ],
  after: [
    ['Wait for clearance', 'Return only when local authorities say the area is safe.'],
    ['Avoid standing water', 'It may hide open drains, debris, sewage or electrical hazards.'],
    ['Check water safety', 'Do not drink tap or well water unless authorities confirm it is safe.'],
    ['Use protective gear', 'Wear sturdy shoes and gloves when cleaning up.'],
    ['Watch for health risks', 'Seek medical advice for injuries or illness after floodwater exposure.'],
    ['Report hazards safely', 'Record damage only from a safe location and report urgent hazards.']
  ]
};
function renderSteps(stage) {
  $$('.stage-tab').forEach(tab => {
    const active = tab.dataset.stage === stage;
    tab.classList.toggle('selected', active);
    tab.setAttribute('aria-selected', String(active));
  });
  $('#stageContent').innerHTML = safetySteps[stage].map((step, index) =>
    `<article class="step-card"><span class="step-number">${index + 1}</span><div><strong>${step[0]}</strong><p>${step[1]}</p></div></article>`
  ).join('');
}
$$('.stage-tab').forEach(tab => tab.addEventListener('click', () => renderSteps(tab.dataset.stage)));
renderSteps('before');

/* Emergency kit checklist: progress updates immediately and is not uploaded anywhere. */
const kitItems = ['Drinking water', 'Non-perishable food', 'Regular medicines', 'First-aid supplies', 'Torch and spare batteries', 'Power bank and phone charger', 'Copies of key documents', 'Soap and hygiene items'];
$('#kitList').innerHTML = kitItems.map((item, index) =>
  `<label class="kit-item"><input type="checkbox" data-kit="${index}"><span>${item}</span></label>`
).join('');
function updateKit() {
  const count = $$('[data-kit]:checked').length;
  $('#kitProgress').style.width = `${count / kitItems.length * 100}%`;
  $('#kitCount').textContent = `${count} of ${kitItems.length} packed`;
}
$('#kitList').addEventListener('change', updateKit);

/* Historical ASDMA-reported figures, in lakh people. These are not live readings. */
function initCharts() {
  if (!window.Chart) return;
  const barCanvas = $('#populationChart');
  if (barCanvas && !populationChart) {
    populationChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: ['2020', '2021', '2022'],
        datasets: [{
          label: 'People affected (lakh)',
          data: [57.89, 5.74, 57.50],
          backgroundColor: ['#89CFEF', '#B5DFED', '#0E4C92'],
          borderRadius: 6, borderSkipped: false, maxBarThickness: 42
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: item => `${item.raw.toFixed(2)} lakh people affected` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#526F7E', font: { family: 'Nunito Sans', weight: '700' } }, border: { display: false } },
          y: { beginAtZero: true, max: 70, grid: { color: '#E5F0F4' }, border: { display: false },
            title: { display: true, text: 'People affected (lakh)', color: '#526F7E', font: { size: 10, weight: '700' } },
            ticks: { stepSize: 10, color: '#526F7E', callback: value => `${value}L` } }
        }
      }
    });
  }
  const donutCanvas = $('#districtChart');
  if (donutCanvas && !districtChart) {
    districtChart = new Chart(donutCanvas, {
      type: 'doughnut',
      data: { labels: ['2020 · 57.89 lakh', '2021 · 5.74 lakh', '2022 · 57.50 lakh'], datasets: [{ data: [57.89, 5.74, 57.50], backgroundColor: ['#0E4C92', '#89CFEF', '#4B9DC1'], borderWidth: 2, borderColor: '#FFFFFF', hoverOffset: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '76%', plugins: {
        legend: { position: 'bottom', labels: { color: '#526F7E', boxWidth: 9, padding: 10, font: { size: 9, family: 'Nunito Sans' } } },
        tooltip: { callbacks: { label: item => `${item.label} people affected` } }
      } }
    });
  }
}
initCharts();

/* The flood map is a real interactive OpenStreetMap. Satellite imagery is optional context, not a flood detector. */
function initFloodMap() {
  if (!window.L || floodMap) return;
  floodMap = L.map('floodMap', { scrollWheelZoom: true }).setView([26.2, 92.9], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
  }).addTo(floodMap);
  L.marker([26.2, 92.9]).addTo(floodMap).bindPopup('<strong>Assam, India</strong><br>Check official ASDMA and district reports for current flood warnings.');
  const date = new Date(Date.now() - 2 * 86400000);
  const dateText = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  satelliteLayer = L.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateText}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`, {
    maxZoom: 9, opacity: .82, attribution: 'Satellite imagery: NASA GIBS / MODIS'
  });
  $('#satelliteBtn').addEventListener('click', () => {
    satelliteOn = !satelliteOn;
    satelliteOn ? satelliteLayer.addTo(floodMap) : floodMap.removeLayer(satelliteLayer);
    $('#satelliteBtn').classList.toggle('active', satelliteOn);
    $('#baseMapBtn').classList.toggle('active', !satelliteOn);
  });
  $('#baseMapBtn').addEventListener('click', () => {
    satelliteOn = false;
    floodMap.removeLayer(satelliteLayer);
    $('#satelliteBtn').classList.remove('active');
    $('#baseMapBtn').classList.add('active');
  });
  $('#assamView').addEventListener('click', () => floodMap.setView([26.2, 92.9], 7));
}
initFloodMap();

/* Clinic search uses OpenStreetMap's public place search and Overpass facility data. */
function initClinicMap() {
  if (!window.L || clinicMap) return;
  clinicMap = L.map('clinicMap').setView([26.1445, 91.7362], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
  }).addTo(clinicMap);
  clinicMarkers = L.layerGroup().addTo(clinicMap);
}
initClinicMap();
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function distanceKm(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180, dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
async function findClinics(place) {
  const status = $('#clinicStatus'), results = $('#clinicResults');
  status.textContent = 'Searching mapped medical facilities…';
  results.innerHTML = '';
  clinicMarkers?.clearLayers();
  try {
    const geocode = `https://nominatim.openstreetmap.org/search?format=json&limit=1&country=India&q=${encodeURIComponent(place + ', Assam, India')}`;
    const geoResponse = await fetch(geocode, { headers: { Accept: 'application/json' } });
    if (!geoResponse.ok) throw new Error('Place search is busy. Please try again shortly.');
    const places = await geoResponse.json();
    if (!places.length) throw new Error('Place not found. Try a town or district in Assam.');
    const placeData = places[0], lat = Number(placeData.lat), lon = Number(placeData.lon);
    clinicMap.setView([lat, lon], 12);
    L.marker([lat, lon]).addTo(clinicMarkers).bindPopup(`<strong>${escapeHtml(placeData.display_name.split(',').slice(0, 2).join(', '))}</strong><br>Search location`);
    const query = `[out:json][timeout:20];(node["amenity"~"hospital|clinic|doctors"](around:12000,${lat},${lon});way["amenity"~"hospital|clinic|doctors"](around:12000,${lat},${lon});relation["amenity"~"hospital|clinic|doctors"](around:12000,${lat},${lon}););out center tags;`;
    const response = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    if (!response.ok) throw new Error('The medical-facility database is busy. Try again shortly.');
    const data = await response.json();
    const facilities = (data.elements || []).map(item => ({
      lat: item.lat ?? item.center?.lat, lon: item.lon ?? item.center?.lon,
      name: item.tags?.name || 'Unnamed medical facility', type: item.tags?.amenity || 'medical facility'
    })).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lon))
      .sort((a, b) => distanceKm(lat, lon, a.lat, a.lon) - distanceKm(lat, lon, b.lat, b.lon)).slice(0, 18);
    facilities.forEach(item => L.marker([item.lat, item.lon]).addTo(clinicMarkers)
      .bindPopup(`<strong>${escapeHtml(item.name)}</strong><br>${escapeHtml(item.type)}`));
    if (!facilities.length) {
      status.textContent = 'No nearby facilities were returned. Try a larger town; map listings may be incomplete.';
      return;
    }
    status.textContent = `Found ${facilities.length} mapped facilities within about 12 km. Listings may be incomplete; call ahead.`;
    results.innerHTML = facilities.slice(0, 6).map(item =>
      `<div class="clinic-result"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.type)}</span></div>`
    ).join('');
  } catch (error) {
    status.textContent = error.message || 'Could not load facility data. Check your connection and try again.';
  }
}
$('#clinicForm').addEventListener('submit', event => {
  event.preventDefault();
  const place = $('#clinicQuery').value.trim();
  if (place) findClinics(place);
});
findClinics('Guwahati');

/* Five-question quiz with answer feedback, progress, score and restart. */
const questions = [
  { q: 'What should you do if officials tell your neighbourhood to evacuate?', a: ['Wait until water reaches your home', 'Leave promptly using the advised route', 'Go to the river to check the level', 'Drive through the fastest-looking water'], correct: 1, why: 'Follow evacuation instructions promptly and use the route advised by local authorities.' },
  { q: 'Why should you never walk or drive through floodwater?', a: ['It always contains salt', 'It may hide depth, currents and hazards', 'It is only dangerous at night', 'It makes shoes dirty'], correct: 1, why: 'Floodwater can be deeper or faster than it looks and may hide drains, debris or electrical hazards.' },
  { q: 'Which is best for protecting important medical information?', a: ['Leave papers beside a window', 'Post medical details publicly', 'Keep copies in a waterproof pouch', 'Store papers loose in a bag'], correct: 2, why: 'A waterproof pouch can help protect paper copies of prescriptions and key medical details.' },
  { q: 'After a flood, when should you return to a damaged area?', a: ['As soon as rain stops', 'Only when authorities say it is safe', 'When neighbours start cleaning', 'When water looks shallow'], correct: 1, why: 'Floodwater can leave structural, electrical and contamination risks after it recedes.' },
  { q: 'Which source should you use for Assam flood situation reports?', a: ['An unverified forwarded message', 'A random social media comment', 'Assam State Disaster Management Authority', 'A guess based on yesterday’s weather'], correct: 2, why: 'Use official ASDMA and district administration reports for warnings and current situation updates.' }
];
let quizIndex = 0, quizScore = 0, quizAnswered = false, quizComplete = false;
function renderQuestion() {
  const question = questions[quizIndex];
  quizAnswered = false; quizComplete = false;
  $('#quizQuestionNumber').textContent = `QUESTION ${quizIndex + 1} OF ${questions.length}`;
  $('#quizQuestion').textContent = question.q;
  $('#quizFeedback').textContent = '';
  $('#nextQuestion').disabled = true;
  $('#nextQuestion').textContent = quizIndex === questions.length - 1 ? 'See results →' : 'Next question →';
  $('#quizAnswers').innerHTML = question.a.map((answer, index) =>
    `<button class="quiz-answer" data-answer="${index}">${String.fromCharCode(65 + index)}. ${answer}</button>`
  ).join('');
  $('#quizScore').textContent = `${quizScore} / ${questions.length}`;
  $('#quizProgress').style.width = `${quizIndex / questions.length * 100}%`;
}
$('#quizAnswers').addEventListener('click', event => {
  const answerButton = event.target.closest('[data-answer]');
  if (!answerButton || quizAnswered || quizComplete) return;
  quizAnswered = true;
  const question = questions[quizIndex], picked = Number(answerButton.dataset.answer);
  $$('.quiz-answer').forEach(button => {
    button.disabled = true;
    const index = Number(button.dataset.answer);
    if (index === question.correct) button.classList.add('correct');
    else if (index === picked) button.classList.add('wrong');
  });
  if (picked === question.correct) quizScore++;
  $('#quizFeedback').textContent = (picked === question.correct ? 'That’s right! ' : 'Not quite. ') + question.why;
  $('#quizScore').textContent = `${quizScore} / ${questions.length}`;
  $('#quizProgress').style.width = `${(quizIndex + 1) / questions.length * 100}%`;
  $('#nextQuestion').disabled = false;
});
$('#nextQuestion').addEventListener('click', () => {
  if (!quizAnswered || quizComplete) return;
  if (quizIndex < questions.length - 1) { quizIndex++; renderQuestion(); return; }
  quizComplete = true;
  $('#quizQuestionNumber').textContent = 'QUIZ COMPLETE';
  $('#quizQuestion').textContent = quizScore >= 4 ? 'Great work — you know the key safety basics!' : 'Good effort — review the safety steps and try again.';
  $('#quizAnswers').innerHTML = '';
  $('#quizFeedback').textContent = `You scored ${quizScore} out of ${questions.length}. Official local guidance comes first.`;
  $('#nextQuestion').disabled = true;
  $('#nextQuestion').textContent = 'Completed';
});
$('#resetQuiz').addEventListener('click', () => { quizIndex = 0; quizScore = 0; renderQuestion(); });
renderQuestion();

window.addEventListener('resize', () => {
  floodMap?.invalidateSize(); clinicMap?.invalidateSize();
  populationChart?.resize(); districtChart?.resize();
});
