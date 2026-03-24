let akten = [];
let currentIndex = null;

// SOCKET (optional)
let socket;
if (typeof io !== "undefined") {
  socket = io();

  socket.on("update", (data) => {
    akten = data;
    render();

    if (currentIndex !== null) {
      renderFaelle();
    }
  });
}

// 🔥 Daten laden
async function loadAkten() {
  try {
    const res = await fetch("/akten");
    akten = await res.json();
    render();
  } catch (err) {
    console.error("Fehler beim Laden:", err);
  }
}

loadAkten();

// 🔥 Seiten wechseln
function showPage(page) {
  document.getElementById("list").classList.add("hidden");
  document.getElementById("new").classList.add("hidden");
  document.getElementById("detail").classList.add("hidden");

  document.getElementById(page).classList.remove("hidden");
}

// 🔥 Logout
function logout() {
  location.href = "index.html";
}

// 🔥 Liste anzeigen
function render() {
  const list = document.getElementById("list");
  list.innerHTML = "<h2>📂 Patientenakten</h2>";

  akten.forEach((akte, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${akte.name}</h3>
      <p>🎮 ${akte.roblox || "-"}</p>
      <button onclick="openAkte(${i})">Öffnen</button>
    `;

    list.appendChild(div);
  });
}

// 🔥 Akte öffnen
function openAkte(i) {
  currentIndex = i;

  if (!akten[i]) return;

  document.getElementById("detailName").innerText = akten[i].name;

  showPage("detail");
  renderFaelle();
}

// 🔥 Neue Akte
async function addAkte() {
  const name = document.getElementById("name").value;
  const roblox = document.getElementById("roblox").value;

  if (!name) return alert("Name fehlt!");

  await fetch("/akten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      roblox,
      faelle: []
    })
  });

  await loadAkten();

  document.getElementById("name").value = "";
  document.getElementById("roblox").value = "";

  showPage("list");
}

// 🔥 Neuer Fall
async function addFall() {
  const data = {
    arzt: document.getElementById("arzt").value,
    diagnose: document.getElementById("diagnose").value,
    med: document.getElementById("med").value,
    status: document.getElementById("status").value,
    puls: document.getElementById("puls").value,
    rr: document.getElementById("rr").value,
    spo2: document.getElementById("spo2").value,
    zeit: new Date().toLocaleString()
  };

  await fetch("/fall/" + currentIndex, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  await loadAkten();

  document.getElementById("arzt").value = "";
  document.getElementById("diagnose").value = "";
  document.getElementById("med").value = "";
  document.getElementById("puls").value = "";
  document.getElementById("rr").value = "";
  document.getElementById("spo2").value = "";
}

// 🔥 Fälle anzeigen
function renderFaelle() {
  const container = document.getElementById("faelle");
  container.innerHTML = "";

  if (!akten[currentIndex]) return;

  akten[currentIndex].faelle.forEach((f) => {
    const colors = {
      anfahrt: "tag-blue",
      kh: "tag-green",
      nef: "tag-red",
      stabil: "tag-green",
      kritisch: "tag-orange"
    };

    const div = document.createElement("div");
    div.className = "fall";

    div.innerHTML = `
      <div class="fall-header">
        <span class="tag ${colors[f.status] || ""}">
          ${f.status ? f.status.toUpperCase() : "-"}
        </span>
        <span class="zeit">${f.zeit}</span>
      </div>

      <h3>${f.diagnose || "Keine Diagnose"}</h3>

      👨‍⚕️ Arzt: ${f.arzt || "-"}<br>
      💊 Medikamente: ${f.med || "-"}<br><br>

      ❤️ Puls: ${f.puls || "-"} |
      🩸 RR: ${f.rr || "-"} |
      🫁 SpO2: ${f.spo2 || "-"}
    `;

    container.appendChild(div);
  });
}

// 🔥 Detail schließen
function closeDetail() {
  currentIndex = null;
  showPage("list");
}

// 🔍 Suche
const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(value) ? "block" : "none";
    });
  });
}

// 🔥 Nav Animation
const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(btn => {
  btn.addEventListener("click", function () {
    navItems.forEach(b => b.classList.remove("active"));
    this.classList.add("active");
  });
});