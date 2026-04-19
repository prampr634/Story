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
// STATE
// =========================
let state = {
  clues: [],
  suspects: {
    chef: 0,
    conductor: 0,
    passenger: 0
  },
  knife: false,
  bag: false,
  cargo: false
};

// =========================
// ELEMENTS
// =========================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const cluesEl = document.getElementById("clues");

let typing = false;

// =========================
// TYPE EFFECT
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
  }, 10);
}

// =========================
// UPDATE UI
// =========================
function update() {
  cluesEl.innerText = state.clues.length;
}

// =========================
// ENGINE
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
    suspects: { chef: 0, conductor: 0, passenger: 0 },
    knife: false,
    bag: false,
    cargo: false
  };

  sounds.tension.play().catch(()=>{});
  intro();
}

// =========================
// INTRO
// =========================
function intro() {
  scene(
    "🚆 Midnight Express. A passenger vanished mid-journey. Doors are locked. You are the only investigator onboard.",
    [
      { text: "Start Investigation", next: train }
    ]
  );
}

// =========================
// TRAIN HUB
// =========================
function train() {
  scene(
    "You stand in the shaking corridor. Three places feel suspicious.",
    [
      { text: "🍽 Dining Car", next: dining },
      { text: "📦 Cargo Car", next: cargo },
      { text: "🚪 Passenger Cabins", next: cabins },
      { text: "🧠 Interrogate Suspects", next: suspects }
    ]
  );
}

// =========================
// DINING CAR
// =========================
function dining() {
  scene(
    "The chef is cleaning aggressively… too clean.",
    [
      {
        text: "Inspect counter",
        effect: () => {
          state.clues.push("Knife missing");
          state.knife = true;
          state.suspects.chef++;
          play("clue");
        },
        next: train
      },
      {
        text: "Question chef",
        effect: () => state.suspects.chef++,
        next: chefTalk
      }
    ]
  );
}

function chefTalk() {
  scene(
    "Chef: 'I never left this car.'",
    [
      { text: "Return", next: train }
    ]
  );
}

// =========================
// CARGO CAR
// =========================
function cargo() {
  scene(
    "Cargo crates are shifted slightly… something moved here.",
    [
      {
        text: "Search crates",
        effect: () => {
          state.clues.push("Hidden bag found");
          state.cargo = true;
          state.suspects.conductor++;
          play("clue");
        },
        next: train
      }
    ]
  );
}

// =========================
// CABINS
// =========================
function cabins() {
  scene(
    "Passenger cabins are empty… except one open suitcase.",
    [
      {
        text: "Inspect suitcase",
        effect: () => {
          state.clues.push("Strange ticket");
          state.suspects.passenger++;
          play("clue");
        },
        next: train
      },
      {
        text: "Check hallway",
        next: train
      }
    ]
  );
}

// =========================
// SUSPECTS
// =========================
function suspects() {
  scene(
    "Choose who to interrogate:",
    [
      { text: "Chef", next: chefAccuse },
      { text: "Conductor", next: conductorAccuse },
      { text: "Passenger", next: passengerAccuse },
      { text: "Return", next: train }
    ]
  );
}

function chefAccuse() {
  scene("Chef avoids eye contact.", [
    {
      text: "Press harder",
      effect: () => state.suspects.chef++,
      next: train
    }
  ]);
}

function conductorAccuse() {
  scene("Conductor seems too calm…", [
    {
      text: "Observe",
      effect: () => state.suspects.conductor++,
      next: train
    }
  ]);
}

function passengerAccuse() {
  scene("Passenger claims innocence…", [
    {
      text: "Doubt them",
      effect: () => state.suspects.passenger++,
      next: train
    }
  ]);
}

// =========================
// ENDING LOGIC
// =========================
function suspectsScore() {
  if (state.suspects.conductor > state.suspects.chef &&
      state.suspects.conductor > state.suspects.passenger) return "conductor";

  if (state.suspects.chef > state.suspects.conductor &&
      state.suspects.chef > state.suspects.passenger) return "chef";

  return "passenger";
}

function ending() {
  sounds.tension.pause();

  const result = suspectsScore();

  if (result === "conductor" && state.cargo && state.knife) {
    play("win");
    scene("🏆 You caught the conductor. He orchestrated the disappearance during the stop.", [
      { text: "Play Again", next: start }
    ]);
  }
  else if (result === "chef") {
    play("lose");
    scene("💀 Wrong suspect. The real culprit escapes at the next station.", [
      { text: "Retry", next: start }
    ]);
  }
  else {
    play("lose");
    scene("💀 Evidence was incomplete. The case remains unsolved.", [
      { text: "Retry", next: start }
    ]);
  }
}

// trigger ending option inside train
function train() {
  scene(
    "You are inside the moving train. Everything connects here.",
    [
      { text: "🍽 Dining Car", next: dining },
      { text: "📦 Cargo Car", next: cargo },
      { text: "🚪 Cabins", next: cabins },
      { text: "🧠 Suspects", next: suspects },
      { text: "📊 Make Final Deduction", next: ending }
    ]
  );
}

// START GAME
start();
