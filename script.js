// =========================
// SOUND SYSTEM (song/)
// =========================
const sounds = {
  click: new Audio("song/click.mp3"),
  win: new Audio("song/win.mp3"),
  lose: new Audio("song/lose.mp3"),
  tension: new Audio("song/tension.mp3"),
  clue: new Audio("song/clue.mp3")
};

sounds.tension.loop = true;

function play(s) {
  if (!sounds[s]) return;
  sounds[s].currentTime = 0;
  sounds[s].play().catch(()=>{});
}

// =========================
// GAME STATE (DEDUCTION CORE)
// =========================
let state = {
  clues: [],
  suspicion: {
    chef: 0,
    conductor: 0,
    passenger: 0
  },
  flags: {
    knife: false,
    bag: false,
    sabotage: false
  }
};

// =========================
// UI
// =========================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const cluesEl = document.getElementById("clues");

let typing = false;

// =========================
// TYPE SYSTEM
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
  }, 8);
}

// =========================
// UPDATE UI
// =========================
function update() {
  cluesEl.innerText = state.clues.length;
}

// =========================
// ENGINE (NO DEAD ENDS)
// =========================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(o => {
      const btn = document.createElement("button");
      btn.innerText = o.text;

      btn.onclick = () => {
        if (typing) return;

        play("click");

        if (o.effect) o.effect();
        update();

        o.next();
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
    suspicion: { chef: 0, conductor: 0, passenger: 0 },
    flags: { knife: false, bag: false, sabotage: false }
  };

  sounds.tension.play().catch(()=>{});
  intro();
}

// =========================
// INTRO (CINEMATIC)
// =========================
function intro() {
  scene(
    "🚆 MIDNIGHT EXPRESS INCIDENT\nA passenger vanished between stops. Doors locked. No exits. Someone onboard is lying.",
    [
      { text: "Enter Train Investigation", next: hub }
    ]
  );
}

// =========================
// HUB (TRAIN MAP SYSTEM)
// =========================
function hub() {
  scene(
    "📍 Train Map: Choose your investigation route",
    [
      { text: "🍽 Dining Car", next: dining },
      { text: "📦 Cargo Car", next: cargo },
      { text: "🚪 Passenger Cabins", next: cabins },
      { text: "🧠 Deduction Board", next: deduction },
      { text: "⚖️ Accuse Suspect", next: accuse }
    ]
  );
}

// =========================
// DINING CAR
// =========================
function dining() {
  scene(
    "Chef is nervously cleaning a spotless counter.",
    [
      {
        text: "Inspect knife rack",
        effect: () => {
          state.flags.knife = true;
          state.clues.push("Missing knife");
          state.suspicion.chef++;
          play("clue");
        },
        next: hub
      },
      {
        text: "Question chef",
        effect: () => state.suspicion.chef++,
        next: chefDialogue
      }
    ]
  );
}

function chefDialogue() {
  scene(
    "Chef: 'I never left the dining car. Ask the conductor.'",
    [
      { text: "Return", next: hub }
    ]
  );
}

// =========================
// CARGO CAR
// =========================
function cargo() {
  scene(
    "Cargo crates shifted. Someone searched here recently.",
    [
      {
        text: "Open crate",
        effect: () => {
          state.flags.bag = true;
          state.clues.push("Hidden luggage");
          state.suspicion.conductor++;
          play("clue");
        },
        next: hub
      }
    ]
  );
}

// =========================
// CABINS
// =========================
function cabins() {
  scene(
    "Passenger cabin is empty… except one torn ticket.",
    [
      {
        text: "Inspect ticket",
        effect: () => {
          state.clues.push("Fake ticket");
          state.suspicion.passenger++;
          play("clue");
        },
        next: hub
      }
    ]
  );
}

// =========================
// DEDUCTION BOARD (CORE SYSTEM)
// =========================
function deduction() {
  let summary =
`📓 DEDUCTION BOARD

Clues Found: ${state.clues.length}

- Chef suspicion: ${state.suspicion.chef}
- Conductor suspicion: ${state.suspicion.conductor}
- Passenger suspicion: ${state.suspicion.passenger}

Key Evidence:
${state.clues.map(c => "• " + c).join("\n")}`;

  scene(summary, [
    { text: "Return to Map", next: hub }
  ]);
}

// =========================
// ACCUSATION SYSTEM (FINAL BOSS MECHANIC)
// =========================
function accuse() {
  scene(
    "⚖️ Final Decision: Who caused the disappearance?",
    [
      { text: "Chef", next: () => ending("chef") },
      { text: "Conductor", next: () => ending("conductor") },
      { text: "Passenger", next: () => ending("passenger") }
    ]
  );
}

// =========================
// FINAL ENDINGS (MULTIPLE)
// =========================
function ending(choice) {
  sounds.tension.pause();

  const max = Math.max(
    state.suspicion.chef,
    state.suspicion.conductor,
    state.suspicion.passenger
  );

  const correct = (state.flags.knife && state.flags.bag);

  // TRUE ENDING
  if (choice === "conductor" && correct && state.suspicion.conductor === max) {
    play("win");
    scene(
      "🏆 TRUE ENDING: The conductor staged the disappearance during a scheduled stop.",
      [{ text: "Play Again", next: start }]
    );
  }

  // PARTIAL WIN
  else if (choice === "conductor") {
    play("win");
    scene(
      "🧠 You solved it… but without full proof. The case closes quietly.",
      [{ text: "Try Again for True Ending", next: start }]
    );
  }

  // WRONG ENDINGS
  else {
    play("lose");
    scene(
      "💀 Wrong accusation. The real culprit escapes into the next station.",
      [{ text: "Retry Case", next: start }]
    );
  }
}

// START GAME
start();
