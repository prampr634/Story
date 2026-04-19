// =========================
// SHERLOCK DETECTIVE ENGINE (FIXED)
// =========================

// -------------------------
// STATE
// -------------------------
let state = {
  clues: [],
  trust: 0,
  tension: 0,
  volume: 0.6,
  location: "start"
};

// -------------------------
// ELEMENTS
// -------------------------
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const boardEl = document.getElementById("board");

// -------------------------
// 🔊 SOUND SYSTEM (FIXED FOR "sound/")
// -------------------------
function play(file) {
  const audio = new Audio("sound/" + file);
  audio.volume = state.volume;
  audio.play().catch(() => {});
}

// volume slider
document.getElementById("volume").addEventListener("input", e => {
  state.volume = parseFloat(e.target.value);
});

// -------------------------
// TYPEWRITER EFFECT
// -------------------------
function type(text, cb) {
  textEl.innerHTML = "";
  let i = 0;

  const t = setInterval(() => {
    textEl.innerHTML += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(t);
      cb && cb();
    }
  }, 15);
}

// -------------------------
// SCENE ENGINE
// -------------------------
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  type(text, () => {
    options.forEach(o => {
      const btn = document.createElement("button");
      btn.innerText = o.text;

      btn.onclick = () => {
        play("click.mp3");

        if (o.effect) o.effect();

        updateHUD();
        o.next();
      };

      choicesEl.appendChild(btn);
    });
  });
}

// -------------------------
// HUD + BOARD
// -------------------------
function updateHUD() {
  document.getElementById("clueCount").innerText = state.clues.length;
  document.getElementById("trust").innerText = state.trust;
  document.getElementById("tension").innerText = state.tension;

  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = "";

  state.clues.forEach(c => {
    const li = document.createElement("li");
    li.innerText = "🧩 " + c;
    boardEl.appendChild(li);
  });
}

// -------------------------
// CLUE SYSTEM
// -------------------------
function addClue(text) {
  state.clues.push(text);
  play("clue.mp3");
}

// -------------------------
// TENSION SYSTEM
// -------------------------
function tension(n) {
  state.tension += n;

  if (state.tension > 3) {
    document.body.style.background = "#1a0000";
  }

  if (state.tension > 6) {
    document.body.style.filter = "contrast(1.3)";
  }
}

// -------------------------
// MAP SYSTEM
// -------------------------
function go(loc) {
  play("click.mp3");

  state.location = loc;

  if (loc === "kitchen") kitchen();
  if (loc === "security") security();
  if (loc === "garden") garden();
  if (loc === "vault") vault();
}

// -------------------------
// START GAME
// -------------------------
function startGame() {
  state = {
    clues: [],
    trust: 0,
    tension: 0,
    volume: state.volume,
    location: "start"
  };

  updateHUD();

  scene(
    "🕵️ Sherlock Holmes arrives. A diamond has vanished from the museum under impossible circumstances.",
    [
      { text: "🍽️ Kitchen Wing", next: () => kitchen() },
      { text: "🖥️ Security Room", next: () => security() },
      { text: "🌿 Garden", next: () => garden() }
    ]
  );
}

// -------------------------
// LOCATIONS
// -------------------------
function kitchen() {
  tension(1);

  scene(
    "🍽️ Kitchen Wing — something was disturbed here.",
    [
      {
        text: "🔍 Inspect floor",
        effect: () => addClue("Chemical residue near fridge"),
        next: kitchen2
      },
      {
        text: "📦 Search drawers",
        effect: () => addClue("Hidden key fragment found"),
        next: kitchen2
      },
      {
        text: "🧍 Question chef",
        effect: () => {
          state.trust++;
          addClue("Chef saw unknown figure at 2 AM");
        },
        next: kitchen2
      },
      {
        text: "🗺️ Go Map",
        next: startGame
      }
    ]
  );
}

function kitchen2() {
  scene("The kitchen feels colder now... like something is missing.", [
    { text: "Continue", next: startGame }
  ]);
}

// -------------------------
function security() {
  tension(2);

  scene(
    "🖥️ Security Room — all footage has been wiped.",
    [
      {
        text: "Analyze logs",
        effect: () => addClue("Security system manually disabled"),
        next: security2
      },
      {
        text: "Interrogate guard",
        effect: () => {
          state.trust++;
          addClue("Guard saw 2 suspects in garden");
        },
        next: security2
      }
    ]
  );
}

function security2() {
  scene("Someone inside the museum helped the thief...", [
    { text: "Go Garden", next: garden }
  ]);
}

// -------------------------
function garden() {
  tension(3);

  scene(
    "🌿 Garden — silence is unnatural... something is watching.",
    [
      { text: "Follow footprints", next: finalCase },
      { text: "Wait silently", next: finalCase }
    ]
  );
}

// -------------------------
// FINAL DEDUCTION
// -------------------------
function finalCase() {
  scene(
    "🧠 Sherlock analyzes all evidence...",
    [
      {
        text: "Accuse suspect",
        next: () => {
          if (state.clues.length >= 3) {
            win();
          } else {
            lose();
          }
        }
      }
    ]
  );
}

// -------------------------
// ENDINGS
// -------------------------
function win() {
  play("win.mp3");

  scene("🏆 CASE SOLVED — Sherlock exposes the hidden conspiracy behind the theft.", [
    { text: "Play Again", next: startGame }
  ]);
}

function lose() {
  play("lose.mp3");

  scene("💀 CASE FAILED — the real culprit escapes into the shadows.", [
    { text: "Retry Case", next: startGame }
  ]);
}

// -------------------------
// BOOT GAME
// -------------------------
startGame();
