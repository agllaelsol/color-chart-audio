(() => {
  const JSON_URL = "data/colorchart.json";

  const $select = document.getElementById("soundSelect");
  const $status = document.getElementById("status");
  const $icon = document.getElementById("iconImg");
  const $idText = document.getElementById("idText");
  const $desc = document.getElementById("descText");
  const $audio = document.getElementById("audioEl");
  const $playBtn = document.getElementById("playBtn");

  let sounds = [];
  let current = null;
  let isPlaying = false;

  function setStatus(text) {
    if ($status) $status.textContent = text;
  }

  function clearUI() {
    $idText.textContent = "—";
    $desc.textContent = "Selecciona un sonido.";
    $icon.removeAttribute("src");
    $icon.alt = "Icono";
    $audio.removeAttribute("src");
    $audio.load();
    isPlaying = false;
  }

  function renderSelect(items) {
    $select.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Selecciona…";
    $select.appendChild(opt0);

    for (const item of items) {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.id; // simple para mostrárselo a Javier (bonito y limpio)
      $select.appendChild(opt);
    }
  }

  function applySound(item) {
    current = item;
    if (!item) {
      clearUI();
      setStatus("—");
      return;
    }

    $idText.textContent = item.id || "—";
    $desc.textContent = item.description || "";

    // ICONO
    if (item.icon) {
      $icon.src = item.icon;
      $icon.alt = `Icono ${item.id}`;
    } else {
      $icon.removeAttribute("src");
      $icon.alt = "Icono";
    }

    // AUDIO
    if (item.audio) {
      $audio.src = item.audio;
      $audio.load();
    } else {
      $audio.removeAttribute("src");
      $audio.load();
    }

    setStatus("Detenido.");
    isPlaying = false;
  }

  async function loadJSON() {
    try {
      setStatus("Cargando…");

      // cache-buster para que GitHub Pages no se quede con una versión vieja
      const res = await fetch(`${JSON_URL}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Tu JSON no es una LISTA. Debe empezar con [ y terminar con ].");
      }

      sounds = data;

      renderSelect(sounds);

      setStatus(`Listo (${sounds.length}).`);
      clearUI();
    } catch (err) {
      console.error(err);
      setStatus("Error cargando JSON.");
      alert(`No se pudo cargar el JSON: ${err.message}`);
    }
  }

  $select.addEventListener("change", () => {
    const id = $select.value;
    const item = sounds.find(s => s.id === id) || null;
    applySound(item);
  });

  $playBtn.addEventListener("click", async () => {
    if (!current || !$audio.src) return;

    try {
      if (!isPlaying) {
        await $audio.play();
        isPlaying = true;
        setStatus(`Reproduciendo ${current.id}…`);
      } else {
        $audio.pause();
        $audio.currentTime = 0;
        isPlaying = false;
        setStatus("Detenido.");
      }
    } catch (e) {
      console.error(e);
      setStatus("No se pudo reproducir.");
      alert("El navegador bloqueó el audio. Intenta dar click otra vez.");
    }
  });

  $audio.addEventListener("ended", () => {
    isPlaying = false;
    setStatus("Detenido.");
  });

  loadJSON();
})();
