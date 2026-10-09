
/* FLOODWISE ASSAM — INTERACTIVE FEATURES */


/* 1. FLOOD SAFETY GUIDE */

const safetyGuides = {
  before: [
    ["01", "Follow official alerts", "Check weather warnings and updates from local authorities."],
    ["02", "Know your evacuation route", "Learn how to reach a designated shelter from your home."],
    ["03", "Prepare an emergency kit", "Pack water, safe food, a torch, a first-aid kit and essential supplies."],
    ["04", "Protect important documents", "Keep necessary papers in waterproof packaging."],
    ["05", "Plan family communication", "Agree on a meeting point and a way to contact each other."],
    ["06", "Charge essential devices", "Charge phones and power banks when it is safe to do so."],
    ["07", "Protect electrical safety", "Ask an adult or qualified professional how to safely isolate electricity if advised."],
    ["08", "Keep medicines accessible", "Prepare essential medicines and medical information with a responsible adult."]
  ],
  during: [
    ["01", "Follow evacuation instructions", "Move to the designated safe place when authorities tell you to leave."],
    ["02", "Stay away from floodwater", "Do not walk, swim or drive through floodwater."],
    ["03", "Move to safer ground", "Follow official instructions to reach a safer location if water rises."],
    ["04", "Avoid electrical hazards", "Keep away from fallen power lines and electrical equipment exposed to water."],
    ["05", "Keep informed", "Listen to official alerts and updates when available."],
    ["06", "Keep your family together", "Follow your family's emergency plan and stay with a trusted adult."],
    ["07", "Use safe drinking water", "Use bottled or officially confirmed safe water."],
    ["08", "Ask for help safely", "Contact emergency services or local authorities if you need assistance."]
  ],
  after: [
    ["01", "Wait for official clearance", "Return only when authorities say the area is safe."],
    ["02", "Avoid standing water", "It may hide hazards, sharp objects or electrical dangers."],
    ["03", "Check drinking water", "Do not drink water unless it is confirmed safe."],
    ["04", "Avoid damaged buildings", "Stay away until the structure has been declared safe."],
    ["05", "Be careful with electricity", "Never touch wet electrical equipment; get qualified assistance."],
    ["06", "Clean safely", "Follow public health guidance and use suitable protection with adult help."],
    ["07", "Seek medical help when needed", "Get advice for injuries, illness or possible contaminated-water exposure."],
    ["08", "Document damage safely", "If safe, record damage for family records or official assistance requests."]
  ]
};

const safetyPanel = document.getElementById("safetyPanel");
const stageButtons = document.querySelectorAll("[data-stage]");

function showSafetyStage(stage) {
  safetyPanel.innerHTML = safetyGuides[stage].map(
    ([number, title, description]) => `
      <article class="safety-step">
        <span class="step-number">${number}</span>
        <div>
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
      </article>
    `
  ).join("");

  stageButtons.forEach(button => {
    const active = button.dataset.stage === stage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

stageButtons.forEach(button => {
  button.addEventListener("click", () => {
    showSafetyStage(button.dataset.stage);
  });
});

showSafetyStage("before");


/* 2. EMERGENCY KIT CHECKLIST */

const kitItems = [
  "Drinking water and safe, non-perishable food",
  "Torch and spare batteries",
  "First-aid kit",
  "Essential medicines",
  "Phone and charged power bank",
  "Copies of important documents in waterproof packaging",
  "Soap, hand sanitiser and basic hygiene supplies",
  "A whistle and essential family contact information"
];

const kitChecklist = document.getElementById("kitChecklist");
const kitProgress = document.getElementById("kitProgress");
const kitCount = document.getElementById("kitCount");

kitChecklist.innerHTML = kitItems.map((item, index) => `
  <label class="check-item">
    <input type="checkbox" class="kit-checkbox" id="kit-${index}">
    <span>${item}</span>
  </label>
`).join("");

function updateKitProgress() {
  const boxes = [...document.querySelectorAll(".kit-checkbox")];
  const checked = boxes.filter(box => box.checked).length;

  kitProgress.style.width = `${(checked / boxes.length) * 100}%`;
  kitCount.textContent = `${checked} of ${boxes.length} items ready`;
}

kitChecklist.addEventListener("change", updateKitProgress);

document.getElementById("resetKit").addEventListener("click", () => {
  document.querySelectorAll(".kit-checkbox").forEach(box => {
    box.checked = false;
  });

  updateKitProgress();
});

updateKitProgress();


/* 3. MOBILE NAVIGATION */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

function closeNavigation() {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  menuToggle.textContent = "☰";
}

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeNavigation);
});


/* 4. ABOUT US DROPDOWN */

const aboutToggle = document.getElementById("aboutToggle");
const aboutPanel = document.getElementById("aboutPanel");
const aboutArrow = document.getElementById("aboutArrow");

function closeAboutDropdown() {
  aboutToggle.setAttribute("aria-expanded", "false");
  aboutPanel.hidden = true;
  aboutArrow.textContent = "⌄";
}

aboutToggle.addEventListener("click", event => {
  event.stopPropagation();

  const isOpen =
    aboutToggle.getAttribute("aria-expanded") === "true";

  aboutToggle.setAttribute("aria-expanded", String(!isOpen));
  aboutPanel.hidden = isOpen;
  aboutArrow.textContent = isOpen ? "⌄" : "⌃";
});

document.addEventListener("click", event => {
  if (!event.target.closest(".nav-dropdown")) {
    closeAboutDropdown();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeAboutDropdown();
    closeNavigation();
  }
});


/* 5. INTERACTIVE ASSAM MAP */

const assamMapElement = document.getElementById("assamMap");

if (assamMapElement && window.L) {
  const assamMap = L.map("assamMap").setView([26.2, 92.8], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(assamMap);

  const assamLocations = [
    {
      name: "Guwahati",
      coordinates: [26.1445, 91.7362],
      description: "A major city in the Brahmaputra valley."
    },
    {
      name: "Dibrugarh",
      coordinates: [27.4728, 94.9120],
      description: "A city in Upper Assam."
    },
    {
      name: "Tezpur",
      coordinates: [26.6528, 92.7926],
      description: "A city in the Sonitpur area."
    },
    {
      name: "Barpeta",
      coordinates: [26.3226, 91.0063],
      description: "A town in western Assam."
    },
    {
      name: "Silchar",
      coordinates: [24.8333, 92.7789],
      description: "A major city in the Barak valley."
    },
    {
      name: "Dhubri",
      coordinates: [26.0186, 89.9856],
      description: "A town in western Assam."
    },
    {
      name: "Jorhat",
      coordinates: [26.7509, 94.2037],
      description: "A city in eastern Assam."
    },
    {
      name: "Goalpara",
      coordinates: [26.1760, 90.6260],
      description: "A town in western Assam."
    }
  ];

  assamLocations.forEach(place => {
    const mapsURL =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(`${place.name}, Assam, India`);

    L.marker(place.coordinates)
      .addTo(assamMap)
      .bindPopup(`
        <strong>${place.name}</strong><br>
        ${place.description}<br>
        <span>Reference location — not a live flood reading.</span><br>
        <a href="${mapsURL}" target="_blank" rel="noopener noreferrer">
          Explore this area ↗
        </a>
      `);
  });

  // Help Leaflet calculate the map size after the page layout loads.
  window.addEventListener("load", () => {
    assamMap.invalidateSize();
  });
}


/* 6. EMBEDDED HOSPITAL AND CLINIC LOCATOR */

const locationInput = document.getElementById("locationInput");
const clinicSearch = document.getElementById("clinicSearch");
const clinicMapFrame = document.getElementById("clinicMapFrame");
const clinicStatus = document.getElementById("clinicStatus");
const openClinicSearch = document.getElementById("openClinicSearch");

function searchClinics(place) {
  const cleanedPlace = place.trim();

  if (!cleanedPlace) {
    locationInput.setCustomValidity(
      "Enter a town, district or area in Assam first."
    );
    locationInput.reportValidity();
    locationInput.focus();
    return;
  }

  locationInput.setCustomValidity("");

  // Keep searches focused on Assam.
  const query = `hospitals and clinics in ${cleanedPlace}, Assam, India`;

  const embeddedURL =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(query) +
    "&output=embed";

  const externalURL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query);

  clinicMapFrame.src = embeddedURL;
  openClinicSearch.href = externalURL;

  clinicStatus.textContent =
    `Showing embedded map results for ${cleanedPlace}, Assam. ` +
    "Listings may be incomplete; confirm facility details before travelling.";
}

clinicSearch.addEventListener("click", () => {
  searchClinics(locationInput.value);
});

locationInput.addEventListener("input", () => {
  locationInput.setCustomValidity("");
});

locationInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchClinics(locationInput.value);
  }
});

document.querySelectorAll("[data-place]").forEach(button => {
  button.addEventListener("click", () => {
    const place = button.dataset.place;
    locationInput.value = place;
    searchClinics(place);
  });
});


/* 7. FIVE-QUESTION FLOOD SAFETY QUIZ */

const quizQuestions = [
  {
    question: "1. What should you do if authorities order an evacuation?",
    options: [
      "Wait until water reaches your home",
      "Follow instructions and move to the designated safe place",
      "Go closer to the river to inspect the water"
    ],
    answer: 1,
    explanation: "Follow official evacuation instructions promptly."
  },
  {
    question: "2. Is it safe to walk or drive through floodwater?",
    options: [
      "Yes, if it looks shallow",
      "Yes, if other people are crossing",
      "No. Stay away from floodwater"
    ],
    answer: 2,
    explanation: "Floodwater can conceal hazards and move more strongly than it appears."
  },
  {
    question: "3. Which is useful in an emergency kit?",
    options: [
      "A torch and first-aid supplies",
      "Only decorative items",
      "An empty water bottle with no plan to refill it safely"
    ],
    answer: 0,
    explanation: "A torch, first-aid supplies, safe water and other essentials can help you prepare."
  },
  {
    question: "4. When should you return to a flooded area?",
    options: [
      "As soon as the rain stops",
      "When neighbours begin returning",
      "Only after authorities confirm it is safe"
    ],
    answer: 2,
    explanation: "Floodwater may leave hidden hazards even after rain stops."
  },
  {
    question: "5. Where should you verify official Assam flood updates?",
    options: [
      "An unverified social media post",
      "The Assam State Disaster Management Authority",
      "A random forwarded message"
    ],
    answer: 1,
    explanation: "Use official government sources and follow local authority instructions."
  }
];

const quizArea = document.getElementById("quizArea");
const quizProgress = document.getElementById("quizProgress");

let currentQuestion = 0;
let quizScore = 0;
let quizAnswered = false;

function startQuiz() {
  currentQuestion = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuestion();
}

function renderQuestion() {
  quizAnswered = false;

  const item = quizQuestions[currentQuestion];

  quizProgress.style.width =
    `${(currentQuestion / quizQuestions.length) * 100}%`;

  quizArea.innerHTML = `
    <p class="small-note">
      Question ${currentQuestion + 1} of ${quizQuestions.length}
    </p>
    <h3>${item.question}</h3>
    <div id="quizOptions">
      ${item.options.map((option, index) => `
        <button class="quiz-option" data-answer="${index}">
          ${option}
        </button>
      `).join("")}
    </div>
    <div id="quizFeedback" aria-live="polite"></div>
    <button class="button button-primary" id="nextQuestion" hidden>
      ${currentQuestion === quizQuestions.length - 1
        ? "See results"
        : "Next question →"}
    </button>
  `;

  quizArea.querySelectorAll("[data-answer]").forEach(button => {
    button.addEventListener("click", () => {
      answerQuestion(Number(button.dataset.answer));
    });
  });

  document.getElementById("nextQuestion").addEventListener("click", () => {
    if (currentQuestion < quizQuestions.length - 1) {
      currentQuestion++;
      renderQuestion();
    } else {
      showQuizResults();
    }
  });
}

function answerQuestion(selectedIndex) {
  if (quizAnswered) return;

  quizAnswered = true;

  const item = quizQuestions[currentQuestion];
  const correct = selectedIndex === item.answer;

  if (correct) quizScore++;

  quizArea.querySelectorAll("[data-answer]").forEach(button => {
    button.disabled = true;

    const index = Number(button.dataset.answer);

    if (index === item.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
    }
  });

  document.getElementById("quizFeedback").innerHTML = `
    <p class="quiz-feedback">
      <strong>${correct ? "Correct!" : "Not quite."}</strong>
      ${item.explanation}
    </p>
  `;

  document.getElementById("nextQuestion").hidden = false;

  quizProgress.style.width =
    `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
}

function showQuizResults() {
  quizProgress.style.width = "100%";

  let message;

  if (quizScore === 5) {
    message = "Excellent! You answered every question correctly.";
  } else if (quizScore >= 3) {
    message = "Good effort! Review any answers you missed.";
  } else {
    message = "Keep learning! Revisit the safety guide and try again.";
  }

  quizArea.innerHTML = `
    <span class="eyebrow">QUIZ COMPLETE</span>
    <h3>You scored ${quizScore} out of ${quizQuestions.length}</h3>
    <p>${message}</p>
    <button class="button button-primary" id="retryQuiz">Try again ↻</button>
  `;

  document.getElementById("retryQuiz").addEventListener("click", startQuiz);
}

document.getElementById("startQuiz").addEventListener("click", startQuiz);
