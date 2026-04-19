// --------------------
// GAME STATE
// --------------------
let state = {
  score: 0,
  clues: 0,
  trust: 0
};

// --------------------
// ELEMENTS
// --------------------
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const card = document.getElementById("card");

const scoreEl = document.getElementById("score");
const cluesEl = document.getElementById("clues");
const trustEl = document.getElementById("trust");

// --------------------
// UI EFFECT: FADE SWITCH
// --------------------
function transition(callback) {
  card.classList.add("fade-out");

  setTimeout(() => {
    callback();
    card.classList.remove("fade-out");
  }, 300);
}

// --------------------
// TYPEWRITER
// --------------------
function typeText(text) {
  textEl.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      textEl.innerHTML += text[i];
      i++;
      setTimeout(type, 18);
    }
  }

  type();
}

// --------------------
// UPDATE STATS
// --------------------
function updateStats() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
}

// --------------------
// SCENE ENGINE
// --------------------
function setScene(text, options) {
  transition(() => {
    typeText(text);
    choicesEl.innerHTML = "";

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt.text;

      btn.onclick = () => {
        if (opt.effect) opt.effect();
        updateStats();
        opt.next();
      };

      choicesEl.appendChild(btn);
    });
  });
}

// --------------------
// START
// --------------------
function start() {
  state = { score: 0, clues: 0, trust: 0 };
  updateStats();

  setScene(
    "A priceless diamond has vanished. The museum is locked down. Detective Mira steps in… where do you go first?",
    [
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🛏️ Security Room", next: security },
      { text: "🌿 Garden", next: garden }
    ]
  );
}

// --------------------
// KITCHEN
// --------------------
function kitchen() {
  setScene(
    "The kitchen is cold. A drawer is slightly open…",
    [
      {
        text: "Open drawer",
        effect: () => state.clues++,
        next: kitchen2
      },
      {
        text: "Eat cookie",
        next: () => lose("Poisoned cookie. Case over ☠️")
      }
    ]
  );
}

function kitchen2() {
  setScene(
    "Inside: a strange key engraved with a symbol.",
    [
      {
        text: "Take key",
        effect: () => state.clues++,
        next: start
      }
    ]
  );
}

// --------------------
// SECURITY
// --------------------
function security() {
  setScene(
    "Monitors flicker. A guard avoids eye contact.",
    [
      {
        text: "Interrogate",
        effect: () => state.trust++,
        next: () => {
          setScene(
            "Guard whispers: 'I saw someone in the garden…'",
            [{ text: "Go garden", next: garden }]
          );
        }
      },
      {
        text: "Hack system",
        next: () => lose("Alarm triggered 🚨")
      }
    ]
  );
}

// --------------------
// GARDEN
// --------------------
function garden() {
  setScene(
    "Fog covers the garden. Footprints split in two directions…",
    [
      {
        text: "Follow footprints",
        next: () => {
          if (state.trust > 0) {
            win("You solved the case with teamwork 🏆");
          } else {
            lose("Trap! Wrong path.");
          }
        }
      },
      {
        text: "Hide",
        next: () => lose("You hesitated too long.")
      }
    ]
  );
}

// --------------------
// ENDINGS
// --------------------
function win(msg) {
  setScene("🏆 " + msg, [
    { text: "Play Again", next: start }
  ]);
}

function lose(msg) {
  setScene("💀 " + msg, [
    { text: "Restart", next: start }
  ]);
}

// START GAME
start();
