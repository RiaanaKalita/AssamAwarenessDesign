


document.addEventListener("DOMContentLoaded", () => {
  const views = {
    home: document.getElementById("homeView"),
    tracker: document.getElementById("trackerView"),
    safety: document.getElementById("safetyView"),
    help: document.getElementById("helpView"),
    quiz: document.getElementById("quizView")
  };

  const navButtons = document.querySelectorAll("[data-view]");
  const aboutButton = document.getElementById("aboutButton");
  const aboutContent = document.getElementById("aboutContent");
  const aboutArrow = document.getElementById("aboutArrow");

  let map = null;

  function closeAbout() {
    aboutContent.hidden = true;
    aboutButton.setAttribute("aria-expanded", "false");
    aboutArrow.textContent = "⌄";
  }

  function showView(name) {
    if (!views[name]) return;

    Object.entries(views).forEach(([key, section]) => {
      section.hidden = key !== name;
    });

    document.querySelectorAll(".nav-link[data-view]").forEach(button => {
      button.classList.toggle("active", button.dataset.view === name);
    });

    closeAbout();
    window.scrollTo({ top: 0, behavior: "auto" });

    if (name === "tracker") {
      initializeMap();
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 100);
    }
  }

  navButtons.forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  aboutButton.addEventListener("click", () => {
    const opening = aboutContent.hidden;
    aboutContent.hidden = !opening;
    aboutButton.setAttribute("aria-expanded", String(opening));
    aboutArrow.textContent = opening ? "⌃" : "⌄";
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".about-wrap")) closeAbout();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAbout();
  });

  function initializeMap() {
    const mapElement = document.getElementById("liveMap");

    if (map || !mapElement || !window.L) {
      if (!window.L && mapElement) {
        mapElement.innerHTML =
          '<div class="map-fallback">The map needs an internet connection to load. You can still use the official flood information links beside it.</div>';
      }
      return;
    }

    map = L.map(mapElement, {
      scrollWheelZoom: false
    }).setView([26.2, 92.8], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    const locations = [
      { name: "Guwahati", coords: [26.1445, 91.7362] },
      { name: "Dibrugarh", coords: [27.4728, 94.9120] },
      { name: "Tezpur", coords: [26.6528, 92.7926] },
      { name: "Goalpara", coords: [26.1760, 90.6260] },
      { name: "Dhubri", coords: [26.0207, 89.9743] },
      { name: "Neamatighat area", coords: [26.95, 94.20] }
    ];

    locations.forEach(location => {
      L.circleMarker(location.coords, {
        radius: 6,
        color: "#0E4C92",
        weight: 2,
        fillColor: "#168B78",
        fillOpacity: 0.95
      })
      .addTo(map)
      .bindPopup(
        `<strong>${location.name}</strong><br>Reference location only. Check official sources for current flood conditions.`
      );
    });

    document.getElementById("liveStatus").textContent =
      "Reference locations are shown on the map. Current river levels and warnings must be checked using official sources.";

    document.getElementById("lastUpdated").textContent =
      "This map does not retrieve live river readings.";
  }

  // Flood safety quiz
  const questions = [
    {
      question: "What should you do if floodwater covers a road?",
      answers: [
        "Walk through if the water looks shallow",
        "Find another route and follow official instructions",
        "Drive quickly through it",
        "Follow another vehicle through"
      ],
      correct: 1,
      explanation: "Correct! Floodwater can be deeper and faster-moving than it appears. Never walk or drive through it."
    },
    {
      question: "Which item is useful in an emergency bag?",
      answers: [
        "A torch and spare batteries",
        "Only decorative items",
        "Heavy furniture",
        "Glass containers filled with water"
      ],
      correct: 0,
      explanation: "A torch, essential medicines, safe drinking water, food and important documents are useful emergency supplies."
    },
    {
      question: "What should you do when officials advise evacuation?",
      answers: [
        "Wait until the water reaches your house",
        "Ignore the warning if it is sunny",
        "Follow the evacuation instructions promptly",
        "Go closer to the river to check"
      ],
      correct: 2,
      explanation: "Follow official evacuation advice promptly and use the recommended safe route."
    },
    {
      question: "After a flood, when should you return home?",
      answers: [
        "As soon as the rain stops",
        "When neighbours return",
        "When the water looks clear",
        "Only when authorities say it is safe"
      ],
      correct: 3,
      explanation: "Floodwater may leave behind hidden hazards. Wait for official confirmation that it is safe."
    },
    {
      question: "Where should you check for reliable flood warnings?",
      answers: [
        "Unverified social media posts",
        "Official disaster-management and flood-forecast sources",
        "Old messages from unknown people",
        "Rumours from neighbours"
      ],
      correct: 1,
      explanation: "Use official disaster-management and flood-forecast sources, and follow local authorities."
    }
  ];

  const questionElement = document.getElementById("quizQuestion");
  const answersElement = document.getElementById("quizAnswers");
  const feedbackElement = document.getElementById("quizFeedback");
  const progressElement = document.getElementById("quizProgress");
  const progressBar = document.getElementById("quizProgressBar");
  const nextButton = document.getElementById("nextQuestion");
  const quizContent = document.getElementById("quizContent");
  const resultElement = document.getElementById("quizResult");
  const scoreElement = document.getElementById("quizScore");
  const restartButton = document.getElementById("restartQuiz");

  let currentQuestion = 0;
  let score = 0;
  let answered = false;

  function renderQuestion() {
    const item = questions[currentQuestion];
    answered = false;

    progressElement.textContent =
      `QUESTION ${currentQuestion + 1} OF ${questions.length}`;
    progressBar.style.width =
      `${((currentQuestion + 1) / questions.length) * 100}%`;

    questionElement.textContent = item.question;
    answersElement.replaceChildren();
    feedbackElement.textContent = "";
    nextButton.disabled = true;
    nextButton.textContent =
      currentQuestion === questions.length - 1
        ? "See my results →"
        : "Next question →";

    item.answers.forEach((answer, index) => {
      const button = document.createElement("button");
      button.className = "quiz-answer";

      const letter = document.createElement("span");
      letter.className = "answer-letter";
      letter.textContent = String.fromCharCode(65 + index);

      const label = document.createElement("span");
      label.textContent = answer;

      button.append(letter, label);
      button.addEventListener("click", () => selectAnswer(index));
      answersElement.appendChild(button);
    });
  }

  function selectAnswer(index) {
    if (answered) return;
    answered = true;

    const item = questions[currentQuestion];
    const buttons = answersElement.querySelectorAll(".quiz-answer");

    buttons.forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === item.correct) {
        button.classList.add("correct");
      }
    });

    if (index === item.correct) {
      score++;
      feedbackElement.textContent = item.explanation;
    } else {
      buttons[index].classList.add("wrong");
      feedbackElement.textContent = item.explanation;
    }

    nextButton.disabled = false;
  }

  function showResults() {
    quizContent.hidden = true;
    resultElement.hidden = false;
    scoreElement.textContent = `${score}/${questions.length}`;
    progressElement.textContent = "QUIZ COMPLETE";
    progressBar.style.width = "100%";
  }

  nextButton.addEventListener("click", () => {
    if (!answered) return;

    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      renderQuestion();
    } else {
      showResults();
    }
  });

  restartButton.addEventListener("click", () => {
    currentQuestion = 0;
    score = 0;
    resultElement.hidden = true;
    quizContent.hidden = false;
    renderQuestion();
  });

  renderQuestion();
});
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
