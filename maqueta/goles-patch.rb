# encoding: utf-8
css, html = ARGV
s = File.read(css, encoding: "UTF-8")
a = <<A
.goleadores {
  /* el ancho máximo lo fija el código: el del nombre del equipo (mínimo 210u); hasta 2 renglones */
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
  white-space: normal;
A
b = <<B
.goleadores {
  /* el ancho máximo lo fija el código: el del nombre del equipo (mínimo 210u). Se ven 2 renglones;
     si hay más goles, la lista sube despacio para mostrarlos todos y vuelve a empezar */
  display: block; overflow: hidden; max-height: 2.4em;
  white-space: normal;
B
abort "falta css" unless s.include?(a)
s = s.sub(a, b)
s << <<C

/* Goleadores que no entran en 2 renglones: suben de a poco y vuelven */
.goleadores .lista { display: block; }
.goleadores.rueda .lista { animation: rueda-goles var(--dur, 8s) ease-in-out infinite; }
@keyframes rueda-goles {
  0%, 18% { transform: translateY(0); }
  45%, 68% { transform: translateY(var(--sube, 0px)); }
  92%, 100% { transform: translateY(0); }
}
C
File.write(css, s)

h = File.read(html, encoding: "UTF-8")
r = ->(x, y) { abort("falta: " + x[0, 60]) unless h.include?(x); h = h.sub(x, y) }
r.(%(      const fila = T.el("div", "goleadores");\n      gs.forEach((g, i) => {\n        if (i) fila.appendChild(document.createTextNode(" "));),
   %(      const fila = T.el("div", "goleadores");\n      const lista = T.el("span", "lista");\n      fila.appendChild(lista);\n      gs.forEach((g, i) => {\n        if (i) lista.appendChild(document.createTextNode(" "));))
r.(%(        fila.appendChild(s);\n      });\n      d.appendChild(fila);),
   %(        lista.appendChild(s);\n      });\n      d.appendChild(fila);))
r.(%(      fila.style.maxWidth = Math.max(f1.offsetWidth, min) + "px";\n    };),
   %(      fila.style.maxWidth = Math.max(f1.offsetWidth, min) + "px";\n) +
   %(      // si los goleadores no entran en 2 renglones, la lista sube para mostrarlos todos\n) +
   %(      requestAnimationFrame(() => {\n) +
   %(        const lista = fila.firstElementChild, sobra = lista ? lista.offsetHeight - fila.clientHeight : 0;\n) +
   %(        if (sobra > 2) {\n) +
   %(          const renglones = Math.round(sobra / (parseFloat(getComputedStyle(fila).lineHeight) || 20));\n) +
   %(          fila.style.setProperty("--sube", -sobra + "px");\n) +
   %(          fila.style.setProperty("--dur", (6 + 2 * renglones) + "s");\n) +
   %(          fila.classList.add("rueda");\n) +
   %(        } else fila.classList.remove("rueda");\n) +
   %(      });\n    };))
File.write(html, h)
puts "ok"
