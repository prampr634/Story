// =======================
// STATE
// =======================
let state = {
  clues: [],
  trust: 0,
  tension: 0,
  volume: 0.6
};

// =======================
// AUDIO SYSTEM (FIXED)
// =======================
function play(src) {
  const a = new Audio(src);
  a.volume = state.volume;
  a.play().catch(() => {});
}

// volume control
document.getElementById("volume").addEventListener("input", e => {
  state.volume = parseFloat(e.target.value);
});

// =======================
// UI ELEMENTS
// =======================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const boardEl = document.getElementById("board");

// =======================
// UPDATE HUD
// =======================
function updateHUD() {
  document.getElementById("clueCount").innerText = state.clues.length;
  document.getElementById("trust").innerText = state.trust;
  document.getElementById("tension").innerText = state.tension;

  boardEl.innerHTML = "";
  state.clues.forEach(c => {
    const li = document.createElement("li");
    li.innerText = "🧩 " + c;
    boardEl.appendChild(li);
  });
}

// =======================
// TYPEWRITER (CINEMATIC)
// =======================
function type(text, cb) {
  textEl.innerHTML = "";
  let i = 0;

  const t = setInterval(() => {
    textEl.innerHTML += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(t);
      cb && cb();
    }
  }, 15);
}

// =======================
// SCENE ENGINE
// =======================
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  type(text, () => {
    options.forEach(o => {
      const b = document.createElement("button");
      b.innerText = o.text;

      b.onclick = () => {
        play("sounds/click.mp3");

        if (o.effect) o.effect();

        updateHUD();
        o.next();
      };

      choicesEl.appendChild(b);
    });
  });
}

// =======================
// TENSION SYSTEM
// =======================
function addTension(n) {
  state.tension += n;

  if (state.tension > 5) {
    document.body.style.background = "#1a0000";
  }

  if (state.tension > 8) {
    document.body.style.filter = "contrast(1.2)";
  }
}

// =======================
// CLUE SYSTEM
// =======================
function addClue(text) {
  state.clues.push(text);
  play("sounds/clue.mp3");
}

// =======================
// GAME START
// =======================
function startGame() {
  state = { clues: [], trust: 0, tension: 0, volume: state.volume };
  updateHUD();

  scene(
    "🕵️ A priceless diamond has vanished from the museum. Sherlock Holmes has been called to investigate.",
    [
      { text: "Enter Kitchen", next: kitchen },
      { text: "Enter Security Room", next: security },
      { text: "Enter Garden", next: garden }
    ]
  );
}

// =======================
// LOCATIONS
// =======================

function kitchen() {
  addTension(1);

  scene(
    "🍽️ The kitchen smells of chemicals. Something was wiped off the floor.",
    [
      {
        text: "Inspect floor",
        effect: () => addClue("Strange chemical residue found in kitchen"),
        next: kitchen2
      },
      {
        text: "Open fridge",
        effect: () => addClue("Hidden compartment inside fridge"),
        next: kitchen2
      },
      {
        text: "Return",
        next: startGame
      }
    ]
  );
}

function kitchen2() {
  scene(
    "You found traces of a forced entry pattern.",
    [
      { text: "Go back", next: startGame }
    ]
  );
}

// -----------------------

function security() {
  addTension(2);

  scene(
    "🖥️ Security room is corrupted. Footage is missing.",
    [
      {
        text: "Interrogate guard",
        effect: () => {
          state.trust++;
          addClue("Guard saw 2 suspects near garden");
        },
        next: security2
      },
      {
        text: "Analyze logs",
        effect: () => addClue("Security system was manually disabled"),
        next: security2
      }
    ]
  );
}

function security2() {
  scene(
    "Something doesn't add up. Someone inside helped the thief.",
    [
      { text: "Go Garden", next: garden }
    ]
  );
}

// -----------------------

function garden() {
  addTension(4);
  play("sounds/tension.mp3");

  scene(
    "🌫️ The garden is silent... too silent.",
    [
      {
        text: "Follow footprints",
        next: finalDeduction
      },
      {
        text: "Wait silently",
        next: finalDeduction
      }
    ]
  );
}

// =======================
// FINAL DEDUCTION SYSTEM
// =======================
function finalDeduction() {
  scene(
    "🧠 Sherlock analyzes your collected evidence...",
    [
      {
        text: "Accuse the suspect",
        next: () => {
          if (state.clues.length >= 2) {
            win();
          } else {
            lose();
          }
        }
      },
      {
        text: "Continue investigating",
        next: startGame
      }
    ]
  );
}

// =======================
// ENDINGS
// =======================
function win() {
  play("sounds/win.mp3");

  scene("🏆 CASE SOLVED — Sherlock uncovers the hidden conspiracy behind the theft.", [
    { text: "Play Again", next: startGame }
  ]);
}

function lose() {
  play("sounds/lose.mp3");

  scene("💀 CASE FAILED — The real thief escapes in the shadows.", [
    { text: "Retry Case", next: startGame }
  ]);
}

// START
startGame();
