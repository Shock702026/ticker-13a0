/* =====================================================================
   CONFIGURACIÓN DEL TICKER
   Este es el único archivo que necesitás tocar. Guardá los cambios y
   en OBS hacé clic derecho sobre la fuente → "Actualizar" (o refrescar
   caché) para que tome la configuración nueva.
   ===================================================================== */
window.TICKER_CONFIG = {

  /* ---------- Identidad del programa ---------- */
  programa: {
    nombre: "13a0",               // aparece solo si no hay logo
    logo: "logo.png"              // archivo del logo, en esta misma carpeta
  },

  /* ---------- Colores (formato #RRGGBB) — paleta 13a0 radiodeportivo ---------- */
  colores: {
    negro:    "#000000",          // fondo y líneas de la grilla
    blanco:   "#FFFFFF",          // bloques de equipos y titulares
    azul:     "#180B5B",          // texto y marcador final
    celeste:  "#0086C3",          // partidos por jugarse, uruguayos
    amarillo: "#F9BE02",          // separadores, gol de uruguayo
    rojo:     "#C5021E",          // etiquetas, competencias, EN VIVO
    gris:     "#6E6A86"           // equipo que perdió
  },

  reloj: true,                    // hora actual en la esquina derecha (false para ocultarla)
  altoFranja: 70,                 // alto de la franja en px (en una fuente de 1920 de ancho)

  /* ---------- Orden de la cinta según el día ----------
     Cada día corre esta lista de bloques, en este orden, y vuelve a empezar.
     Los bloques sin datos se saltean. Si hay un partido uruguayo en vivo,
     "uru-vivo" vuelve a aparecer cada 3 bloques.
       uru-vivo            fútbol uruguayo: partidos en vivo
       uru-jugados         fútbol uruguayo: resultados de la fecha (o de la última jugada)
       uru-fecha           fútbol uruguayo: resultados de la fecha y partidos a jugarse
       uru-fixture         fútbol uruguayo: próxima fecha
       uru-tablas          torneo en disputa (en vivo) + tabla anual + descenso por promedios
       exterior            partidos de hoy con uruguayos en el exterior
       segunda-resultados  Segunda División: en vivo y últimos resultados (pestaña resultados_manuales)
       segunda-fixture     Segunda División: partidos a jugarse (pestaña resultados_manuales)
       segunda-tabla       Segunda División: tabla (pestaña tablas_uruguay)
       planilla            otras competencias cargadas a mano (básquetbol, Copa AUF…)
       copas               Libertadores, Sudamericana, Champions, Europa y Conference: la fecha + tablas
       arg-vivo / arg-jugados / arg-fixture / arg-tabla      fútbol argentino
       bra-resultados / bra-fixture / bra-tabla             fútbol brasileño (con copas y estaduales)
       europa-resultados / europa-fixture                   Inglaterra, España e Italia + primeros 6 */
  programa: {
    lunes:     ["uru-vivo", "uru-jugados", "uru-tablas", "exterior", "segunda-resultados", "segunda-tabla", "planilla", "copas",
                "arg-vivo", "arg-jugados", "arg-tabla", "bra-resultados", "bra-tabla", "europa-resultados"],
    martes:    ["uru-vivo", "uru-jugados", "uru-tablas", "exterior", "segunda-resultados", "segunda-tabla", "planilla", "copas",
                "arg-vivo", "arg-jugados", "arg-tabla", "bra-resultados", "bra-tabla", "europa-resultados"],
    miercoles: ["uru-vivo", "uru-fixture", "uru-tablas", "exterior", "segunda-tabla", "planilla", "copas",
                "arg-vivo", "arg-tabla", "bra-resultados", "bra-tabla"],
    jueves:    ["uru-vivo", "uru-fixture", "uru-tablas", "exterior", "segunda-fixture", "segunda-tabla", "planilla", "copas",
                "arg-vivo", "arg-fixture", "arg-tabla", "bra-fixture", "bra-tabla", "europa-fixture"],
    viernes:   ["uru-vivo", "uru-fixture", "uru-tablas", "exterior", "segunda-fixture", "segunda-tabla", "planilla", "copas",
                "arg-vivo", "arg-fixture", "arg-tabla", "bra-fixture", "bra-tabla", "europa-fixture"],
    sabado:    ["uru-vivo", "uru-fecha", "uru-tablas", "exterior", "segunda-resultados", "segunda-tabla", "planilla", "copas",
                "arg-vivo", "arg-jugados", "arg-tabla", "bra-resultados", "bra-tabla", "europa-resultados"],
    domingo:   ["uru-vivo", "uru-fecha", "uru-tablas", "exterior", "segunda-resultados", "segunda-tabla", "planilla", "copas",
                "arg-vivo", "arg-jugados", "arg-tabla", "bra-resultados", "bra-tabla", "europa-resultados"]
  },
  vivoUruguayoCada: 3,            // cada cuántos bloques se repite "uru-vivo" si hay partidos uruguayos en vivo

  /* ---------- Tablas ---------- */
  tablas: {
    hoja: "tablas_uruguay",       // pestaña de la planilla: tabla anual, promedios y Segunda División
    anualMostrar: 8,              // primeros N de la tabla anual (cupos a copas)
    promediosMostrar: 6,          // últimos N de la tabla del descenso
    argentinaMostrar: 8,          // primeros N de cada zona argentina
    brasilArriba: 8, brasilAbajo: 4,
    europaMostrar: 6,             // primeros N de Inglaterra, España e Italia
    copasMostrar: 8               // fase de liga de la Champions/Europa/Conference: primeros N + los equipos con uruguayos
  },

  /* ---------- Pantalla de tanda (tanda.html) ---------- */
  tanda: {
    segundosPorNoticia: 20,       // cuánto queda cada noticia
    segundosPorResultado: 8,      // cuánto queda cada resultado destacado (en vivo: un poco más)
    maxDestacados: 10,            // cuántos partidos rotan como destacados (los más importantes)
    mostrarTicker: false          // true = muestra el ticker de resultados abajo también en la tanda
  },

  /* ---------- Comportamiento ---------- */
  velocidad: 95,                  // velocidad de la cinta, en píxeles por segundo
  zonaHoraria: "America/Montevideo",
  actualizarCadaSegundos: 60,     // cada cuánto se consultan resultados y noticias

  /* Partidos que se muestran: solo los de HOY. Excepción: en estas ligas, si
     hay una fecha en juego se muestra la fecha completa (jugados y por jugar). */
  fechaCompleta: {
    ligas: ["uru.1", "uru.2"],
    buscarDias: 4,                // busca partidos de la fecha en juego hasta 4 días atrás
    buscarDiasAdelante: 14,       // y la próxima fecha hasta 14 días adelante
    separacionMaxDias: 1          // días sin partidos que puede haber dentro de una misma fecha
  },

  /* ---------- Planilla de Google (noticias y resultados manuales) ----------
     Pegá acá el link de tu planilla de Google Sheets. La planilla tiene que
     estar compartida como "Cualquier persona con el enlace: Lector".
     Si lo dejás vacío, los tickers muestran datos de ejemplo.            */
  googleSheet: "https://docs.google.com/spreadsheets/d/1RWYJrnosHmqeEXJoR9lqTS8V6bsuwzusLhwZLm2D1Hc/edit?usp=sharing",
  hojaNoticias: "noticias",
  hojaResultadosManuales: "resultados_manuales",

  /* ---------- Competencias que se muestran completas ----------
     deporte: "soccer" o "basketball"   liga: código de la fuente de datos
     nombre: lo que aparece en pantalla                                    */
  competencias: [
    { deporte: "soccer",     liga: "uru.1",                   nombre: "Liga AUF Uruguaya" },
    { deporte: "soccer",     liga: "uru.2",                   nombre: "Segunda División" },
    { deporte: "soccer",     liga: "conmebol.libertadores",   nombre: "Copa Libertadores" },
    { deporte: "soccer",     liga: "conmebol.sudamericana",   nombre: "Copa Sudamericana" },
    { deporte: "soccer",     liga: "conmebol.recopa",         nombre: "Recopa Sudamericana" },
    { deporte: "soccer",     liga: "fifa.worldq.conmebol",    nombre: "Eliminatorias" },
    { deporte: "soccer",     liga: "fifa.friendly",           nombre: "Amistosos internacionales", soloConUruguay: true },
    { deporte: "soccer",     liga: "arg.1",                   nombre: "Liga Profesional Argentina" },
    { deporte: "soccer",     liga: "arg.copa",                nombre: "Copa Argentina" },
    { deporte: "soccer",     liga: "arg.copa_lpf",            nombre: "Copa de la Liga" },
    { deporte: "soccer",     liga: "bra.1",                   nombre: "Brasileirão" },
    { deporte: "soccer",     liga: "bra.copa_do_brazil",      nombre: "Copa do Brasil" },
    { deporte: "soccer",     liga: "bra.camp.paulista",       nombre: "Paulistão" },
    { deporte: "soccer",     liga: "bra.camp.carioca",        nombre: "Carioca" },
    { deporte: "soccer",     liga: "bra.camp.mineiro",        nombre: "Mineiro" },
    { deporte: "soccer",     liga: "bra.camp.gaucho",         nombre: "Gaúcho" },
    { deporte: "soccer",     liga: "uefa.champions",          nombre: "Champions League" },
    { deporte: "soccer",     liga: "eng.1",                   nombre: "Premier League" },
    { deporte: "soccer",     liga: "esp.1",                   nombre: "LaLiga" },
    { deporte: "soccer",     liga: "ita.1",                   nombre: "Serie A" },
    { deporte: "soccer",     liga: "ger.1",                   nombre: "Bundesliga" },
    { deporte: "soccer",     liga: "fra.1",                   nombre: "Ligue 1" },
    { deporte: "basketball", liga: "nba",                     nombre: "NBA" }
  ],

  /* ---------- Uruguayos en el exterior ----------
     Una vez por semana el ticker revisa los planteles de estas ligas y
     detecta automáticamente en qué equipos juegan uruguayos. Después:
       · en las competencias de arriba, marca esos partidos con la bandera
         y el nombre del jugador (y si hace un gol, lo destaca);
       · de las "competenciasExtra", muestra SOLO los partidos de equipos
         con uruguayos, en un bloque "URUGUAYOS EN EL EXTERIOR".          */
  exterior: {
    activo: true,
    titulo: "Uruguayos en el exterior",
    escanearCadaDias: 7,
    ligasAEscanear: [
      "eng.1","esp.1","ita.1","ger.1","fra.1","por.1","ned.1","bel.1","tur.1","gre.1",
      "sco.1","sui.1","aut.1","rus.1","eng.2","esp.2","ita.2","ger.2","fra.2",
      "usa.1","mex.1","ksa.1","arg.1","arg.2","bra.1","bra.2",
      "chi.1","par.1","col.1","ecu.1","per.1","bol.1","ven.1"
    ],
    competenciasExtra: [
      { liga: "uefa.champions",      nombre: "Champions League" },
      { liga: "uefa.europa",         nombre: "Europa League" },
      { liga: "uefa.europa.conf",    nombre: "Conference League" },
      { liga: "esp.copa_del_rey",    nombre: "Copa del Rey" },
      { liga: "eng.fa",              nombre: "FA Cup" },
      { liga: "eng.league_cup",      nombre: "Carabao Cup" },
      { liga: "ita.coppa_italia",    nombre: "Coppa Italia" },
      { liga: "ger.dfb_pokal",       nombre: "Copa de Alemania" },
      { liga: "fra.coupe_de_france", nombre: "Copa de Francia" },
      { liga: "por.1", nombre: "Portugal" }, { liga: "ned.1", nombre: "Países Bajos" },
      { liga: "bel.1", nombre: "Bélgica" },  { liga: "tur.1", nombre: "Turquía" },
      { liga: "gre.1", nombre: "Grecia" },   { liga: "sco.1", nombre: "Escocia" },
      { liga: "sui.1", nombre: "Suiza" },    { liga: "aut.1", nombre: "Austria" },
      { liga: "rus.1", nombre: "Rusia" },    { liga: "eng.2", nombre: "Championship" },
      { liga: "esp.2", nombre: "LaLiga 2" }, { liga: "ita.2", nombre: "Serie B" },
      { liga: "ger.2", nombre: "2. Bundesliga" }, { liga: "fra.2", nombre: "Ligue 2" },
      { liga: "usa.1", nombre: "MLS" },      { liga: "mex.1", nombre: "Liga MX" },
      { liga: "ksa.1", nombre: "Arabia Saudita" }, { liga: "arg.2", nombre: "Primera Nacional" },
      { liga: "bra.2", nombre: "Brasileirão Série B" },
      { liga: "chi.1", nombre: "Chile" },    { liga: "par.1", nombre: "Paraguay" },
      { liga: "col.1", nombre: "Colombia" }, { liga: "ecu.1", nombre: "Ecuador" },
      { liga: "per.1", nombre: "Perú" },     { liga: "bol.1", nombre: "Bolivia" },
      { liga: "ven.1", nombre: "Venezuela" },
      { liga: "concacaf.champions", nombre: "Concachampions" }
    ]
  }
};
