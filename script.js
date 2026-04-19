let state = {
  score: 0,
  clues: 0,
  trust: 0,
  inventory: []
};

// ELEMENTS
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const cluesEl = document.getElementById("clues");
const trustEl = document.getElementById("trust");
const invEl = document.getElementById("inv");

let typing = false;

// TYPE ENGINE
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
  }, 12);
}

// UPDATE UI
function update() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
  invEl.innerText = state.inventory.length ? state.inventory.join(", ") : "None";
}

// SCENE ENGINE
function scene(text, options = []) {
  choicesEl.innerHTML = "";

  typeText(text, () => {
    options.forEach(o => {
      const b = document.createElement("button");
      b.innerText = o.text;

      b.onclick = () => {
        if (typing) return;

        if (o.effect) o.effect();
        update();
        o.next();
      };

      choicesEl.appendChild(b);
    });
  });
}

// START GAME
function start() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  update();

  scene(
    "🕵️ A diamond vanished from a locked museum. No forced entry detected.",
    [
      { text: "🏛️ Museum", next: museum },
      { text: "🖥️ Security", next: security },
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🌿 Garden", next: garden }
    ]
  );
}

// MUSEUM
function museum() {
  scene(
    "The glass case is shattered from inside.",
    [
      {
        text: "Inspect glass",
        effect: () => state.clues++,
        next: start
      },
      {
        text: "Talk guard",
        effect: () => state.trust++,
        next: security
      }
    ]
  );
}

// SECURITY
function security() {
  scene(
    "Monitors show missing footage at 2:14 AM.",
    [
      {
        text: "Check logs",
        effect: () => state.clues++,
        next: kitchen
      },
      {
        text: "Question technician",
        next: garden
      }
    ]
  );
}

// KITCHEN
function kitchen() {
  scene(
    "Kitchen smells like bleach. Someone cleaned fast.",
    [
      {
        text: "Search sink",
        effect: () => {
          state.clues++;
          state.inventory.push("Chemical Evidence");
        },
        next: garden
      },
      {
        text: "Talk chef",
        next: start
      }
    ]
  );
}

// GARDEN (END CHECK)
function garden() {

  if (state.clues >= 2 && state.trust >= 1) {
    win();
  } else {
    lose();
  }
}

// ENDINGS
function win() {
  scene("🏆 Case solved. Insider exposed.", [
    { text: "Restart", next: start }
  ]);
}

function lose() {
  scene("💀 Case failed. Not enough evidence.", [
    { text: "Restart", next: start }
  ]);
}

// START
start();
