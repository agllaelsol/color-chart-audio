(() => {
  const JSON_URL = "data/colorchart.json";

  const $select = document.getElementById("soundSelect");
  const $search = document.getElementById("searchInput");
  const $status = document.getElementById("statusText");

  const $icon = document.getElementById("iconImg");
  const $id = document.getElementById("idText");
  const $type = document.getElementById("typeText");
  const $ipa = document.getElementById("ipaText");
  const $ex = document.getElementById("exampleText");
  const $desc = document.getElementById("descText");

  const $btn = document.getElementById("playBtn");
  const $audio = document.getElementById("audioPlayer");

  let sounds = [];
  let current = null;

  function setStatus(msg) {
    $status.textContent = msg;
  }

  function safeText(v, fallback = "—") {
    return (v === null || v === undefined || v === "") ? fallback : String(v);
  }

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function buildOptionLabel(s) {
    // Ej: "CC08 — /ɑː/ — car"
    const id = safeText(s.id, "");
    const ipa = safeText(s.ipa, "");
    const ex = safeText(s.example, "");
    return [id, ipa, ex].filter(Boolean).join(" — ");
  }

  function fillSelect(list) {
    $select.innerHTML = "";
    if (!list.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No hay resultados";
      $select.appendChild(opt);
      return;
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecciona un sonido…";
    $select.appendChild(placeholder);

    list.forEach((s, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = buildOptionLabel(s);
      $select.appendChild(opt);
    });
  }

  function renderSound(s) {
    current = s;

    $id.textContent = safeText(s.id);
    $type.textContent = safeText(s.type);
    $ipa.textContent = safeText(s.ipa);
    $ex.textContent = safeText(s.example);
    $desc.textContent = safeText(s.description, "Sin descripción por ahora.");

    // ICONO
    const iconPath = safeText(s.icon, "");
    if (iconPath) {
      $icon.src = iconPath;
      $icon.style.opacity = "1";
    } else {
      $icon.removeAttribute("src");
      $icon.style.opacity = "0.25";
    }

    // AUDIO
    const audioPath = safeText(s.audio, "");
    if (audioPath) {
      $audio.src = audioPath;
      $audio.load();
      setStatus(`Cargado ${safeText(s.id)}.`);
    } else {
      $audio.removeAttribute("src");
      setStatus(`Sin audio en ${safeText(s.id)}.`);
    }

    // reset botón
    $btn.textContent = "▶︎";
  }

  async function loadJSON() {
    try {
      setStatus("Cargando JSON…");

      const res = await fetch(JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("El JSON debe ser un arreglo []");

      // Validación ligera
      sounds = data
        .filter(x => x && typeof x === "object")
        .map(x => ({
          id: x.id || "",
          ipa: x.ipa || "",
          example: x.example || "",
          description: x.description || "",
          type: x.type || "",
          audio: x.audio || "",
          icon: x.icon || ""
        }));

      fillSelect(sounds);
      setStatus(`Listo. ${sounds.length} sonido(s).`);

      // Auto-cargar el primero si existe
      if (sounds.length) {
        $select.value = "1"; // porque el 0 es el placeholder; nuestros items empiezan en 0, pero el select tiene placeholder primero
        // Ajuste: nuestro value real es idx (0..), pero hay placeholder arriba, así que no forzamos aquí.
        // Mejor: cargar primer sonido directo:
        renderSound(sounds[0]);
        // y reflejarlo en el select:
        $select.value = "0";
      }
    } catch (err) {
      console.error(err);
      setStatus("Error cargando JSON.");
      alert("No se pudo cargar el JSON. Revisa que exista data/colorchart.json y que GitHub Pages esté activo.");
    }
  }

  function togglePlay() {
    if (!$audio.src) {
      alert("Este sonido no tiene audio asignado en el JSON (campo 'audio').");
      return;
    }

    // Solo reproduce si el usuario dio click (política del navegador)
    if ($audio.paused) {
      $audio.play()
        .then(() => {
          $btn.textContent = "⏸";
          setStatus("Reproduciendo…");
        })
        .catch((e) => {
          console.error(e);
          setStatus("No se pudo reproducir.");
          alert("El navegador bloqueó el audio o no encontró el archivo. Revisa el nombre exacto del .mp3 (mayúsculas/minúsculas).");
        });
    } else {
      $audio.pause();
      $audio.currentTime = 0;
      $btn.textContent = "▶︎";
      setStatus("Detenido.");
    }
  }

  function applyFilter() {
    const q = normalize($search.value);
    if (!q) {
      fillSelect(sounds);
      return;
    }

    const filtered = sounds.filter(s => {
      const hay = [
        s.id, s.ipa, s.example, s.type, s.description
      ].map(normalize).join(" ");
      return hay.includes(q);
    });

    fillSelect(filtered);
  }

  // Eventos
  $select.addEventListener("change", () => {
    const v = $select.value;
    if (v === "") return;

    const idx = Number(v);
    if (Number.isNaN(idx) || !sounds[idx]) return;

    // stop actual
    $audio.pause();
    $audio.currentTime = 0;

    renderSound(sounds[idx]);
  });

  $search.addEventListener("input", applyFilter);

  $btn.addEventListener("click", togglePlay);

  $audio.addEventListener("ended", () => {
    $btn.textContent = "▶︎";
    setStatus("Listo.");
  });

  // Init
  loadJSON();
})();
