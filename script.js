
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
// UPDATE UI
// =========================
function update() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
  invEl.innerText = state.inventory.length ? state.inventory.join(", ") : "None";
}

// =========================
// SAFE ENGINE (NO DEAD BUTTONS)
// =========================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(o => {
      const b = document.createElement("button");
      b.innerText = o.text;

      b.onclick = () => {
        if (typing) return;

        // ALWAYS DO SOMETHING
        if (o.effect) o.effect();
        update();

        // SAFE NAVIGATION (NO DEAD ENDS)
        if (o.next) {
          o.next();
        } else {
          hub(); // fallback ALWAYS works
        }
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
  hub();
}

// =========================
// HUB (ALWAYS SAFE RETURN POINT)
// =========================
function hub() {
  scene(
    "🕵️ The diamond is missing from the locked museum. Where do you investigate?",
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
    "Glass case shattered… but no forced entry exists.",
    [
      {
        text: "Inspect glass",
        effect: () => state.clues++,
        next: () => {
          scene("You notice the break was from inside.", [
            { text: "Go security", next: security },
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Talk guard",
        next: guard
      },
      {
        text: "Check floor",
        effect: () => {
          state.inventory.push("Footprint Evidence");
        },
        next: () => {
          scene("Footprints lead toward kitchen wing.", [
            { text: "Go kitchen", next: kitchen },
            { text: "Return", next: hub }
          ]);
        }
      },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// GUARD
// =========================
function guard() {
  scene(
    "Guard: 'I saw movement… but it wasn’t an outsider.'",
    [
      {
        text: "Press him",
        effect: () => state.trust++,
        next: () => {
          scene("Guard admits internal access was used.", [
            { text: "Go security", next: security },
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Leave",
        next: hub
      }
    ]
  );
}

// =========================
// SECURITY
// =========================
function security() {
  scene(
    "Monitors flicker. Footage missing at 2:14 AM.",
    [
      {
        text: "Check logs",
        effect: () => state.clues++,
        next: () => {
          scene("System override detected internally.", [
            { text: "Go garden", next: garden },
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Check badge records",
        effect: () => state.trust++,
        next: () => {
          scene("Three staff accessed restricted area.", [
            { text: "Go kitchen", next: kitchen },
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Recover footage",
        next: () => {
          state.inventory.push("Blurred Footage");
          update();

          scene("Figure seen moving toward garden.", [
            { text: "Go garden", next: garden },
            { text: "Return", next: hub }
          ]);
        }
      },
      { text: "Return", next: hub }
    ]
  );
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
        next: () => {
          scene("Chemical residue confirms cleanup.", [
            { text: "Go security", next: security },
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Check trash",
        next: () => {
          state.inventory.push("Fabric Piece");
          update();

          scene("Fabric matches museum staff uniform.", [
            { text: "Go garden", next: garden },
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Talk chef",
        next: chef
      },
      { text: "Return", next: hub }
    ]
  );
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
      {
        text: "Leave",
        next: hub
      }
    ]
  );
}

// =========================
// LIBRARY
// =========================
function library() {
  scene(
    "Books displaced. A security file is missing.",
    [
      {
        text: "Search shelves",
        effect: () => {
          state.inventory.push("Security Page");
          state.clues++;
        },
        next: () => {
          scene("Blind spots in security documented here.", [
            { text: "Go security", next: security },
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Talk librarian",
        next: () => {
          scene("Librarian: 'Some truths are dangerous.'", [
            { text: "Return", next: hub }
          ]);
        }
      },
      { text: "Return", next: hub }
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
      {
        text: "Follow footprints",
        next: finalCase
      },
      {
        text: "Inspect bushes",
        effect: () => state.clues++,
        next: finalCase
      },
      {
        text: "Check hidden wall",
        next: () => {
          scene("A hidden door appears behind ivy.", [
            {
              text: "Enter",
              next: secretRoom
            },
            { text: "Return", next: hub }
          ]);
        }
      },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// SECRET ROOM
// =========================
function secretRoom() {
  scene(
    "You find surveillance files of all suspects.",
    [
      {
        text: "Analyze files",
        next: secretEnding
      },
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

// START
start();
