



document.addEventListener("DOMContentLoaded", () => {
  const views = {
    home: document.getElementById("homeView"),
    tracker: document.getElementById("trackerView"),
    safety: document.getElementById("safetyView"),
    help: document.getElementById("helpView"),
    quiz: document.getElementById("quizView")
  };

  const navButtons = document.querySelectorAll(".nav-link[data-view]");
  const allViewButtons = document.querySelectorAll("[data-view]");
  const aboutButton = document.getElementById("aboutButton");
  const aboutContent = document.getElementById("aboutContent");
  const aboutArrow = document.getElementById("aboutArrow");

  let map = null;
  let mapAttempted = false;

  // PAGE NAVIGATION
  function closeAbout() {
    aboutContent.hidden = true;
    aboutButton.setAttribute("aria-expanded", "false");
    aboutArrow.textContent = "⌄";
  }

  function showView(name) {
    if (!Object.prototype.hasOwnProperty.call(views, name)) return;

    Object.entries(views).forEach(([viewName, element]) => {
      element.hidden = viewName !== name;
    });

    navButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.view === name);
    });

    closeAbout();
    window.scrollTo({ top: 0, behavior: "auto" });

    if (name === "tracker") {
      initializeMap();

      // Leaflet needs to recalculate its size after a hidden panel is shown.
      window.setTimeout(() => {
        if (map) map.invalidateSize();
      }, 150);
    }
  }

  allViewButtons.forEach(button => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });

  // ABOUT US DROPDOWN
  aboutButton.addEventListener("click", event => {
    event.stopPropagation();

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

  // MAP
  function initializeMap() {
    const mapElement = document.getElementById("liveMap");

    if (map || mapAttempted) return;
    mapAttempted = true;

    if (!window.L) {
      mapElement.innerHTML =
        '<div class="map-fallback">The interactive map could not load. Please check your internet connection. The official flood information links are still available beside this panel.</div>';
      return;
    }

    try {
      map = L.map(mapElement, {
        scrollWheelZoom: false
      }).setView([26.2, 92.8], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      const locations = [
        { name: "Guwahati", coordinates: [26.1445, 91.7362] },
        { name: "Dibrugarh", coordinates: [27.4728, 94.9120] },
        { name: "Tezpur", coordinates: [26.6528, 92.7926] },
        { name: "Goalpara", coordinates: [26.1760, 90.6260] },
        { name: "Dhubri", coordinates: [26.0207, 89.9743] },
        { name: "Neamatighat area", coordinates: [26.95, 94.20] }
      ];

      locations.forEach(location => {
        L.circleMarker(location.coordinates, {
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
        "The map shows reference locations only. Use the official forecast links to check current conditions.";

      document.getElementById("lastUpdated").textContent =
        "No live river readings have been retrieved.";
    } catch (error) {
      map = null;
      mapElement.innerHTML =
        '<div class="map-fallback">The map could not be displayed. Please check your internet connection and use the official forecast links.</div>';
    }
  }

  // QUIZ QUESTIONS
  const questions = [
    {
      question: "What should you do if floodwater covers a road?",
      answers: [
        "Walk through if it looks shallow",
        "Find another route and follow official instructions",
        "Drive quickly through it",
        "Follow another vehicle through"
      ],
      correct: 1,
      explanation:
        "Correct! Floodwater can be deeper and faster-moving than it appears. Never walk or drive through it."
    },
    {
      question: "Which is useful to keep in an emergency bag?",
      answers: [
        "A torch, essential medicines and drinking water",
        "Only decorative items",
        "Heavy household objects",
        "Unnecessary valuables"
      ],
      correct: 0,
      explanation:
        "An emergency bag should include essentials such as water, food, medicines, a torch and important documents."
    },
    {
      question: "What should you do if authorities advise evacuation?",
      answers: [
        "Wait until water enters your home",
        "Ignore the warning if the sky looks clear",
        "Follow the evacuation instructions promptly",
        "Go to the river to check the water"
      ],
      correct: 2,
      explanation:
        "Follow official evacuation instructions promptly and use the recommended safe route."
    },
    {
      question: "When should you return to your home after a flood?",
      answers: [
        "As soon as the rain stops",
        "When a neighbour returns",
        "When the water looks clear",
        "Only when authorities say it is safe"
      ],
      correct: 3,
      explanation:
        "Floods can leave hidden hazards behind. Wait until authorities confirm that returning is safe."
    },
    {
      question: "Where should you check for reliable flood warnings?",
      answers: [
        "Unverified social media posts",
        "Official disaster-management and flood-forecast sources",
        "Old messages from unknown people",
        "Unconfirmed rumours"
      ],
      correct: 1,
      explanation:
        "Use official disaster-management and flood-forecast sources, and follow local authorities."
    }
  ];

  const quizContent = document.getElementById("quizContent");
  const questionElement = document.getElementById("quizQuestion");
  const answersElement = document.getElementById("quizAnswers");
  const feedbackElement = document.getElementById("quizFeedback");
  const progressElement = document.getElementById("quizProgress");
  const progressBar = document.getElementById("quizProgressBar");
  const nextButton = document.getElementById("nextQuestion");
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
    feedbackElement.textContent = "";
    nextButton.disabled = true;
    nextButton.textContent =
      currentQuestion === questions.length - 1
        ? "See my results →"
        : "Next question →";

    answersElement.replaceChildren();

    item.answers.forEach((answer, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-answer";

      const letter = document.createElement("span");
      letter.className = "answer-letter";
      letter.textContent = String.fromCharCode(65 + index);

      const answerText = document.createElement("span");
      answerText.textContent = answer;

      button.append(letter, answerText);
      button.addEventListener("click", () => selectAnswer(index));
      answersElement.appendChild(button);
    });
  }

  function selectAnswer(selectedIndex) {
    if (answered) return;
    answered = true;

    const item = questions[currentQuestion];
    const buttons = answersElement.querySelectorAll(".quiz-answer");

    buttons.forEach((button, index) => {
      button.disabled = true;

      if (index === item.correct) {
        button.classList.add("correct");
      }
    });

    if (selectedIndex === item.correct) {
      score += 1;
    } else {
      buttons[selectedIndex].classList.add("wrong");
    }

    feedbackElement.textContent = item.explanation;
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
      currentQuestion += 1;
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
