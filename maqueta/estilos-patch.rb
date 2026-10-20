# encoding: utf-8
f = ARGV[0]; s = File.read(f, encoding: "UTF-8")
r = ->(a, b) { abort("falta: " + a) unless s.include?(a); s = s.sub(a, b) }
# textos chicos un poco más grandes (la franja ahora es más baja)
r.("font-family: var(--slab); font-weight: 700; font-size: calc(21 * var(--u));", "font-family: var(--slab); font-weight: 700; font-size: calc(23 * var(--u));")
r.("font-family: var(--grotesca); font-weight: 500; font-size: calc(16 * var(--u));", "font-family: var(--grotesca); font-weight: 600; font-size: calc(19 * var(--u));")
r.("font-family: var(--grotesca); font-weight: 700; font-size: calc(15 * var(--u)); line-height: 1;\n  text-transform: uppercase; letter-spacing: 0.08em;", "font-family: var(--grotesca); font-weight: 700; font-size: calc(18 * var(--u)); line-height: 1;\n  text-transform: uppercase; letter-spacing: 0.08em;")
r.(".marcador.pre .goles { font-size: calc(17 * var(--u));", ".marcador.pre .goles { font-size: calc(19 * var(--u));")
r.("font-family: var(--grotesca); font-weight: 700; font-size: calc(20 * var(--u)); line-height: 1.15; white-space: nowrap;", "font-family: var(--grotesca); font-weight: 700; font-size: calc(22 * var(--u)); line-height: 1.15; white-space: nowrap;")
r.("font-family: var(--grotesca); font-weight: 900; font-size: calc(15 * var(--u)); line-height: 1;\n  text-transform: uppercase; letter-spacing: 0.12em;", "font-family: var(--grotesca); font-weight: 900; font-size: calc(17 * var(--u)); line-height: 1;\n  text-transform: uppercase; letter-spacing: 0.12em;")
s << <<CSS

/* ---------- Tablas de posiciones ---------- */
/* Cartel de entrada: logo + nombre de la tabla (rojo o azul) + bajada amarilla */
.t-cartel { display: flex; align-items: center; gap: var(--linea); flex: none; height: var(--alto-bloque); }
.t-cartel img { height: var(--alto-bloque); width: var(--alto-bloque); object-fit: contain; background: var(--blanco); padding: calc(10 * var(--u)); }
.t-cartel .t-tit {
  display: flex; align-items: center; height: 100%; padding: 0 calc(22 * var(--u));
  background: var(--rojo); color: var(--blanco); white-space: nowrap;
  font-family: var(--slab); font-weight: 800; font-size: calc(30 * var(--u)); letter-spacing: -0.01em;
}
.t-cartel.azul .t-tit { background: var(--azul); }
.t-cartel .t-sub {
  display: flex; align-items: center; height: 100%; padding: 0 calc(18 * var(--u));
  background: var(--amarillo); color: var(--azul); white-space: nowrap;
  font-family: var(--grotesca); font-weight: 800; font-size: calc(19 * var(--u)); letter-spacing: 0.08em; text-transform: uppercase;
}
/* Fila: posición (color según zona) + equipo + puntos */
.t-fila { display: flex; gap: var(--linea); flex: none; height: var(--alto-bloque); }
.t-pos {
  display: flex; align-items: center; justify-content: center; width: calc(64 * var(--u));
  background: var(--azul); color: var(--blanco); font-family: var(--grotesca); font-weight: 900; font-size: calc(36 * var(--u));
}
.t-pos.lider { background: var(--amarillo); color: var(--azul); }
.t-pos.copa { background: var(--celeste); }
.t-pos.copa2 { background: #5aa9d6; }
.t-pos.desc { background: var(--rojo); }
.t-eq { display: flex; align-items: center; gap: calc(12 * var(--u)); padding: 0 calc(20 * var(--u)); background: var(--blanco); min-width: calc(250 * var(--u)); }
.t-eq img { flex: none; height: calc(44 * var(--u)); width: calc(44 * var(--u)); object-fit: contain; }
.t-nom { font-family: var(--grotesca); font-weight: 800; font-size: calc(30 * var(--u)); letter-spacing: -0.02em; white-space: nowrap; line-height: 1.05; }
.t-uy {
  display: inline-flex; align-items: center; gap: calc(6 * var(--u)); margin-top: calc(4 * var(--u)); padding: calc(1 * var(--u)) calc(8 * var(--u));
  background: var(--celeste); color: var(--blanco); font-family: var(--grotesca); font-weight: 700; font-size: calc(17 * var(--u)); white-space: nowrap;
}
.t-uy img { height: calc(13 * var(--u)); width: calc(20 * var(--u)); object-fit: cover; }
.t-pts {
  display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: calc(120 * var(--u)); padding: 0 calc(14 * var(--u));
  background: var(--azul); color: var(--blanco);
}
.t-pts b { font-family: var(--grotesca); font-weight: 900; font-size: calc(40 * var(--u)); line-height: 1; font-variant-numeric: tabular-nums; }
.t-pts span { margin-top: calc(5 * var(--u)); font-family: var(--grotesca); font-weight: 700; font-size: calc(16 * var(--u)); letter-spacing: 0.06em; text-transform: uppercase; opacity: .9; white-space: nowrap; }
.t-fila.vivo .t-pts { background: var(--rojo); }
.t-fila.vivo .t-pts span::before { content: ""; display: inline-block; width: calc(9 * var(--u)); height: calc(9 * var(--u)); margin-right: calc(6 * var(--u)); background: var(--blanco); animation: latido 1.1s steps(2, jump-none) infinite; }
CSS
File.write(f, s); puts "ok"
