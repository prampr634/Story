// ----------------------
// GAME STATE
// ----------------------
let score = 0;
let trust = 0;
let evidence = [];

// ----------------------
// ELEMENTS
// ----------------------
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

// ----------------------
// TYPEWRITER EFFECT
// ----------------------
function typeText(text, speed = 18) {
  textEl.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      textEl.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// ----------------------
// SCENE ENGINE
// ----------------------
function setScene(text, choices) {
  typeText(text);

  choicesEl.innerHTML = "";

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;

    btn.onclick = () => {
      // play click sound if you added it
      if (choice.effect) choice.effect();
      choice.next();
    };

    choicesEl.appendChild(btn);
  });
}

// ----------------------
// START GAME
// ----------------------
function start() {
  score = 0;
  trust = 0;
  evidence = [];

  setScene(
    "🕵️ Detective Mira arrives at the museum. The diamond is missing. The cameras are down. Something feels off... where do you go first?",
    [
      { text: "🍪 Kitchen", next: kitchen },
      { text: "🛏️ Security Room", next: securityRoom },
      { text: "🌿 Garden Exit", next: gardenExit }
    ]
  );
}

// ----------------------
// KITCHEN PATH
// ----------------------
function kitchen() {
  setScene(
    "The kitchen smells strange. You see crumbs, a broken plate, and a locked drawer.",
    [
      {
        text: "Open drawer (risky)",
        effect: () => score += 5,
        next: () => {
          if (Math.random() < 0.4) {
            lose("A trap activates. You get caught in a net.");
          } else {
            evidence.push("Key");
            kitchen2();
          }
        }
      },
      {
        text: "Eat crumbs",
        next: () => lose("The crumbs were poisoned cookies ☠️")
      },
      {
        text: "Leave",
        next: start
      }
    ]
  );
}

function kitchen2() {
  setScene(
    "Inside the drawer you find a strange key with a symbol.",
    [
      {
        text: "Take key",
        effect: () => evidence.push("Key"),
        next: start
      },
      {
        text: "Ignore it",
        next: start
      }
    ]
  );
}

// ----------------------
// SECURITY ROOM PATH
// ----------------------
function securityRoom() {
  setScene(
    "The security feed is corrupted. A guard looks nervous.",
    [
      {
        text: "Interrogate guard",
        effect: () => trust += 1,
        next: securityTruth
      },
      {
        text: "Hack system",
        effect: () => score += 5,
        next: () => lose("You triggered the alarm system 🚨")
      },
      {
        text: "Leave",
        next: () => lose("You ignored key evidence. Case lost.")
      }
    ]
  );
}

function securityTruth() {
  setScene(
    "The guard whispers: 'I saw someone heading toward the garden...'",
    [
      { text: "Go to garden", next: gardenExit }
    ]
  );
}

// ----------------------
// GARDEN PATH
// ----------------------
function gardenExit() {
  setScene(
    "The foggy garden is silent. Footprints lead deeper in... you hear movement behind you.",
    [
      {
        text: "Chase suspect",
        next: () => {
          if (trust > 0) {
            win("You and the guard work together and catch the thief 🏆");
          } else {
            lose("You chased the wrong person. It was a trap.");
          }
        }
      },
      {
        text: "Hide",
        next: () => lose("You hesitated too long. The thief escaped.")
      },
      {
        text: "Call backup",
        next: () => win("Backup arrives and you solve the case professionally 🚔")
      }
    ]
  );
}

// ----------------------
// ENDINGS
// ----------------------
function win(message) {
  setScene(
    "🏆 " + message + "\n\nFINAL SCORE: " + score + "\nEVIDENCE: " + evidence.join(", "),
    [
      { text: "Play Again", next: start }
    ]
  );
}

function lose(message) {
  setScene(
    "💀 " + message + "\n\nGAME OVER\nFINAL SCORE: " + score,
    [
      { text: "Restart", next: start }
    ]
  );
}

// ----------------------
// START GAME ON LOAD
// ----------------------
start();
