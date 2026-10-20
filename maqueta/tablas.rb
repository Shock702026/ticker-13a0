# encoding: utf-8
T = "\t"
out = [%w[tabla pos equipo pj pts dg promedio zona logo].join(T)]
anual = [["Peñarol",33,63,24],["Maldonado",32,59,22],["MC Torque",33,57,15],["Racing (M)",33,56,12],["Nacional",32,55,10],["Liverpool",33,53,13],["Wanderers",33,50,-1],["Albion",33,43,1],["Juventud",33,40,-4],["Central Español",33,38,-12],["Boston River",33,37,-10],["Cerro",33,36,-21],["Defensor",33,35,-10],["Cerro Largo",33,34,-8],["Danubio",33,32,-14],["Progreso",33,32,-17]]
anual.each_with_index { |(e, pj, pts, dg), i| out << ["anual", i + 1, e, pj, pts, dg, "", "", ""].join(T) }
prom = [["Peñarol",141,70,"2,014"],["Nacional",134,69,"1,942"],["Maldonado",59,32,"1,844"],["Liverpool",118,70,"1,686"],["Racing (M)",109,70,"1,557"],["MC Torque",103,70,"1,471"],["Juventud",101,70,"1,443"],["Defensor",96,70,"1,371"],["Boston River",92,70,"1,314"],["Albion",43,33,"1,303"],["Cerro Largo",83,70,"1,186"],["Cerro",82,70,"1,171"],["Wanderers",81,70,"1,157"],["Central Español",38,33,"1,152"],["Danubio",75,70,"1,071"],["Progreso",71,70,"1,014"]]
prom.each_with_index { |(e, pts, pj, pr), i| out << ["promedios", i + 1, e, pj, pts, "", "", i >= 13 ? "descenso" : "", ""].join(T) }
seg = [["Plaza Colonia",29,48,13,"ascenso"],["Oriental",29,46,8,"ascenso"],["Rentistas",29,45,6,"reducido"],["Colón",29,45,5,""],["Atenas",29,45,3,""],["Fénix",29,41,8,"reducido"],["Cerrito",29,41,3,""],["La Luz",29,38,-5,""],["River Plate",29,37,-1,""],["Huracán",29,37,-6,""],["Paysandú",29,35,-3,""],["Miramar Misiones",29,34,-6,""],["Uruguay Montevideo",29,27,-12,""],["Tacuarembó",29,27,-13,""]]
seg.each_with_index { |(e, pj, pts, dg, z), i| out << ["segunda", i + 1, e, pj, pts, dg, "", z, ""].join(T) }
File.write(ARGV[0], out.join("\n")); puts out.size
