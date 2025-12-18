// ===============================
// Color Chart – app.js (FINAL)
// ===============================

// Elementos
const menuEl = document.getElementById("soundMenu");
const statusEl = document.getElementById("status");

const avatarEl = document.getElementById("avatar");
const idTextEl = document.getElementById("idText");
const typeTextEl = document.getElementById("typeText");
const ipaBigEl = document.getElementById("ipaBig");
const exampleBigEl = document.getElementById("exampleBig");
const descTextEl = document.getElementById("descText");

const playBtn = document.getElementById("playBtn");

// Variables
let data = [];
let currentItem = null;
let audioPlayer = null;

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function stopAudio() {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer = null;
  }
  if (playBtn) playBtn.classList.remove("isPlaying");
}

function render(item) {
  currentItem = item;

  if (idTextEl) idTextEl.textContent = item.id || "";
  if (typeTextEl) typeTextEl.textContent = item.type || "";

  if (ipaBigEl) ipaBigEl.textContent = item.ipa || "";
  if (exampleBigEl) exampleBigEl.textContent = item.example || "";
  if (descTextEl) descTextEl.textContent = item.description || "";

  // Icono (opcional)
  if (avatarEl) {
    if (item.icon && String(item.icon).trim() !== "") {
      avatarEl.style.backgroundImage = `url('${item.icon}')`;
    } else {
      avatarEl.style.backgroundImage = "none";
    }
  }

  // sincroniza el menú
  if (menuEl && item.id) menuEl.value = item.id;

  // cambiar de sonido = detener
  stopAudio();
}

function fillMenu(list) {
  if (!menuEl) return;
  menuEl.innerHTML = "";

  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.id} — ${item.ipa || ""} — ${item.example || ""}`.trim();
    menuEl.appendChild(opt);
  });
}

async function fetchJsonSmart() {
  // ✅ Primer intento: el nombre que estás usando ahora
  const candidates = [
    "./data/colorchart.json",
    "./data/colorchart.json"
  ];

  let lastErr = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
      const json = await res.json();
      return { json, url };
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("No se pudo cargar el JSON");
}

async function init() {
  try {
    setStatus("Cargando JSON…");

    const { json, url } = await fetchJsonSmart();

    if (!Array.isArray(json) || json.length === 0) {
      throw new Error("El JSON está vacío o no es un arreglo");
    }

    data = json;

    fillMenu(data);
    render(data[0]);

    setStatus(`JSON OK ✅ (${data.length} sonidos) — ${url}`);
  } catch (e) {
    console.error(e);
    setStatus("Error cargando JSON ❌ (revisa nombre/ruta en /data)");
    alert(
      "No se pudo cargar el JSON.\n\n" +
      "1) Abre con Live Preview o GitHub Pages.\n" +
      "2) Verifica que exista: data/colorchart.json\n" +
      "3) Que NO tenga espacios tipo: colorchart (1).json"
    );
  }
}

// Cambio de selección
if (menuEl) {
  menuEl.addEventListener("change", () => {
    const item = data.find(x => x.id === menuEl.value);
    if (item) render(item);
  });
}

// Play / Stop
if (playBtn) {
  playBtn.addEventListener("click", () => {
    if (!currentItem) return;

    // Toggle stop
    if (audioPlayer) {
      stopAudio();
      setStatus("Detenido.");
      return;
    }

    const src = "./" + currentItem.audio; // ej: audio/CC08.mp3
    audioPlayer = new Audio(src);

    audioPlayer.addEventListener("ended", () => {
      stopAudio();
      setStatus("Listo ✅");
    });

    audioPlayer.addEventListener("error", () => {
      stopAudio();
      setStatus(`No encontró el audio: ${currentItem.audio} ❌`);
      alert(`No encontró el audio:\n${currentItem.audio}\n\nRevisa que exista y el nombre sea EXACTO.`);
    });

    audioPlayer.play()
      .then(() => {
        playBtn.classList.add("isPlaying");
        setStatus(`Reproduciendo ${currentItem.id}…`);
      })
      .catch(() => {
        stopAudio();
        setStatus("El navegador bloqueó el audio ❌ (da click otra vez)");
      });
  });
}

init();
