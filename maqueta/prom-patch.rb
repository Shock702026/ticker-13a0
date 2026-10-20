# encoding: utf-8
f = ARGV[0]; s = File.read(f, encoding: "UTF-8")
a = "promedio: num(f.promedio), zona: normEq(f.zona)"
abort "falta" unless s.include?(a)
s = s.sub(a, "promedio: promedioDe(f), zona: normEq(f.zona)")
s = s.sub("  async function cargarTablasHoja() {", "  // El promedio se calcula con puntos / partidos (más seguro que leer decimales de la planilla)\n  function promedioDe(f) {\n    const pts = num(f.pts), pj = num(f.pj), p = num(f.promedio);\n    if (pts != null && pj) return pts / pj;\n    return p != null && p < 4 ? p : null;\n  }\n\n  async function cargarTablasHoja() {")
File.write(f, s); puts "ok"
