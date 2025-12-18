(() => {
  const JSON_URL = "./data/colorchart.json"; // IMPORTANT: relativo, sin "/" al inicio

  const elSelect = document.getElementById("soundSelect");
  const elStatus = document.getElementById("statusText");
  const elIcon = document.getElementById("iconImg");
  const elIdPill = document.getElementById("idPill");
  const elDesc = document.getElementById("descText");
  const elPlayBtn = document.getElementById("playBtn");

  let sounds = [];
  let current = null;
  let audio = null;

  function setStatus(msg) {
    elStatus.textContent = msg || "—";
  }

  function safeText(v, fallback = "—") {
    return (typeof v === "string" && v.trim()) ? v.trim() : fallback;
  }

  function stopAudio() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio = null;
    elPlayBtn.textContent = "▶";
  }

  function render(item) {
    current = item;

    // ID
    elIdPill.textContent = safeText(item?.id);

    // Descripción
    elDesc.textContent = safeText(item?.description, "Sin descripción por ahora.");

    // Icono
    const iconPath = safeText(item?.icon, "");
    elIcon.src = iconPath ? iconPath : "";
    elIcon.alt = item?.id ? `Icono ${item.id}` : "Icono";
    elIcon.onerror = () => {
      // fallback visual si falta el archivo
      elIcon.src = "";
    };

    // Reset audio al cambiar
    stopAudio();
    setStatus("Listo.");
  }

  function fillSelect(list) {
    elSelect.innerHTML = "";

    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Selecciona un sonido…";
    elSelect.appendChild(opt0);

    for (const s of list) {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = s.id; // solo ID, como pediste
      elSelect.appendChild(o);
    }
  }

  async function loadJSON() {
    try {
      setStatus("Cargando…");

      // cache: no-store ayuda cuando GitHub Pages se pone necio con el caché
      const res = await fetch(JSON_URL, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`No se pudo cargar JSON (${res.status})`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("El JSON no es un array.");
      }

      // Validación mínima
      sounds = data
        .filter(x => x && typeof x.id === "string")
        .map(x => ({
          id: x.id,
          description: x.description || "",
          audio: x.audio || "",
          icon: x.icon || ""
        }));

      fillSelect(sounds);

      // auto-seleccionar el primero si existe
      if (sounds.length) {
        elSelect.value = sounds[0].id;
        render(sounds[0]);
      } else {
        setStatus("JSON vacío.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error cargando JSON.");
      // deja el select usable (por si quieres)
      elSelect.innerHTML = `<option value="">Error cargando JSON</option>`;
      alert("No se pudo cargar el JSON. Revisa que exista /data/colorchart.json en GitHub Pages.");
    }
  }

  // Events
  elSelect.addEventListener("change", () => {
    const id = elSelect.value;
    const found = sounds.find(s => s.id === id);
    if (found) render(found);
  });

  elPlayBtn.addEventListener("click", () => {
    if (!current) return;

    const audioPath = safeText(current.audio, "");

    if (!audioPath) {
      alert("Este sonido no tiene ruta de audio.");
      return;
    }

    // toggle play/stop
    if (audio) {
      stopAudio();
      setStatus("Detenido.");
      return;
    }

    audio = new Audio(audioPath);

    audio.addEventListener("playing", () => {
      elPlayBtn.textContent = "■";
      setStatus(`Reproduciendo ${current.id}…`);
    });

    audio.addEventListener("ended", () => {
      stopAudio();
      setStatus("Terminado.");
    });

    audio.addEventListener("error", () => {
      stopAudio();
      setStatus("Error de audio.");
      alert(`No pude reproducir el audio: ${audioPath}\nRevisa que exista en /audio y el nombre sea EXACTO.`);
    });

    audio.play().catch(() => {
      stopAudio();
      setStatus("Bloqueado por el navegador.");
      alert("El navegador bloqueó el audio. Da click otra vez (a veces requiere interacción).");
    });
  });

  // Start
  loadJSON();
})();
