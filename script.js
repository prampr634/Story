
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

// =========================
// TYPE ENGINE
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
  }, 12);
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
    "🕵️ A diamond vanished inside a locked museum. No forced entry. Three leads remain.",
    [
      { text: "🏛️ Museum", next: museum },
      { text: "🖥️ Security Room", next: security },
      { text: "🍪 Kitchen", next: kitchen },
      { text: "📚 Library", next: library }
    ]
  );
}

// =========================
// MUSEUM (EXPANDED)
// =========================
function museum() {
  scene(
    "Glass case shattered… but no entry point exists.",
    [
      {
        text: "Inspect glass",
        effect: () => state.clues++,
        next: museum2
      },
      {
        text: "Talk to guard",
        effect: () => state.trust++,
        next: guard
      },
      {
        text: "Go library",
        next: library
      }
    ]
  );
}

function museum2() {
  scene(
    "The break looks staged… someone wanted it to look like theft.",
    [
      { text: "Continue", next: security }
    ]
  );
}

// =========================
// 🧍 GUARD NPC
// =========================
function guard() {
  scene(
    "Guard: 'I saw someone inside... but I shouldn't say more.'",
    [
      {
        text: "Press harder",
        effect: () => state.clues++,
        next: security
      },
      {
        text: "Believe him",
        next: museum
      }
    ]
  );
}

// =========================
// SECURITY (EXPANDED)
// =========================
function security() {
  scene(
    "Monitors flicker. One camera feed is missing.",
    [
      {
        text: "Check logs",
        effect: () => state.clues++,
        next: security2
      },
      {
        text: "Question technician",
        effect: () => state.trust++,
        next: security3
      }
    ]
  );
}

function security2() {
  scene(
    "System shows internal override during theft window.",
    [
      { text: "Go garden", next: garden }
    ]
  );
}

function security3() {
  scene(
    "Technician: 'Someone used an authorized badge... not a hacker.'",
    [
      { text: "Go museum", next: museum },
      { text: "Go library", next: library }
    ]
  );
}

// =========================
// 🍪 KITCHEN
// =========================
function kitchen() {
  scene(
    "Kitchen is too clean… like evidence was removed.",
    [
      {
        text: "Search sink",
        effect: () => {
          state.clues++;
          state.inventory.push("Chemical Residue");
        },
        next: kitchen2
      },
      {
        text: "Talk to chef",
        effect: () => state.trust++,
        next: chef
      }
    ]
  );
}

function kitchen2() {
  scene(
    "Bleach traces suggest cleanup after incident.",
    [
      { text: "Go security", next: security },
      { text: "Go garden", next: garden }
    ]
  );
}

// =========================
// 🍽️ CHEF NPC
// =========================
function chef() {
  scene(
    "Chef: 'I was cooking... I didn't see anything suspicious.'",
    [
      { text: "Trust him", next: kitchen },
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
    "Books are displaced… one file is missing: Security Protocols.",
    [
      {
        text: "Search shelves",
        effect: () => {
          state.clues++;
          state.inventory.push("Torn Security Page");
        },
        next: library2
      },
      {
        text: "Talk to librarian",
        next: librarian
      }
    ]
  );
}

function library2() {
  scene(
    "The missing file describes museum blind spots.",
    [
      { text: "Go security", next: security },
      { text: "Go museum", next: museum }
    ]
  );
}

// =========================
// 🧍 LIBRARIAN
// =========================
function librarian() {
  scene(
    "Librarian: 'Some books are better left unread.'",
    [
      {
        text: "Force answers",
        effect: () => state.trust--,
        next: security
      },
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
      {
        text: "Follow footprints",
        next: finalCase
      },
      {
        text: "Inspect bushes",
        effect: () => state.clues++,
        next: finalCase
      }
    ]
  );
}

// =========================
// 🏁 FINAL CASE (MORE ENDINGS)
// =========================
function finalCase() {

  if (state.clues >= 5 && state.trust >= 2) {
    goodEnding();
  }

  else if (state.clues >= 3) {
    neutralEnding();
  }

  else if (state.inventory.includes("Torn Security Page")) {
    secretEnding();
  }

  else {
    badEnding();
  }
}

// =========================
// ENDINGS
// =========================
function goodEnding() {
  scene("🏆 Perfect deduction. Insider exposed. Case solved.", [{ text: "Restart", next: start }]);
}

function neutralEnding() {
  scene("🟡 Case solved, but key truths remain hidden.", [{ text: "Restart", next: start }]);
}

function badEnding() {
  scene("💀 Case failed. Suspect escapes.", [{ text: "Restart", next: start }]);
}

function secretEnding() {
  scene("🧠 SECRET ENDING: You discovered hidden internal surveillance conspiracy.", [{ text: "Restart", next: start }]);
}

// START
start();
