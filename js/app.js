(() => {
  const DATA_URL = "data/colorchart.json";

  const $select = document.getElementById("soundSelect");
  const $status = document.getElementById("statusText");

  const $idText = document.getElementById("idText");
  const $descText = document.getElementById("descText");

  const $iconImg = document.getElementById("iconImg");

  const $audio = document.getElementById("audioEl");
  const $playBtn = document.getElementById("playBtn");

  let sounds = [];
  let current = null;
  let isPlaying = false;

  function setStatus(text) {
    if ($status) $status.textContent = text;
  }

  function safeText(el, text) {
    if (el) el.textContent = text ?? "";
  }

  function safeImg(imgEl, src) {
    if (!imgEl) return;

    if (!src) {
      imgEl.removeAttribute("src");
      imgEl.style.opacity = "0";
      return;
    }

    imgEl.style.opacity = "1";
    imgEl.src = src;

    // si falla la imagen, no rompas todo
    imgEl.onerror = () => {
      imgEl.removeAttribute("src");
      imgEl.style.opacity = "0";
      setStatus("Ícono no encontrado.");
    };
  }

  function fillSelect(items) {
    $select.innerHTML = "";

    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Selecciona un sonido…";
    opt0.disabled = true;
    opt0.selected = true;
    $select.appendChild(opt0);

    items.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.id; // SOLO ID, como quieres
      $select.appendChild(opt);
    });
  }

  function stopAudio() {
    try {
      $audio.pause();
      $audio.currentTime = 0;
    } catch {}
    isPlaying = false;
    $playBtn?.classList.remove("playing");
    if (current?.id) setStatus("Detenido.");
    else setStatus("—");
  }

  function loadSoundById(id) {
    const s = sounds.find((x) => x.id === id);
    if (!s) return;

    current = s;
    stopAudio();

    safeText($idText, s.id || "—");
    safeText($descText, s.description || "");

    // Icono
    safeImg($iconImg, s.icon);

    // Audio
    if (s.audio) {
      $audio.src = s.audio;
      $audio.load();
      setStatus("Listo.");
    } else {
      $audio.removeAttribute("src");
      setStatus("Audio no definido.");
    }
  }

  async function init() {
    setStatus("Cargando...");

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${DATA_URL}`);

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("El JSON debe ser una lista (array) de objetos.");

      // Normaliza y filtra mínimos
      sounds = data
        .map((s) => ({
          id: String(s.id || "").trim(),
          description: String(s.description || ""),
          audio: String(s.audio || "").trim(),
          icon: String(s.icon || "").trim()
        }))
        .filter((s) => s.id);

      if (!sounds.length) throw new Error("El JSON no trae sonidos válidos (faltan ids).");

      fillSelect(sounds);
      setStatus("Listo. Selecciona un sonido.");

      // Si quieres que arranque en CC08 si existe:
      const defaultId = sounds.find((x) => x.id === "CC08") ? "CC08" : null;
      if (defaultId) {
        $select.value = defaultId;
        loadSoundById(defaultId);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error cargando JSON (revisa consola).");
      $select.innerHTML = `<option value="" selected disabled>Error cargando JSON</option>`;
      safeText($idText, "—");
      safeText($descText, "No se pudo cargar el catálogo.");
      safeImg($iconImg, "");
    }
  }

  // Eventos
  $select?.addEventListener("change", (e) => {
    const id = e.target.value;
    loadSoundById(id);
  });

  $playBtn?.addEventListener("click", async () => {
    if (!current) return;

    // si no hay src, intenta recargar desde current
    if (!$audio.src && current.audio) {
      $audio.src = current.audio;
      $audio.load();
    }

    // toggle
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      await $audio.play();
      isPlaying = true;
      $playBtn.classList.add("playing");
      setStatus(`Reproduciendo ${current.id}...`);
    } catch (err) {
      console.error(err);
      setStatus("No se pudo reproducir (permiso / ruta / formato).");
    }
  });

  // Cuando termina el audio
  $audio?.addEventListener("ended", () => {
    isPlaying = false;
    $playBtn?.classList.remove("playing");
    setStatus("Terminado.");
  });

  // Init
  init();
})();
