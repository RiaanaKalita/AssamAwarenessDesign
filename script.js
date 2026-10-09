

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
    ["03", "Move to safer ground", "If water rises, follow official instructions to reach a safer location."],
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
  safetyPanel.innerHTML = safetyGuides[stage].map(([number, title, description]) => `
    <article class="safety-step">
      <span class="step-number">${number}</span>
      <div>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    </article>
  `).join("");

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

// Emergency kit checklist
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

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

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
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.textContent = "☰";
  });
});

// External clinic locator
const locationInput = document.getElementById("locationInput");
const clinicSearch = document.getElementById("clinicSearch");

function searchClinics(place) {
  const cleanedPlace = place.trim();

  if (!cleanedPlace) {
    locationInput.focus();
    locationInput.setCustomValidity("Enter a town or area in Assam first.");
    locationInput.reportValidity();
    return;
  }

  locationInput.setCustomValidity("");

  const query = `${cleanedPlace}, Assam, India hospitals and clinics`;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

locationInput.addEventListener("input", () => {
  locationInput.setCustomValidity("");
});

clinicSearch.addEventListener("click", () => {
  searchClinics(locationInput.value);
});

locationInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    searchClinics(locationInput.value);
  }
});

document.querySelectorAll("[data-place]").forEach(button => {
  button.addEventListener("click", () => {
    const place = button.dataset.place;
    locationInput.value = place.replace(" hospitals", "");
    searchClinics(place);
  });
});

// Five-question flood safety quiz
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
    <p class="small-note">Question ${currentQuestion + 1} of ${quizQuestions.length}</p>
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
      ${currentQuestion === quizQuestions.length - 1 ? "See results" : "Next question →"}
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
