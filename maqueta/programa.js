  /* ==============================================================
     4) PROGRAMA POR DÍA Y TABLAS DE POSICIONES
     (config.js → programa, tablas)
     ============================================================== */
  const CT = C.tablas || {};
  const BRASIL = ["bra.1", "bra.copa_do_brazil", "bra.camp.paulista", "bra.camp.carioca", "bra.camp.mineiro", "bra.camp.gaucho"];
  const EUROPA = ["eng.1", "esp.1", "ita.1"];
  const COPAS = ["conmebol.libertadores", "conmebol.sudamericana", "uefa.champions", "uefa.europa", "uefa.europa.conf"];
  const NOMBRES = {
    "uru.1": "Liga AUF Uruguaya", "arg.1": "Liga Profesional Argentina", "bra.1": "Brasileirão", "bra.copa_do_brazil": "Copa do Brasil",
    "bra.camp.paulista": "Paulistão", "bra.camp.carioca": "Carioca", "bra.camp.mineiro": "Mineiro", "bra.camp.gaucho": "Gaúcho",
    "eng.1": "Premier League", "esp.1": "LaLiga", "ita.1": "Serie A",
    "conmebol.libertadores": "Copa Libertadores", "conmebol.sudamericana": "Copa Sudamericana",
    "uefa.champions": "Champions League", "uefa.europa": "Europa League", "uefa.europa.conf": "Conference League"
  };
  const LIGAS_PROGRAMA = new Set(C.programa ? ["uru.1", "arg.1", ...BRASIL, ...EUROPA, ...COPAS] : []);
  const VENTANA = { atras: 8, adelante: 10 };          // días hacia atrás y adelante para armar "la fecha"
  const TABLAS_ESPN = ["uru.1", "arg.1", "bra.1", ...EUROPA, ...COPAS];
  const tablas = {};                                     // liga -> { t, grupos: [{ nombre, filas }] }
  let tablasHoja = {};                                   // "anual" | "promedios" | "segunda" -> filas

  const num = (v) => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isNaN(n) ? null : n; };
  const normEq = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w && !["club", "atletico", "fc", "ca", "cd", "sad", "de", "del", "la", "el", "sc", "ac"].includes(w)).join(" ");
  function mismoEquipo(a, b) {
    const x = normEq(a), y = normEq(b);
    if (!x || !y) return false;
    return x === y || (x.length >= 4 && y.includes(x)) || (y.length >= 4 && x.includes(y));
  }

  // Busca un equipo en una lista: primero por nombre exacto; si no, por parecido solo si hay uno solo
  function buscarEquipo(lista, id, ...nombres) {
    if (id) { const x = lista.find((f) => f.id && f.id === String(id)); if (x) return x; }
    const ns = nombres.map(normEq).filter(Boolean);
    const exacto = lista.find((f) => ns.includes(normEq(f.nombre)) || ns.includes(normEq(f.completo)));
    if (exacto) return exacto;
    const parecidos = lista.filter((f) => nombres.some((n) => mismoEquipo(f.nombre, n) || mismoEquipo(f.completo, n)));
    return parecidos.length === 1 ? parecidos[0] : null;
  }

  async function cargarTablas() {
    if (T.demo || !C.programa) return;
    for (const liga of TABLAS_ESPN) {
      if (tablas[liga] && Date.now() - tablas[liga].t < 10 * 60e3) continue;
      try {
        const j = await T.fetchJSON("https://site.api.espn.com/apis/v2/sports/soccer/" + liga + "/standings");
        const grupos = (j.children || []).map((c) => ({
          nombre: c.name || c.abbreviation || "",
          filas: (((c.standings || {}).entries) || []).map((x) => {
            const st = {};
            (x.stats || []).forEach((s) => { st[s.abbreviation || s.name] = s.value != null ? s.value : num(s.displayValue); });
            const t = x.team || {};
            return { id: String(t.id || ""), nombre: (t.shortDisplayName || t.displayName || "").trim(), completo: t.displayName || "",
                     logo: (t.logos && t.logos[0] && t.logos[0].href) || "", pos: st.R || st.rank || 0, pj: st.GP || 0, pts: st.P || 0, dg: st.GD || 0 };
          }).sort((a, b) => a.pos - b.pos)
        })).filter((g) => g.filas.length);
        tablas[liga] = { t: Date.now(), grupos };
      } catch (e) { /* se reintenta en la próxima vuelta */ }
      await T.esperar(150);
    }
  }

  // Pestaña "tablas_uruguay": tabla | pos | equipo | pj | pts | dg | promedio | zona
  async function cargarTablasHoja() {
    if (T.demo || !C.programa) return;
    try {
      const filas = await T.leerHoja(CT.hoja || "tablas_uruguay");
      if (!filas || !filas.length || !("tabla" in filas[0])) return;
      const nuevo = {};
      filas.forEach((f) => {
        const k = normEq(f.tabla).replace(/ /g, "");
        const clave = /prom|desc/.test(k) ? "promedios" : /anual/.test(k) ? "anual" : /segunda/.test(k) ? "segunda" : k;
        if (!clave) return;
        (nuevo[clave] = nuevo[clave] || []).push({
          id: "", nombre: f.equipo || "", pos: num(f.pos) || 0, pj: num(f.pj) || 0, pts: num(f.pts) || 0, dg: num(f.dg) || 0,
          promedio: num(f.promedio), zona: normEq(f.zona), logo: T.urlImagen(f.logo || "")
        });
      });
      Object.values(nuevo).forEach((l) => l.sort((a, b) => a.pos - b.pos));
      tablasHoja = nuevo;
    } catch (e) { console.warn("No se pudo leer la pestaña de tablas", e.message); }
  }

  /* Partidos en vivo → tabla provisoria (suma los puntos del resultado parcial) */
  function enVivoDe(ligas) {
    const out = [];
    ligas.forEach((l) => ((datos[l] || {}).todos || []).forEach((p) => { if (p.estado === "in") out.push(p); }));
    return out;
  }
  function vivosManuales(nombre) {
    const m = manuales[nombre];
    return m ? m.partidos.filter((p) => p.estado === "in") : [];
  }
  function tablaEnVivo(filas, vivos, porPromedio) {
    const out = filas.map((f) => Object.assign({}, f, { vivo: false }));
    if (!vivos.length) return out;
    const busca = (e) => buscarEquipo(out, e.id, e.nombre, e.completo);
    let cambio = false;
    vivos.forEach((p) => {
      const gl = num(p.local.goles) || 0, gv = num(p.visita.goles) || 0;
      [[p.local, gl, gv], [p.visita, gv, gl]].forEach(([e, a, b]) => {
        const f = busca(e);
        if (!f) return;
        f.pj = (f.pj || 0) + 1; f.pts = (f.pts || 0) + (a > b ? 3 : a === b ? 1 : 0); f.dg = (f.dg || 0) + a - b; f.vivo = true; cambio = true;
        if (porPromedio && f.pj) f.promedio = f.pts / f.pj;
      });
    });
    if (cambio) {
      // los equipos que no juegan conservan el orden oficial entre sí (desempates)
      const oficial = new Map(out.map((f, i) => [f, i]));
      out.sort(porPromedio ? (a, b) => (b.promedio || 0) - (a.promedio || 0) || oficial.get(a) - oficial.get(b)
                           : (a, b) => b.pts - a.pts || b.dg - a.dg || oficial.get(a) - oficial.get(b));
      out.forEach((f, i) => (f.pos = i + 1));
    }
    return out;
  }

  // Filas de la planilla: toman el logo (y el id) del equipo en la tabla de la fuente
  function conLogos(lista, ref) {
    return lista.map((f) => {
      const x = buscarEquipo(ref || [], null, f.nombre);
      return x ? Object.assign({}, f, { logo: f.logo || x.logo, id: f.id || x.id }) : f;
    });
  }

  /* --- Fechas: días seguidos con partidos (con hasta un día libre en el medio) --- */
  function fechasDe(ps) {
    const dias = [...new Set(ps.map((p) => p.dia))].sort((a, b) => a - b);
    const grupos = [];
    dias.forEach((d, i) => { if (!i || d - dias[i - 1] > 2) grupos.push([]); grupos[grupos.length - 1].push(d); });
    return grupos.map((g) => ps.filter((p) => g.includes(p.dia)));
  }
  const esHoy = (g) => g.some((p) => p.dia === 0) || (g[0].dia < 0 && g[g.length - 1].dia > 0);
  function partidosDe(liga, que) {
    const ps = ((datos[liga] || {}).todos) || [];
    const vivos = ps.filter((p) => p.estado === "in");
    const fs = fechasDe(ps);
    const actual = fs.find(esHoy);
    const jugadas = fs.filter((g) => g.some((p) => p.estado === "post"));
    const ultima = actual && actual.some((p) => p.estado === "post") ? actual : jugadas.filter((g) => g[0].dia <= 0).pop();
    const proxima = fs.find((g) => g.some((p) => p.estado === "pre" && p.dia >= 0));
    let lista = [];
    if (que === "vivo") lista = vivos;
    else if (que === "jugados") lista = (ultima || []).filter((p) => p.estado === "post");
    else if (que === "resultados") lista = vivos.concat((ultima || []).filter((p) => p.estado === "post"));
    else if (que === "fixture") lista = vivos.concat((proxima || []).filter((p) => p.estado === "pre"));
    else if (que === "fecha") {
      const base = actual || [];
      lista = vivos.concat(base.filter((p) => p.estado !== "in"));
      if (!actual) lista = lista.concat((ultima || []).filter((p) => p.estado === "post"), (proxima || []).filter((p) => p.estado === "pre"));
    } else if (que === "copa") {
      // la fecha de copa en curso; si no hay, la última (hasta 3 días) y la próxima (hasta 7 días)
      if (actual) lista = actual.slice();
      else {
        if (ultima && ultima[ultima.length - 1].dia >= -3) lista = lista.concat(ultima);
        if (proxima && proxima[0].dia <= 7) lista = lista.concat(proxima);
      }
    }
    const vistos = new Set();
    return lista.filter((p) => !vistos.has(p.id) && vistos.add(p.id)).sort(ordenar);
  }

  /* --- Piezas de la cinta --- */
  const fmtNum = (n) => (n > 0 ? "+" : "") + n;
  const fmtProm = (n) => (n == null ? "" : n.toFixed(3).replace(".", ","));
  function cartel(titulo, sub, logo, color) { return { tipo: "cartel", titulo, sub, logo, color }; }
  function filas(lista, opc) { return lista.map((f) => ({ tipo: "fila", f, opc: opc || {} })); }
  function piezasPartidos(liga, nombre, logo, ps, mini) {
    if (!ps.length) return [];
    return [{ tipo: "cab", nombre, logo }].concat(ps.map((p) => ({ tipo: "partido", liga, p, mini: mini ? mini(p) : "" })));
  }
  const logoLiga = (l) => (datos[l] || {}).logo || "";
  const titulo = (g) => String(g || "").replace(/\s*\d{4}(-\d{2,4})?\s*/g, " ").trim();
  const zonaEsp = { "Group A": "Zona A", "Group B": "Zona B" };

  function textoSerie(p) {
    const s = p.serie;
    if (!s) return "";
    const ronda = { Final: "Final", Semifinals: "Semifinal", Quarterfinals: "Cuartos", "Round of 16": "Octavos", Playoffs: "Playoff", "Knockout Round Playoffs": "Playoff" }[s.titulo] || s.titulo;
    if (!s.vuelta) return ronda + (s.total > 1 ? " · Ida" : "");
    const g = s.aggLocal != null && s.aggVisita != null ? " · Global " + s.aggLocal + "-" + s.aggVisita : "";
    return ronda + " · Vuelta" + g;
  }

  // Bloques del día: cada uno devuelve la lista de piezas (vacía = se saltea)
  const BLOQUES = {
    "uru-vivo": () => piezasPartidos("uru.1", NOMBRES["uru.1"] + " · En vivo", logoLiga("uru.1"), partidosDe("uru.1", "vivo")),
    "uru-jugados": () => piezasPartidos("uru.1", NOMBRES["uru.1"] + " · Resultados", logoLiga("uru.1"), partidosDe("uru.1", "jugados")),
    "uru-fecha": () => piezasPartidos("uru.1", NOMBRES["uru.1"], logoLiga("uru.1"), partidosDe("uru.1", "fecha").filter((p) => p.estado !== "in")),
    "uru-fixture": () => piezasPartidos("uru.1", NOMBRES["uru.1"] + " · Próxima fecha", logoLiga("uru.1"), partidosDe("uru.1", "fixture").filter((p) => p.estado === "pre")),
    "uru-tablas": () => {
      const out = [], logo = logoLiga("uru.1"), vivos = enVivoDe(["uru.1"]);
      const g = ((tablas["uru.1"] || {}).grupos || [])[0];
      if (g) {
        const t = tablaEnVivo(g.filas, vivos);
        out.push(cartel(titulo(g.nombre) || "Torneo", t.some((f) => f.vivo) ? "Tabla en vivo" : "Posiciones", logo));
        out.push(...filas(t, { zona: (f) => (f.pos === 1 ? "lider" : "") }));
      }
      const an = tablasHoja.anual;
      if (an && an.length) {
        const cupos = an.filter((f) => /copa|libertadores|sudamericana/.test(f.zona)).length;
        const t = tablaEnVivo(conLogos(an, g && g.filas), vivos).slice(0, CT.anualMostrar || 8);
        out.push(cartel("Tabla Anual", (t.some((f) => f.vivo) ? "En vivo · " : "") + "Cupos a copas", logo));
        out.push(...filas(t, { dg: false, zona: (f) => (f.pos <= cupos ? "copa" : "") }));
      }
      const pr = tablasHoja.promedios;
      if (pr && pr.length) {
        const baja = pr.filter((f) => /desc/.test(f.zona)).length || 3;
        const t = tablaEnVivo(conLogos(pr, g && g.filas), vivos, true), n = t.length;
        out.push(cartel("Descenso", (t.some((f) => f.vivo) ? "En vivo · " : "") + "Promedios", logo, "azul"));
        out.push(...filas(t.slice(-(CT.promediosMostrar || 6)), { promedio: true, zona: (f) => (f.pos > n - baja ? "desc" : "") }));
      }
      return out;
    },
    "exterior": () => {
      const ocultas = new Set(diaPrograma().some((b) => /^copas/.test(b)) ? COPAS : []);
      const items = [];
      Object.keys(datos).forEach((l) => {
        if (/^uru\./.test(l) || ocultas.has(l)) return;
        const d = datos[l];
        const nombre = (comps.find((c) => c.liga === l) || extra.find((c) => c.liga === l) || {}).nombre || NOMBRES[l] || d.nombre || l;
        d.partidos.filter((p) => p.deporte === "soccer" && tieneUru(p)).forEach((p) => items.push({ liga: l, mini: nombre, p }));
      });
      if (!items.length) return [];
      items.sort((a, b) => ordenar(a.p, b.p));
      return [{ tipo: "cab", nombre: (C.exterior && C.exterior.titulo) || "Uruguayos en el exterior", logo: BANDERA_URU, clase: "uru-cab" }]
        .concat(items.map((it) => ({ tipo: "partido", liga: it.liga, p: it.p, mini: it.mini })));
    },
    "segunda-resultados": () => {
      const m = manuales[segundaNombre()];
      return m ? piezasPartidos("M:segunda", segundaNombre(), m.logo, m.partidos.filter((p) => p.estado !== "pre")) : [];
    },
    "segunda-fixture": () => {
      const m = manuales[segundaNombre()];
      return m ? piezasPartidos("M:segunda", segundaNombre() + " · Próxima fecha", m.logo, m.partidos.filter((p) => p.estado !== "post")) : [];
    },
    "segunda-tabla": () => {
      const s = tablasHoja.segunda;
      if (!s || !s.length) return [];
      const t = tablaEnVivo(s, vivosManuales(segundaNombre()));
      const asc = s.filter((f) => /asc/.test(f.zona)).length;
      return [cartel(segundaNombre(), t.some((f) => f.vivo) ? "Tabla en vivo" : "Posiciones", (manuales[segundaNombre()] || {}).logo || "")]
        .concat(filas(t, { zona: (f) => (f.pos === 1 ? "lider" : f.pos <= asc ? "copa" : "") }));
    },
    "planilla": () => {
      const out = [];
      Object.keys(manuales).forEach((n) => { if (n !== segundaNombre()) out.push(...piezasPartidos("M:" + n, n, manuales[n].logo, manuales[n].partidos)); });
      return out;
    },
    "copas": () => {
      const out = [];
      COPAS.forEach((l) => {
        const ps = partidosDe(l, "copa");
        out.push(...piezasPartidos(l, NOMBRES[l], logoLiga(l), ps, textoSerie));
        if (!ps.length || ps.some((p) => p.serie)) return;      // eliminación directa: sin tabla
        const gs = (tablas[l] || {}).grupos || [];
        const vivos = enVivoDe([l]);
        const conUru = (f) => esClubUruguayo(f.id) || !!uruDeEquipo(f.id);
        gs.forEach((g) => {
          let t = tablaEnVivo(g.filas, vivos);
          if (gs.length === 1 && t.length > 12) t = t.filter((f) => f.pos <= (CT.copasMostrar || 8) || conUru(f));   // fase de liga
          else if (!t.some(conUru)) return;                                                                         // grupos: solo los que tienen uruguayos
          out.push(cartel(NOMBRES[l] + (gs.length > 1 ? " · " + (zonaEsp[g.nombre] || g.nombre).replace("Group", "Grupo") : ""), "Posiciones", logoLiga(l)));
          out.push(...filas(t, { uru: true, zona: (f) => (gs.length === 1 ? (f.pos <= 8 ? "copa" : f.pos <= 24 ? "copa2" : "") : (f.pos <= 2 ? "copa" : "")) }));
        });
      });
      return out;
    },
    "arg-vivo": () => piezasPartidos("arg.1", NOMBRES["arg.1"] + " · En vivo", logoLiga("arg.1"), partidosDe("arg.1", "vivo")),
    "arg-jugados": () => piezasPartidos("arg.1", NOMBRES["arg.1"] + " · Resultados", logoLiga("arg.1"), partidosDe("arg.1", "jugados")),
    "arg-fixture": () => piezasPartidos("arg.1", NOMBRES["arg.1"] + " · Próxima fecha", logoLiga("arg.1"), partidosDe("arg.1", "fixture").filter((p) => p.estado === "pre")),
    "arg-tabla": () => {
      const out = [], gs = (tablas["arg.1"] || {}).grupos || [], vivos = enVivoDe(["arg.1"]), n = CT.argentinaMostrar || 8;
      gs.forEach((g) => {
        const t = tablaEnVivo(g.filas, vivos);
        out.push(cartel("Liga Profesional" + (gs.length > 1 ? " · " + (zonaEsp[g.nombre] || g.nombre) : ""), (t.some((f) => f.vivo) ? "En vivo · " : "") + "Clasifican " + n, logoLiga("arg.1")));
        out.push(...filas(t.slice(0, n), { uru: true, zona: () => "copa" }));
      });
      return out;
    },
    "bra-resultados": () => BRASIL.flatMap((l) => piezasPartidos(l, NOMBRES[l], logoLiga(l), partidosDe(l, "resultados"))),
    "bra-fixture": () => BRASIL.flatMap((l) => piezasPartidos(l, NOMBRES[l] + " · Próxima fecha", logoLiga(l), partidosDe(l, "fixture"))),
    "bra-tabla": () => {
      const g = ((tablas["bra.1"] || {}).grupos || [])[0];
      if (!g) return [];
      const t = tablaEnVivo(g.filas, enVivoDe(["bra.1"])), arriba = CT.brasilArriba || 8, abajo = CT.brasilAbajo || 4;
      const sel = t.filter((f) => f.pos <= arriba || f.pos > t.length - abajo);
      return [cartel("Brasileirão", (t.some((f) => f.vivo) ? "En vivo · " : "") + "Arriba y abajo", logoLiga("bra.1"))]
        .concat(filas(sel, { uru: true, zona: (f) => (f.pos <= 6 ? "copa" : f.pos > t.length - 4 ? "desc" : "") }));
    },
    "europa-resultados": () => EUROPA.flatMap((l) => piezasPartidos(l, NOMBRES[l], logoLiga(l), partidosDe(l, "resultados")).concat(tablaEuropa(l))),
    "europa-fixture": () => EUROPA.flatMap((l) => piezasPartidos(l, NOMBRES[l] + " · Próxima fecha", logoLiga(l), partidosDe(l, "fixture")).concat(tablaEuropa(l)))
  };
  function tablaEuropa(l) {
    const g = ((tablas[l] || {}).grupos || [])[0];
    if (!g) return [];
    const n = CT.europaMostrar || 6, t = tablaEnVivo(g.filas, enVivoDe([l])).slice(0, n);
    return [cartel(NOMBRES[l], (t.some((f) => f.vivo) ? "En vivo · " : "") + "Primeros " + n, logoLiga(l))]
      .concat(filas(t, { uru: true, zona: (f) => (f.pos <= 4 ? "copa" : "copa2") }));
  }
  function segundaNombre() {
    return Object.keys(manuales).find((n) => /segunda/i.test(n)) || "Segunda División";
  }

  const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const fmtDiaSemana = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: C.zonaHoraria || undefined });
  function diaPrograma() {
    const d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(fmtDiaSemana.format(new Date()));
    const P = C.programa || {};
    return P[DIAS[d]] || P[DIAS[d].replace("miercoles", "miércoles").replace("sabado", "sábado")] || P.lunes || [];
  }

  /* --- Armado de cada segmento --- */
  function filaTabla(f, opc) {
    const el = T.el("div", "t-fila" + (f.vivo ? " vivo" : ""));
    el.appendChild(T.el("div", "t-pos " + ((opc.zona && opc.zona(f)) || ""), String(f.pos)));
    const eq = T.el("div", "t-eq");
    if (f.logo) eq.appendChild(T.img(f.logo));
    const txt = T.el("div");
    txt.appendChild(T.el("div", "t-nom", f.nombre));
    const jug = opc.uru && f.id && !esClubUruguayo(f.id) ? uruDeEquipo(f.id) : null;
    if (jug && jug.length) {
      const u = T.el("span", "t-uy");
      u.appendChild(T.img(BANDERA_URU));
      u.appendChild(document.createTextNode(jug.slice(0, 2).map((n) => n.split(" ").slice(-1)[0]).join(", ")));
      txt.appendChild(u);
    }
    eq.appendChild(txt);
    el.appendChild(eq);
    const pts = T.el("div", "t-pts");
    if (opc.promedio) {
      pts.appendChild(T.el("b", null, fmtProm(f.promedio)));
      pts.appendChild(T.el("span", null, f.vivo ? "En vivo" : (f.pts ? f.pts + " pts · " + f.pj + " PJ" : "Promedio")));
    } else {
      pts.appendChild(T.el("b", null, String(f.pts)));
      pts.appendChild(T.el("span", null, f.vivo ? "En vivo" : "PJ " + f.pj + (opc.dg === false ? "" : " · DG " + fmtNum(f.dg))));
    }
    el.appendChild(pts);
    return el;
  }
  function piezaDOM(x) {
    if (x.tipo === "cab") return cabecera(x.nombre, x.logo, x.clase);
    if (x.tipo === "partido") return crearPartido(x.liga, x.p, x.mini ? { ligaMini: x.mini } : null);
    if (x.tipo === "fila") return filaTabla(x.f, x.opc);
    const c = T.el("div", "t-cartel" + (x.color === "azul" ? " azul" : ""));
    if (x.logo) c.appendChild(T.img(x.logo));
    c.appendChild(T.el("span", "t-tit", x.titulo));
    if (x.sub) c.appendChild(T.el("span", "t-sub", x.sub));
    return c;
  }

  let posPrograma = -1, desdeVivo = 0;
  function segmentoPrograma() {
    const seg = T.el("div", "seg");
    const lista = diaPrograma();
    let piezas = [], k = "";
    // si hay un partido uruguayo en vivo, vuelve cada N bloques
    if (lista.includes("uru-vivo") && desdeVivo >= (C.vivoUruguayoCada || 3) && partidosDe("uru.1", "vivo").length) {
      piezas = BLOQUES["uru-vivo"](); k = "uru-vivo";
    }
    for (let i = 0; !piezas.length && i < lista.length; i++) {
      posPrograma = (posPrograma + 1) % lista.length;
      k = lista[posPrograma];
      try { piezas = (BLOQUES[k] || (() => []))(); } catch (e) { console.warn("Bloque " + k, e); piezas = []; }
    }
    if (!piezas.length) {
      seg.classList.add("esperando");
      seg.appendChild(T.el("div", "vacio aviso", textoAviso()));
      return seg;
    }
    desdeVivo = k === "uru-vivo" ? 0 : desdeVivo + 1;
    seg.dataset.bloque = k;
    piezas.forEach((x) => seg.appendChild(piezaDOM(x)));
    return seg;
  }
