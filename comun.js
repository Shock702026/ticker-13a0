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

  /* ---- Pestaña "ajustes" de la planilla: pisa los valores de config.js ----
     Columnas: ajuste | valor | explicacion. Se reconoce el ajuste por su nombre.
     Si un valor está vacío o no es un número válido, queda el de config.js. */
  const AJUSTES = [
    ["alto de la franja", ["altoFranja"], 40, 140],
    ["velocidad de la cinta", ["velocidad"], 20, 400],
    ["segundos por noticia", ["tanda", "segundosPorNoticia"], 5, 120],
    ["segundos por resultado destacado", ["tanda", "segundosPorResultado"], 3, 60],
    ["repetir uruguayo en vivo cada", ["vivoUruguayoCada"], 1, 20],
    ["tabla anual: primeros", ["tablas", "anualMostrar"], 1, 16],
    ["descenso: ultimos", ["tablas", "promediosMostrar"], 1, 16],
    ["argentina: primeros por zona", ["tablas", "argentinaMostrar"], 1, 30],
    ["brasil: primeros", ["tablas", "brasilArriba"], 0, 20],
    ["brasil: ultimos", ["tablas", "brasilAbajo"], 0, 20],
    ["europa: primeros", ["tablas", "europaMostrar"], 1, 20],
    ["copas fase de liga: primeros", ["tablas", "copasMostrar"], 1, 36]
  ];
  const sinTildes = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  T.ajustesHoja = {};
  T.cargarAjustes = async function () {
    if (T.demo) return false;
    let filas;
    try { filas = await T.leerHoja("ajustes"); } catch (e) { return false; }
    if (!filas || !filas.length || !("ajuste" in filas[0])) return false;
    let cambio = false;
    filas.forEach((f) => {
      const nombre = sinTildes(f.ajuste);
      const def = AJUSTES.find((a) => nombre.startsWith(a[0]));
      const v = parseFloat(String(f.valor || "").replace(",", "."));
      if (!def || isNaN(v) || v < def[2] || v > def[3]) return;
      const ruta = def[1];
      let obj = C;
      for (let i = 0; i < ruta.length - 1; i++) obj = obj[ruta[i]] = obj[ruta[i]] || {};
      const k = ruta[ruta.length - 1];
      if (obj[k] !== v) { obj[k] = v; cambio = true; }
      T.ajustesHoja[ruta.join(".")] = v;
    });
    if (cambio && T.medir) T.medir();
    return cambio;
  };

  /* ---- Escudos propios: carpeta escudos/ (índice en escudos.js) + pestaña "escudos" ----
     Prioridad: pestaña "escudos" de la planilla > archivo propio > imagen original de la fuente. */
  const ESC = window.ESCUDOS || { equipos: {}, nombres: {}, ligas: {} };
  const slugEsc = (s) => sinTildes(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  T.respaldo = {};        // escudo propio -> imagen original (por si el archivo no está)
  T.escudosHoja = {};     // nombre -> imagen cargada en la planilla
  T.escudo = function (id, nombres, original) {
    const ns = [].concat(nombres || []).filter(Boolean);
    for (const n of ns) { const h = T.escudosHoja[slugEsc(n)]; if (h) return h; }
    // NBA: "nba:<id>" (los números de equipo de la NBA se repiten con los de fútbol)
    const nba = /^nba:(\d+)$/.exec(String(id || ""));
    let p = nba ? (ESC.nba || {})[nba[1]] || null : (id && ESC.equipos[String(id)]) || null;
    // básquetbol: "basquet:Nombre" busca primero en los escudos de la LUB
    if (!p) for (const n of ns) if (/^basquet:/.test(n)) { p = (ESC.basquet || {})[slugEsc(n.slice(8))]; if (p) break; }
    if (!p && !id) for (const n of ns) { p = ESC.nombres[slugEsc(n.replace(/^basquet:/, ""))]; if (p) break; }
    if (p) { if (original) T.respaldo[p] = original; return p; }
    return original || "";
  };
  T.escudoLiga = function (liga, original, nombre) {
    const h = (nombre && T.escudosHoja[slugEsc(nombre)]) || T.escudosHoja[slugEsc(liga)];
    if (h) return h;
    const p = ESC.ligas[liga] || (nombre && (ESC.competencias || {})[slugEsc(nombre)]);
    if (p) { if (original) T.respaldo[p] = original; return p; }
    return original || "";
  };
  // Pestaña "escudos": equipo | liga | escudo | otros_nombres
  // escudo = link de Drive, link a una imagen, o el nombre de un archivo de la carpeta escudos
  T.cargarEscudosHoja = async function () {
    if (T.demo) return;
    let filas;
    try { filas = await T.leerHoja("escudos"); } catch (e) { return; }
    if (!filas || !filas.length || !("equipo" in filas[0])) return;
    const nuevo = {};
    filas.forEach((f) => {
      let src = (f.escudo || "").trim();
      if (!src) return;
      if (!/^(https?:|data:|escudos\/)/.test(src)) src = "escudos/" + src;
      src = T.urlImagen(src);
      [f.equipo].concat(String(f.otros_nombres || "").split(/[,;]/)).map((x) => x.trim()).filter(Boolean)
        .forEach((n) => (nuevo[slugEsc(n)] = src));
    });
    T.escudosHoja = nuevo;
  };

  /* ---- Pestaña "correcciones": pisar datos que vienen automáticos ----
     tipo | equipo_o_local | visitante | valor | nota
     tipos: ocultar partido · cambiar nombre · corregir marcador · agregar uruguayos · quitar uruguayos ·
            lesionado (valor = jugadores, nota = motivo) · no lesionado (saca la marca de lesión) */
  T.correcciones = { ocultar: [], nombres: {}, marcador: [], agregar: {}, quitar: {}, lesion: [], sano: [] };
  // mismo equipo o jugador: igual nombre, sin tildes ni palabras de relleno ("Cerro" no es "Cerro Largo")
  const limpio = (s) => slugEsc(s).split("-").filter((w) => w && !["club", "ca", "cd", "fc", "cf", "sc", "sad", "de", "del", "la", "el", "atletico"].includes(w)).join("-");
  const mismo = (a, b) => { const x = limpio(a), y = limpio(b); return !!x && x === y; };
  T.mismoNombre = mismo;
  // jugadores: mismo nombre, o mismo apellido si uno de los dos se escribió solo con el apellido
  const mismoJug = (a, b) => { if (mismo(a, b)) return true; const x = slugEsc(a).split("-"), y = slugEsc(b).split("-"); return (x.length === 1 || y.length === 1) && x[x.length - 1] === y[y.length - 1]; };
  T.cargarCorrecciones = async function () {
    if (T.demo) return;
    let filas;
    try { filas = await T.leerHoja("correcciones"); } catch (e) { return; }
    if (!filas || !filas.length || !("tipo" in filas[0])) return;
    const c = { ocultar: [], nombres: {}, marcador: [], agregar: {}, quitar: {}, lesion: [], sano: [] };
    const lista = (s) => String(s || "").split(/[,;]/).map((x) => x.trim()).filter(Boolean);
    filas.forEach((f) => {
      const tipo = sinTildes(f.tipo), a = (f.equipo_o_local || "").trim(), b = (f.visitante || "").trim(), v = (f.valor || "").trim();
      if (!tipo || !a) return;
      if (tipo.startsWith("ocultar")) c.ocultar.push([a, b]);
      else if (tipo.startsWith("cambiar nombre") && v) c.nombres[slugEsc(a)] = v;
      else if (tipo.startsWith("corregir marcador")) {
        const m = v.match(/(\d+)\s*[-a]\s*(\d+)/);
        if (m && b) c.marcador.push({ a, b, gl: m[1], gv: m[2] });
      } else if (tipo.startsWith("agregar uruguayo")) (c.agregar[slugEsc(a)] = c.agregar[slugEsc(a)] || []).push(...lista(v));
      else if (tipo.startsWith("quitar uruguayo")) (c.quitar[slugEsc(a)] = c.quitar[slugEsc(a)] || []).push(...(lista(v).length ? lista(v) : ["*"]));
      else if (tipo.startsWith("no lesionado") || tipo.startsWith("quitar lesion")) lista(v).forEach((j) => c.sano.push(j));
      else if (tipo.startsWith("lesionado") || tipo.startsWith("suspendido")) lista(v).forEach((j) => c.lesion.push({ jugador: j, estado: tipo.startsWith("susp") ? "suspendido" : "lesionado", motivo: (f.nota || "").trim() }));
    });
    T.correcciones = c;
  };
  const delEquipo = (mapa, ...nombres) => { for (const k of Object.keys(mapa)) if (nombres.some((n) => mismo(k, n))) return mapa[k]; return null; };
  // nombre a mostrar (cambiar nombre)
  // nombre en pantalla: corrección de la planilla > nombre en español (nombres.js, por número de equipo o selección) > el de la fuente
  T.nombreVisible = function (nombre, completo, id) {
    const c = delEquipo(T.correcciones.nombres, nombre, completo);
    if (c) return c;
    const N = window.NOMBRES_ES || {}, ids = N.ids || {}, pa = N.paises || {};
    if (id != null && ids[String(id)]) return ids[String(id)];
    const k = (x) => String(x || "").trim().toLowerCase();
    return pa[k(completo)] || pa[k(nombre)] || String(nombre || "").trim();
  };
  // partidos: oculta y corrige marcadores
  T.corregirPartidos = function (lista) {
    const C2 = T.correcciones;
    if (!C2.ocultar.length && !C2.marcador.length) return lista;
    const es = (p, a, b) => (mismo(a, p.local.nombre) || mismo(a, p.local.completo)) && (!b || mismo(b, p.visita.nombre) || mismo(b, p.visita.completo));
    return lista.filter((p) => !C2.ocultar.some(([a, b]) => es(p, a, b) || (!b && (mismo(a, p.visita.nombre) || mismo(a, p.visita.completo)))))
      .map((p) => {
        const m = C2.marcador.find((x) => es(p, x.a, x.b));
        if (!m) return p;
        const q = Object.assign({}, p, { local: Object.assign({}, p.local, { goles: m.gl }), visita: Object.assign({}, p.visita, { goles: m.gv }) });
        if (q.estado === "post") { q.local.gano = +m.gl > +m.gv; q.visita.gano = +m.gv > +m.gl; }
        return q;
      });
  };
  // uruguayos de un equipo, con lo agregado o quitado en la planilla
  T.uruCorregidos = function (nombresEquipo, base) {
    const ns = [].concat(nombresEquipo || []).filter(Boolean);
    let out = (base || []).slice();
    const quitar = delEquipo(T.correcciones.quitar, ...ns);
    if (quitar) out = quitar.includes("*") ? [] : out.filter((j) => !quitar.some((q) => mismoJug(q, j)));
    const agregar = delEquipo(T.correcciones.agregar, ...ns);
    if (agregar) agregar.forEach((j) => { if (!out.some((x) => mismoJug(x, j))) out.push(j); });
    return out;
  };
  T.esUruAgregado = function (nombresEquipo, jugador) {
    const agregar = delEquipo(T.correcciones.agregar, ...[].concat(nombresEquipo || []).filter(Boolean));
    return !!agregar && agregar.some((j) => mismoJug(j, jugador));
  };

  /* ---- Pestaña "lesionados" (la carga la tarea diaria desde Flashscore) ----
     jugador | club | estado | motivo | fuente | actualizado   (estado: lesionado / suspendido / ausente) */
  T.lesionados = [];
  T.cargarLesionados = async function () {
    if (T.demo) return;
    let filas;
    try { filas = await T.leerHoja("lesionados"); } catch (e) { return; }
    if (!filas || !filas.length || !("jugador" in filas[0])) return;
    T.lesionados = filas.filter((f) => (f.jugador || "").trim())
      .map((f) => ({ jugador: f.jugador.trim(), estado: sinTildes(f.estado || "lesionado"), motivo: (f.motivo || "").trim() }));
  };
  // mismo jugador aunque el nombre venga escrito distinto ("Valverde Federico", "Federico Valverde",
  // "Fede Valverde"): todas las palabras del nombre más corto están en el otro, o coincide como en mismoJug
  T.mismoJugador = function (a, b) {
    if (mismoJug(a, b)) return true;
    const x = slugEsc(a).split("-").filter((w) => w.length > 1), y = slugEsc(b).split("-").filter((w) => w.length > 1);
    const [c, l] = x.length <= y.length ? [x, y] : [y, x];
    return c.length >= 2 && c.every((w) => l.includes(w));
  };
  // ¿está lesionado o suspendido? (lo de la pestaña correcciones manda sobre lo de "lesionados")
  T.ausencia = function (jugador) {
    const C2 = T.correcciones;
    if ((C2.sano || []).some((j) => T.mismoJugador(j, jugador))) return null;
    return (C2.lesion || []).find((x) => T.mismoJugador(x.jugador, jugador)) ||
      T.lesionados.find((x) => T.mismoJugador(x.jugador, jugador)) || null;
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
    // si el escudo propio no está, se usa la imagen original de la fuente
    i.onerror = () => {
      const r = src && T.respaldo && T.respaldo[src];
      if (r && i.src !== r) { i.src = r; return; }
      i.style.visibility = "hidden";
    };
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
  T.medir = medir;
  window.addEventListener("resize", medir);

  T.aplicarColores();
})();
