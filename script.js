// ==========================
// GAME STATE
// ==========================
let state = {
  score: 0,
  clues: 0,
  trust: 0,
  inventory: []
};

// ==========================
// ELEMENTS
// ==========================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const cluesEl = document.getElementById("clues");
const trustEl = document.getElementById("trust");
const invEl = document.getElementById("inv");

// ==========================
// UPDATE HUD
// ==========================
function update() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
  invEl.innerText = state.inventory.length ? state.inventory.join(", ") : "None";
}

// ==========================
// SAFE TYPE ENGINE
// ==========================
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
  }, 14);
}

// ==========================
// CORE SCENE ENGINE
// ==========================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt.text;

      btn.onclick = () => {
        if (opt.effect) opt.effect();
        update();
        opt.next();
      };

      choicesEl.appendChild(btn);
    });
  });
}

// ==========================
// GAME START
// ==========================
function startGame() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  update();

  scene(
    "🕵️ The museum alarm went off at 2:13 AM. The diamond vanished. Cameras corrupted. Three zones show suspicious activity.",
    [
      { text: "🍪 Kitchen Wing", next: kitchen },
      { text: "🖥️ Security Room", next: security },
      { text: "🌿 Garden Exit", next: garden }
    ]
  );
}

// ==========================
// KITCHEN ARC (LONG + BRANCHED)
// ==========================
function kitchen() {
  scene(
    "The kitchen is frozen in chaos. Broken glass, spilled liquid, and a faint chemical smell.",
    [
      {
        text: "Inspect fridge",
        effect: () => state.clues++,
        next: kitchenFridge
      },
      {
        text: "Check floor stains",
        effect: () => state.score += 3,
        next: kitchenFloor
      },
      {
        text: "Eat cookie (risky)",
        next: () => lose("☠️ Poisoned bait. You collapsed instantly.")
      }
    ]
  );
}

function kitchenFridge() {
  scene(
    "Inside the fridge: a hidden compartment opens… revealing a coded key.",
    [
      {
        text: "Take key",
        effect: () => state.inventory.push("Key"),
        next: kitchenReturn
      },
      { text: "Ignore", next: kitchenReturn }
    ]
  );
}

function kitchenFloor() {
  scene(
    "Footprints overlap here. At least two suspects moved through this area.",
    [
      { text: "Follow prints", next: garden },
      {
        text: "Report evidence",
        effect: () => state.trust++,
        next: security
      }
    ]
  );
}

function kitchenReturn() {
  scene("You leave the kitchen with new information.", [
    { text: "Go back", next: startGame }
  ]);
}

// ==========================
// SECURITY ARC (DEEPER)
// ==========================
function security() {
  scene(
    "Security hub is glitching. One guard is sweating, avoiding eye contact.",
    [
      {
        text: "Interrogate guard",
        effect: () => state.trust += 2,
        next: securityTalk
      },
      {
        text: "Hack system",
        next: () => lose("🚨 System lock triggered. Investigation blocked.")
      },
      {
        text: "Watch silently",
        effect: () => state.score += 2,
        next: securityReveal
      }
    ]
  );
}

function securityTalk() {
  scene(
    "Guard whispers: 'There were TWO people in the garden… not one.'",
    [{ text: "Go garden", next: garden }]
  );
}

function securityReveal() {
  scene(
    "You uncover corrupted footage showing a second hidden suspect.",
    [{ text: "Investigate garden", next: garden }]
  );
}

// ==========================
// GARDEN (MULTI-END GAME SYSTEM)
// ==========================
function garden() {
  scene(
    "Fog covers the garden. Two paths split: one clean, one destroyed.",
    [
      {
        text: "Take clean path",
        next: () => {
          if (state.trust >= 2 && state.inventory.includes("Key")) {
            win("🏆 MASTER DETECTIVE ENDING: You solved everything perfectly.");
          } else {
            lose("You trusted incomplete evidence. The real thief escapes.");
          }
        }
      },
      {
        text: "Take broken path",
        next: () => {
          if (state.clues >= 2) {
            win("🏆 EVIDENCE-BASED ENDING: You solved the case through clues.");
          } else {
            lose("Trap triggered. Investigation failed.");
          }
        }
      },
      {
        text: "Call backup",
        next: () => win("🚔 PROFESSIONAL ENDING: Backup secures the arrest.")
      },
      {
        text: "Search secretly (hidden path)",
        next: () => secretEnding()
      }
    ]
  );
}

// ==========================
// SECRET ENDING
// ==========================
function secretEnding() {
  if (state.inventory.includes("Key") && state.trust >= 1) {
    win("🕶️ SECRET ENDING: You discover the thief is an inside agent…");
  } else {
    lose("Secret path failed. You were not ready.");
  }
}

// ==========================
// ENDINGS
// ==========================
function win(msg) {
  scene("🏆 " + msg, [
    { text: "Play Again", next: startGame }
  ]);
}

function lose(msg) {
  scene("💀 " + msg, [
    { text: "Restart Case", next: startGame }
  ]);
}

// START
startGame();
