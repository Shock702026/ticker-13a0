# encoding: utf-8
f = ARGV[0]; s = File.read(f, encoding: "UTF-8")
r = ->(a, b) { abort("falta: " + a[0, 60]) unless s.include?(a); s = s.sub(a, b) }
r.("  /* --- Fechas: días seguidos",
   "  // Filas de la planilla: toman el logo (y el id) del equipo en la tabla de la fuente\n" \
   "  function conLogos(lista, ref) {\n" \
   "    return lista.map((f) => {\n" \
   "      const x = (ref || []).find((y) => mismoEquipo(y.nombre, f.nombre) || mismoEquipo(y.completo, f.nombre));\n" \
   "      return x ? Object.assign({}, f, { logo: f.logo || x.logo, id: f.id || x.id }) : f;\n" \
   "    });\n" \
   "  }\n\n  /* --- Fechas: días seguidos")
r.("const t = tablaEnVivo(an, vivos).slice(0, CT.anualMostrar || 8);", "const t = tablaEnVivo(conLogos(an, g && g.filas), vivos).slice(0, CT.anualMostrar || 8);")
r.("const t = tablaEnVivo(pr, vivos, true), n = t.length;", "const t = tablaEnVivo(conLogos(pr, g && g.filas), vivos, true), n = t.length;")
File.write(f, s); puts "ok"
