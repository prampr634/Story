// =========================
// SOUND (song/)
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
let state;

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
  }, 12);
}

// =========================
// UPDATE UI
// =========================
function update() {
  cluesEl.innerText = state.clues.length;
}

// =========================
// SCENE ENGINE
// =========================
function scene(text, options) {
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

        o.next();
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
    ticketChecked: false,
    bagFound: false,
    suspectUnlocked: false
  };

  sounds.tension.play().catch(()=>{});
  intro();
}

// =========================
// STORY START
// =========================
function intro() {
  scene(
    "🚆 Midnight. You board a quiet train. Suddenly — a scream echoes. A passenger is missing.",
    [
      { text: "Investigate immediately", next: cabin }
    ]
  );
}

// =========================
// CABIN
// =========================
function cabin() {
  scene(
    "The victim’s seat is empty. A bag is left behind.",
    [
      {
        text: "Search bag",
        effect: () => {
          state.clues.push("Strange ticket");
          state.bagFound = true;
          play("clue");
        },
        next: hallway
      },
      {
        text: "Ask nearby passenger",
        next: passenger
      }
    ]
  );
}

// =========================
// PASSENGER
// =========================
function passenger() {
  scene(
    "Passenger: 'I saw someone leave quickly… toward the back.'",
    [
      {
        text: "Follow direction",
        next: hallway
      }
    ]
  );
}

// =========================
// HALLWAY
// =========================
function hallway() {
  scene(
    "The train sways. Lights flicker.",
    [
      {
        text: "Check dining car",
        next: dining
      },
      {
        text: "Go to luggage car",
        next: luggage
      }
    ]
  );
}

// =========================
// DINING CAR
// =========================
function dining() {
  scene(
    "A chef is nervously cleaning.",
    [
      {
        text: "Question chef",
        effect: () => {
          state.clues.push("Chef nervous");
          play("clue");
        },
        next: reveal
      },
      {
        text: "Inspect kitchen",
        effect: () => {
          state.clues.push("Knife missing");
          play("clue");
        },
        next: reveal
      }
    ]
  );
}

// =========================
// LUGGAGE
// =========================
function luggage() {
  scene(
    "You find a locked suitcase.",
    [
      {
        text: "Force it open",
        effect: () => {
          state.clues.push("Hidden money");
          play("clue");
        },
        next: reveal
      },
      {
        text: "Leave it",
        next: reveal
      }
    ]
  );
}

// =========================
// REVEAL SUSPECTS
// =========================
function reveal() {
  state.suspectUnlocked = true;

  scene(
    "All passengers are gathered. One of them is lying.",
    [
      { text: "Interrogate suspects", next: suspects }
    ]
  );
}

// =========================
// SUSPECTS
// =========================
function suspects() {
  scene(
    "Who do you accuse?",
    [
      { text: "Chef", next: () => ending("chef") },
      { text: "Passenger", next: () => ending("passenger") },
      { text: "Conductor", next: () => ending("conductor") }
    ]
  );
}

// =========================
// ENDINGS
// =========================
function ending(choice) {
  sounds.tension.pause();

  if (choice === "conductor" && state.clues.includes("Strange ticket")) {
    play("win");
    scene(
      "🏆 The conductor forged tickets and kidnapped the passenger. You solved it.",
      [{ text: "Play Again", next: start }]
    );
  } else {
    play("lose");
    scene(
      "💀 Wrong accusation. The real culprit escapes at the next stop.",
      [{ text: "Retry", next: start }]
    );
  }
}

// START
start();
