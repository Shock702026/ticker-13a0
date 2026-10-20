/* Código compartido por los dos tickers. No hace falta editar este archivo. */
(function () {
  const C = window.TICKER_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const T = (window.Ticker = {});

  T.config = C;
  T.demo = params.has("demo") || params.get("modo") === "demo";
  T.params = params;

  /* ---- Colores de la configuración → variables CSS ---- */
  T.aplicarColores = function () {
    const col = C.colores || {};
    const map = {
      negro: "--negro", blanco: "--blanco", azul: "--azul", celeste: "--celeste",
      amarillo: "--amarillo", rojo: "--rojo", gris: "--gris"
    };
    for (const k in map) if (col[k]) document.documentElement.style.setProperty(map[k], col[k]);
  };

  /* ---- Bloque de marca (logo o nombre del programa) ---- */
  T.marca = function (el, etiqueta) {
    const p = C.programa || {};
    el.innerHTML = "";
    if (p.logo) {
      const img = document.createElement("img");
      img.className = "marca-logo";
      img.src = p.logo;
      img.alt = "";
      img.onerror = () => { img.remove(); };
      el.appendChild(img);
    } else if (p.nombre) {
      const n = document.createElement("div");
      n.className = "marca-nombre";
      n.textContent = p.nombre;
      el.appendChild(n);
    }
    if (etiqueta) {
      const e = document.createElement("div");
      e.className = "marca-etiqueta";
      e.textContent = etiqueta;
      el.appendChild(e);
    }
  };

  /* ---- Red ---- */
  T.fetchJSON = async function (url, ms = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  };
  T.fetchText = async function (url, ms = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.text();
    } finally { clearTimeout(t); }
  };
  T.esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---- Almacenamiento local (sobrevive a reinicios de OBS) ---- */
  T.leer = function (k, def) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  };
  T.guardar = function (k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  };

  /* ---- Google Sheets ---- */
  T.urlHoja = function (hoja) {
    const link = (C.googleSheet || "").trim();
    if (!link) return null;
    const m = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const id = m ? m[1] : link;
    return "https://docs.google.com/spreadsheets/d/" + id +
      "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(hoja) + "&_=" + Date.now();
  };

  T.parseCSV = function (txt) {
    const filas = [];
    let fila = [], campo = "", comillas = false;
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      if (comillas) {
        if (c === '"') {
          if (txt[i + 1] === '"') { campo += '"'; i++; } else comillas = false;
        } else campo += c;
      } else if (c === '"') comillas = true;
      else if (c === ",") { fila.push(campo); campo = ""; }
      else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
      else if (c !== "\r") campo += c;
    }
    if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
    if (!filas.length) return [];
    const norm = (s) => s.trim().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");
    const cab = filas[0].map(norm);
    return filas.slice(1)
      .filter((f) => f.some((x) => x.trim() !== ""))
      .map((f) => { const o = {}; cab.forEach((h, i) => (o[h] = (f[i] || "").trim())); return o; });
  };

  T.leerHoja = async function (hoja) {
    const url = T.urlHoja(hoja);
    if (!url) return null;
    return T.parseCSV(await T.fetchText(url));
  };

  /* Links de imágenes de Google Drive → link directo que se puede mostrar */
  T.urlImagen = function (u) {
    if (!u) return "";
    u = u.trim();
    const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([a-zA-Z0-9-_]+)/);
    if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1600";
    return u;
  };

  T.esSi = (v) => {
    const s = String(v || "").trim().toLowerCase();
    return s === "" || ["si", "sí", "s", "x", "1", "true", "verdadero", "yes"].includes(s);
  };

  /* ---- Fechas ---- */
  T.hora = function (iso) {
    try {
      return new Intl.DateTimeFormat("es-UY", {
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: C.zonaHoraria || undefined
      }).format(new Date(iso));
    } catch (e) { return ""; }
  };
  T.diaCorto = function (iso) {
    try {
      const f = (d) => new Intl.DateTimeFormat("es-UY", {
        year: "numeric", month: "2-digit", day: "2-digit", timeZone: C.zonaHoraria || undefined
      }).format(d);
      const hoy = f(new Date()), man = f(new Date(Date.now() + 864e5)), d = f(new Date(iso));
      if (d === hoy) return "";
      if (d === man) return "Mañana";
      const parte = (o) => new Intl.DateTimeFormat("es-UY", Object.assign({ timeZone: C.zonaHoraria || undefined }, o)).format(new Date(iso));
      return parte({ weekday: "short" }).replace(".", "") + " " + parte({ day: "numeric" });
    } catch (e) { return ""; }
  };

  T.el = function (tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  };
  T.img = function (src, cls) {
    const i = document.createElement("img");
    i.className = cls || "";
    i.alt = "";
    i.decoding = "async";
    if (src) i.src = src; else i.style.visibility = "hidden";
    i.onerror = () => { i.style.visibility = "hidden"; };
    return i;
  };

  /* =================================================================
     Scroller: cinta continua que pide "segmentos" a medida que hay
     espacio. Cada segmento se arma con los datos más recientes, y los
     que ya están en pantalla se actualizan en el lugar (sin saltos).
     ================================================================= */
  T.Scroller = class {
    constructor(viewport, proximoSegmento) {
      this.vp = viewport;
      this.track = T.el("div", "track");
      this.vp.appendChild(this.track);
      this.proximo = proximoSegmento;
      this.x = 0;
      this.vel = parseFloat(params.get("velocidad")) || C.velocidad || 90;
      this.ultimo = null;
      this.pausa = false;
      requestAnimationFrame((t) => this.loop(t));
    }
    rellenar() {
      const ancho = this.vp.clientWidth;
      let guard = 0;
      while (this.x + this.track.scrollWidth < ancho * 2 && guard++ < 30) {
        const seg = this.proximo();
        if (!seg) break;
        this.track.appendChild(seg);
      }
    }
    loop(t) {
      if (this.ultimo != null && !this.pausa) {
        const dt = Math.min(0.1, (t - this.ultimo) / 1000);
        // la velocidad está pensada para una franja de 100 px de alto; si la fuente es más alta, se escala
        this.x -= this.vel * dt * T.unidad;
      }
      this.ultimo = t;
      const primero = this.track.firstElementChild;
      if (primero && this.x + primero.offsetWidth < 0) {
        this.x += primero.offsetWidth;
        primero.remove();
      }
      this.rellenar();
      this.track.style.transform = "translate3d(" + this.x.toFixed(2) + "px,0,0)";
      requestAnimationFrame((tt) => this.loop(tt));
    }
    elementos(selector) { return this.track.querySelectorAll(selector); }
  };

  /* Tamaño: la franja mide config.altoFranja px en una fuente de 1920 de ancho
     (100 si no se indica), salvo que la fuente sea más baja que eso. */
  T.unidad = 1;
  function medir() {
    const escala = (C.altoFranja || 100) / 100;
    const alto = Math.min(window.innerHeight, window.innerWidth / 19.2 * escala);
    T.unidad = alto / 100;
    document.documentElement.style.setProperty("--u", T.unidad + "px");
  }
  medir();
  window.addEventListener("resize", medir);

  T.aplicarColores();
})();
