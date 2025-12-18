(() => {
  const JSON_URL = "./data/colorchart.json";

  const soundSelect = document.getElementById("soundSelect");
  const statusEl = document.getElementById("status");
  const iconImg = document.getElementById("iconImg");
  const idPill = document.getElementById("idPill");
  const descText = document.getElementById("descText");
  const playBtn = document.getElementById("playBtn");

  const audio = new Audio();
  audio.preload = "auto";

  let items = [];
  let current = null;

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function clearUI() {
    idPill.textContent = "CC--";
    descText.textContent = "Selecciona un sonido.";
    iconImg.removeAttribute("src");
    iconImg.alt = "Icono";
    playBtn.classList.remove("isPlaying");
  }

  function stopAudio() {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
    playBtn.classList.remove("isPlaying");
  }

  function setCurrentById(id) {
    current = items.find(x => x.id === id) || null;
    stopAudio();

    if (!current) {
      clearUI();
      return;
    }

    idPill.textContent = current.id || "CC--";
    descText.textContent = current.description || "";
    iconImg.src = current.icon || "";
    iconImg.alt = current.id ? `Icono ${current.id}` : "Icono";

    audio.src = current.audio || "";
    audio.load();
    setStatus("Listo.");
  }

  async function loadJSON() {
    try {
      setStatus("Cargando JSON…");
      const res = await fetch(JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("JSON no es un array.");

      // Validación mínima
      items = data.filter(x => x && x.id && x.audio && x.icon);

      if (!items.length) throw new Error("JSON vacío o sin campos requeridos (id, audio, icon).");

      // Llenar select
      soundSelect.innerHTML = "";
      items.forEach((it) => {
        const opt = document.createElement("option");
        opt.value = it.id;
        opt.textContent = it.id;
        soundSelect.appendChild(opt);
      });

      soundSelect.disabled = false;
      setStatus("Terminado.");

      // Seleccionar primero
      setCurrentById(items[0].id);
      soundSelect.value = items[0].id;

    } catch (err) {
      console.error(err);
      soundSelect.innerHTML = `<option>Error cargando JSON</option>`;
      soundSelect.disabled = true;
      setStatus("Error cargando JSON.");
      clearUI();
    }
  }

  // Cambiar sonido (NO reproducir automáticamente)
  soundSelect.addEventListener("change", () => {
    setCurrentById(soundSelect.value);
  });

  // Botón play/stop (esto SÍ es gesto del usuario → no lo bloquea el navegador)
  playBtn.addEventListener("click", async () => {
    if (!current) return;

    if (!audio.src) {
      setStatus("Audio no encontrado.");
      return;
    }

    if (!audio.paused) {
      stopAudio();
      setStatus("Detenido.");
      return;
    }

    try {
      await audio.play();
      playBtn.classList.add("isPlaying");
      setStatus(`Reproduciendo ${current.id}…`);
    } catch (e) {
      console.error(e);
      setStatus("El navegador bloqueó la reproducción. Vuelve a dar click.");
    }
  });

  audio.addEventListener("ended", () => {
    playBtn.classList.remove("isPlaying");
    setStatus("Terminado.");
  });

  // Si falla una imagen, al menos no rompe
  iconImg.addEventListener("error", () => {
    iconImg.removeAttribute("src");
  });

  clearUI();
  loadJSON();
})();
