// =========================
// GAME STATE
// =========================
let state = {
  score: 0,
  clues: 0,
  trust: 0,
  inventory: []
};

// =========================
// STORY DATABASE (ENGINE CORE)
// =========================
const STORY = {
  start: {
    text: "🕵️ The museum alarm triggered at 2:13 AM. The diamond is gone. Three locations show suspicious activity.",
    choices: [
      { text: "🍪 Kitchen", next: "kitchen" },
      { text: "🖥️ Security Room", next: "security" },
      { text: "🌿 Garden", next: "garden" }
    ]
  },

  kitchen: {
    text: "The kitchen is frozen in chaos. Broken glass and strange footprints.",
    choices: [
      {
        text: "Search drawer",
        effect: () => { state.inventory.push("Key"); state.clues++; },
        next: "kitchen2"
      },
      {
        text: "Eat cookie",
        next: "lose_poison"
      }
    ]
  },

  kitchen2: {
    text: "You find a coded key hidden inside.",
    choices: [
      { text: "Return", next: "start" }
    ]
  },

  security: {
    text: "Security system is corrupted. A guard is nervous.",
    choices: [
      {
        text: "Interrogate",
        effect: () => state.trust++,
        next: "security2"
      },
      {
        text: "Hack system",
        next: "lose_alarm"
      }
    ]
  },

  security2: {
    text: "Guard whispers: 'There were TWO suspects in the garden.'",
    choices: [
      { text: "Go garden", next: "garden" }
    ]
  },

  garden: {
    text: "Fog covers the garden. Two paths appear.",
    choices: [
      {
        text: "Follow clean path",
        next: "check_win"
      },
      {
        text: "Search hidden area",
        next: "secret"
      },
      {
        text: "Call backup",
        next: "win_backup"
      }
    ]
  },

  secret: {
    text: "You discover hidden evidence buried underground...",
    choices: [
      { text: "Analyze", next: "check_secret" }
    ]
  },

  // ENDINGS
  lose_poison: {
    text: "💀 Poisoned cookie. Investigation failed.",
    choices: [{ text: "Restart", next: "start" }]
  },

  lose_alarm: {
    text: "🚨 Alarm triggered. Case locked down.",
    choices: [{ text: "Restart", next: "start" }]
  },

  win_backup: {
    text: "🏆 Backup arrives. Case solved professionally.",
    choices: [{ text: "Play again", next: "start" }]
  }
};

// =========================
// ELEMENTS
// =========================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const cluesEl = document.getElementById("clues");
const trustEl = document.getElementById("trust");
const invEl = document.getElementById("inv");

// =========================
// TYPEWRITER ENGINE (CLEAN)
// =========================
function typeText(text, cb) {
  textEl.innerHTML = "";
  let i = 0;

  const interval = setInterval(() => {
    textEl.innerHTML += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (cb) cb();
    }
  }, 14);
}

// =========================
// RENDER SCENE
// =========================
function render(sceneId) {
  const scene = STORY[sceneId];
  if (!scene) return;

  choicesEl.innerHTML = "";

  typeText(scene.text, () => {
    scene.choices.forEach(c => {
      const btn = document.createElement("button");
      btn.innerText = c.text;

      btn.onclick = () => {
        if (c.effect) c.effect();
        updateHUD();
        render(c.next);
      };

      choicesEl.appendChild(btn);
    });
  });
}

// =========================
// HUD UPDATE
// =========================
function updateHUD() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
  invEl.innerText = state.inventory.join(", ") || "None";
}

// =========================
// SAVE / LOAD
// =========================
function saveGame() {
  localStorage.setItem("mira_save", JSON.stringify(state));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("mira_save"));
  if (data) state = data;
  updateHUD();
  render("start");
}

// =========================
// START GAME
// =========================
function startGame() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  updateHUD();
  render("start");
}

// START
startGame();
