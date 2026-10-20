/* Datos de ejemplo. Se usan solo para probar:
   - ticker.html?demo → partidos inventados para ver el diseño
   - sin planilla configurada → noticias de ejemplo */
(function () {
  const svg = (c1, c2, txt) => "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/>' +
    '<stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
    '<rect width="320" height="200" fill="url(#g)"/>' +
    '<text x="160" y="118" text-anchor="middle" font-family="Arial" font-weight="700" font-size="54" fill="rgba(255,255,255,.85)">' + txt + '</text></svg>');

  const noticias = [
    { cat: "Ejemplo", tit: "Así se ven las noticias del ticker: cargalas en la **planilla de Google** y aparecen solas", img: svg("#1C6DD0", "#0B1220", "1") },
    { cat: "Deportes", tit: "Cada fila de la planilla es una noticia: categoría, titular y una imagen opcional", img: svg("#0E9F6E", "#0B1220", "2") },
    { cat: "Último momento", tit: "Para sacar una noticia del aire, poné NO en la columna “mostrar”", img: svg("#D03A1C", "#0B1220", "3") },
    { cat: "Programa", tit: "Las palabras entre **dos asteriscos** se destacan con el color del programa", img: "" }
  ];

  // Noticias de ejemplo para la pantalla de tanda (titular + dos párrafos + foto)
  const fotoCancha = (txt, c1, c2) => "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900"><defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset=".5" stop-color="#0b1a33"/><stop offset=".51" stop-color="' + c2 + '"/><stop offset="1" stop-color="#0f4d23"/></linearGradient></defs>' +
    '<rect width="900" height="900" fill="url(#c)"/><g fill="#fff" opacity=".85"><circle cx="160" cy="120" r="30"/><circle cx="740" cy="120" r="30"/></g>' +
    '<g stroke="#fff" stroke-width="6" fill="none" opacity=".55"><line x1="0" y1="560" x2="900" y2="560"/><line x1="450" y1="560" x2="450" y2="900"/><circle cx="450" cy="740" r="110"/></g>' +
    '<text x="450" y="380" text-anchor="middle" font-family="Arial" font-weight="700" font-size="52" fill="rgba(255,255,255,.6)">' + txt + '</text></svg>');
  const noticiasTanda = [
    { tit: "Así se ven las noticias en la tanda: **titular arriba**, foto de anclaje y dos párrafos",
      parrafos: ["Cada fila de la pestaña “noticias” de la planilla de Google es una noticia. El primer párrafo se muestra en negrita, como bajada.",
                 "El segundo párrafo desarrolla la información. Si un texto es largo, la letra se achica sola para que entre; lo ideal son dos o tres líneas por párrafo."],
      img: fotoCancha("FOTO DE LA NOTICIA", "#1d3b6e", "#1f7a3a"), credito: "13a0" },
    { tit: "Una noticia sin foto ocupa todo el ancho con el texto más grande",
      parrafos: ["Si la columna “imagen” queda vacía, los párrafos usan todo el espacio.",
                 "Las palabras entre **dos asteriscos** se destacan en rojo, igual que en el titular."],
      img: "", credito: "" },
    { tit: "La columna **crédito foto** cita de dónde sale cada imagen",
      parrafos: ["Aparece chiquito sobre la foto, por ejemplo “Foto: AUF”.",
                 "Usá fotos propias, oficiales de prensa de clubes y federaciones, o con licencia libre, y citá siempre la fuente."],
      img: fotoCancha("FOTO OFICIAL", "#3a1d6e", "#1f7a3a"), credito: "AUF" }
  ];

  const L = (id) => "https://a.espncdn.com/i/teamlogos/soccer/500/" + id + ".png";
  const N = (ab) => "https://a.espncdn.com/i/teamlogos/nba/500/" + ab + ".png";
  const hoy = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const eq = (id, nombre, logo, goles, gano) => ({ id: String(id), nombre, completo: nombre, logo, goles: goles == null ? "" : String(goles), penales: "", gano: !!gano });
  // g: [equipoId, atletaId, apellido, minuto, penal?, enContra?]
  const G = (lista) => (lista || []).map(([equipo, atleta, jugador, min, pen, ec]) => ({ equipo: String(equipo), atleta, jugador, min, pen: !!pen, ec: !!ec }));
  const P = (id, estado, etiqueta, local, visita, goles, deporte, dia) => {
    const gs = G(goles);
    return { id: String(id), deporte: deporte || "soccer", inicio: hoy(19, 0), dia: dia || 0, estado, etiqueta, local, visita,
             goles: gs, golesPorJugador: gs.filter((g) => !g.ec).map((g) => g.atleta) };
  };

  function cargarResultados(datos, setUru) {
    setUru({
      fecha: Date.now(),
      equipos: {
        "86": { nombre: "Real Madrid", jugadores: ["Federico Valverde"] },
        "9001": { nombre: "Galatasaray", jugadores: ["Lucas Torreira"] },
        "9002": { nombre: "Flamengo", jugadores: ["Nicolás de la Cruz", "Guillermo Varela"] },
        "102": { nombre: "Villarreal", jugadores: ["Santiago Mouriño"] },
        "5": { nombre: "Boca Juniors", jugadores: ["Miguel Merentiel", "Brian Lozano"] },
        "3454": { nombre: "Vasco da Gama", jugadores: ["Brian Rodríguez"] }
      },
      atletas: { "t1": "Juan Pérez", "t3": "Matías Cabrera", "a1": "Federico Valverde", "a2": "Nicolás de la Cruz", "318098": "Santiago Mouriño", "b1": "Miguel Merentiel", "b2": "Brian Lozano", "b3": "Brian Rodríguez" }
    });
    // Fecha completa del fútbol uruguayo: partidos del sábado, en vivo y por jugarse
    datos["uru.2"] = { nombre: "Segunda División", proxima: true, logo: "", partidos: [
      P(70, "pre", "sáb 17 15:30", eq(1, "Rentistas", ""), eq(2, "Uruguay Montevideo", ""), [], "soccer", 4),
      P(71, "pre", "dom 18 11:00", eq(3, "Villa Teresa", ""), eq(4, "Tacuarembó", ""), [], "soccer", 5)
    ] };
    datos["uru.1"] = { nombre: "Liga AUF Uruguaya", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/1592.png", partidos: [
      P(1, "in", "67'", eq(2684, "Nacional", L(2684), 2), eq(8416, "Juventud", L(8416), 1),
        [[2684, "x1", "Bareiro", "12'"], [8416, "x2", "Rodríguez", "40'"], [2684, "x1", "Bareiro", "58' (p)"]]),
      P(2, "post", "Final · sáb", eq(5490, "Cerro", L(5490), 1, true), eq(9903, "Racing", L(9903), 0),
        [[5490, "x3", "Suárez", "9'"]], "soccer", -1),
      P(3, "pre", "21:00", eq(5492, "Liverpool", L(5492)), eq(9999, "Boston River", L(9999))),
      P(4, "pre", "Mañana 16:00", eq(1007, "Defensor Sporting", L(1007)), eq(131688, "Central Español", L(131688)), [], "soccer", 1)
    ] };
    datos["conmebol.libertadores"] = { nombre: "Copa Libertadores", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/58.png", partidos: [
      Object.assign(P(10, "in", "34'", eq(9002, "Flamengo", L(819), 1), eq(1, "Estudiantes", L(1), 0), [[9002, "a2", "de la Cruz", "22'"]]),
        { demoUru: { "9002": ["Nicolás de la Cruz (titular)", "Guillermo Varela (titular)"] } })
    ] };
    datos["eng.1"] = { nombre: "Premier League", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/23.png", partidos: [
      P(20, "post", "Final", eq(364, "Liverpool", L(364), 3, true), eq(359, "Arsenal", L(359), 1),
        [[364, "y1", "Salah", "14'"], [359, "y2", "Saka", "33'"], [364, "y1", "Salah", "61'"], [364, "y3", "Gakpo", "88'"]])
    ] };
    datos["conmebol.sudamericana"] = { nombre: "Copa Sudamericana", logo: "", partidos: [
      Object.assign(P(60, "in", "58'", eq(5, "Boca Juniors", L(5), 1), eq(3454, "Vasco da Gama", L(3454), 1),
        [[5, "b1", "Merentiel", "12'"], [3454, "b3", "Rodríguez", "49'"]]),
        { demoUru: { "5": ["Miguel Merentiel (titular)", "Brian Lozano (titular)"], "3454": ["Brian Rodríguez (titular)"] } }),
      // Club uruguayo en copa: sus uruguayos no se resaltan
      P(61, "post", "Final", eq(700, "Torque", L(20793), 2, true), eq(7632, "Atlético Mineiro", L(7632), 1),
        [[700, "t1", "Pérez", "15'"], [7632, "t2", "Hulk", "40'"], [700, "t3", "Cabrera", "77'"]])
    ] };
    datos["esp.1"] = { nombre: "LaLiga", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/15.png", partidos: [
      Object.assign(P(50, "in", "62'", eq(102, "Villarreal", L(102), 1), eq(244, "Betis", L(244), 0),
        [[102, "318098", "Mouriño", "34'"]]), { demoUru: { "102": ["Santiago Mouriño (titular)"] } }),
      P(51, "post", "Final", eq(83, "Barcelona", L(83), 4, true), eq(1068, "Atlético Madrid", L(1068), 3),
        [[83, "w1", "Lewandowski", "5'"], [1068, "w2", "Griezmann", "11'"], [83, "w3", "Yamal", "23'"], [83, "w1", "Lewandowski", "40' (p)"],
         [1068, "w4", "Álvarez", "55'"], [1068, "w2", "Griezmann", "71'"], [83, "w5", "Raphinha", "90'+3'"]]),
      P(52, "pre", "21:00", eq(86, "Real Madrid", L(86)), eq(93, "Sevilla", L(243)))
    ] };
    datos["nba"] = { nombre: "NBA", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png", partidos: [
      P(30, "in", "3C 4:12", eq(1, "Celtics", N("bos"), 78), eq(2, "Lakers", N("lal"), 81), [], "basketball")
    ] };
    datos["uefa.champions"] = { nombre: "Champions League", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/2.png", partidos: [
      Object.assign(P(40, "in", "71'", eq(86, "Real Madrid", L(86), 2), eq(132, "Bayern", L(132), 1),
        [[86, "a1", "Valverde", "18'"], [132, "z1", "Kane", "50' (p)"], [86, "z2", "Mbappé", "66'"]]),
        { demoUru: { "86": ["Federico Valverde (titular)"] } }),
      Object.assign(P(41, "post", "Final", eq(9001, "Galatasaray", L(432), 1, true), eq(437, "Juventus", L(111), 0),
        [[9001, "z3", "Icardi", "77'"]]), { demoUru: { "9001": ["Lucas Torreira (ingresó 63')"] } })
    ] };
  }

  const manuales = {
    "Liga Uruguaya de Básquetbol": { logo: "", partidos: [
      { id: "m1", deporte: "manual", estado: "in", etiqueta: "3C 2:10", dia: 0, goles: [], golesPorJugador: [],
        local: { nombre: "Aguada", logo: "", goles: "72" }, visita: { nombre: "Peñarol", logo: "", goles: "68" } }
    ] }
  };

  window.TickerDemo = { noticias, noticiasTanda, cargarResultados, manuales, clubesUru: ["700"] };
})();
