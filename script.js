// =========================
// SOUND SYSTEM (FIXED: song/)
// =========================
const sounds = {
  click: new Audio("song/click.mp3"),
  win: new Audio("song/win.mp3"),
  lose: new Audio("song/lose.mp3"),
  tension: new Audio("song/tension.mp3"),
  clue: new Audio("song/clue.mp3")
};

sounds.tension.loop = true;

function play(name) {
  if (!sounds[name]) return;
  sounds[name].currentTime = 0;
  sounds[name].play().catch(()=>{});
}

// =========================
// STATE
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
const cluesEl = document.getElementById("clues");
const trustEl = document.getElementById("trust");

let typing = false;

// =========================
// TYPEWRITER
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
      cb && cb();
    }
  }, 12);
}

// =========================
// UPDATE UI
// =========================
function update() {
  cluesEl.innerText = state.clues.length;
  trustEl.innerText = state.trust;
}

// =========================
// ENGINE (NO DEAD BUTTONS EVER)
// =========================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(o => {
      const b = document.createElement("button");
      b.innerText = o.text;

      b.onclick = () => {
        if (typing) return;

        play("click");

        if (o.effect) o.effect();
        update();

        if (typeof o.next === "function") {
          o.next();
        } else {
          hub();
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
  state = {
    clues: [],
    trust: 0,
    suspicion: { guard: 0, chef: 0, technician: 0 }
  };

  sounds.tension.pause();
  update();
  intro();
}

// =========================
// INTRO (NEW)
// =========================
function intro() {
  scene(
    "🌙 Midnight. The museum is sealed. The diamond is gone. No signs of forced entry.",
    [
      {
        text: "Enter investigation",
        next: hub
      }
    ]
  );
}

// =========================
// HUB (ALWAYS MULTIPLE OPTIONS)
// =========================
function hub() {
  sounds.tension.play().catch(()=>{});

  scene(
    "🕵️ Choose your next move carefully.",
    [
      { text: "🏛️ Museum Hall", next: museum },
      { text: "🖥️ Security Room", next: security },
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🌿 Garden", next: garden },
      { text: "🧍 Interrogate Suspects", next: suspects },
      { text: "📓 Deduction Board", next: deduction }
    ]
  );
}

// =========================
// MUSEUM
// =========================
function museum() {
  scene(
    "Glass shattered inward. This was staged.",
    [
      {
        text: "Analyze glass pattern",
        effect: () => {
          state.clues.push("Inside job");
          play("clue");
        },
        next: museum2
      },
      {
        text: "Search floor",
        effect: () => {
          state.clues.push("Footprints");
          play("clue");
        },
        next: garden
      },
      { text: "Return", next: hub }
    ]
  );
}

function museum2() {
  scene(
    "The break confirms internal access.",
    [
      { text: "Check security logs", next: security },
      { text: "Interrogate guard", next: guard },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// SECURITY
// =========================
function security() {
  scene(
    "Footage missing exactly at 2:14 AM.",
    [
      {
        text: "Recover logs",
        effect: () => {
          state.clues.push("Override used");
          play("clue");
        },
        next: security2
      },
      {
        text: "Inspect system",
        effect: () => state.suspicion.technician += 2,
        next: hub
      },
      { text: "Return", next: hub }
    ]
  );
}

function security2() {
  scene(
    "Manual override. Someone knew the system.",
    [
      { text: "Go to suspects", next: suspects },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// KITCHEN
// =========================
function kitchen() {
  scene(
    "Strong bleach smell. Something was cleaned.",
    [
      {
        text: "Search sink",
        effect: () => {
          state.clues.push("Cleanup");
          play("clue");
        },
        next: kitchen2
      },
      {
        text: "Talk chef",
        next: chef
      },
      { text: "Return", next: hub }
    ]
  );
}

function kitchen2() {
  scene(
    "Someone erased evidence quickly.",
    [
      { text: "Go to suspects", next: suspects },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// GARDEN
// =========================
function garden() {
  scene(
    "Fog hides movement.",
    [
      {
        text: "Follow footprints",
        effect: () => {
          state.clues.push("Escape route");
          play("clue");
        },
        next: hub
      },
      {
        text: "Search bushes",
        effect: () => {
          state.clues.push("Hidden stash");
          play("clue");
        },
        next: hub
      },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// SUSPECT SYSTEM (NEW BIG FEATURE)
// =========================
function suspects() {
  scene(
    "Choose who to interrogate:",
    [
      { text: "Guard", next: guard },
      { text: "Chef", next: chef },
      { text: "Technician", next: technician },
      { text: "Return", next: hub }
    ]
  );
}

function guard() {
  scene(
    "Guard looks nervous.",
    [
      {
        text: "Accuse",
        effect: () => state.suspicion.guard += 2,
        next: hub
      },
      {
        text: "Pressure him",
        effect: () => {
          state.suspicion.guard++;
          state.trust++;
        },
        next: hub
      }
    ]
  );
}

function chef() {
  scene(
    "Chef avoids eye contact.",
    [
      {
        text: "Accuse",
        effect: () => state.suspicion.chef += 2,
        next: hub
      },
      { text: "Return", next: hub }
    ]
  );
}

function technician() {
  scene(
    "Technician knows the system well.",
    [
      {
        text: "Accuse",
        effect: () => state.suspicion.technician += 2,
        next: hub
      },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// DEDUCTION
// =========================
function deduction() {
  let suspect = "None";

  if (state.suspicion.guard >= 3) suspect = "Guard";
  else if (state.suspicion.technician >= 3) suspect = "Technician";
  else if (state.suspicion.chef >= 3) suspect = "Chef";

  scene(
    `📓 CLUES: ${state.clues.length}\nTOP SUSPECT: ${suspect}`,
    [
      {
        text: "Make Final Accusation",
        next: () => ending(suspect)
      },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// ENDINGS
// =========================
function ending(suspect) {
  sounds.tension.pause();

  if (suspect === "Guard") {
    play("win");
    scene("🏆 Guard confesses. Case solved.", [{ text: "Restart", next: start }]);
  } else if (suspect === "Technician") {
    play("win");
    scene("🧠 Technician planned everything.", [{ text: "Restart", next: start }]);
  } else {
    play("lose");
    scene("💀 Wrong choice. The thief escapes.", [{ text: "Restart", next: start }]);
  }
}

// START
start();
