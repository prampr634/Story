// ======================
// GAME STATE (GLOBAL)
// ======================
const state = {
  score: 0,
  clues: 0,
  trust: 0,
  locked: false
};

// ======================
// DOM ELEMENTS
// ======================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const cluesEl = document.getElementById("clues");
const trustEl = document.getElementById("trust");

// ======================
// SAFE TYPEWRITER (FIXED)
// ======================
function typeText(text, done) {
  textEl.innerHTML = "";
  let i = 0;

  const interval = setInterval(() => {
    textEl.innerHTML += text[i];
    i++;

    if (i >= text.length) {
      clearInterval(interval);
      if (done) done();
    }
  }, 15);
}

// ======================
// UPDATE UI
// ======================
function updateStats() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
}

// ======================
// ENGINE: SET SCENE (LOCKED SAFE)
// ======================
function setScene(text, options = []) {
  state.locked = true;

  choicesEl.innerHTML = "";

  typeText(text, () => {
    state.locked = false;

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt.text;

      btn.onclick = () => {
        if (state.locked) return; // prevents spam bugs

        if (opt.effect) opt.effect();
        updateStats();

        opt.next();
      };

      choicesEl.appendChild(btn);
    });
  });
}

// ======================
// START GAME
// ======================
function start() {
  state.score = 0;
  state.clues = 0;
  state.trust = 0;

  updateStats();

  setScene(
    "🕵️ Detective Mira enters the locked museum. The diamond is gone. Cameras are dead. Silence feels wrong… Where do you investigate first?",
    [
      { text: "🍪 Kitchen Wing", next: kitchen },
      { text: "🧠 Security Hub", next: security },
      { text: "🌿 Garden Exit", next: garden }
    ]
  );
}

// ======================
// KITCHEN (MORE COMPLEX)
// ======================
function kitchen() {
  setScene(
    "The kitchen smells metallic. A drawer is slightly open… and something is dripping.",
    [
      {
        text: "Open drawer",
        effect: () => state.clues += 1,
        next: kitchen2
      },
      {
        text: "Inspect floor",
        effect: () => state.score += 2,
        next: kitchenFloor
      },
      {
        text: "Eat cookie (risky)",
        next: () => lose("☠️ The cookie was poisoned. Instant failure.")
      }
    ]
  );
}

function kitchen2() {
  setScene(
    "Inside the drawer: a coded key and a torn note saying 'GARDEN = TRUTH'.",
    [
      {
        text: "Take both items",
        effect: () => state.clues += 2,
        next: start
      },
      {
        text: "Ignore it",
        next: start
      }
    ]
  );
}

function kitchenFloor() {
  setScene(
    "You find muddy footprints AND fresh blood stains.",
    [
      {
        text: "Follow footprints",
        next: garden
      },
      {
        text: "Report evidence",
        effect: () => state.trust += 1,
        next: security
      }
    ]
  );
}

// ======================
// SECURITY (MORE BRANCHES)
// ======================
function security() {
  setScene(
    "Security hub is frozen. One guard is sweating heavily.",
    [
      {
        text: "Interrogate guard",
        effect: () => state.trust += 2,
        next: securityTalk
      },
      {
        text: "Hack system",
        next: () => lose("🚨 You triggered lockdown protocol.")
      },
      {
        text: "Watch silently",
        effect: () => state.score += 3,
        next: securitySilent
      }
    ]
  );
}

function securityTalk() {
  setScene(
    "Guard whispers: 'Someone inside the garden is lying… badly.'",
    [
      { text: "Go garden", next: garden }
    ]
  );
}

function securitySilent() {
  setScene(
    "You notice hidden camera footage glitching… showing a SECOND suspect.",
    [
      { text: "Investigate garden", next: garden }
    ]
  );
}

// ======================
// GARDEN (FINAL ROUTE)
// ======================
function garden() {
  setScene(
    "Fog spreads across the garden. Two paths appear: one clean, one destroyed.",
    [
      {
        text: "Take clean path",
        next: () => {
          if (state.trust >= 2) {
            win("🏆 You correctly identify the thief with strong evidence.");
          } else {
            lose("You trusted the wrong clues. The thief escapes.");
          }
        }
      },
      {
        text: "Take broken path",
        next: () => {
          if (state.clues >= 3) {
            win("🏆 You piece together all clues and solve the case.");
          } else {
            lose("Trap activated. Wrong path.");
          }
        }
      },
      {
        text: "Call backup",
        next: () => win("🚔 Backup arrives. Case solved professionally.")
      }
    ]
  );
}

// ======================
// ENDINGS
// ======================
function win(msg) {
  setScene("🏆 " + msg + "\n\nFinal Score: " + state.score, [
    { text: "Play Again", next: start }
  ]);
}

function lose(msg) {
  setScene("💀 " + msg + "\n\nCase Failed.", [
    { text: "Restart", next: start }
  ]);
}

// START
start();
