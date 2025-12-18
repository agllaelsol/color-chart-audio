(() => {
  const DATA_URL = "data/colorchart.json";

  const $ = (id) => document.getElementById(id);

  // IDs que debe tener tu HTML:
  // soundSelect, searchInput, statusText
  // iconImg, idText, typeText, ipaText, exampleText, descText
  // playBtn
  const els = {
    select: $("soundSelect"),
    search: $("searchInput"),
    status: $("statusText"),

    icon: $("iconImg"),
    idText: $("idText"),
    typeText: $("typeText"),
    ipa: $("ipaText"),
    example: $("exampleText"),
    desc: $("descText"),

    playBtn: $("playBtn"),
  };

  let sounds = [];
  let current = null;
  const audio = new Audio();
  audio.preload = "auto";

  function setStatus(msg) {
    if (els.status) els.status.textContent = msg || "";
  }

  function fillSelect(list) {
    els.select.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Selecciona un sonido…";
    els.select.appendChild(opt0);

    list.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.id} — ${s.ipa || ""} — ${s.example || ""}`.trim();
      els.select.appendChild(opt);
    });
  }

  function renderSound(s) {
    current = s;

    els.idText.textContent = s.id || "--";
    els.typeText.textContent = s.type || "--";
    els.ipa.textContent = s.ipa || "--";
    els.example.textContent = s.example || "--";
    els.desc.textContent = s.description || "";

    // Icono
    if (s.icon) {
      els.icon.src = s.icon;
      els.icon.style.opacity = "1";
    } else {
      els.icon.removeAttribute("src");
      els.icon.style.opacity = "0.25";
    }

    // Audio (no reproduce solo: solo prepara)
    if (s.audio) {
      audio.src = s.audio;
      setStatus("Listo.");
    } else {
      audio.removeAttribute("src");
      setStatus("Este sonido no tiene audio asignado.");
    }
  }

  async function togglePlay() {
    if (!current || !current.audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setStatus("Reproduciendo…");
      } else {
        audio.pause();
        setStatus("Detenido.");
      }
    } catch (err) {
      // Si falla, casi siempre es ruta incorrecta o archivo faltante
      console.error(err);
      alert(
        "No se pudo reproducir el audio.\n\n" +
        "1) Revisa que exista el archivo exacto en /audio (ej. CC08.mp3)\n" +
        "2) Revisa que en el JSON diga: audio/CC08.mp3\n" +
        "3) Respeta MAYÚSCULAS/minúsculas."
      );
      setStatus("Error al reproducir.");
    }
  }

  function applyFilter() {
    const q = (els.search.value || "").toLowerCase().trim();
    if (!q) {
      fillSelect(sounds);
      return;
    }
    const filtered = sounds.filter((s) => {
      return (
        (s.id || "").toLowerCase().includes(q) ||
        (s.ipa || "").toLowerCase().includes(q) ||
        (s.example || "").toLowerCase().includes(q) ||
        (s.type || "").toLowerCase().includes(q)
      );
    });
    fillSelect(filtered);
  }

  function getById(id) {
    return sounds.find((s) => s.id === id);
  }

  async function init() {
    if (!els.select || !els.playBtn) {
      alert("Faltan IDs en el HTML. Revisa que existan soundSelect y playBtn.");
      return;
    }

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      sounds = await res.json();

      if (!Array.isArray(sounds)) throw new Error("JSON no es un array");

      fillSelect(sounds);
      setStatus("Listo.");

      // Auto-selección del primero (para demo)
      if (sounds.length) {
        els.select.value = sounds[0].id;
        renderSound(sounds[0]);
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar el JSON: " + DATA_URL);
      setStatus("Error cargando JSON.");
    }
  }

  // Eventos
  if (els.select) {
    els.select.addEventListener("change", () => {
      const s = getById(els.select.value);
      if (s) renderSound(s);
    });
  }

  if (els.search) {
    els.search.addEventListener("input", applyFilter);
  }

  if (els.playBtn) {
    els.playBtn.addEventListener("click", togglePlay);
  }

  audio.addEventListener("ended", () => setStatus("Detenido."));

  // Inicia
  init();
})();
