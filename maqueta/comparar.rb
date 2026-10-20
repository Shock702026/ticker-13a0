# encoding: utf-8
d = File.dirname(__FILE__)
s = File.read("#{d}/maqueta-tablas.html", encoding: "UTF-8")
s = s.sub("</style>", ".chico .barra.fija{zoom:.86}\n</style>")
body = s[/<body>(.*)<\/body>/m, 1]
partes = body.scan(/<p class="rot">.*?<\/div><\/div><\/div>/m)
t = ->(x) { %(<p class="rot" style="font-size:28px;color:#F9BE02">#{x}</p>) }
nuevo = t.("ACTUAL · 100 px de alto") + partes[0] + partes[3] + %(<div class="chico">) + t.("PROPUESTA · 86 px de alto (14% más angosto)") + partes[0] + partes[3] + "</div>"
File.write("#{d}/comparar-alto.html", s.sub(body, nuevo)); puts partes.size
