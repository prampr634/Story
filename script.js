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
// SCENE ENGINE
// =========================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(o => {
      const b = document.createElement("button");
      b.innerText = o.text;

      b.onclick = () => {
        if (typing) return;
        if (o.effect) o.effect();
        update();
        o.next();
      };

      choicesEl.appendChild(b);
    });
  });
}

// =========================
// START (INIT ONLY)
// =========================
function start() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  update();
  hub();
}

// =========================
// HUB (MAIN LOOP - FIXES ALL BUGS)
// =========================
function hub() {
  scene(
    "🕵️ The diamond is missing. The museum is locked. You must investigate all leads.",
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
// MUSEUM (EXPANDED)
// =========================
function museum() {
  scene(
    "Glass case shattered from inside. No forced entry detected.",
    [
      {
        text: "Inspect glass fragments",
        effect: () => state.clues++,
        next: () => museum2()
      },
      {
        text: "Check security angle",
        effect: () => state.trust++,
        next: security
      },
      {
        text: "Talk to guard",
        next: guard
      },
      {
        text: "Return to hub",
        next: hub
      }
    ]
  );
}

function museum2() {
  scene(
    "Break pattern suggests internal access, not theft.",
    [
      { text: "Go security", next: security },
      { text: "Go kitchen", next: kitchen },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// GUARD NPC
// =========================
function guard() {
  scene(
    "Guard: 'I saw movement… but it wasn’t an outsider.'",
    [
      {
        text: "Press further",
        effect: () => state.trust++,
        next: security
      },
      {
        text: "Observe silently",
        next: museum
      },
      {
        text: "Return",
        next: hub
      }
    ]
  );
}

// =========================
// SECURITY ROOM
// =========================
function security() {
  scene(
    "Monitors flicker. Camera feed missing at 2:14 AM.",
    [
      {
        text: "Check logs",
        effect: () => state.clues++,
        next: security2
      },
      {
        text: "Check badge access",
        effect: () => state.trust++,
        next: security3
      },
      {
        text: "Recover footage",
        next: security4
      },
      {
        text: "Return to hub",
        next: hub
      }
    ]
  );
}

function security2() {
  scene("Internal override detected during theft window.", [
    { text: "Go garden", next: garden },
    { text: "Return", next: hub }
  ]);
}

function security3() {
  scene("Multiple staff accessed restricted zone.", [
    { text: "Go kitchen", next: kitchen },
    { text: "Return", next: hub }
  ]);
}

function security4() {
  state.inventory.push("Blurred Footage");
  update();

  scene(
    "Recovered footage shows a figure leaving toward the garden.",
    [
      { text: "Go garden", next: garden },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// KITCHEN
// =========================
function kitchen() {
  scene(
    "Kitchen smells like bleach. Evidence was cleaned fast.",
    [
      {
        text: "Search sink",
        effect: () => {
          state.clues++;
          state.inventory.push("Chemical Evidence");
        },
        next: kitchen2
      },
      {
        text: "Check trash",
        effect: () => state.clues++,
        next: kitchen3
      },
      {
        text: "Talk chef",
        next: chef
      },
      {
        text: "Return hub",
        next: hub
      }
    ]
  );
}

function kitchen2() {
  scene("Cleaning chemicals used immediately after incident.", [
    { text: "Go security", next: security },
    { text: "Return", next: hub }
  ]);
}

function kitchen3() {
  state.inventory.push("Fabric Piece");
  update();

  scene("Fabric matches museum staff uniform.", [
    { text: "Go garden", next: garden },
    { text: "Return", next: hub }
  ]);
}

// =========================
// CHEF
// =========================
function chef() {
  scene(
    "Chef: 'I only cook. I saw nothing suspicious.'",
    [
      { text: "Believe him", next: kitchen },
      {
        text: "Accuse him",
        effect: () => state.clues++,
        next: security
      },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// LIBRARY (EXPANDED)
// =========================
function library() {
  scene(
    "Books are misplaced. A file is missing from security archives.",
    [
      {
        text: "Search shelves",
        effect: () => {
          state.clues++;
          state.inventory.push("Security Page");
        },
        next: library2
      },
      {
        text: "Talk librarian",
        next: librarian
      },
      {
        text: "Return hub",
        next: hub
      }
    ]
  );
}

function library2() {
  scene("Security blind spots documented here.", [
    { text: "Go security", next: security },
    { text: "Return", next: hub }
  ]);
}

// =========================
// LIBRARIAN
// =========================
function librarian() {
  scene(
    "Librarian: 'Some truths are hidden for a reason.'",
    [
      { text: "Force answers", next: security },
      { text: "Return", next: library }
    ]
  );
}

// =========================
// GARDEN (FINAL HUB)
// =========================
function garden() {
  scene(
    "Fog covers the garden. Everything connects here.",
    [
      { text: "Follow footprints", next: finalCase },
      { text: "Inspect bushes", next: finalCase },
      { text: "Check hidden wall", next: secretPath },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// SECRET PATH
// =========================
function secretPath() {
  scene(
    "A hidden door appears behind ivy.",
    [
      { text: "Enter room", next: secretRoom },
      { text: "Return", next: garden }
    ]
  );
}

function secretRoom() {
  scene(
    "You discover surveillance files of ALL suspects.",
    [
      { text: "Analyze files", next: secretEnding },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// ENDINGS
// =========================
function finalCase() {
  if (state.clues >= 6 && state.trust >= 2) goodEnding();
  else if (state.inventory.includes("Blurred Footage")) secretEnding();
  else if (state.clues >= 4) neutralEnding();
  else badEnding();
}

function goodEnding() {
  scene("🏆 Perfect investigation. Case solved.", [{ text: "Restart", next: start }]);
}

function neutralEnding() {
  scene("🟡 Case solved but incomplete truth.", [{ text: "Restart", next: start }]);
}

function badEnding() {
  scene("💀 Case failed. Suspect escapes.", [{ text: "Restart", next: start }]);
}

function secretEnding() {
  scene("🧠 SECRET: Hidden conspiracy uncovered.", [{ text: "Restart", next: start }]);
}

// START GAME
start();
