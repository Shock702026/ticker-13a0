# encoding: utf-8
f = ARGV[0]; s = File.read(f, encoding: "UTF-8")
r = ->(a, b) { abort("falta: " + a[0, 70]) unless s.include?(a); s = s.sub(a, b) }

# 1) Serie (ida/vuelta y global) en copas
r.(%(    return {\n      id: String(ev.id), deporte, inicio, estado, dia: diaRelativo(inicio),),
   %(    let serie = null;\n) +
   %(    if (comp.series && comp.series.competitors) {\n) +
   %(      const agg = (e) => { const x = comp.series.competitors.find((c) => String(c.id) === String((e.team || {}).id)); return x && x.aggregateScore != null ? Math.round(x.aggregateScore) : null; };\n) +
   %(      serie = { titulo: comp.series.title || "", vuelta: !!(comp.leg && comp.leg.value === 2), aggLocal: agg(loc), aggVisita: agg(vis), total: comp.series.totalCompetitions || 0 };\n) +
   %(    }\n) +
   %(    return {\n      id: String(ev.id), deporte, inicio, estado, dia: diaRelativo(inicio), serie,))

# 2) Ventana de días para las ligas del programa por día + lista completa de partidos
r.(%(    const completa = ligasFechaCompleta.has(liga);\n    const atras = completa ? (FC.buscarDias == null ? 4 : FC.buscarDias) : 0;\n    const adelante = completa ? (FC.buscarDiasAdelante == null ? 14 : FC.buscarDiasAdelante) : 0;),
   %(    const completa = ligasFechaCompleta.has(liga);\n    const prog = LIGAS_PROGRAMA.has(liga);\n) +
   %(    const atras = Math.max(completa ? (FC.buscarDias == null ? 4 : FC.buscarDias) : 0, prog ? VENTANA.atras : 0);\n) +
   %(    const adelante = Math.max(completa ? (FC.buscarDiasAdelante == null ? 14 : FC.buscarDiasAdelante) : 0, prog ? VENTANA.adelante : 0);))
r.(%(    let proxima = false;\n    if (completa) { const r = filtrarFechaCompleta(partidos); partidos = r.partidos; proxima = r.proxima; }),
   %(    const sinTbd = (p) => !/^tbd\\b/i.test(p.local.completo || p.local.nombre) && !/^tbd\\b/i.test(p.visita.completo || p.visita.nombre);\n) +
   %(    const todos = partidos.filter(sinTbd).sort((a, b) => new Date(a.inicio) - new Date(b.inicio));\n) +
   %(    let proxima = false;\n    if (completa) { const r = filtrarFechaCompleta(partidos); partidos = r.partidos; proxima = r.proxima; }))
r.(%(    datos[liga] = { nombre, logo, proxima, partidos: partidos.sort(ordenar) };),
   %(    datos[liga] = { nombre, logo, proxima, partidos: partidos.sort(ordenar), todos };))

# 3) Ciclo de datos: también las ligas del programa que no estén en la configuración, y las tablas
r.(%(        for (const c of extraSinRepetir) await cargarLiga("soccer", c.liga, c.nombre, true);\n        await cargarManuales();),
   %(        for (const c of extraSinRepetir) await cargarLiga("soccer", c.liga, c.nombre, true);\n) +
   %(        for (const l of LIGAS_PROGRAMA) if (!ligasPropias.has(l) && !extra.some((c) => c.liga === l)) await cargarLiga("soccer", l, NOMBRES[l] || l, false);\n) +
   %(        await cargarManuales();\n        await cargarTablas();\n        await cargarTablasHoja();))

nuevo = File.read(File.join(File.dirname(__FILE__), "programa.js"), encoding: "UTF-8")
r.(%(  function textoAviso() {), nuevo + %(\n  function textoAviso() {))

# 4) La cinta usa el programa del día (si está configurado)
r.(%(  function proximoSegmento() {\n    const bs = bloques();),
   %(  function proximoSegmento() {\n    if (C.programa) return segmentoPrograma();\n    const bs = bloques();))
File.write(f, s); puts "ok"
