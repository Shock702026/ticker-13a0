# encoding: utf-8
f = ARGV[0]; s = File.read(f, encoding: "UTF-8")
r = ->(a, b) { abort("falta: " + a[0, 60]) unless s.include?(a); s = s.sub(a, b) }
r.("  async function cargarTablas() {",
   "  // Busca un equipo en una lista: primero por nombre exacto; si no, por parecido solo si hay uno solo\n" \
   "  function buscarEquipo(lista, id, ...nombres) {\n" \
   "    if (id) { const x = lista.find((f) => f.id && f.id === String(id)); if (x) return x; }\n" \
   "    const ns = nombres.map(normEq).filter(Boolean);\n" \
   "    const exacto = lista.find((f) => ns.includes(normEq(f.nombre)) || ns.includes(normEq(f.completo)));\n" \
   "    if (exacto) return exacto;\n" \
   "    const parecidos = lista.filter((f) => nombres.some((n) => mismoEquipo(f.nombre, n) || mismoEquipo(f.completo, n)));\n" \
   "    return parecidos.length === 1 ? parecidos[0] : null;\n" \
   "  }\n\n  async function cargarTablas() {")
r.("    const busca = (e) => out.find((f) => (f.id && e.id && f.id === String(e.id)) || mismoEquipo(f.nombre, e.nombre) || mismoEquipo(f.nombre, e.completo));",
   "    const busca = (e) => buscarEquipo(out, e.id, e.nombre, e.completo);")
r.("      const x = (ref || []).find((y) => mismoEquipo(y.nombre, f.nombre) || mismoEquipo(y.completo, f.nombre));",
   "      const x = buscarEquipo(ref || [], null, f.nombre);")
File.write(f, s); puts "ok"
