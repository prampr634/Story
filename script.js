// =========================
// SHERLOCK AAA ENGINE v3 (DATA-DRIVEN)
// =========================

// -------------------------
// STATE (REAL GAME DATA MODEL)
// -------------------------
let state = {
  location: "start",
  clues: {},
  inventory: {},
  trust: 0,
  tension: 0,
  volume: 0.6
};

// -------------------------
// DOM
// -------------------------
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const boardEl = document.getElementById("board");

// -------------------------
// AUDIO (ROBUST FIX)
// -------------------------
function play(src) {
  const audio = new Audio(src);
  audio.volume = state.volume;

  const p = audio.play();
  if (p) p.catch(() => {});
}

document.getElementById("volume").addEventListener("input", e => {
  state.volume = parseFloat(e.target.value);
});

// -------------------------
// CORE ENGINE: SCENE RENDERER
// -------------------------
function renderScene(scene) {
  textEl.innerHTML = "";
  choicesEl.innerHTML = "";

  type(scene.text, () => {
    scene.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt.text;

      btn.onclick = () => {
        play("sound/click.mp3");

        if (opt.effect) opt.effect();

        updateHUD();

        if (opt.next) {
          goScene(opt.next);
        }
      };

      choicesEl.appendChild(btn);
    });
  });
}

// -------------------------
// TYPEWRITER (CINEMATIC FEEL)
// -------------------------
function type(text, cb) {
  let i = 0;
  const t = setInterval(() => {
    textEl.innerHTML += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(t);
      cb && cb();
    }
  }, 12);
}

// -------------------------
// CLUE SYSTEM (REAL IDS)
// -------------------------
function addClue(id, text) {
  state.clues[id] = text;
  play("sound/clue.mp3");
}

// -------------------------
// INVENTORY SYSTEM
// -------------------------
function addItem(id, text) {
  state.inventory[id] = text;
}

// -------------------------
// HUD + BOARD
// -------------------------
function updateHUD() {
  document.getElementById("clueCount").innerText =
    Object.keys(state.clues).length;

  document.getElementById("trust").innerText = state.trust;
  document.getElementById("tension").innerText = state.tension;

  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = "";

  Object.entries(state.clues).forEach(([id, text]) => {
    const li = document.createElement("li");
    li.innerText = "🧩 " + text;

    li.onclick = () => analyzeClue(id);

    boardEl.appendChild(li);
  });
}

// -------------------------
// CLUE ANALYSIS (IMPORTANT AAA FEATURE)
// -------------------------
function analyzeClue(id) {
  play("sound/click.mp3");

  const clue = state.clues[id];

  renderScene({
    text: "🧠 Analyzing clue: " + clue,
    options: [
      {
        text: "Mark important",
        effect: () => state.trust++
      },
      {
        text: "Discard",
        effect: () => delete state.clues[id]
      },
      {
        text: "Return",
        next: state.location
      }
    ]
  });
}

// -------------------------
// NAVIGATION ENGINE (REAL MAP SYSTEM)
// -------------------------
function goScene(name) {
  state.location = name;
  scenes[name]();
}

// -------------------------
// ATMOSPHERE SYSTEM
// -------------------------
function tension(n) {
  state.tension += n;

  if (state.tension > 3) {
    document.body.style.background = "#120000";
  }

  if (state.tension > 6) {
    document.body.style.filter = "contrast(1.4)";
  }
}

// -------------------------
// SCENE DATABASE (THIS IS THE AAA CHANGE)
// -------------------------
const scenes = {

  start() {
    renderScene({
      text: "🕵️ A diamond vanished from the museum. Sherlock begins the case.",
      options: [
        { text: "🍽️ Kitchen Wing", next: "kitchen" },
        { text: "🖥️ Security Room", next: "security" },
        { text: "🌿 Garden", next: "garden" }
      ]
    });
  },

  kitchen() {
    tension(1);

    renderScene({
      text: "🍽️ Kitchen — evidence of forced entry detected.",
      options: [
        {
          text: "🔍 Inspect floor",
          effect: () => addClue("chemical_stain", "Chemical residue near fridge"),
          next: "kitchen"
        },
        {
          text: "📦 Open drawer",
          effect: () => addItem("key", "Rusty key fragment"),
          next: "kitchen"
        },
        {
          text: "🧍 Question chef",
          effect: () => {
            state.trust++;
            addClue("chef_sighting", "Chef saw unknown figure at 2AM");
          },
          next: "kitchen"
        },
        {
          text: "🗺️ Go Map",
          next: "start"
        }
      ]
    });
  },

  security() {
    tension(2);

    renderScene({
      text: "🖥️ Security — footage has been wiped clean.",
      options: [
        {
          text: "Analyze logs",
          effect: () => addClue("system_disabled", "Security system manually disabled"),
          next: "security"
        },
        {
          text: "Interrogate guard",
          effect: () => {
            state.trust++;
            addClue("two_suspects", "Guard saw 2 suspects in garden");
          },
          next: "security"
        },
        {
          text: "Go Map",
          next: "start"
        }
      ]
    });
  },

  garden() {
    tension(3);

    renderScene({
      text: "🌿 Garden — silence is unnatural... something is watching.",
      options: [
        {
          text: "Follow footprints",
          next: "final"
        },
        {
          text: "Wait silently",
          next: "final"
        },
        {
          text: "Go Map",
          next: "start"
        }
      ]
    });
  },

  final() {
    renderScene({
      text: "🧠 Sherlock analyzes all collected evidence...",
      options: [
        {
          text: "Accuse suspect",
          next: () => {
            const count = Object.keys(state.clues).length;

            if (count >= 3) win();
            else lose();
          }
        }
      ]
    });
  }
};

// -------------------------
// ENDINGS
// -------------------------
function win() {
  play("sound/win.mp3");

  renderScene({
    text: "🏆 CASE SOLVED — Sherlock exposes the conspiracy behind the theft.",
    options: [
      { text: "Play Again", next: "start" }
    ]
  });
}

function lose() {
  play("sound/lose.mp3");

  renderScene({
    text: "💀 CASE FAILED — the real culprit escapes into the shadows.",
    options: [
      { text: "Retry Case", next: "start" }
    ]
  });
}

// -------------------------
// START GAME
// -------------------------
goScene("start");
