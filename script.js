// =========================
// STATE
// =========================
let state = {
  score: 0,
  clues: 0,
  trust: 0,
  inventory: [],
  tension: 0
};

// =========================
// AUDIO SYSTEM
// =========================
const SFX = {
  click: new Audio("sounds/click.mp3"),
  win: new Audio("sounds/win.mp3"),
  lose: new Audio("sounds/lose.mp3"),
  wind: new Audio("sounds/wind.mp3")
};

let bgMusic = new Audio("sounds/ambient.mp3");
bgMusic.loop = true;

let volume = 0.6;

document.getElementById("volume").addEventListener("input", e => {
  volume = parseFloat(e.target.value);
});

// play sound
function play(s) {
  if (!SFX[s]) return;
  SFX[s].volume = volume;
  SFX[s].currentTime = 0;
  SFX[s].play();
}

// music fade
function musicFadeIn() {
  bgMusic.play();
  let v = 0;
  const t = setInterval(() => {
    if (v < 0.4) {
      v += 0.02;
      bgMusic.volume = v * volume;
    } else clearInterval(t);
  }, 40);
}

function musicFadeOut() {
  let v = bgMusic.volume;
  const t = setInterval(() => {
    if (v > 0) {
      v -= 0.02;
      bgMusic.volume = v;
    } else {
      bgMusic.pause();
      clearInterval(t);
    }
  }, 40);
}

// =========================
// ELEMENTS
// =========================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

// =========================
// HUD UPDATE
// =========================
function update() {
  document.getElementById("score").innerText = state.score;
  document.getElementById("clues").innerText = state.clues;
  document.getElementById("trust").innerText = state.trust;
  document.getElementById("inv").innerText =
    state.inventory.length ? state.inventory.join(", ") : "None";
}

// =========================
// TYPEWRITER (CINEMATIC CONTROLLED)
// =========================
function typeText(text, cb) {
  textEl.innerHTML = "";
  let i = 0;

  const interval = setInterval(() => {
    textEl.innerHTML += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (cb) cb();
    }
  }, 16);
}

// =========================
// CINEMATIC SCENE SWITCH
// =========================
function scene(text, options = []) {
  const box = document.getElementById("scene");

  // cinematic transition
  box.classList.add("fade");

  setTimeout(() => {
    choicesEl.innerHTML = "";

    typeText(text, () => {
      options.forEach(o => {
        const b = document.createElement("button");

        b.innerText = o.text;

        b.onclick = () => {
          play("click");

          if (o.effect) o.effect();
          update();

          // tension reaction
          if (state.tension > 5) {
            box.style.boxShadow = "0 0 40px rgba(255,0,0,0.2)";
          }

          o.next();
        };

        choicesEl.appendChild(b);
      });
    });

    box.classList.remove("fade");
  }, 300);
}

// =========================
// START GAME
// =========================
function startGame() {
  state = { score: 0, clues: 0, trust: 0, inventory: [], tension: 0 };
  update();

  musicFadeIn();

  scene(
    "🕵️ The museum went dark at 2:13 AM. The diamond vanished. Security systems failed. You arrive as Detective Mira.",
    [
      { text: "Enter Kitchen", next: kitchen },
      { text: "Enter Security Room", next: security },
      { text: "Enter Garden", next: garden }
    ]
  );
}

// =========================
// GAME SYSTEMS
// =========================
function addTension(x) {
  state.tension += x;

  if (state.tension > 4) musicFadeIn();
  if (state.tension > 8) document.body.style.background = "#2a0000";
}

// =========================
// LOCATIONS
// =========================
function kitchen() {
  addTension(1);

  scene(
    "The kitchen is frozen in chaos. Something was dragged across the floor...",
    [
      {
        text: "Search drawer",
        effect: () => {
          state.inventory.push("Key");
          state.clues++;
        },
        next: kitchen2
      },
      {
        text: "Leave",
        next: startGame
      }
    ]
  );
}

function kitchen2() {
  scene(
    "You found a coded key. It may open something important.",
    [{ text: "Return", next: startGame }]
  );
}

function security() {
  addTension(2);

  scene(
    "Security system is corrupted. A guard avoids eye contact.",
    [
      {
        text: "Interrogate",
        effect: () => state.trust++,
        next: () => {
          scene(
            "Guard: 'There were TWO suspects in the garden.'",
            [{ text: "Go Garden", next: garden }]
          );
        }
      }
    ]
  );
}

function garden() {
  addTension(4);
  play("wind");

  scene(
    "🌫️ The garden feels wrong... colder... like you're being watched.",
    [
      {
        text: "Follow path",
        next: () => {
          if (state.inventory.includes("Key") && state.trust > 0) {
            win();
          } else {
            lose();
          }
        }
      },
      {
        text: "Call backup",
        next: win
      }
    ]
  );
}

// =========================
// ENDINGS
// =========================
function win() {
  play("win");
  musicFadeOut();

  scene("🏆 CASE SOLVED — You uncovered the truth behind the diamond theft.", [
    { text: "Play Again", next: startGame }
  ]);
}

function lose() {
  play("lose");
  musicFadeOut();

  scene("💀 CASE FAILED — The truth remains hidden in the shadows.", [
    { text: "Retry Case", next: startGame }
  ]);
}

// START
startGame();
