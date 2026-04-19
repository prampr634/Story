
// =========================
// WORLD STATE (OPEN WORLD CORE)
// =========================
let world = {
  location: "museum",
  clues: [],
  volume: 0.6
};

// =========================
// ELEMENTS
// =========================
const locName = document.getElementById("locName");
const npcEl = document.getElementById("npc");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const boardEl = document.getElementById("board");

// =========================
// SOUND SYSTEM (FIXED)
// =========================
function play(file) {
  const audio = new Audio("./sound/" + file);
  audio.volume = world.volume;
  audio.play().catch(() => {});
}

// =========================
// UPDATE HUD
// =========================
function updateHUD() {
  document.getElementById("clueCount").innerText = world.clues.length;

  boardEl.innerHTML = "";
  world.clues.forEach(c => {
    const d = document.createElement("div");
    d.innerText = "🧩 " + c;
    boardEl.appendChild(d);
  });
}

// =========================
// TYPE EFFECT
// =========================
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
  }, 10);
}

// =========================
// CLUE SYSTEM
// =========================
function addClue(text) {
  world.clues.push(text);
  updateHUD();
  play("clue.mp3");
}

// =========================
// TRAVEL SYSTEM (OPEN WORLD CORE)
// =========================
function travel(loc) {
  play("click.mp3");
  world.location = loc;
  loadLocation();
}

// =========================
// LOCATIONS (OPEN WORLD MAP)
// =========================
function loadLocation() {

  choicesEl.innerHTML = "";

  if (world.location === "museum") museum();
  if (world.location === "alley") alley();
  if (world.location === "station") station();
  if (world.location === "house") house();

  updateHUD();
}

// =========================
// 🏛️ MUSEUM
// =========================
function museum() {
  locName.innerText = "🏛️ Museum";

  type(
    "A stolen diamond case lies shattered. The museum is silent… too silent.",
    () => {

      choicesEl.innerHTML = `
        <button class="choice" onclick="addClue('Broken glass from inside')">Inspect display case</button>
        <button class="choice" onclick="addClue('Security logs show internal access')">Check security logs</button>
        <button class="choice" onclick="npcGuard()">Talk to Guard</button>
      `;

    }
  );
}

// =========================
// 🧍 NPC GUARD
// =========================
function npcGuard() {
  npcEl.innerText = "🧍 Guard";

  type("I swear I saw nothing... but I heard footsteps inside.", () => {

    choicesEl.innerHTML = `
      <button class="choice" onclick="addClue('Guard nervous, hiding truth')">Pressure him</button>
      <button class="choice" onclick="travel('alley')">Leave</button>
    `;

  });
}

// =========================
// 🌑 ALLEY
// =========================
function alley() {
  locName.innerText = "🌑 Dark Alley";

  type(
    "A hidden alley behind the museum. Something was dragged here.",
    () => {

      choicesEl.innerHTML = `
        <button class="choice" onclick="addClue('Drag marks leading from museum')">Inspect ground</button>
        <button class="choice" onclick="addClue('Hidden security badge found')">Search trash</button>
        <button class="choice" onclick="npcInformant()">Talk to informant</button>
      `;
    }
  );
}

// =========================
// 🧍 INFORMANT
// =========================
function npcInformant() {
  npcEl.innerText = "🧍 Informant";

  type("People are scared… someone powerful did this.", () => {

    choicesEl.innerHTML = `
      <button class="choice" onclick="addClue('Suspect linked to museum staff')">Pay for info</button>
      <button class="choice" onclick="travel('station')">Leave</button>
    `;

  });
}

// =========================
// 🚉 STATION
// =========================
function station() {
  locName.innerText = "🚉 Train Station";

  type(
    "Crowded station. Someone here knows something.",
    () => {

      choicesEl.innerHTML = `
        <button class="choice" onclick="addClue('Suspect seen leaving city')">Check arrivals</button>
        <button class="choice" onclick="npcWitness()">Talk to witness</button>
        <button class="choice" onclick="travel('house')">Follow suspect lead</button>
      `;
    }
  );
}

// =========================
// 🧍 WITNESS
// =========================
function npcWitness() {
  npcEl.innerText = "🧍 Witness";

  type("I saw a museum employee with a black bag…", () => {

    choicesEl.innerHTML = `
      <button class="choice" onclick="addClue('Employee involved in theft')">Take statement</button>
      <button class="choice" onclick="travel('museum')">Return</button>
    `;

  });
}

// =========================
// 🏠 HOUSE
// =========================
function house() {
  locName.innerText = "🏠 Suspect House";

  type(
    "You arrive at a dim house. The door is slightly open.",
    () => {

      choicesEl.innerHTML = `
        <button class="choice" onclick="addClue('Hidden vault key found')">Search house</button>
        <button class="choice" onclick="finalCase()">Enter basement</button>
        <button class="choice" onclick="travel('museum')">Retreat</button>
      `;
    }
  );
}

// =========================
// 🧠 FINAL CASE
// =========================
function finalCase() {

  type(
    "All clues connect… the thief was an INSIDER working across multiple locations.",
    () => {

      choicesEl.innerHTML = `
        <button class="choice" onclick="win()">Accuse suspect</button>
        <button class="choice" onclick="travel('museum')">Reinvestigate</button>
      `;
    }
  );
}

// =========================
// ENDINGS
// =========================
function win() {
  play("win.mp3");

  type("🏆 CASE SOLVED — The insider conspiracy is exposed.", () => {
    choicesEl.innerHTML = `
      <button class="choice" onclick="location.reload()">Play Again</button>
    `;
  });
}

// =========================
// START
// =========================
loadLocation();
updateHUD();
