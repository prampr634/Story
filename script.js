
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
  }, 10);
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
// START
// =========================
function start() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  update();

  scene(
    "🕵️ A diamond vanished from a locked museum. No forced entry. You must uncover the truth.",
    [
      { text: "🏛️ Enter Museum", next: museum },
      { text: "🖥️ Security Room", next: security },
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🌿 Garden", next: garden },
      { text: "📚 Library", next: library }
    ]
  );
}

// =========================
// 🏛️ MUSEUM (EXPANDED STORY)
// =========================
function museum() {
  scene(
    "Glass case shattered… but strangely no broken entrance.",
    [
      {
        text: "Inspect glass",
        effect: () => state.clues++,
        next: museum2
      },
      {
        text: "Check camera angle",
        next: security
      },
      {
        text: "Talk to guard",
        next: guard
      },
      {
        text: "Check floor prints",
        effect: () => state.clues++,
        next: museum3
      },
      {
        text: "Return outside",
        next: start
      }
    ]
  );
}

function museum2() {
  scene(
    "Break pattern suggests internal access.",
    [
      { text: "Continue", next: security }
    ]
  );
}

function museum3() {
  state.inventory.push("Footprint Evidence");
  update();

  scene(
    "Footprints lead toward kitchen wing.",
    [
      { text: "Go kitchen", next: kitchen },
      { text: "Go security", next: security }
    ]
  );
}

// =========================
// 🧍 GUARD
// =========================
function guard() {
  scene(
    "Guard: 'I saw nothing… but I heard movement.'",
    [
      {
        text: "Press him",
        effect: () => state.trust++,
        next: security
      },
      {
        text: "Observe behavior",
        next: kitchen
      },
      {
        text: "Leave",
        next: museum
      }
    ]
  );
}

// =========================
// 🖥️ SECURITY ROOM (EXPANDED)
// =========================
function security() {
  scene(
    "Monitors flicker. Footage missing at exact theft time.",
    [
      {
        text: "Check logs",
        effect: () => state.clues++,
        next: security2
      },
      {
        text: "Check badge records",
        effect: () => state.trust++,
        next: security3
      },
      {
        text: "Recover deleted footage",
        next: security4
      },
      {
        text: "Question technician",
        next: technician
      }
    ]
  );
}

function security2() {
  scene("Internal override detected.", [{ text: "Continue", next: garden }]);
}

function security3() {
  scene("Multiple staff accessed restricted zone.", [{ text: "Go kitchen", next: kitchen }]);
}

function security4() {
  state.inventory.push("Blurred Footage");
  update();

  scene(
    "You see a figure carrying a case toward garden.",
    [
      { text: "Go garden", next: garden },
      { text: "Go museum", next: museum }
    ]
  );
}

// =========================
// 🍪 KITCHEN (EXPANDED)
// =========================
function kitchen() {
  scene(
    "Kitchen smells like bleach and panic.",
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
        next: kitchen3
      },
      {
        text: "Talk chef",
        next: chef
      }
    ]
  );
}

function kitchen2() {
  scene("Cleaning happened minutes after theft.", [{ text: "Continue", next: kitchen }]);
}

function kitchen3() {
  state.inventory.push("Fabric Piece");
  update();

  scene(
    "Fabric matches museum staff uniform.",
    [
      { text: "Go security", next: security },
      { text: "Go garden", next: garden }
    ]
  );
}

// =========================
// 🍽️ CHEF
// =========================
function chef() {
  scene(
    "Chef: 'I was cooking… nothing else.'",
    [
      { text: "Believe him", next: kitchen },
      {
        text: "Accuse him",
        effect: () => state.clues++,
        next: security
      }
    ]
  );
}

// =========================
// 📚 LIBRARY (NEW BIG AREA)
// =========================
function library() {
  scene(
    "Books are displaced. One file is missing.",
    [
      {
        text: "Search shelves",
        effect: () => {
          state.clues++;
          state.inventory.push("Security Manual Page");
        },
        next: library2
      },
      {
        text: "Talk librarian",
        next: librarian
      },
      {
        text: "Go museum records",
        next: museum
      }
    ]
  );
}

function library2() {
  scene("Security blind spots are documented here.", [{ text: "Continue", next: security }]);
}

// =========================
// 🧍 LIBRARIAN
// =========================
function librarian() {
  scene(
    "Librarian: 'Some truths are locked away for a reason.'",
    [
      { text: "Force answers", next: security },
      { text: "Leave", next: library }
    ]
  );
}

// =========================
// 🌿 GARDEN (FINAL HUB)
// =========================
function garden() {
  scene(
    "Fog covers the garden. Everything connects here.",
    [
      { text: "Follow footprints", next: finalCase },
      { text: "Inspect bushes", next: finalCase },
      { text: "Check hidden wall", next: secretPath },
      { text: "Recheck museum", next: museum }
    ]
  );
}

// =========================
// 💀 SECRET PATH
// =========================
function secretPath() {
  scene(
    "A hidden door is behind ivy.",
    [
      { text: "Enter room", next: secretRoom },
      { text: "Go back", next: garden }
    ]
  );
}

function secretRoom() {
  scene(
    "You find surveillance files of every suspect.",
    [
      { text: "Analyze files", next: secretEnding },
      { text: "Leave", next: badEnding }
    ]
  );
}

// =========================
// ENDINGS (MULTI-LOGIC)
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
  scene("🟡 Case solved but incomplete.", [{ text: "Restart", next: start }]);
}

function badEnding() {
  scene("💀 Case failed. Suspect escapes.", [{ text: "Restart", next: start }]);
}

function secretEnding() {
  scene("🧠 SECRET: Hidden conspiracy exposed.", [{ text: "Restart", next: start }]);
}

// START
start();
