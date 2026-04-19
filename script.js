// =========================
// STATE
// =========================
let state = {
  score: 0,
  clues: 0,
  trust: 0,
  inventory: []
};

// =========================
// ELEMENTS
// =========================
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const cluesEl = document.getElementById("clues");
const trustEl = document.getElementById("trust");
const invEl = document.getElementById("inv");

// =========================
// TYPE ENGINE
// =========================
let typing = false;

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
  }, 10);
}

// =========================
// UPDATE UI
// =========================
function update() {
  scoreEl.innerText = state.score;
  cluesEl.innerText = state.clues;
  trustEl.innerText = state.trust;
  invEl.innerText = state.inventory.length ? state.inventory.join(", ") : "None";
}

// =========================
// SCENE ENGINE
// =========================
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

// =========================
// START (NOW MORE OPTIONS)
// =========================
function start() {
  state = { score: 0, clues: 0, trust: 0, inventory: [] };
  update();

  scene(
    "🕵️ A diamond is missing from a locked museum. No forced entry. You must investigate carefully.",
    [
      { text: "🏛️ Enter Museum Hall", next: museum },
      { text: "🖥️ Security Room", next: security },
      { text: "🍪 Kitchen Wing", next: kitchen },
      { text: "🌿 Garden Area", next: garden }
    ]
  );
}

// =========================
// 🏛️ MUSEUM (EXPANDED HEAVY OPTIONS)
// =========================
function museum() {
  scene(
    "The glass case is shattered… but strangely clean around it.",
    [
      {
        text: "Inspect broken glass",
        effect: () => state.clues++,
        next: museum2
      },
      {
        text: "Look at security camera angle",
        effect: () => state.trust++,
        next: museum3
      },
      {
        text: "Check floor markings",
        effect: () => state.clues++,
        next: museum4
      },
      {
        text: "Talk to guard",
        next: guard1
      },
      {
        text: "Check display stand underside",
        next: museum5
      }
    ]
  );
}

function museum2() {
  scene(
    "Glass fragments show break happened from INSIDE the case.",
    [
      { text: "Continue investigation", next: museum }
    ]
  );
}

function museum3() {
  scene(
    "Camera had blind spot activation at exact theft time.",
    [
      { text: "Go security", next: security },
      { text: "Go garden", next: garden }
    ]
  );
}

function museum4() {
  state.inventory.push("Drag Marks Evidence");
  update();

  scene(
    "You find drag marks leading toward exit hallway.",
    [
      { text: "Follow marks", next: security },
      { text: "Return", next: museum }
    ]
  );
}

function museum5() {
  state.inventory.push("Hidden Dust Sample");
  update();

  scene(
    "Dust under stand suggests object was removed carefully.",
    [
      { text: "Go kitchen", next: kitchen },
      { text: "Go security", next: security }
    ]
  );
}

// =========================
// 🧍 GUARD (EXPANDED DIALOGUE TREE)
// =========================
function guard1() {
  scene(
    "Guard: 'I… I didn’t see anything unusual.'",
    [
      {
        text: "Press harder",
        effect: () => state.trust++,
        next: guard2
      },
      {
        text: "Observe behavior",
        next: guard3
      },
      {
        text: "Leave",
        next: museum
      }
    ]
  );
}

function guard2() {
  scene(
    "Guard: 'Fine… someone used a badge after hours.'",
    [
      { text: "Ask who", next: security },
      { text: "Go kitchen", next: kitchen }
    ]
  );
}

function guard3() {
  scene(
    "He avoids eye contact. Hands shaking.",
    [
      { text: "Go security", next: security },
      { text: "Go museum", next: museum }
    ]
  );
}

// =========================
// 🖥️ SECURITY (MORE OPTIONS)
// =========================
function security() {
  scene(
    "Monitors flicker. One feed is missing from exactly 2:14 AM.",
    [
      {
        text: "Check system logs",
        effect: () => state.clues++,
        next: security2
      },
      {
        text: "Check badge access records",
        effect: () => state.trust++,
        next: security3
      },
      {
        text: "View deleted footage recovery",
        next: security4
      },
      {
        text: "Question technician",
        next: technician
      },
      {
        text: "Compare timestamps",
        next: security5
      }
    ]
  );
}

function security2() {
  scene("System override detected internally.", [{ text: "Continue", next: security }]);
}

function security3() {
  scene("Three employees accessed restricted zones.", [{ text: "Go garden", next: garden }]);
}

function security4() {
  state.inventory.push("Recovered Frame");
  update();

  scene(
    "You recover a blurred image of someone carrying a case.",
    [
      { text: "Analyze image", next: garden },
      { text: "Go museum", next: museum }
    ]
  );
}

function security5() {
  scene(
    "Time mismatch suggests intentional manipulation.",
    [
      { text: "Go garden", next: garden },
      { text: "Go library", next: library }
    ]
  );
}

// =========================
// 🍪 KITCHEN (MORE DEPTH)
// =========================
function kitchen() {
  scene(
    "Kitchen smells like bleach and metal.",
    [
      {
        text: "Inspect sink",
        effect: () => state.clues++,
        next: kitchen2
      },
      {
        text: "Check trash bin",
        next: kitchen3
      },
      {
        text: "Talk to chef",
        next: chef1
      },
      {
        text: "Check storage room",
        next: kitchen4
      }
    ]
  );
}

function kitchen2() {
  state.inventory.push("Chemical Residue");
  update();

  scene("Cleaning agents were used recently.", [{ text: "Continue", next: kitchen }]);
}

function kitchen3() {
  state.inventory.push("Discarded Fabric");
  update();

  scene("Fabric matches museum uniform style.", [{ text: "Go security", next: security }]);
}

function kitchen4() {
  scene("Storage room has been recently accessed.", [{ text: "Go garden", next: garden }]);
}

// =========================
// 🍽️ CHEF
// =========================
function chef1() {
  scene(
    "Chef: 'I only cook… I don’t deal with museum things.'",
    [
      { text: "Believe him", next: kitchen },
      { text: "Accuse him", next: security }
    ]
  );
}

// =========================
// 🌿 GARDEN (FINAL HUB EXPANDED)
// =========================
function garden() {
  scene(
    "Fog covers the garden. Everything connects here.",
    [
      { text: "Follow footprints", next: finalCase },
      { text: "Inspect bushes", next: finalCase },
      { text: "Check hidden wall", next: secretPath },
      { text: "Wait silently", next: finalCase },
      { text: "Revisit museum clues", next: museum }
    ]
  );
}

// =========================
// 💀 SECRET PATH
// =========================
function secretPath() {
  scene(
    "A hidden door appears behind ivy.",
    [
      {
        text: "Enter hidden room",
        next: secretRoom
      },
      {
        text: "Go back",
        next: garden
      }
    ]
  );
}

function secretRoom() {
  scene(
    "You discover surveillance records of ALL suspects.",
    [
      {
        text: "Analyze files",
        next: secretEnding
      },
      { text: "Leave", next: badEnding }
    ]
  );
}

// =========================
// ENDINGS (MORE CONDITIONS)
// =========================
function finalCase() {
  if (state.clues >= 6 && state.trust >= 3) goodEnding();
  else if (state.inventory.includes("Recovered Frame")) secretEnding();
  else if (state.clues >= 4) neutralEnding();
  else badEnding();
}

function goodEnding() {
  scene("🏆 Perfect case solved. Insider exposed.", [{ text: "Restart", next: start }]);
}

function neutralEnding() {
  scene("🟡 Case solved but incomplete truth.", [{ text: "Restart", next: start }]);
}

function badEnding() {
  scene("💀 Case failed. Suspect escapes.", [{ text: "Restart", next: start }]);
}

function secretEnding() {
  scene("🧠 SECRET: You uncovered hidden surveillance conspiracy.", [{ text: "Restart", next: start }]);
}

// START
start();
