# encoding: utf-8
f = ARGV[0]; s = File.read(f, encoding: "UTF-8")
r = ->(a, b) { abort("falta: " + a[0, 60]) unless s.include?(a); s = s.sub(a, b) }
r.(%(    let lista = [];\n    if (que === "vivo") lista = vivos;),
   %(    // una fecha tiene a lo sumo un partido por cada dos equipos: si se juntan dos fechas, quedan los más recientes\n) +
   %(    const equipos = ((tablas[liga] || {}).grupos || []).reduce((n, g) => n + g.filas.length, 0);\n) +
   %(    const tope = (l) => (equipos >= 6 && l.length > Math.floor(equipos / 2) ? l.slice(-Math.floor(equipos / 2)) : l);\n) +
   %(    let lista = [];\n    if (que === "vivo") lista = vivos;))
r.(%(else if (que === "jugados") lista = (ultima || []).filter((p) => p.estado === "post");),
   %(else if (que === "jugados") lista = tope((ultima || []).filter((p) => p.estado === "post"));))
r.(%(else if (que === "resultados") lista = vivos.concat((ultima || []).filter((p) => p.estado === "post"));),
   %(else if (que === "resultados") lista = vivos.concat(tope((ultima || []).filter((p) => p.estado === "post")));))
File.write(f, s); puts "ok"
