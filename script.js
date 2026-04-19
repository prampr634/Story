let score = 0;
let inventory = [];

const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const inventoryEl = document.getElementById("inventory");

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

// TYPEWRITER EFFECT
function typeText(text, i = 0) {
  if (i === 0) textEl.innerHTML = "";
  if (i < text.length) {
    textEl.innerHTML += text.charAt(i);
    setTimeout(() => typeText(text, i + 1), 25);
  }
}

// UPDATE UI
function updateStats() {
  scoreEl.innerText = score;
  inventoryEl.innerText = inventory.length ? inventory.join(", ") : "None";
  localStorage.setItem("score", score);
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

// SET SCENE
function setScene(text, choices) {
  typeText(text);
  choicesEl.innerHTML = "";

  choices.forEach(choice => {
    let btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.onclick = () => {
      clickSound.play();
      choice.action();
    };
    choicesEl.appendChild(btn);
  });

  updateStats();
}

// START GAME
function start() {
  score = Number(localStorage.getItem("score")) || 0;
  inventory = JSON.parse(localStorage.getItem("inventory")) || [];

  setScene(
    "A priceless diamond has been stolen. You are Detective Mira. Where do you go?",
    [
      { text: "🍪 Kitchen", action: kitchen },
      { text: "🛏️ Bedroom", action: bedroom },
      { text: "🌿 Garden", action: garden }
    ]
  );
}

// SCENES
function kitchen() {
  score += 5;
  setScene(
    "You find crumbs... and a strange key.",
    [
      {
        text: "Take key",
        action: () => {
          inventory.push("Key");
          kitchen2();
        }
      },
      { text: "Ignore", action: start }
    ]
  );
}

function kitchen2() {
  setScene(
    "The crumbs lead to a locked box.",
    [
      {
        text: "Open box",
        action: () => {
          if (inventory.includes("Key")) {
            win("You opened the box and found the diamond 💎");
          } else {
            lose("It's locked!");
          }
        }
      }
    ]
  );
}

function bedroom() {
  setScene(
    "The room is spotless... suspicious.",
    [
      { text: "Check closet", action: () => lose("A cat attacks you 😭") },
      { text: "Look under bed", action: () => {
        score += 10;
        setScene("You find a clue pointing to the garden.", [
          { text: "Go to garden", action: garden }
        ]);
      }}
    ]
  );
}

function garden() {
  setScene(
    "You see footprints.",
    [
      {
        text: "Follow footprints",
        action: () => win("You caught the thief 🏆")
      },
      { text: "Ignore", action: () => lose("The thief escaped.") }
    ]
  );
}

// ENDINGS
function win(message) {
  score += 20;
  winSound.play();
  setScene(message + " YOU WIN!", []);
}

function lose(message) {
  setScene(message + " GAME OVER.", []);
}

// RESTART
function restart() {
  localStorage.clear();
  score = 0;
  inventory = [];
  start();
}

// START GAME ON LOAD
start();
