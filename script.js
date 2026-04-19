// =========================
// SOUND (song/ folder)
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
  suspectsUnlocked: false,
  powerOn: true,
  keycard: false
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
  }, 12);
}

// =========================
// UPDATE UI
// =========================
function update() {
  cluesEl.innerText = state.clues.length;
}

// =========================
// ENGINE (NO DEAD BUTTONS)
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

        if (o.next) o.next();
        else intro();
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
    suspectsUnlocked: false,
    powerOn: true,
    keycard: false
  };

  sounds.tension.play().catch(()=>{});
  intro();
}

// =========================
// INTRO
// =========================
function intro() {
  scene(
    "🌙 The lights suddenly cut out. Darkness swallows the museum. When power returns… the diamond is gone.",
    [
      { text: "Enter the museum", next: lobby }
    ]
  );
}

// =========================
// LOBBY (MAIN HUB BUT PROGRESSIVE)
// =========================
function lobby() {
  let options = [
    { text: "🔌 Investigate blackout", next: electricalRoom },
    { text: "🏛️ Check exhibit hall", next: exhibit }
  ];

  if (state.keycard) {
    options.push({ text: "🚪 Open locked door", next: vault });
  }

  if (state.suspectsUnlocked) {
    options.push({ text: "🧍 Interrogate suspects", next: suspects });
  }

  scene("The museum feels… off. Something happened during the blackout.", options);
}

// =========================
// ELECTRICAL ROOM
// =========================
function electricalRoom() {
  scene(
    "The breaker panel is open. Someone forced a shutdown.",
    [
      {
        text: "Inspect panel",
        effect: () => {
          state.clues.push("Power sabotage");
          play("clue");
        },
        next: electrical2
      },
      {
        text: "Follow cable trail",
        next: storage
      }
    ]
  );
}

function electrical2() {
  scene(
    "This wasn’t random. It was planned.",
    [
      {
        text: "Return to lobby",
        next: lobby
      }
    ]
  );
}

// =========================
// STORAGE (NEW PATH)
// =========================
function storage() {
  scene(
    "You find a dropped keycard.",
    [
      {
        text: "Pick it up",
        effect: () => {
          state.keycard = true;
          state.clues.push("Keycard");
          play("clue");
        },
        next: storage2
      }
    ]
  );
}

function storage2() {
  scene(
    "This unlocks restricted areas…",
    [
      {
        text: "Return to lobby",
        next: lobby
      }
    ]
  );
}

// =========================
// EXHIBIT
// =========================
function exhibit() {
  scene(
    "The glass case is shattered inward.",
    [
      {
        text: "Analyze glass",
        effect: () => {
          state.clues.push("Inside job");
          play("clue");
        },
        next: exhibit2
      },
      {
        text: "Search floor",
        next: footprints
      }
    ]
  );
}

function exhibit2() {
  scene(
    "This confirms: someone inside did it.",
    [
      {
        text: "Return to lobby",
        next: lobby
      }
    ]
  );
}

// =========================
// FOOTPRINT PATH (NO HUB RETURN)
// =========================
function footprints() {
  scene(
    "Footprints lead outside into the garden.",
    [
      {
        text: "Follow them",
        next: garden
      }
    ]
  );
}

// =========================
// GARDEN (NOW CONTINUES STORY)
// =========================
function garden() {
  scene(
    "You see movement. Someone is hiding.",
    [
      {
        text: "Chase figure",
        next: chase
      },
      {
        text: "Search bushes carefully",
        effect: () => {
          state.clues.push("Hidden bag");
          play("clue");
        },
        next: revealSuspects
      }
    ]
  );
}

function chase() {
  scene(
    "The figure escapes… but drops something.",
    [
      {
        text: "Pick it up",
        effect: () => {
          state.clues.push("Suspicious tool");
          play("clue");
        },
        next: revealSuspects
      }
    ]
  );
}

// =========================
// UNLOCK SUSPECT SYSTEM
// =========================
function revealSuspects() {
  state.suspectsUnlocked = true;

  scene(
    "This is bigger than you thought. Multiple people were involved.",
    [
      {
        text: "Return to lobby",
        next: lobby
      }
    ]
  );
}

// =========================
// VAULT (LOCKED AREA)
// =========================
function vault() {
  scene(
    "You enter a hidden vault room… files everywhere.",
    [
      {
        text: "Read files",
        effect: () => {
          state.clues.push("Inside conspiracy");
          play("clue");
        },
        next: finalDecision
      }
    ]
  );
}

// =========================
// SUSPECTS
// =========================
function suspects() {
  scene(
    "Three suspects stand before you.",
    [
      { text: "Accuse Guard", next: () => ending("guard") },
      { text: "Accuse Technician", next: () => ending("technician") },
      { text: "Accuse Chef", next: () => ending("chef") }
    ]
  );
}

// =========================
// FINAL DECISION
// =========================
function finalDecision() {
  scene(
    "You now have enough evidence. Who is the mastermind?",
    [
      { text: "Accuse Guard", next: () => ending("guard") },
      { text: "Accuse Technician", next: () => ending("technician") },
      { text: "Accuse Chef", next: () => ending("chef") }
    ]
  );
}

// =========================
// ENDINGS
// =========================
function ending(suspect) {
  sounds.tension.pause();

  if (suspect === "technician" && state.clues.includes("Power sabotage")) {
    play("win");
    scene("🏆 You exposed the technician’s blackout plan. Perfect solve.", [
      { text: "Play again", next: start }
    ]);
  } else {
    play("lose");
    scene("💀 Wrong choice. The real thief escapes in the chaos.", [
      { text: "Retry case", next: start }
    ]);
  }
}

// START
start();
