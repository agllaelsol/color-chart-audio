(() => {
  const JSON_URL = "data/colorchart.json";

  const $select = document.getElementById("soundSelect");
  const $status = document.getElementById("status");
  const $iconImg = document.getElementById("iconImg");
  const $soundId = document.getElementById("soundId");
  const $descText = document.getElementById("descText");
  const $playBtn = document.getElementById("playBtn");

  if (!$select || !$status || !$iconImg || !$soundId || !$descText || !$playBtn) {
    console.error("IDs no coinciden entre index.html y app.js");
    return;
  }

  const audio = new Audio();
  audio.preload = "auto";

  let sounds = [];
  let current = null;

  const setStatus = (msg) => { $status.textContent = msg || "—"; };

  const stopAudio = () => {
    try { audio.pause(); } catch {}
    audio.currentTime = 0;
  };

  const safePath = (id, provided, folder, ext) => {
    // si en tu JSON viene vacío o viene mal, lo derivamos
    if (typeof provided === "string" && provided.trim()) return provided.trim();
    return `${folder}/${id}${ext}`;
  };

  const setCurrentById = (id) => {
    current = sounds.find(s => s.id === id) || null;

    if (!current) {
      $soundId.textContent = "";
      $descText.textContent = "Selecciona un sonido.";
      $iconImg.removeAttribute("src");
      audio.removeAttribute("src");
      stopAudio();
      return;
    }

    const iconPath  = safePath(current.id, current.icon,  "img",   ".png");
    const audioPath = safePath(current.id, current.audio, "audio", ".mp3");

    $soundId.textContent = current.id;
    $descText.textContent = current.description || "";

    $iconImg.src = iconPath;

    stopAudio();
    audio.src = audioPath;
    audio.load();

    setStatus("Listo.");
  };

  const togglePlay = async () => {
    if (!current) return;

    // detener si ya está sonando
    if (!audio.paused) {
      stopAudio();
      setStatus("Detenido.");
      return;
    }

    // forzar desde 0 siempre que le vuelvas a dar play
    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus(`Reproduciendo ${current.id}…`);
    } catch (e) {
      setStatus("El navegador bloqueó la reproducción. Vuelve a dar click.");
    }
  };

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    setStatus("Terminado.");
  });

  audio.addEventListener("error", () => {
    // esto sale cuando NO encuentra el archivo o no puede leerlo
    setStatus("Error cargando audio (revisa ruta/nombre).");
  });

  $select.addEventListener("change", () => setCurrentById($select.value));
  $playBtn.addEventListener("click", togglePlay);

  async function init() {
    setStatus("Cargando…");
    try {
      const res = await fetch(JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("JSON no es un array");

      sounds = data;

      // llena select
      $select.innerHTML = sounds
        .map(s => `<option value="${s.id}">${s.id}</option>`)
        .join("");

      // arranca en CC01 si existe, si no en el primero
      const firstId = sounds.some(s => s.id === "CC01") ? "CC01" : (sounds[0]?.id || "");
      $select.value = firstId;
      setCurrentById(firstId);

      setStatus("Listo.");
    } catch (err) {
      console.error(err);
      $select.innerHTML = `<option value="">Error cargando JSON</option>`;
      setStatus("Error cargando JSON.");
    }
  }

  init();
})();
