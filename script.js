// =========================
// STATE SYSTEM
// =========================
let state = {
  score: 0,
  clues: 0,
  trust: 0,
  inventory: []
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
// SAFE TYPEWRITER ENGINE
// =========================
let typing = false;

function typeText(text, cb) {
  typing = true;
  textEl.innerHTML = "";

  let i = 0;
  const interval = setInterval(() => {
    textEl.innerHTML += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      typing = false;
      if (cb) cb();
    }
  }, 15);
}

// =========================
// UI UPDATE
// =========================
function update() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
  invEl.innerText = state.inventory.length ? state.inventory.join(", ") : "None";
}

// =========================
// SCENE ENGINE
// =========================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(o => {
      const b = document.createElement("button");
      b.innerText = o.text;

      b.onclick = () => {
        if (o.effect) o.effect();
        update();
        o.next();
      };

      choicesEl.appendChild(b);
    });
  });
}

// =========================
// START
// =========================
function start() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  update();

  scene(
    "🕵️ The diamond is missing. The museum is locked. Three locations are available.",
    [
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🖥️ Security Room", next: security },
      { text: "🌿 Garden", next: garden }
    ]
  );
}

// =========================
// KITCHEN
// =========================
function kitchen() {
  scene(
    "The kitchen is messy. Something was dragged across the floor.",
    [
      {
        text: "Search drawers",
        effect: () => state.clues++,
        next: () => {
          state.inventory.push("Key");
          update();
          kitchen2();
        }
      },
      {
        text: "Leave",
        next: start
      }
    ]
  );
}

function kitchen2() {
  scene(
    "You found a strange key. It might open something important.",
    [
      { text: "Return", next: start }
    ]
  );
}

// =========================
// SECURITY
// =========================
function security() {
  scene(
    "Monitors flicker. A guard avoids eye contact.",
    [
      {
        text: "Interrogate",
        effect: () => state.trust++,
        next: () => {
          scene(
            "Guard: 'I saw someone go to the garden.'",
            [{ text: "Go garden", next: garden }]
          );
        }
      },
      {
        text: "Hack system",
        next: () => lose("Alarm triggered. Investigation failed.")
      }
    ]
  );
}

// =========================
// GARDEN
// =========================
function garden() {
  scene(
    "Fog covers the garden. Two paths appear.",
    [
      {
        text: "Follow path",
        next: () => {
          if (state.trust > 0 && state.inventory.includes("Key")) {
            win("You solved the case using all evidence 🏆");
          } else {
            lose("You were tricked. Wrong path.");
          }
        }
      },
      {
        text: "Call backup",
        next: () => win("Backup arrives. Case solved professionally 🚔")
      }
    ]
  );
}

// =========================
// ENDINGS
// =========================
function win(msg) {
  scene("🏆 " + msg, [
    { text: "Play Again", next: start }
  ]);
}

function lose(msg) {
  scene("💀 " + msg, [
    { text: "Restart", next: start }
  ]);
}

// START GAME
start();
