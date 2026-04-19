 // =========================
// SOUND SYSTEM
// =========================
const sounds = {
  click: new Audio("sound/click.mp3"),
  win: new Audio("sound/win.mp3"),
  lose: new Audio("sound/lose.mp3"),
  tension: new Audio("sound/tension.mp3"),
  clue: new Audio("sound/clue.mp3")
};

function playSound(name) {
  if (!sounds[name]) return;
  sounds[name].currentTime = 0;
  sounds[name].play();
}

// loop tension music
sounds.tension.loop = true;

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

        playSound("click");

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

  sounds.tension.pause();
  update();
  hub();
}

// =========================
// HUB
// =========================
function hub() {
  sounds.tension.play();

  scene(
    "🕵️ The diamond is missing. The museum is locked. Every move matters.",
    [
      { text: "🏛️ Museum", next: museum },
      { text: "🖥️ Security", next: security },
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🌿 Garden", next: garden },
      { text: "📓 Deduction Board", next: deductionBoard }
    ]
  );
}

// =========================
// MUSEUM
// =========================
function museum() {
  scene(
    "The glass case is shattered from inside.",
    [
      {
        text: "Inspect glass",
        effect: () => {
          state.clues.push("Inside break");
          playSound("clue");
        },
        next: museum2
      },
      {
        text: "Talk guard",
        next: guard
      },
      { text: "Return", next: hub }
    ]
  );
}

function museum2() {
  scene(
    "This was not a forced entry… someone inside did this.",
    [
      { text: "Go security", next: security },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// GUARD
// =========================
function guard() {
  scene(
    "Guard looks nervous.",
    [
      {
        text: "Press him",
        effect: () => {
          state.suspicion.guard += 2;
          state.trust++;
        },
        next: () => {
          scene("Guard: 'I… I didn’t mean to…'", [
            { text: "Return", next: hub }
          ]);
        }
      },
      {
        text: "Observe silently",
        effect: () => state.suspicion.guard++,
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
    "Camera feed is missing at the exact moment.",
    [
      {
        text: "Check logs",
        effect: () => {
          state.clues.push("Override used");
          playSound("clue");
        },
        next: security2
      },
      {
        text: "Check technician",
        effect: () => state.suspicion.technician += 2,
        next: hub
      },
      { text: "Return", next: hub }
    ]
  );
}

function security2() {
  scene(
    "System was manually overridden.",
    [
      { text: "Go garden", next: garden },
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// KITCHEN
// =========================
function kitchen() {
  scene(
    "Strong bleach smell fills the room.",
    [
      {
        text: "Search sink",
        effect: () => {
          state.clues.push("Cleanup evidence");
          playSound("clue");
        },
        next: hub
      },
      {
        text: "Talk chef",
        effect: () => state.suspicion.chef++,
        next: chef
      }
    ]
  );
}

function chef() {
  scene(
    "Chef: 'I only cook… I swear.'",
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
    "Fog covers the ground.",
    [
      {
        text: "Follow footprints",
        effect: () => {
          state.clues.push("Escape route");
          playSound("clue");
        },
        next: hub
      },
      {
        text: "Search bushes",
        effect: () => {
          state.clues.push("Hidden stash");
          playSound("clue");
        },
        next: hub
      }
    ]
  );
}

// =========================
// DEDUCTION BOARD
// =========================
function deductionBoard() {
  let suspect = "None";

  if (state.suspicion.guard >= 3) suspect = "Guard";
  else if (state.suspicion.technician >= 3) suspect = "Technician";
  else if (state.suspicion.chef >= 3) suspect = "Chef";

  scene(
    `📓 CLUES: ${state.clues.length}\nTOP SUSPECT: ${suspect}`,
    [
      {
        text: "Make Arrest",
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
    playSound("win");
    scene("🏆 You solved the case. The guard confesses.", [
      { text: "Restart", next: start }
    ]);
  } else if (suspect === "Technician") {
    playSound("win");
    scene("🧠 Technician planned everything. Genius capture.", [
      { text: "Restart", next: start }
    ]);
  } else {
    playSound("lose");
    scene("💀 Wrong suspect. The real thief escapes.", [
      { text: "Restart", next: start }
    ]);
  }
}

// START
start();
