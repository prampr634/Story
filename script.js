
// =========================
// STATE
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

let typing = false;

// =========================
// TYPE ENGINE
// =========================
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
  }, 8);
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
// SAFE SCENE ENGINE (NO DEAD BUTTONS)
// =========================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(o => {
      const btn = document.createElement("button");
      btn.innerText = o.text;

      btn.onclick = () => {
        if (typing) return;

        if (o.effect) o.effect();
        update();

        // SAFE NAVIGATION GUARANTEE
        if (typeof o.next === "function") {
          o.next();
        } else {
          hub();
        }
      };

      choicesEl.appendChild(btn);
    });
  });
}

// =========================
// START
// =========================
function start() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  update();
  hub();
}

// =========================
// HUB (MAIN LOOP - FIXED SYSTEM CORE)
// =========================
function hub() {
  scene(
    "🕵️ The diamond is missing from the locked museum. Choose your lead:",
    [
      { text: "🏛️ Museum Hall", next: museum },
      { text: "🖥️ Security Room", next: security },
      { text: "🍪 Kitchen Wing", next: kitchen },
      { text: "🌿 Garden Area", next: garden },
      { text: "📚 Library Archives", next: library }
    ]
  );
}

// =========================
// MUSEUM
// =========================
function museum() {
  scene(
    "Glass case shattered… but no forced entry.",
    [
      {
        text: "Inspect glass",
        effect: () => state.clues++,
        next: museumGlass
      },
      {
        text: "Talk guard",
        next: guard
      },
      {
        text: "Return hub",
        next: hub
      }
    ]
  );
}

function museumGlass() {
  scene(
    "Break pattern suggests internal access.",
    [
      { text: "Go security", next: security },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// GUARD
// =========================
function guard() {
  scene(
    "Guard: 'I saw movement… but not an outsider.'",
    [
      {
        text: "Press him",
        effect: () => state.trust++,
        next: guardReveal
      },
      { text: "Return hub", next: hub }
    ]
  );
}

function guardReveal() {
  scene(
    "Guard admits internal badge usage.",
    [
      { text: "Go security", next: security },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// SECURITY
// =========================
function security() {
  scene(
    "Monitors flicker. Missing footage at 2:14 AM.",
    [
      {
        text: "Check logs",
        effect: () => state.clues++,
        next: securityLogs
      },
      {
        text: "Check badge access",
        effect: () => state.trust++,
        next: securityBadges
      },
      {
        text: "Recover footage",
        next: securityFootage
      },
      { text: "Return hub", next: hub }
    ]
  );
}

function securityLogs() {
  scene("Internal override detected.", [
    { text: "Go garden", next: garden },
    { text: "Return hub", next: hub }
  ]);
}

function securityBadges() {
  scene("Multiple staff accessed restricted zone.", [
    { text: "Go kitchen", next: kitchen },
    { text: "Return hub", next: hub }
  ]);
}

function securityFootage() {
  state.inventory.push("Blurred Footage");
  update();

  scene("Figure seen heading toward garden.", [
    { text: "Go garden", next: garden },
    { text: "Return hub", next: hub }
  ]);
}

// =========================
// KITCHEN
// =========================
function kitchen() {
  scene(
    "Kitchen smells like bleach. Someone cleaned quickly.",
    [
      {
        text: "Search sink",
        effect: () => {
          state.clues++;
          state.inventory.push("Chemical Evidence");
        },
        next: kitchenSink
      },
      {
        text: "Check trash",
        next: kitchenTrash
      },
      {
        text: "Talk chef",
        next: chef
      },
      { text: "Return hub", next: hub }
    ]
  );
}

function kitchenSink() {
  scene("Chemical residue confirms cleanup.", [
    { text: "Go security", next: security },
    { text: "Return hub", next: hub }
  ]);
}

function kitchenTrash() {
  state.inventory.push("Fabric Piece");
  update();

  scene("Fabric matches museum staff uniform.", [
    { text: "Go garden", next: garden },
    { text: "Return hub", next: hub }
  ]);
}

// =========================
// CHEF
// =========================
function chef() {
  scene(
    "Chef: 'I only cook… nothing else.'",
    [
      {
        text: "Accuse him",
        effect: () => state.clues++,
        next: security
      },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// LIBRARY (FIXED — YOUR BUG WAS HERE BEFORE)
// =========================
function library() {
  scene(
    "Books displaced. Security file missing.",
    [
      {
        text: "Search shelves",
        effect: () => {
          state.clues++;
          state.inventory.push("Security Page");
        },
        next: libraryResult
      },
      {
        text: "Talk librarian",
        next: librarian
      },
      { text: "Return hub", next: hub }
    ]
  );
}

function libraryResult() {
  scene(
    "Security blind spots documented here.",
    [
      { text: "Go security", next: security },
      { text: "Go garden", next: garden },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// LIBRARIAN
// =========================
function librarian() {
  scene(
    "Librarian: 'Some truths are locked away.'",
    [
      { text: "Force answers", next: security },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// GARDEN
// =========================
function garden() {
  scene(
    "Fog covers the garden. Everything connects here.",
    [
      { text: "Follow footprints", next: finalCase },
      { text: "Inspect bushes", next: finalCase },
      {
        text: "Check hidden wall",
        next: secretRoom
      },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// SECRET ROOM
// =========================
function secretRoom() {
  scene(
    "Hidden surveillance files discovered.",
    [
      { text: "Analyze files", next: secretEnding },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// ENDINGS
// =========================
function finalCase() {
  if (state.clues >= 5 && state.trust >= 2) goodEnding();
  else if (state.inventory.includes("Blurred Footage")) secretEnding();
  else if (state.clues >= 3) neutralEnding();
  else badEnding();
}

function goodEnding() {
  scene("🏆 Case solved perfectly.", [{ text: "Restart", next: start }]);
}

function neutralEnding() {
  scene("🟡 Case solved but incomplete.", [{ text: "Restart", next: start }]);
}

function badEnding() {
  scene("💀 Case failed. Suspect escapes.", [{ text: "Restart", next: start }]);
}

function secretEnding() {
  scene("🧠 SECRET: Hidden conspiracy uncovered.", [{ text: "Restart", next: start }]);
}

// START GAME
start();
