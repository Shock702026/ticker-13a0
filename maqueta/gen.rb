# encoding: utf-8
require "json"
D = File.dirname(__FILE__)
TSV = "/Users/fabrizio/.claude/scheduled-tasks/relevamiento-noticias/datos/uruguayos-exterior.tsv"
UY = File.readlines(TSV, encoding: "UTF-8").drop(1).map { |l| l.chomp.split("\t") }
def norm(s) s.to_s.downcase.unicode_normalize(:nfkd).gsub(/[^a-z0-9 ]/, "") end
def uy_de(team, pais)
  t = norm(team).split.reject { |w| w.size < 4 || %w[club football hotspur united city manchester].include?(w) }
  UY.select { |r| r[4] == pais && !(norm(r[2]).split & t).empty? }.map { |r| r[0].split.last }
end
def tabla(liga, grupo = 0)
  j = JSON.parse(File.read("#{D}/#{liga}.json"))
  j["children"][grupo]["standings"]["entries"].map { |x|
    st = x["stats"].map { |s| [s["abbreviation"], s["displayValue"]] }.to_h
    { pos: st["R"].to_i, nom: x["team"]["shortDisplayName"].strip, largo: x["team"]["displayName"], pj: st["GP"], pts: st["P"], dg: st["GD"],
      logo: (x["team"]["logos"] || [{}])[0]["href"] }
  }.sort_by { |r| r[:pos] }
end
def fila(r, zona: nil, pais: nil, dg: true, extra: nil)
  uy = pais ? uy_de(r[:largo], pais) : []
  band = uy.empty? ? "" : %(<span class="t-uy"><img src="https://a.espncdn.com/i/teamlogos/countries/500/uru.png" alt="">#{uy.first(2).join(", ")}</span>)
  sub = extra || ("PJ #{r[:pj]}" + (dg ? " · DG #{r[:dg]}" : ""))
  %(<div class="t-fila"><div class="t-pos #{zona}">#{r[:pos]}</div><div class="t-eq"><img src="#{r[:logo]}" alt=""><div><div class="t-nom">#{r[:nom]}</div>#{band}</div></div><div class="t-pts"><b>#{r[:pts]}</b><span>#{sub}</span></div></div>)
end
def cartel(titulo, sub, logo: nil, color: "rojo")
  img = logo ? %(<img src="#{logo}" alt="">) : ""
  %(<div class="t-cartel #{color}">#{img}<span class="t-tit">#{titulo}</span><span class="t-sub">#{sub}</span></div>)
end
def barra(etiqueta, contenido) %(<p class="rot">#{etiqueta}</p><div class="barra fija"><img class="marca-logo" src="../logo.png" alt=""><div class="viewport"><div class="track">#{contenido}</div></div></div>) end
LUY = "https://a.espncdn.com/i/leaguelogos/soccer/500/1592.png"
cl = tabla("uru.1")
s1 = cartel("Torneo Clausura", "Tabla en vivo", logo: LUY) + cl.first(6).each_with_index.map { |r, i| fila(r, zona: i == 0 ? "lider" : nil) }.join
# Anual y promedios: valores de EJEMPLO (no son reales)
an = [["Peñarol", 66, 31], ["Nacional", 64, 30], ["Liverpool", 58, 31], ["MC Torque", 55, 31], ["Defensor", 51, 31], ["Racing", 47, 31], ["Danubio", 45, 31], ["Boston River", 44, 31]]
lg = cl.map { |r| [r[:nom], r[:logo]] }.to_h
s2 = cartel("Tabla Anual", "Cupos a copas · ejemplo", logo: LUY) + an.each_with_index.map { |(n, p, pj), i|
  fila({ pos: i + 1, nom: n, pj: pj, pts: p, logo: lg[n] || lg.values.first }, zona: i < 4 ? "copa" : (i < 8 ? "copa2" : nil), dg: false) }.join
pr = [["Cerro", "1,103"], ["Progreso", "1,086"], ["Plaza Colonia", "1,052"], ["Cerro Largo", "1,017"], ["Miramar", "0,983"], ["Juventud", "0,948"]]
s3 = cartel("Descenso", "Promedios · ejemplo", logo: LUY, color: "azul") + pr.each_with_index.map { |(n, v), i|
  fila({ pos: 11 + i, nom: n, pj: 0, pts: v, logo: lg[n] || lg.values.last }, zona: i >= 3 ? "desc" : nil, extra: i >= 3 ? "Zona de descenso" : "Promedio") }.join
ar = tabla("arg.1", 0)
s4 = cartel("Liga Profesional · Zona A", "Clasifican 8", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/1.png") + ar.first(6).map { |r| fila(r, zona: "copa", pais: "Argentina") }.join
en = tabla("eng.1")
s5 = cartel("Premier League", "Primeros 6", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/23.png") + en.first(6).map { |r| fila(r, zona: r[:pos] <= 4 ? "copa" : "copa2", pais: "Inglaterra") }.join
serie = %(<div class="t-serie"><div class="equipo"><div class="fila1"><img src="https://a.espncdn.com/i/teamlogos/soccer/500/12.png" alt=""><span class="nom">Estudiantes</span></div></div><div class="marcador"><div class="goles">0-0</div><div class="estado">Ida · Global 0-0</div></div><div class="equipo visita"><div class="fila1"><img src="https://a.espncdn.com/i/teamlogos/soccer/500/819.png" alt=""><span class="nom">Flamengo</span></div></div><div class="t-vuelta">Vuelta: miércoles<br>en Río de Janeiro</div></div>)
s6 = cartel("Copa Libertadores", "Semifinales · serie", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/58.png") + serie
html = <<H
<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Maqueta tablas ticker</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500..900&family=Bitter:wght@700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../estilos.css">
<style>
html,body{overflow:auto;background:#2a2838;width:1920px;height:auto}
.rot{color:#fff;font:700 22px Archivo,Arial;margin:28px 20px 10px}
.barra.fija{position:relative;}
.track{position:relative;padding-left:7px}
/* cartel de entrada del bloque */
.t-cartel{display:flex;align-items:center;gap:7px;height:var(--alto-bloque);flex:none}
.t-cartel img{height:var(--alto-bloque);width:var(--alto-bloque);object-fit:contain;background:#fff;padding:10px}
.t-cartel .t-tit{display:flex;align-items:center;height:100%;padding:0 22px;background:var(--rojo);color:#fff;font:800 30px var(--slab)}
.t-cartel.azul .t-tit{background:var(--azul)}
.t-cartel .t-sub{display:flex;align-items:center;height:100%;padding:0 18px;background:var(--amarillo);color:var(--azul);font:800 17px var(--grotesca);letter-spacing:.08em;text-transform:uppercase}
/* fila de tabla */
.t-fila{display:flex;gap:7px;height:var(--alto-bloque);flex:none;margin-left:7px}
.t-pos{display:flex;align-items:center;justify-content:center;width:64px;background:var(--azul);color:#fff;font:900 36px var(--grotesca)}
.t-pos.lider{background:var(--amarillo);color:var(--azul)}
.t-pos.copa{background:var(--celeste)}
.t-pos.copa2{background:#5aa9d6}
.t-pos.desc{background:var(--rojo)}
.t-eq{display:flex;align-items:center;gap:12px;padding:0 20px;background:#fff;min-width:250px}
.t-eq img{height:44px;width:44px;object-fit:contain}
.t-nom{font:800 30px var(--grotesca);letter-spacing:-.02em;white-space:nowrap;line-height:1.05}
.t-uy{display:inline-flex;align-items:center;gap:6px;margin-top:4px;padding:1px 8px;background:var(--celeste);color:#fff;font:700 15px var(--grotesca)}
.t-uy img{height:12px;width:18px;object-fit:cover}
.t-pts{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:120px;padding:0 14px;background:var(--azul);color:#fff}
.t-pts b{font:900 40px var(--grotesca);line-height:1}
.t-pts span{margin-top:5px;font:700 14px var(--grotesca);letter-spacing:.06em;text-transform:uppercase;opacity:.85;white-space:nowrap}
.t-serie{display:flex;gap:7px;height:var(--alto-bloque);margin-left:7px}
.t-vuelta{display:flex;align-items:center;padding:0 20px;background:var(--celeste);color:#fff;font:800 20px var(--grotesca);line-height:1.15}
</style></head><body>
#{barra("1 · Clausura en vivo (completa: sigue con los 16 equipos)", s1)}
#{barra("2 · Tabla anual: primeros 8 (valores de ejemplo)", s2)}
#{barra("3 · Descenso por promedios: últimos 6 (valores de ejemplo)", s3)}
#{barra("4 · Argentina, Zona A: primeros 8 · 🇺🇾 marca equipos con uruguayos", s4)}
#{barra("5 · Premier League: primeros 6", s5)}
#{barra("6 · Copas en eliminación directa: la serie con el global", s6)}
</body></html>
H
File.write("#{D}/maqueta-tablas.html", html); puts "ok"
t = ->(x) { %(<p class="rot" style="font-size:28px;color:#F9BE02;margin-top:40px">#{x}</p>) }
cmp = t.("ACTUAL · 100 px de alto") + barra("Clausura", s1) + barra("Argentina", s4) +
      %(<div class="chico">) + t.("PROPUESTA · 80 px de alto (20% más angosta)") + barra("Clausura", s1) + barra("Argentina", s4) + "</div>"
c = html.sub("</style>", ".chico .barra.fija{zoom:.80}\n</style>")
c = c.sub(/<body>.*<\/body>/m, "<body>#{cmp}</body>")
File.write("#{D}/comparar-alto.html", c); puts "ok cmp"
