// =========================
// SHERLOCK AAA DETECTIVE ENGINE
// =========================

// -------------------------
// STATE
// -------------------------
let state = {
  clues: [],
  trust: 0,
  tension: 0,
  volume: 0.6
};

// -------------------------
// AUDIO SYSTEM (FIXED)
// -------------------------
function play(src) {
  try {
    const audio = new Audio(src);
    audio.volume = state.volume;

    const p = audio.play();
    if (p) p.catch(() => {});
  } catch (e) {
    console.log("Audio error:", e);
  }
}

// volume control
document.getElementById("volume").addEventListener("input", e => {
  state.volume = parseFloat(e.target.value);
});

// -------------------------
// ELEMENTS
// -------------------------
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const boardEl = document.getElementById("board");

// -------------------------
// HUD UPDATE
// -------------------------
function updateHUD() {
  document.getElementById("clueCount").innerText = state.clues.length;
  document.getElementById("trust").innerText = state.trust;
  document.getElementById("tension").innerText = state.tension;

  renderBoard();
}

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
        play("sound/click.mp3");

        if (o.effect) o.effect();

        updateHUD();
        o.next();
      };

      choicesEl.appendChild(btn);
    });
  });
}

// -------------------------
// MAP SYSTEM
// -------------------------
function go(location) {
  play("sound/click.mp3");

  if (location === "kitchen") kitchen();
  if (location === "security") security();
  if (location === "garden") garden();
  if (location === "vault") vault();
}

// -------------------------
// EVIDENCE SYSTEM
// -------------------------
function addClue(text) {
  state.clues.push(text);
  play("sound/clue.mp3");
  updateHUD();
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
// TENSION SYSTEM
// -------------------------
function tensionUp(n) {
  state.tension += n;

  if (state.tension > 3) {
    document.body.style.background = "#1a0000";
  }

  if (state.tension > 6) {
    document.body.style.filter = "contrast(1.3)";
  }
}

// -------------------------
// LOCATIONS
// -------------------------

function kitchen() {
  tensionUp(1);

  scene(
    "🍽️ Kitchen Wing — something is very wrong here...",
    [
      {
        text: "🔍 Inspect floor stains",
        effect: () => addClue("Chemical residue near fridge"),
        next: kitchen2
      },
      {
        text: "📦 Search drawers",
        effect: () => addClue("Hidden key fragment discovered"),
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
        text: "🗺️ Open Map",
        next: startGame
      }
    ]
  );
}

function kitchen2() {
  scene(
    "The kitchen holds more secrets than expected...",
    [
      { text: "Continue Investigation", next: startGame }
    ]
  );
}

// -------------------------

function security() {
  tensionUp(2);

  scene(
    "🖥️ Security Office — footage has been erased.",
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
          addClue("Guard saw 2 suspects entering garden");
        },
        next: security2
      }
    ]
  );
}

function security2() {
  scene(
    "Someone inside helped the thief...",
    [
      { text: "Go Garden", next: garden }
    ]
  );
}

// -------------------------

function garden() {
  tensionUp(3);

  scene(
    "🌿 Garden — silence feels unnatural... like you're being watched.",
    [
      {
        text: "Follow footprints",
        next: finalCase
      },
      {
        text: "Wait silently",
        next: finalCase
      }
    ]
  );
}

// -------------------------
// FINAL DEDUCTION
// -------------------------
function finalCase() {
  scene(
    "🧠 Sherlock analyzes your collected evidence...",
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
  play("sound/win.mp3");

  scene("🏆 CASE SOLVED — Sherlock uncovers the hidden conspiracy.", [
    { text: "Play Again", next: startGame }
  ]);
}

function lose() {
  play("sound/lose.mp3");

  scene("💀 CASE FAILED — the real culprit escapes into the shadows.", [
    { text: "Retry Case", next: startGame }
  ]);
}

// -------------------------
// START GAME
// -------------------------
function startGame() {
  state = {
    clues: [],
    trust: 0,
    tension: 0,
    volume: state.volume
  };

  updateHUD();

  scene(
    "🕵️ A priceless diamond has vanished from the museum. Sherlock Holmes begins the investigation.",
    [
      { text: "Enter Kitchen", next: kitchen },
      { text: "Enter Security", next: security },
      { text: "Enter Garden", next: garden }
    ]
  );
}

// AUTO START
startGame();
