

/* script.js */

/* OFFICIAL DATA SOURCE
   National Water Data Portal:
   Assam river water level telemetry, 2026–2030 CSV.
*/
const LIVE_CSV =
  "https://nwdp.nwic.gov.in/dataset/6273c426-32f9-4fdf-b67f-e4e7a46d8554/resource/847f5630-f231-46c0-922d-0f2f379a5cb8/download/rwl_tel_hr_assam_999_2026_2030.csv";

const OFFICIAL_FORECAST =
  "https://ffs.india-water.gov.in/";

const OFFICIAL_ASSAM_REPORTS =
  "https://asdma.assam.gov.in/information-services/detail/assam-flood-report";

/* APPROXIMATE MAP POSITIONS FOR MAJOR GAUGE AREAS.
   Readings are only shown when matched with downloaded source data.
*/
const STATIONS = [
  { name: "Dibrugarh", aliases: ["dibrugarh"], lat: 27.48, lon: 94.91 },
  { name: "Neamatighat", aliases: ["neamatighat", "neamati"], lat: 26.93, lon: 94.22 },
  { name: "Tezpur", aliases: ["tezpur"], lat: 26.63, lon: 92.80 },
  { name: "Guwahati", aliases: ["guwahati", "dc court"], lat: 26.18, lon: 91.75 },
  { name: "Goalpara", aliases: ["goalpara"], lat: 26.17, lon: 90.63 },
  { name: "Dhubri", aliases: ["dhubri"], lat: 26.02, lon: 89.98 },
  { name: "Badatighat", aliases: ["badatighat"], lat: 27.25, lon: 94.10 },
  { name: "Kampur", aliases: ["kampur"], lat: 26.17, lon: 92.68 },
  { name: "A.P. Ghat", aliases: ["a.p. ghat", "ap ghat"], lat: 24.83, lon: 92.80 }
];

const views = {
  home: document.getElementById("homeView"),
  tracker: document.getElementById("trackerView"),
  safety: document.getElementById("safetyView"),
  help: document.getElementById("helpView"),
  quiz: document.getElementById("quizView")
};

/* NAVIGATION */

function showView(name) {
  Object.entries(views).forEach(([key, element]) => {
    if (element) element.hidden = key !== name;
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.remove("active");
  });

  const active = document.querySelector(
    `.nav-link[data-view="${name}"]`
  );
  if (active) active.classList.add("active");

  closeAbout();

  if (name === "tracker") {
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);
    loadLiveData();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-home]").forEach(button => {
  button.addEventListener("click", () => showView("home"));
});

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

/* ABOUT US DROPDOWN */

const aboutButton = document.getElementById("aboutButton");
const aboutContent = document.getElementById("aboutContent");
const aboutArrow = document.getElementById("aboutArrow");

function closeAbout() {
  if (!aboutButton || !aboutContent) return;
  aboutContent.hidden = true;
  aboutButton.setAttribute("aria-expanded", "false");
  if (aboutArrow) aboutArrow.textContent = "▾";
}

if (aboutButton && aboutContent) {
  aboutButton.addEventListener("click", event => {
    event.stopPropagation();
    const opening = aboutContent.hidden;
    aboutContent.hidden = !opening;
    aboutButton.setAttribute("aria-expanded", String(opening));
    if (aboutArrow) aboutArrow.textContent = opening ? "▴" : "▾";
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".about-wrap")) closeAbout();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAbout();
      aboutButton.focus();
    }
  });
}

/* LIVE RIVER MAP */

let map = null;
let markersLayer = null;
let lastSuccessfulLoad = null;
let isLoading = false;

const liveStatus = document.getElementById("liveStatus");
const readingsList = document.getElementById("readingsList");
const lastUpdated = document.getElementById("lastUpdated");

function setLiveStatus(message) {
  if (liveStatus) liveStatus.textContent = message;
}

function setupMap() {
  if (!document.getElementById("liveMap")) return;
  if (typeof L === "undefined") {
    setLiveStatus(
      "The map library could not load. Use the official forecast and report links below."
    );
    return;
  }
  if (map) return;

  map = L.map("liveMap").setView([26.2, 92.9], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/* CSV parser supports quoted fields and commas inside quotes. */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell.trim());
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(value => value !== "")) rows.push(row);

  if (rows.length < 2) return [];

  const headers = rows[0].map(normalize);

  return rows.slice(1).map(values => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record;
  });
}

function findField(record, patterns) {
  const keys = Object.keys(record);
  for (const pattern of patterns) {
    const match = keys.find(key => pattern.test(key));
    if (match) return record[match];
  }
  return "";
}

function parseDate(value) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function extractRecord(record) {
  const station = String(findField(record, [
    /station.*name/,
    /^station$/,
    /gauge.*name/,
    /location/,
    /site.*name/
  ])).trim();

  const river = String(findField(record, [
    /river.*name/,
    /^river$/
  ])).trim();

  const date = String(findField(record, [
    /date.*time/,
    /timestamp/,
    /^datetime$/,
    /^date$/,
    /observation.*time/
  ])).trim();

  const levelRaw = findField(record, [
    /water.*level/,
    /river.*level/,
    /level.*m/,
    /^level$/,
    /water.*height/
  ]);

  const level = Number(String(levelRaw).replace(/,/g, ""));

  if (!station || !Number.isFinite(level) || levelRaw === "") {
    return null;
  }

  return {
    station,
    river,
    date,
    time: parseDate(date),
    level
  };
}

function matchStation(name) {
  const value = normalize(name);
  return STATIONS.find(station =>
    station.aliases.some(alias => value.includes(normalize(alias)))
  );
}

function latestRecords(records) {
  const latestByStation = new Map();

  records.forEach(record => {
    const parsed = extractRecord(record);
    if (!parsed) return;

    const station = matchStation(parsed.station);
    if (!station) return;

    const previous = latestByStation.get(station.name);

    if (!previous || parsed.time >= previous.time) {
      latestByStation.set(station.name, {
        ...parsed,
        mapStation: station
      });
    }
  });

  return [...latestByStation.values()];
}

function renderReadings(readings) {
  if (!readingsList) return;

  readingsList.replaceChildren();

  if (!readings.length) {
    readingsList.textContent =
      "No usable readings for the mapped stations were found in the latest response. Check the official links for current information.";
    return;
  }

  readings
    .sort((a, b) => a.mapStation.name.localeCompare(b.mapStation.name))
    .forEach(reading => {
      const row = document.createElement("div");
      row.className = "reading-row";

      const details = document.createElement("div");
      const name = document.createElement("strong");
      const meta = document.createElement("small");
      const level = document.createElement("span");

      name.textContent = reading.mapStation.name;
      meta.textContent =
        `${reading.river ? reading.river + " · " : ""}` +
        `${reading.date || "Observation time not supplied"}`;

      level.className = "reading-value";
      level.textContent = `${reading.level} m`;

      details.append(name, meta);
      row.append(details, level);
      readingsList.appendChild(row);
    });
}

function renderMarkers(readings) {
  if (!map || !markersLayer) return;
  markersLayer.clearLayers();

  readings.forEach(reading => {
    const station = reading.mapStation;
    const marker = L.marker([station.lat, station.lon]);

    const popup = document.createElement("div");
    const title = document.createElement("strong");
    const level = document.createElement("p");
    const date = document.createElement("small");

    title.textContent = station.name;
    level.textContent = `Reported river level: ${reading.level} m`;
    date.textContent = reading.date
      ? `Source observation: ${reading.date}`
      : "Observation time not provided by source";

    popup.append(title, level, date);
    marker.bindPopup(popup);
    marker.addTo(markersLayer);
  });

  if (readings.length) {
    const bounds = markersLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.15), { maxZoom: 8 });
  }
}

async function loadLiveData() {
  if (isLoading) return;
  isLoading = true;

  setupMap();

  setLiveStatus(
    "Connecting to the National Water Data Portal's Assam river-level dataset…"
  );

  try {
    const response = await fetch(LIVE_CSV, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Data request returned ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (!rows.length) {
      throw new Error("No CSV records were returned.");
    }

    const readings = latestRecords(rows);
    renderReadings(readings);
    renderMarkers(readings);

    lastSuccessfulLoad = new Date();

    if (lastUpdated) {
      lastUpdated.textContent =
        `Checked ${lastSuccessfulLoad.toLocaleString()}`;
    }

    if (readings.length) {
      setLiveStatus(
        `Live source connected. ${readings.length} mapped station(s) have readings. ` +
        "Readings are displayed with their source observation times; they may not represent the current minute."
      );
    } else {
      setLiveStatus(
        "The CSV was reached, but the station fields did not match the map's supported stations. No readings have been invented. Open the official forecast and river-report links below."
      );
    }
  } catch (error) {
    console.error("Unable to load river-level data:", error);

    setLiveStatus(
      "The live feed could not be loaded in this browser. The data service may block direct browser requests or use different CSV fields. Use the official CWC forecast and Assam flood-report links below for current information."
    );

    if (readingsList) {
      readingsList.replaceChildren();

      const message = document.createElement("p");
      message.className = "fine-print";
      message.textContent =
        "No live readings are being displayed because the source could not be verified.";
      readingsList.appendChild(message);
    }
  } finally {
    isLoading = false;
  }
}

/* QUIZ */

const questions = [
  {
    question: "What should you do when a road is covered by floodwater?",
    answers: [
      "Walk through if it looks shallow",
      "Avoid crossing and find a safe alternative",
      "Follow another vehicle through"
    ],
    correct: 1,
    explanation: "Correct. Floodwater can hide hazards and move more strongly than it appears."
  },
  {
    question: "What is useful to prepare before a flood?",
    answers: [
      "A torch, drinking water and essential medicines",
      "Only extra clothing",
      "Nothing until water enters the house"
    ],
    correct: 0,
    explanation: "A prepared emergency kit can help you respond more safely."
  },
  {
    question: "What should you do if authorities advise evacuation?",
    answers: [
      "Wait until the water reaches your door",
      "Follow the advised route to safety",
      "Go closer to the river to check its level"
    ],
    correct: 1,
    explanation: "Follow official instructions and move to safety promptly."
  },
  {
    question: "When is it safe to return after a flood?",
    answers: [
      "As soon as the rain stops",
      "When neighbours begin returning",
      "When authorities say it is safe"
    ],
    correct: 2,
    explanation: "Floodwater, damaged structures and electrical hazards can remain after rain stops."
  }
];

let questionIndex = 0;
let score = 0;
let answered = false;

const questionElement = document.getElementById("quizQuestion");
const answersElement = document.getElementById("quizAnswers");
const feedbackElement = document.getElementById("quizFeedback");
const progressElement = document.getElementById("quizProgress");
const progressBar = document.getElementById("quizProgressBar");
const nextButton = document.getElementById("nextQuestion");
const quizContent = document.getElementById("quizContent");
const quizResult = document.getElementById("quizResult");
const quizScore = document.getElementById("quizScore");
const restartButton = document.getElementById("restartQuiz");

function renderQuestion() {
  const item = questions[questionIndex];
  answered = false;

  questionElement.textContent = item.question;
  progressElement.textContent =
    `QUESTION ${questionIndex + 1} OF ${questions.length}`;
  progressBar.style.width =
    `${((questionIndex + 1) / questions.length) * 100}%`;

  feedbackElement.textContent = "";
  nextButton.disabled = true;
  nextButton.textContent =
    questionIndex === questions.length - 1
      ? "See results →"
      : "Next question →";

  answersElement.replaceChildren();

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "quiz-answer";
    button.textContent = answer;

    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;

      const correct = index === item.correct;
      if (correct) score++;

      [...answersElement.children].forEach((choice, choiceIndex) => {
        choice.disabled = true;
        if (choiceIndex === item.correct) {
          choice.classList.add("correct");
        } else if (choiceIndex === index && !correct) {
          choice.classList.add("incorrect");
        }
      });

      feedbackElement.textContent = item.explanation;
      nextButton.disabled = false;
    });

    answersElement.appendChild(button);
  });
}

function startQuiz() {
  questionIndex = 0;
  score = 0;
  quizContent.hidden = false;
  quizResult.hidden = true;
  renderQuestion();
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (!answered) return;

    if (questionIndex < questions.length - 1) {
      questionIndex++;
      renderQuestion();
    } else {
      quizContent.hidden = true;
      quizResult.hidden = false;
      quizScore.textContent =
        `You scored ${score} out of ${questions.length}. ` +
        (score === questions.length
          ? "Excellent work — you know the key safety basics!"
          : "Review the safety guide and try again to practise.");
    }
  });
}

if (restartButton) {
  restartButton.addEventListener("click", startQuiz);
}

/* INITIALISE */

setupMap();
startQuiz();
