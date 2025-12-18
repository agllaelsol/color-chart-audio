(() => {
  const JSON_URL = "data/colorchart.json";

  // Cambia aquí el nombre/ubicación del ícono de bocina
  // Recomendación: guárdalo en /img/ como speaker.svg o speaker.png
  const SPEAKER_ICON = "img/speaker.svg";

  const $select = document.getElementById("soundSelect");
  const $status = document.getElementById("status");
  const $iconImg = document.getElementById("iconImg");
  const $soundId = document.getElementById("soundId");
  const $descText = document.getElementById("descText");
  const $playBtn = document.getElementById("playBtn");
  const $speakerImg = document.getElementById("speakerImg");

  // Audio único (no crees uno por click)
  const audio = new Audio();
  audio.preload = "auto";

  let sounds = [];
  let current = null;

  // UI helpers
  function setStatus(msg) { $status.textContent = msg || "—"; }

  function stopAudio() {
    try { audio.pause(); } catch {}
    // CLAVE: reset para que vuelva a sonar siempre
    audio.currentTime = 0;
  }

  function setCurrentById(id) {
    current = sounds.find(s => s.id === id) || null;

    if (!current) {
      $soundId.textContent = "";
      $descText.textContent = "Selecciona un sonido.";
      $iconImg.removeAttribute("src");
      audio.removeAttribute("src");
      stopAudio();
      return;
    }

    // Render
    $soundId.textContent = current.id || "";
    $descText.textContent = current.description || "";
    if (current.icon) $iconImg.src = current.icon;

    // Preparar audio (NO autoplay)
    stopAudio();
    audio.src = current.audio; // ruta relativa tipo "audio/CC01.mp3"
    audio.load();

    setStatus("Listo.");
  }

  // Reproducción SOLO por click
  async function togglePlay() {
    if (!current) return;

    // Si está sonando => stop
    if (!audio.paused) {
      stopAudio();
      setStatus("Detenido.");
      return;
    }

    // Si estaba al final por cualquier razón, forzar inicio
    if (audio.currentTime >= (audio.duration || 0)) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setStatus(`Reproduciendo ${current.id}…`);
    } catch (e) {
      // Esto solo debería pasar si alguien intentó autoplay fuera de click
      setStatus("El navegador bloqueó la reproducción. Vuelve a dar click.");
    }
  }

  // Cuando termina: reset para que al siguiente click vuelva a sonar
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    setStatus("Terminado.");
  });

  // Si hay error real de archivo
  audio.addEventListener("error", () => {
    setStatus("Error cargando audio (revisa ruta/nombre).");
  });

  // Select: cambiar sonido NO debe reproducir
  $select.addEventListener("change", () => {
    const id = $select.value;
    setCurrentById(id);
  });

  // Botón: único lugar donde se reproduce
  $playBtn.addEventListener("click", togglePlay);

  // Speaker icon
  $speakerImg.src = SPEAKER_ICON;

  // Cargar JSON
  async function init() {
    setStatus("Cargando…");

    try {
      const res = await fetch(JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar JSON");
      const data = await res.json();

      // Espera un array: [{id, description, audio, icon}, ...]
      sounds = Array.isArray(data) ? data : [];

      // Poblar menú
      $select.innerHTML = `<option value="">Selecciona…</option>` +
        sounds.map(s => `<option value="${s.id}">${s.id}</option>`).join("");

      setStatus("Listo.");

      // Opcional: seleccionar primero
      // if (sounds[0]) { $select.value = sounds[0].id; setCurrentById(sounds[0].id); }

    } catch (err) {
      $select.innerHTML = `<option value="">Error cargando JSON</option>`;
      setStatus("Error cargando JSON.");
    }
  }

  init();
})();
