/* js/app.js
   - Carga data/colorchart.json (GitHub Pages friendly)
   - Llena el menú con TODOS los sonidos
   - Reproduce/pausa audio
   - Muestra icono (img/CCxx.png)
   - Solo usa: id, description, audio, icon (ignora ipa/example/type)
*/

(() => {
  // --- Helpers
  const $ = (sel) => document.querySelector(sel);

  // Trata de “encontrar” elementos aunque hayas cambiado el HTML
  const ui = {
    select:
      $("#soundSelect") ||
      $("#menuSonidos") ||
      $("select"),
    iconImg:
      $("#iconImg") ||
      $("#icon") ||
      $("img"),
    desc:
      $("#description") ||
      $("#descText") ||
      $("#desc") ||
      $(".description") ||
      $("p"),
    status:
      $("#statusText") ||
      $("#status") ||
      null,
    playBtn:
      $("#soundBtn") ||
      $("#playBtn") ||
      $("#audioBtn") ||
      null,
  };

  // Si no existe botón, usamos el audio nativo y lo controlamos con click en cualquier “zona” que tengas
  const audio = new Audio();
  audio.preload = "auto";

  const setStatus = (txt) => {
    if (ui.status) ui.status.textContent = txt;
  };

  // IMPORTANTE: ruta correcta en GitHub Pages (usa URL relativa al documento actual)
  const JSON_URL = new URL("./data/colorchart.json", window.location.href);

  let sounds = [];
  let current = null;

  const normalizeItem = (item) => {
    // Acepta campos extra pero solo usa los que te importan
    const id = String(item.id || "").trim();
    const description = String(item.description || "").trim();

    // Si audio/icon vienen vacíos, los armamos por convención
    const audioPath = (item.audio && String(item.audio).trim()) || `audio/${id}.mp3`;
    const iconPath = (item.icon && String(item.icon).trim()) || `img/${id}.png`;

    return { id, description, audio: audioPath, icon: iconPath };
  };

  const validItem = (x) => x && x.id && x.audio && x.icon;

  const fillSelect = () => {
    if (!ui.select) return;

    ui.select.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Selecciona un sonido…";
    ui.select.appendChild(opt0);

    sounds.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.id; // (solo ID, como quieres)
      ui.select.appendChild(opt);
    });
  };

  const render = (s) => {
    current = s;

    // descripción
    if (ui.desc) ui.desc.textContent = s?.description || "Aquí va la descripción del sonido…";

    // icono
    if (ui.iconImg) {
      ui.iconImg.src = new URL(`./${s.icon}`, window.location.href).toString();
      ui.iconImg.alt = s.id;
    }

    // audio
    audio.src = new URL(`./${s.audio}`, window.location.href).toString();
    audio.currentTime = 0;

    setStatus("Detenido.");
  };

  const togglePlay = async () => {
    if (!current) return;

    try {
      if (audio.paused) {
        await audio.play();
        setStatus(`Reproduciendo ${current.id}…`);
      } else {
        audio.pause();
        setStatus("Detenido.");
      }
    } catch (e) {
      // Si el navegador bloquea autoplay, aquí te enteras
      console.error("Audio play error:", e);
      setStatus("No se pudo reproducir (bloqueo del navegador).");
      alert("Tu navegador bloqueó la reproducción. Haz click directo en el botón de sonido y vuelve a intentar.");
    }
  };

  // Eventos de audio para estado
  audio.addEventListener("ended", () => setStatus("Detenido."));
  audio.addEventListener("pause", () => setStatus("Detenido."));

  const bindUI = () => {
    if (ui.select) {
      ui.select.addEventListener("change", () => {
        const id = ui.select.value;
        if (!id) return;

        const s = sounds.find((x) => x.id === id);
        if (s) render(s);
      });
    }

    // Si tienes botón de “sonido”, úsalo; si no, clickea el contenedor que exista
    if (ui.playBtn) {
      ui.playBtn.addEventListener("click", togglePlay);
    } else {
      // fallback: click en cualquier elemento con texto “Click para reproducir”
      const fallbackBtn =
        document.querySelector('[data-play]') ||
        document.querySelector(".soundCard") ||
        document.querySelector(".sound") ||
        null;

      if (fallbackBtn) fallbackBtn.addEventListener("click", togglePlay);
    }
  };

  const load = async () => {
    try {
      setStatus("Cargando…");

      const res = await fetch(JSON_URL.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} al cargar JSON`);

      const raw = await res.json();

      if (!Array.isArray(raw)) throw new Error("El JSON debe ser un ARRAY [ ... ]");

      sounds = raw.map(normalizeItem).filter(validItem);

      if (!sounds.length) throw new Error("El JSON cargó, pero no hay items válidos (id/audio/icon).");

      fillSelect();
      bindUI();

      // Selecciona el primero por defecto (para demo)
      render(sounds[0]);
      if (ui.select) ui.select.value = sounds[0].id;

      setStatus("Listo.");
    } catch (err) {
      console.error(err);
      setStatus("Error cargando JSON.");
      alert(`Error cargando JSON:\n${err.message}\n\nTip: abre esta URL y verifica que exista:\n${JSON_URL}`);
    }
  };

  // Arranca cuando el DOM está listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
