# encoding: utf-8
f = ARGV[0]; s = File.read(f, encoding: "UTF-8")
r = ->(a, b) { abort("falta: " + a[0, 60]) unless s.include?(a); s = s.sub(a, b) }
r.('const cupos = an.filter((f) => /copa|libertadores|sudamericana/.test(f.zona)).length;',
   'const lib = an.filter((f) => /libertadores/.test(f.zona)).length, sud = an.filter((f) => /sudamericana/.test(f.zona)).length;')
r.('out.push(...filas(t, { dg: false, zona: (f) => (f.pos <= cupos ? "copa" : "") }));',
   'out.push(...filas(t, { dg: false, zona: (f) => (f.pos <= lib ? "copa" : f.pos <= lib + sud ? "copa2" : "") }));')
File.write(f, s); puts "ok"
