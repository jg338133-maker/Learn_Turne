import { RouteStop } from "../types";

/**
 * ============================================================================
 *  RUTA DE PRUEBA REAL — tramo Moléson 1 → Montsalvens 1 (1630 Bulle)
 * ============================================================================
 *
 * 238 paradas REALES de tu recorrido, en orden.
 * Coordenadas geocodificadas en OpenStreetMap con precisión de portal.
 * (Saint-Denis 72 y 74 se descartaron: OSM no las tiene como portal.)
 *
 * Calles del recorrido: Moléson · Saint-Denis · Gruyères · Vevey · Bourgo ·
 * Champ-Fleuri · Montsalvens · Joseph-Reichlen · Abbé-Bovet · Trois-Trèfles ·
 * Pierre-Sciobéret · Tirage · Vanils · Albergeux · Louis-Bornet · Halage ·
 * Jordils · Temple · Essert.
 *
 * Las paradas 1-86 se geocodificaron a mano; las 87-238 (tras Montsalvens 1)
 * de forma automática vía Nominatim: 3 quedaron como ⚠️ approx (portal no
 * encontrado, situadas sobre el eje de la calle) y conviene afinarlas.
 *
 * Para afinar un punto: mantén pulsado el portal en Google/Apple Maps,
 * copia (latitud, longitud) y pégalos aquí. Mantén 'order' en secuencia.
 *
 * Los paquetes NO van aquí: están en testPackages.ts
 */
export const ROUTE_STOPS: RouteStop[] = [
  { id: 1, order: 1, address: "Rue du Moléson 1", latitude: 46.615077, longitude: 7.056791 },
  { id: 2, order: 2, address: "Rue Saint-Denis 35", latitude: 46.615018, longitude: 7.057259 },
  { id: 3, order: 3, address: "Rue Saint-Denis 29", latitude: 46.614833, longitude: 7.057354 },
  { id: 4, order: 4, address: "Rue Saint-Denis 23", latitude: 46.614877, longitude: 7.057699 },
  { id: 5, order: 5, address: "Rue Saint-Denis 5", latitude: 46.615123, longitude: 7.057698 },
  { id: 6, order: 6, address: "Rue Saint-Denis 3", latitude: 46.615213, longitude: 7.057605 }, // 📦 1
  { id: 7, order: 7, address: "Rue de Gruyères 52", latitude: 46.615063, longitude: 7.057866 },
  { id: 8, order: 8, address: "Rue de Gruyères 54", latitude: 46.614996, longitude: 7.057936 },
  { id: 9, order: 9, address: "Rue de Gruyères 56", latitude: 46.614925, longitude: 7.058031 },
  { id: 10, order: 10, address: "Rue de Gruyères 58", latitude: 46.61486, longitude: 7.058111 },
  { id: 11, order: 11, address: "Rue de Gruyères 60", latitude: 46.614789, longitude: 7.058183 },
  { id: 12, order: 12, address: "Rue de Gruyères 62", latitude: 46.614736, longitude: 7.058265 },
  { id: 13, order: 13, address: "Rue de Gruyères 64", latitude: 46.614682, longitude: 7.058357 },
  { id: 14, order: 14, address: "Rue de Gruyères 66", latitude: 46.614581, longitude: 7.058422 },
  { id: 15, order: 15, address: "Rue de Gruyères 67", latitude: 46.614905, longitude: 7.058557 },
  { id: 16, order: 16, address: "Rue de Gruyères 65", latitude: 46.615015, longitude: 7.058437 },
  { id: 17, order: 17, address: "Rue de Gruyères 51", latitude: 46.615321, longitude: 7.058098 },
  { id: 18, order: 18, address: "Rue de Gruyères 53", latitude: 46.615437, longitude: 7.058328 },
  { id: 19, order: 19, address: "Rue de Gruyères 49", latitude: 46.615407, longitude: 7.058035 },
  { id: 20, order: 20, address: "Rue de Gruyères 47", latitude: 46.615436, longitude: 7.057924 },
  { id: 21, order: 21, address: "Rue de Gruyères 41", latitude: 46.615769, longitude: 7.057882 },
  { id: 22, order: 22, address: "Rue de Gruyères 39", latitude: 46.6157, longitude: 7.05772 },
  { id: 23, order: 23, address: "Rue de Gruyères 37", latitude: 46.615789, longitude: 7.057632 },
  { id: 24, order: 24, address: "Rue de Gruyères 35", latitude: 46.61587, longitude: 7.057616 },
  { id: 25, order: 25, address: "Rue de Gruyères 33", latitude: 46.615974, longitude: 7.057563 },
  { id: 26, order: 26, address: "Rue de Gruyères 21", latitude: 46.616709, longitude: 7.057466 },
  { id: 27, order: 27, address: "Rue de Gruyères 19", latitude: 46.616912, longitude: 7.058005 },
  { id: 28, order: 28, address: "Rue de Gruyères 11", latitude: 46.616993, longitude: 7.057464 }, // 📦 1
  { id: 29, order: 29, address: "Rue de Gruyères 9", latitude: 46.617109, longitude: 7.057428 },
  { id: 30, order: 30, address: "Rue de Gruyères 7", latitude: 46.617187, longitude: 7.057397 },
  { id: 31, order: 31, address: "Rue de Gruyères 5", latitude: 46.617312, longitude: 7.0574 },
  { id: 32, order: 32, address: "Rue de Gruyères 3", latitude: 46.617377, longitude: 7.057428 },
  { id: 33, order: 33, address: "Rue de Gruyères 2", latitude: 46.617443, longitude: 7.057204 },
  { id: 34, order: 34, address: "Rue de Gruyères 16", latitude: 46.616821, longitude: 7.057057 },
  { id: 35, order: 35, address: "Rue de Gruyères 18", latitude: 46.616657, longitude: 7.056905 },
  { id: 36, order: 36, address: "Rue de Vevey 1", latitude: 46.616905, longitude: 7.056967 },
  { id: 37, order: 37, address: "Rue de Gruyères 22", latitude: 46.616412, longitude: 7.05704 }, // 📦 1
  { id: 38, order: 38, address: "Rue de Gruyères 24", latitude: 46.616329, longitude: 7.057049 },
  { id: 39, order: 39, address: "Rue de Gruyères 26", latitude: 46.616266, longitude: 7.057067 },
  { id: 40, order: 40, address: "Rue de Gruyères 28", latitude: 46.616152, longitude: 7.057077 },
  { id: 41, order: 41, address: "Rue Saint-Denis 12", latitude: 46.615971, longitude: 7.056773 },
  { id: 42, order: 42, address: "Rue Saint-Denis 40", latitude: 46.615742, longitude: 7.056332 },
  { id: 43, order: 43, address: "Rue Saint-Denis 42", latitude: 46.61575, longitude: 7.056131 },
  { id: 44, order: 44, address: "Rue Saint-Denis 44", latitude: 46.615727, longitude: 7.055926 },
  { id: 45, order: 45, address: "Rue Saint-Denis 46", latitude: 46.615627, longitude: 7.055737 },
  { id: 46, order: 46, address: "Rue Saint-Denis 66", latitude: 46.61565, longitude: 7.054989 }, // 📦 1
  { id: 47, order: 47, address: "Rue Saint-Denis 68", latitude: 46.615614, longitude: 7.054775 }, // 📦 2
  { id: 48, order: 48, address: "Rue Saint-Denis 85", latitude: 46.61528, longitude: 7.053861 },
  { id: 49, order: 49, address: "Rue Saint-Denis 81", latitude: 46.615275, longitude: 7.05407 },
  { id: 50, order: 50, address: "Rue Saint-Denis 77", latitude: 46.615362, longitude: 7.054484 },
  { id: 51, order: 51, address: "Rue Saint-Denis 71", latitude: 46.615399, longitude: 7.054724 },
  { id: 52, order: 52, address: "Rue Saint-Denis 67", latitude: 46.615398, longitude: 7.05491 },
  { id: 53, order: 53, address: "Rue de Montsalvens 12", latitude: 46.61471, longitude: 7.055061 },
  { id: 54, order: 54, address: "Rue Saint-Denis 61", latitude: 46.614957, longitude: 7.055218 },
  { id: 55, order: 55, address: "Rue Saint-Denis 45", latitude: 46.615353, longitude: 7.055854 },
  { id: 56, order: 56, address: "Rue du Moléson 4", latitude: 46.615169, longitude: 7.056266 },
  { id: 57, order: 57, address: "Rue du Bourgo 7", latitude: 46.614446, longitude: 7.057209 },
  { id: 58, order: 58, address: "Rue du Bourgo 9", latitude: 46.614205, longitude: 7.057393 },
  { id: 59, order: 59, address: "Rue du Bourgo 30", latitude: 46.613154, longitude: 7.057857 }, // 📦 2
  { id: 60, order: 60, address: "Rue du Bourgo 22", latitude: 46.613401, longitude: 7.057611 },
  { id: 61, order: 61, address: "Rue du Bourgo 14", latitude: 46.613736, longitude: 7.057343 },
  { id: 62, order: 62, address: "Rue du Bourgo 10", latitude: 46.614029, longitude: 7.057124 },
  { id: 63, order: 63, address: "Rue du Bourgo 6", latitude: 46.61424, longitude: 7.056957 },
  { id: 64, order: 64, address: "Rue du Bourgo 4", latitude: 46.614441, longitude: 7.056857 },
  { id: 65, order: 65, address: "Rue du Bourgo 2", latitude: 46.614694, longitude: 7.056447 },
  { id: 66, order: 66, address: "Rue du Moléson 6", latitude: 46.6149, longitude: 7.056119 }, // 📦 2
  { id: 67, order: 67, address: "Rue du Moléson 8", latitude: 46.614726, longitude: 7.056019 },
  { id: 68, order: 68, address: "Rue du Moléson 10", latitude: 46.614647, longitude: 7.055971 },
  { id: 69, order: 69, address: "Rue du Moléson 12", latitude: 46.614587, longitude: 7.055919 },
  { id: 70, order: 70, address: "Rue du Moléson 20", latitude: 46.614234, longitude: 7.055657 },
  { id: 71, order: 71, address: "Rue du Moléson 22", latitude: 46.614172, longitude: 7.055616 },
  { id: 72, order: 72, address: "Rue du Moléson 24", latitude: 46.614097, longitude: 7.055578 },
  { id: 73, order: 73, address: "Rue du Moléson 26", latitude: 46.613953, longitude: 7.055494 },
  { id: 74, order: 74, address: "Rue du Moléson 30", latitude: 46.614047, longitude: 7.05508 },
  { id: 75, order: 75, address: "Rue du Moléson 36", latitude: 46.613768, longitude: 7.05535 },
  { id: 76, order: 76, address: "Rue du Moléson 42", latitude: 46.613758, longitude: 7.055343 },
  { id: 77, order: 77, address: "Rue du Moléson 45", latitude: 46.613356, longitude: 7.055751 },
  { id: 78, order: 78, address: "Rue du Moléson 41", latitude: 46.613531, longitude: 7.055602 },
  { id: 79, order: 79, address: "Rue du Moléson 35", latitude: 46.613702, longitude: 7.055837 },
  { id: 80, order: 80, address: "Rue Champ-Fleuri 2", latitude: 46.614183, longitude: 7.056063 },
  { id: 81, order: 81, address: "Rue Champ-Fleuri 10", latitude: 46.613906, longitude: 7.056074 }, // 📦 2
  { id: 82, order: 82, address: "Rue Champ-Fleuri 14", latitude: 46.613944, longitude: 7.056521 },
  { id: 83, order: 83, address: "Rue Champ-Fleuri 18", latitude: 46.613593, longitude: 7.056298 },
  { id: 84, order: 84, address: "Rue Champ-Fleuri 24", latitude: 46.613684, longitude: 7.056834 },
  { id: 85, order: 85, address: "Rue Champ-Fleuri 3", latitude: 46.614458, longitude: 7.056252 },
  { id: 86, order: 86, address: "Rue de Montsalvens 1", latitude: 46.6143, longitude: 7.055711 },
  // ── Continuación tras Montsalvens 1 (geocodificado con OpenStreetMap/Nominatim) ──
  // 3 paradas marcadas con ⚠️ approx: OSM no tenía ese portal exacto y se situaron
  // sobre el eje de la calle. Afínalas manteniendo pulsado el portal en Google/Apple Maps.
  { id: 87, order: 87, address: "Rue de Montsalvens 3", latitude: 46.614237, longitude: 7.055092 },
  { id: 88, order: 88, address: "Rue de Montsalvens 15", latitude: 46.614111, longitude: 7.054785 },
  { id: 89, order: 89, address: "Rue de Montsalvens 17", latitude: 46.614116, longitude: 7.05453 },
  { id: 90, order: 90, address: "Rue de Montsalvens 27", latitude: 46.61433, longitude: 7.054307 },
  { id: 91, order: 91, address: "Rue de Montsalvens 2", latitude: 46.614484, longitude: 7.055826 },
  { id: 92, order: 92, address: "Rue du Moléson 14", latitude: 46.614519, longitude: 7.055872 },
  { id: 93, order: 93, address: "Rue de Montsalvens 4", latitude: 46.614556, longitude: 7.055563 }, // 📦
  { id: 94, order: 94, address: "Rue de Montsalvens 6", latitude: 46.61458, longitude: 7.05532 },
  { id: 95, order: 95, address: "Rue de Montsalvens 28", latitude: 46.614648, longitude: 7.054386 },
  { id: 96, order: 96, address: "Rue Joseph-Reichlen 15", latitude: 46.614769, longitude: 7.05434 }, // 📦
  { id: 97, order: 97, address: "Rue Joseph-Reichlen 9", latitude: 46.614936, longitude: 7.054391 },
  { id: 98, order: 98, address: "Rue Joseph-Reichlen 5", latitude: 46.615109, longitude: 7.054388 },
  { id: 99, order: 99, address: "Rue Joseph-Reichlen 2", latitude: 46.615217, longitude: 7.054071 },
  { id: 100, order: 100, address: "Rue Joseph-Reichlen 14", latitude: 46.614863, longitude: 7.054034 }, // 📦
  { id: 101, order: 101, address: "Rue de Montsalvens 30", latitude: 46.614677, longitude: 7.053939 },
  { id: 102, order: 102, address: "Rue de Montsalvens 32", latitude: 46.614687, longitude: 7.053583 },
  { id: 103, order: 103, address: "Rue de Montsalvens 40", latitude: 46.614729, longitude: 7.052914 }, // 📦
  { id: 104, order: 104, address: "Rue de Montsalvens 41", latitude: 46.614378, longitude: 7.05248 },
  { id: 105, order: 105, address: "Rue de Montsalvens 33", latitude: 46.61433, longitude: 7.053486 },
  { id: 106, order: 106, address: "Rue de Montsalvens 31", latitude: 46.614382, longitude: 7.053856 },
  { id: 107, order: 107, address: "Rue Joseph-Reichlen 18", latitude: 46.614981, longitude: 7.054198 }, // ⚠️ approx (revisar portal)
  { id: 108, order: 108, address: "Rue Joseph-Reichlen 20", latitude: 46.614241, longitude: 7.053788 },
  { id: 109, order: 109, address: "Rue Joseph-Reichlen 22", latitude: 46.614046, longitude: 7.053684 },
  { id: 110, order: 110, address: "Rue Joseph-Reichlen 25", latitude: 46.613818, longitude: 7.054421 },
  { id: 111, order: 111, address: "Rue de l'Abbé-Bovet 1", latitude: 46.613754, longitude: 7.053673 },
  { id: 112, order: 112, address: "Rue de l'Abbé-Bovet 3", latitude: 46.613779, longitude: 7.053401 },
  { id: 113, order: 113, address: "Rue de l'Abbé-Bovet 5", latitude: 46.613799, longitude: 7.053122 },
  { id: 114, order: 114, address: "Rue de l'Abbé-Bovet 7", latitude: 46.613827, longitude: 7.052746 },
  { id: 115, order: 115, address: "Rue de l'Abbé-Bovet 9", latitude: 46.613726, longitude: 7.052528 },
  { id: 116, order: 116, address: "Rue de l'Abbé-Bovet 10", latitude: 46.614089, longitude: 7.052499 },
  { id: 117, order: 117, address: "Rue des Trois-Trèfles 10", latitude: 46.614064, longitude: 7.052048 },
  { id: 118, order: 118, address: "Rue des Trois-Trèfles 12", latitude: 46.613763, longitude: 7.052066 },
  { id: 119, order: 119, address: "Rue des Trois-Trèfles 22", latitude: 46.613437, longitude: 7.052098 },
  { id: 120, order: 120, address: "Rue Pierre-Sciobéret 94", latitude: 46.613339, longitude: 7.051836 },
  { id: 121, order: 121, address: "Rue Pierre-Sciobéret 96", latitude: 46.61333, longitude: 7.05161 },
  { id: 122, order: 122, address: "Rue Pierre-Sciobéret 98", latitude: 46.613507, longitude: 7.051664 },
  { id: 123, order: 123, address: "Rue du Tirage 35", latitude: 46.613476, longitude: 7.051061 },
  { id: 124, order: 124, address: "Rue du Tirage 31", latitude: 46.613678, longitude: 7.051216 }, // 📦
  { id: 125, order: 125, address: "Rue du Tirage 27", latitude: 46.613762, longitude: 7.051296 },
  { id: 126, order: 126, address: "Rue du Tirage 15", latitude: 46.614055, longitude: 7.05152 },
  { id: 127, order: 127, address: "Rue du Tirage 11", latitude: 46.614151, longitude: 7.051707 },
  { id: 128, order: 128, address: "Rue du Tirage 3", latitude: 46.614356, longitude: 7.05197 },
  { id: 129, order: 129, address: "Rue des Trois-Trèfles 5", latitude: 46.614729, longitude: 7.052525 }, // 📦
  { id: 130, order: 130, address: "Rue des Trois-Trèfles 3", latitude: 46.614958, longitude: 7.052975 },
  { id: 131, order: 131, address: "Rue des Trois-Trèfles 1", latitude: 46.61509, longitude: 7.052494 },
  { id: 132, order: 132, address: "Rue des Trois-Trèfles 2", latitude: 46.614965, longitude: 7.051974 }, // 📦
  { id: 133, order: 133, address: "Rue des Trois-Trèfles 4", latitude: 46.614729, longitude: 7.051932 }, // 📦
  { id: 134, order: 134, address: "Rue des Trois-Trèfles 8", latitude: 46.614967, longitude: 7.052283 }, // ⚠️ approx (revisar portal)
  { id: 135, order: 135, address: "Rue du Tirage 4", latitude: 46.614509, longitude: 7.05158 },
  { id: 136, order: 136, address: "Rue du Tirage 10", latitude: 46.614403, longitude: 7.051389 },
  { id: 137, order: 137, address: "Rue du Tirage 16", latitude: 46.614264, longitude: 7.05119 },
  { id: 138, order: 138, address: "Rue du Tirage 22", latitude: 46.614067, longitude: 7.051022 },
  { id: 139, order: 139, address: "Rue du Tirage 28", latitude: 46.613931, longitude: 7.050828 },
  { id: 140, order: 140, address: "Rue du Tirage 32", latitude: 46.613789, longitude: 7.050752 },
  { id: 141, order: 141, address: "Rue des Vanils 22", latitude: 46.613694, longitude: 7.050237 },
  { id: 142, order: 142, address: "Rue des Vanils 16", latitude: 46.613828, longitude: 7.05012 },
  { id: 143, order: 143, address: "Rue des Vanils 10", latitude: 46.613988, longitude: 7.050054 },
  { id: 144, order: 144, address: "Rue des Vanils 8", latitude: 46.614191, longitude: 7.049981 },
  { id: 145, order: 145, address: "Rue des Vanils 4", latitude: 46.614408, longitude: 7.049881 }, // 📦
  { id: 146, order: 146, address: "Rue des Vanils 3", latitude: 46.614533, longitude: 7.050227 },
  { id: 147, order: 147, address: "Rue des Vanils 7", latitude: 46.614365, longitude: 7.050303 },
  { id: 148, order: 148, address: "Rue des Vanils 11", latitude: 46.614212, longitude: 7.050372 },
  { id: 149, order: 149, address: "Rue des Vanils 17", latitude: 46.614046, longitude: 7.050438 },
  { id: 150, order: 150, address: "Rue des Vanils 23", latitude: 46.61383, longitude: 7.050538 },
  { id: 151, order: 151, address: "Rue des Albergeux 3", latitude: 46.614144, longitude: 7.049761 },
  { id: 152, order: 152, address: "Rue des Albergeux 5", latitude: 46.614101, longitude: 7.049548 },
  { id: 153, order: 153, address: "Rue des Albergeux 7", latitude: 46.614053, longitude: 7.049313 },
  { id: 154, order: 154, address: "Rue des Albergeux 9", latitude: 46.614007, longitude: 7.049092 },
  { id: 155, order: 155, address: "Rue des Albergeux 11", latitude: 46.613957, longitude: 7.048864 },
  { id: 156, order: 156, address: "Rue des Albergeux 15", latitude: 46.613705, longitude: 7.048491 },
  { id: 157, order: 157, address: "Rue des Albergeux 17", latitude: 46.613902, longitude: 7.048487 },
  { id: 158, order: 158, address: "Rue des Albergeux 21", latitude: 46.614097, longitude: 7.048458 },
  { id: 159, order: 159, address: "Rue des Albergeux 19", latitude: 46.614044, longitude: 7.048158 },
  { id: 160, order: 160, address: "Rue Louis-Bornet 16", latitude: 46.61354, longitude: 7.049075 }, // ⚠️ approx (revisar portal)
  { id: 161, order: 161, address: "Rue Louis-Bornet 18", latitude: 46.613757, longitude: 7.047729 },
  { id: 162, order: 162, address: "Rue Louis-Bornet 11", latitude: 46.613453, longitude: 7.048557 },
  { id: 163, order: 163, address: "Rue Louis-Bornet 12", latitude: 46.613696, longitude: 7.048853 },
  { id: 164, order: 164, address: "Rue Louis-Bornet 10", latitude: 46.613695, longitude: 7.049111 },
  { id: 165, order: 165, address: "Rue Louis-Bornet 8", latitude: 46.613685, longitude: 7.049435 },
  { id: 166, order: 166, address: "Rue Louis-Bornet 6", latitude: 46.613675, longitude: 7.04961 },
  { id: 167, order: 167, address: "Rue Louis-Bornet 4", latitude: 46.613644, longitude: 7.049938 },
  { id: 168, order: 168, address: "Chemin de Halage 74", latitude: 46.613051, longitude: 7.050046 },
  { id: 169, order: 169, address: "Rue Louis-Bornet 3", latitude: 46.613283, longitude: 7.050134 }, // 📦
  { id: 170, order: 170, address: "Rue Louis-Bornet 1", latitude: 46.61329, longitude: 7.050492 },
  { id: 171, order: 171, address: "Rue Pierre-Sciobéret 109", latitude: 46.613259, longitude: 7.050641 },
  { id: 172, order: 172, address: "Rue Pierre-Sciobéret 105", latitude: 46.613207, longitude: 7.050926 },
  { id: 173, order: 173, address: "Rue Pierre-Sciobéret 101", latitude: 46.613277, longitude: 7.05118 },
  { id: 174, order: 174, address: "Rue Pierre-Sciobéret 97", latitude: 46.61313, longitude: 7.051489 },
  { id: 175, order: 175, address: "Rue Pierre-Sciobéret 95", latitude: 46.613117, longitude: 7.051789 },
  { id: 176, order: 176, address: "Rue Pierre-Sciobéret 93", latitude: 46.61312, longitude: 7.051964 },
  { id: 177, order: 177, address: "Rue Pierre-Sciobéret 91", latitude: 46.61308, longitude: 7.05216 },
  { id: 178, order: 178, address: "Rue Pierre-Sciobéret 83", latitude: 46.613169, longitude: 7.052528 },
  { id: 179, order: 179, address: "Chemin de Halage 36", latitude: 46.612992, longitude: 7.052529 },
  { id: 180, order: 180, address: "Rue Pierre-Sciobéret 79", latitude: 46.613175, longitude: 7.052772 }, // 📦
  { id: 181, order: 181, address: "Rue Pierre-Sciobéret 75", latitude: 46.61319, longitude: 7.053011 },
  { id: 182, order: 182, address: "Rue Pierre-Sciobéret 73", latitude: 46.613199, longitude: 7.05318 },
  { id: 183, order: 183, address: "Rue Pierre-Sciobéret 67", latitude: 46.613216, longitude: 7.053491 },
  { id: 184, order: 184, address: "Rue Pierre-Sciobéret 63", latitude: 46.613201, longitude: 7.053656 },
  { id: 185, order: 185, address: "Rue Pierre-Sciobéret 59", latitude: 46.613206, longitude: 7.053898 },
  { id: 186, order: 186, address: "Rue Pierre-Sciobéret 51", latitude: 46.613204, longitude: 7.054331 },
  { id: 187, order: 187, address: "Rue Pierre-Sciobéret 82", latitude: 46.613428, longitude: 7.052703 },
  { id: 188, order: 188, address: "Rue Pierre-Sciobéret 80", latitude: 46.613582, longitude: 7.052586 },
  { id: 189, order: 189, address: "Rue Pierre-Sciobéret 76", latitude: 46.613418, longitude: 7.052988 },
  { id: 190, order: 190, address: "Rue Pierre-Sciobéret 72", latitude: 46.61338, longitude: 7.053128 },
  { id: 191, order: 191, address: "Rue Pierre-Sciobéret 70", latitude: 46.613563, longitude: 7.053216 },
  { id: 192, order: 192, address: "Rue Pierre-Sciobéret 66", latitude: 46.613478, longitude: 7.053408 },
  { id: 193, order: 193, address: "Rue Joseph-Reichlen 34", latitude: 46.613522, longitude: 7.053602 },
  { id: 194, order: 194, address: "Rue Pierre-Sciobéret 64", latitude: 46.613432, longitude: 7.053594 },
  { id: 195, order: 195, address: "Rue Pierre-Sciobéret 58", latitude: 46.613394, longitude: 7.054072 },
  { id: 196, order: 196, address: "Rue Pierre-Sciobéret 52", latitude: 46.613385, longitude: 7.054293 },
  { id: 197, order: 197, address: "Rue Pierre-Sciobéret 46", latitude: 46.613574, longitude: 7.054642 },
  { id: 198, order: 198, address: "Rue Joseph-Reichlen 27", latitude: 46.613765, longitude: 7.054519 },
  { id: 199, order: 199, address: "Rue Pierre-Sciobéret 44", latitude: 46.613374, longitude: 7.054642 },
  { id: 200, order: 200, address: "Rue Pierre-Sciobéret 45", latitude: 46.613213, longitude: 7.054451 },
  { id: 201, order: 201, address: "Rue Pierre-Sciobéret 43", latitude: 46.61323, longitude: 7.054667 },
  { id: 202, order: 202, address: "Rue Pierre-Sciobéret 41", latitude: 46.613221, longitude: 7.054798 },
  { id: 203, order: 203, address: "Chemin de Halage 6", latitude: 46.613046, longitude: 7.054361 },
  { id: 204, order: 204, address: "Chemin de Halage 14", latitude: 46.612951, longitude: 7.053865 }, // 📦
  { id: 205, order: 205, address: "Rue Pierre-Sciobéret 35", latitude: 46.612899, longitude: 7.055049 },
  { id: 206, order: 206, address: "Rue Pierre-Sciobéret 31", latitude: 46.613016, longitude: 7.055416 },
  { id: 207, order: 207, address: "Rue Pierre-Sciobéret 30", latitude: 46.61322, longitude: 7.055576 },
  { id: 208, order: 208, address: "Rue Pierre-Sciobéret 25", latitude: 46.612944, longitude: 7.056008 },
  { id: 209, order: 209, address: "Rue Pierre-Sciobéret 11", latitude: 46.612886, longitude: 7.056684 },
  { id: 210, order: 210, address: "Rue Pierre-Sciobéret 20", latitude: 46.613134, longitude: 7.056312 },
  { id: 211, order: 211, address: "Rue Pierre-Sciobéret 12", latitude: 46.613416, longitude: 7.056596 },
  { id: 212, order: 212, address: "Rue Pierre-Sciobéret 10", latitude: 46.613235, longitude: 7.056811 },
  { id: 213, order: 213, address: "Rue Pierre-Sciobéret 2", latitude: 46.613174, longitude: 7.057174 },
  { id: 214, order: 214, address: "Rue des Jordils 42", latitude: 46.613012, longitude: 7.058631 },
  { id: 215, order: 215, address: "Rue des Jordils 36", latitude: 46.613306, longitude: 7.058445 },
  { id: 216, order: 216, address: "Rue des Jordils 32", latitude: 46.613492, longitude: 7.058155 },
  { id: 217, order: 217, address: "Rue des Jordils 15", latitude: 46.613639, longitude: 7.058454 },
  { id: 218, order: 218, address: "Rue des Jordils 22", latitude: 46.613879, longitude: 7.058145 }, // 📦
  { id: 219, order: 219, address: "Rue des Jordils 24", latitude: 46.613773, longitude: 7.057897 },
  { id: 220, order: 220, address: "Ruelle du Temple 17", latitude: 46.614198, longitude: 7.058029 },
  { id: 221, order: 221, address: "Rue de Gruyères 74", latitude: 46.614158, longitude: 7.058786 },
  { id: 222, order: 222, address: "Rue de Gruyères 78", latitude: 46.613975, longitude: 7.058952 },
  { id: 223, order: 223, address: "Rue de Gruyères 82", latitude: 46.613823, longitude: 7.05911 },
  { id: 224, order: 224, address: "Rue de Gruyères 86", latitude: 46.61368, longitude: 7.059355 },
  { id: 225, order: 225, address: "Rue de Gruyères 90", latitude: 46.613475, longitude: 7.059496 },
  { id: 226, order: 226, address: "Rue de l'Essert 2", latitude: 46.613422, longitude: 7.059492 },
  { id: 227, order: 227, address: "Rue de l'Essert 4", latitude: 46.613465, longitude: 7.059256 },
  { id: 228, order: 228, address: "Rue des Jordils 9", latitude: 46.61342, longitude: 7.058726 },
  { id: 229, order: 229, address: "Rue des Jordils 3", latitude: 46.613169, longitude: 7.058969 },
  { id: 230, order: 230, address: "Rue de l'Essert 17", latitude: 46.612844, longitude: 7.058923 },
  { id: 231, order: 231, address: "Rue de l'Essert 15", latitude: 46.61294, longitude: 7.059264 },
  { id: 232, order: 232, address: "Rue de l'Essert 3", latitude: 46.613185, longitude: 7.059798 },
  { id: 233, order: 233, address: "Rue de Gruyères 96", latitude: 46.612983, longitude: 7.060015 },
  { id: 234, order: 234, address: "Rue de Gruyères 102", latitude: 46.612772, longitude: 7.06023 },
  { id: 235, order: 235, address: "Rue de Gruyères 106", latitude: 46.612549, longitude: 7.060216 },
  { id: 236, order: 236, address: "Rue de Gruyères 103", latitude: 46.612759, longitude: 7.060878 },
  { id: 237, order: 237, address: "Rue de Gruyères 101", latitude: 46.612895, longitude: 7.060731 },
  { id: 238, order: 238, address: "Rue de Gruyères 97", latitude: 46.613089, longitude: 7.060528 }, // 📦
];
