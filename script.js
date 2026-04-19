
// =========================
// STATE (UPGRADED)
// =========================
let state = {
  clues: [],
  trust: 0,
  suspicion: {
    guard: 0,
    chef: 0,
    technician: 0
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
  cluesEl.innerText = state.clues.length;
  trustEl.innerText = state.trust;
}

// =========================
// SAFE SCENE ENGINE
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

        if (o.next) o.next();
        else hub();
      };

      choicesEl.appendChild(btn);
    });
  });
}

// =========================
// START
// =========================
function start() {
  state = {
    clues: [],
    trust: 0,
    suspicion: { guard: 0, chef: 0, technician: 0 }
  };
  update();
  hub();
}

// =========================
// HUB
// =========================
function hub() {
  scene(
    "🕵️ The diamond is missing. Choose where to investigate:",
    [
      { text: "🏛️ Museum", next: museum },
      { text: "🖥️ Security Room", next: security },
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🌿 Garden", next: garden },
      { text: "📓 DEDUCTION BOARD", next: deductionBoard }
    ]
  );
}

// =========================
// MUSEUM
// =========================
function museum() {
  scene(
    "Glass case shattered from inside.",
    [
      {
        text: "Inspect glass",
        effect: () => state.clues.push("Glass broken from inside"),
        next: hub
      },
      {
        text: "Talk guard",
        next: guard
      },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// GUARD (SUSPECT SYSTEM)
// =========================
function guard() {
  scene(
    "Guard avoids eye contact.",
    [
      {
        text: "Press him",
        effect: () => state.suspicion.guard += 1,
        next: () => {
          scene("Guard looks nervous… too nervous.", [
            { text: "Return hub", next: hub }
          ]);
        }
      },
      {
        text: "Accuse guard",
        effect: () => state.suspicion.guard += 2,
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
    "Footage missing at exact theft time.",
    [
      {
        text: "Check logs",
        effect: () => state.clues.push("System override detected"),
        next: hub
      },
      {
        text: "Check technician access",
        effect: () => state.suspicion.technician += 2,
        next: hub
      }
    ]
  );
}

// =========================
// KITCHEN
// =========================
function kitchen() {
  scene(
    "Kitchen smells like bleach.",
    [
      {
        text: "Search sink",
        effect: () => state.clues.push("Chemical cleanup evidence"),
        next: hub
      },
      {
        text: "Talk chef",
        effect: () => state.suspicion.chef += 1,
        next: chef
      }
    ]
  );
}

// =========================
// CHEF
// =========================
function chef() {
  scene(
    "Chef denies involvement.",
    [
      {
        text: "Accuse chef",
        effect: () => state.suspicion.chef += 2,
        next: hub
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
    "Fog hides footprints.",
    [
      {
        text: "Follow footprints",
        effect: () => state.clues.push("Escape route toward garden"),
        next: hub
      },
      {
        text: "Search bushes",
        effect: () => state.clues.push("Hidden movement detected"),
        next: hub
      }
    ]
  );
}

// =========================
// 📓 DEDUCTION BOARD (NEW CORE SYSTEM)
// =========================
function deductionBoard() {
  let topSuspect = "None";

  if (state.suspicion.guard > state.suspicion.chef &&
      state.suspicion.guard > state.suspicion.technician) {
    topSuspect = "Guard";
  } else if (state.suspicion.chef > state.suspicion.guard &&
             state.suspicion.chef > state.suspicion.technician) {
    topSuspect = "Chef";
  } else if (state.suspicion.technician > 0) {
    topSuspect = "Technician";
  }

  scene(
    `📓 DEDUCTION BOARD\n\nClues Found: ${state.clues.length}\nTop Suspect: ${topSuspect}`,
    [
      {
        text: "Make arrest",
        next: () => finalVerdict(topSuspect)
      },
      { text: "Return hub", next: hub }
    ]
  );
}

// =========================
// FINAL VERDICT SYSTEM
// =========================
function finalVerdict(suspect) {
  if (suspect === "Guard") {
    scene("🏆 You arrested the guard. Case solved.", [{ text: "Restart", next: start }]);
  } else if (suspect === "Chef") {
    scene("🟡 Chef was involved but not main thief.", [{ text: "Restart", next: start }]);
  } else if (suspect === "Technician") {
    scene("🧠 Technician was mastermind behind system override.", [{ text: "Restart", next: start }]);
  } else {
    scene("💀 No solid evidence. Case failed.", [{ text: "Restart", next: start }]);
  }
}

// START
start();
