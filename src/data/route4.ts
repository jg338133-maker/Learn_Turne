import { RouteStop } from "../types";

/**
 * RUTA 4 — Tournée 119 (rural, distrito de la Gruyère), extraída de vídeo (2fps)
 * y geocodificada por pueblo (OSM): 243 exactas, 27 aprox, 1 sin geo.
 * Pueblos: Vaulruz, Sâles, Rueyres-Treyfayes, Romanens, Maules. Ver RUTA_4_extraida.md.
 * ⚠️ Bloque de Maules (Forge/Publio/Vuara/Paquier/Condémines): números a revisar.
 */
export const ROUTE4_STOPS: RouteStop[] = [
  { id: 1, order: 1, address: "La Sionge 28", latitude: 46.620048, longitude: 6.96998 },
  { id: 2, order: 2, address: "La Sionge 20", latitude: 46.618509, longitude: 6.967744 },
  { id: 3, order: 3, address: "La Sionge 30", latitude: 46.619243, longitude: 6.967152 },
  { id: 4, order: 4, address: "La Sionge 38", latitude: 46.618145, longitude: 6.972471 }, // ⚠️ approx
  { id: 5, order: 5, address: "Route du Reposoir 56", latitude: 46.628136, longitude: 6.955965 },
  { id: 6, order: 6, address: "Route du Reposoir 89", latitude: 46.628923, longitude: 6.951007 },
  { id: 7, order: 7, address: "Route du Reposoir 91", latitude: 46.628991, longitude: 6.950602 },
  { id: 8, order: 8, address: "Route du Reposoir 90", latitude: 46.629737, longitude: 6.951066 },
  { id: 9, order: 9, address: "La Crausa 1", latitude: 46.629737, longitude: 6.951066 }, // ⚠️ sin geo
  { id: 10, order: 10, address: "Route de Rueyres 128", latitude: 46.639084, longitude: 6.949146 },
  { id: 11, order: 11, address: "Route de Rueyres 122", latitude: 46.640469, longitude: 6.950192 },
  { id: 12, order: 12, address: "Route de Rueyres 120", latitude: 46.640419, longitude: 6.95094 },
  { id: 13, order: 13, address: "Route de Rueyres 107", latitude: 46.643347, longitude: 6.955538 },
  { id: 14, order: 14, address: "Route de Rueyres 93", latitude: 46.645847, longitude: 6.956033 },
  { id: 15, order: 15, address: "Route de Rueyres 91", latitude: 46.646218, longitude: 6.956289 },
  { id: 16, order: 16, address: "Route de Rueyres 92", latitude: 46.645888, longitude: 6.955416 },
  { id: 17, order: 17, address: "Route de Rueyres 90", latitude: 46.646518, longitude: 6.9557 },
  { id: 18, order: 18, address: "Impasse de la Fin 11", latitude: 46.645443, longitude: 6.961503 },
  { id: 19, order: 19, address: "Impasse de la Fin 10", latitude: 46.645473, longitude: 6.961165 },
  { id: 20, order: 20, address: "Route de Rueyres 89", latitude: 46.646881, longitude: 6.956202 },
  { id: 21, order: 21, address: "Impasse des Oches 1", latitude: 46.648226, longitude: 6.957263 },
  { id: 22, order: 22, address: "Impasse des Oches 3", latitude: 46.648046, longitude: 6.957469 },
  { id: 23, order: 23, address: "Impasse des Oches 10", latitude: 46.647914, longitude: 6.957988 },
  { id: 24, order: 24, address: "Impasse des Oches 8", latitude: 46.647648, longitude: 6.957804 },
  { id: 25, order: 25, address: "Impasse des Oches 6", latitude: 46.647762, longitude: 6.957432 },
  { id: 26, order: 26, address: "Impasse des Oches 4", latitude: 46.647889, longitude: 6.957096 },
  { id: 27, order: 27, address: "Impasse des Oches 2", latitude: 46.648054, longitude: 6.956714 },
  { id: 28, order: 28, address: "Route de Rueyres 78", latitude: 46.648435, longitude: 6.956696 },
  { id: 29, order: 29, address: "Route de Rueyres 79", latitude: 46.648261, longitude: 6.95762 },
  { id: 30, order: 30, address: "Route de Rueyres 74", latitude: 46.648589, longitude: 6.957807 },
  { id: 31, order: 31, address: "Route de Rueyres 66", latitude: 46.64904, longitude: 6.958558 },
  { id: 32, order: 32, address: "Route de Rueyres 60", latitude: 46.650059, longitude: 6.959127 },
  { id: 33, order: 33, address: "Route de Rueyres 52", latitude: 46.651551, longitude: 6.960097 },
  { id: 34, order: 34, address: "Route de Rueyres 53", latitude: 46.650552, longitude: 6.959683 },
  { id: 35, order: 35, address: "Route de Rueyres 59", latitude: 46.649833, longitude: 6.95956 },
  { id: 36, order: 36, address: "Route de Rueyres 61", latitude: 46.649564, longitude: 6.959532 },
  { id: 37, order: 37, address: "Route de Rueyres 65", latitude: 46.649207, longitude: 6.959119 },
  { id: 38, order: 38, address: "Route de Treyfayes 1", latitude: 46.64884, longitude: 6.958173 },
  { id: 39, order: 39, address: "Route de Treyfayes 5", latitude: 46.648979, longitude: 6.957751 },
  { id: 40, order: 40, address: "Route de Treyfayes 7", latitude: 46.649037, longitude: 6.957623 },
  { id: 41, order: 41, address: "Route de Treyfayes 9", latitude: 46.649215, longitude: 6.957325 },
  { id: 42, order: 42, address: "Route de Treyfayes 12", latitude: 46.649483, longitude: 6.956813 },
  { id: 43, order: 43, address: "Route de Treyfayes 15", latitude: 46.649214, longitude: 6.956506 },
  { id: 44, order: 44, address: "Route de Treyfayes 20", latitude: 46.649428, longitude: 6.95591 },
  { id: 45, order: 45, address: "Route de Mouna 45", latitude: 46.645946, longitude: 6.948955 },
  { id: 46, order: 46, address: "Route de Mouna 40", latitude: 46.647387, longitude: 6.949825 },
  { id: 47, order: 47, address: "Route de Mouna 20", latitude: 46.650151, longitude: 6.950078 },
  { id: 48, order: 48, address: "Route de Treyfayes 38", latitude: 46.65262, longitude: 6.954635 },
  { id: 49, order: 49, address: "Route de Treyfayes 45", latitude: 46.653207, longitude: 6.953728 },
  { id: 50, order: 50, address: "Route de Treyfayes 51", latitude: 46.653906, longitude: 6.9533 },
  { id: 51, order: 51, address: "Route de Treyfayes 62", latitude: 46.654799, longitude: 6.951941 },
  { id: 52, order: 52, address: "Route de Treyfayes 61", latitude: 46.654427, longitude: 6.951477 },
  { id: 53, order: 53, address: "Route de Treyfayes 56", latitude: 46.654786, longitude: 6.952779 },
  { id: 54, order: 54, address: "Route de Treyfayes 50", latitude: 46.653865, longitude: 6.954104 },
  { id: 55, order: 55, address: "Route d'Estévenens 21", latitude: 46.651308, longitude: 6.959819 }, // ⚠️ approx
  { id: 56, order: 56, address: "Impasse de la Becca 6", latitude: 46.651484, longitude: 6.96631 },
  { id: 57, order: 57, address: "Impasse de la Becca 4", latitude: 46.651302, longitude: 6.965983 },
  { id: 58, order: 58, address: "Impasse de la Becca 5", latitude: 46.651066, longitude: 6.964992 },
  { id: 59, order: 59, address: "Impasse de la Becca 18", latitude: 46.652251, longitude: 6.964684 },
  { id: 60, order: 60, address: "Impasse de la Becca 16", latitude: 46.652383, longitude: 6.96534 },
  { id: 61, order: 61, address: "Route de Rueyres 24", latitude: 46.65132, longitude: 6.966858 },
  { id: 62, order: 62, address: "Route de Rueyres 17", latitude: 46.650966, longitude: 6.968179 },
  { id: 63, order: 63, address: "Route de Rueyres 16", latitude: 46.651222, longitude: 6.969165 },
  { id: 64, order: 64, address: "Route de Rueyres 12", latitude: 46.651247, longitude: 6.969624 },
  { id: 65, order: 65, address: "Route de Rueyres 8", latitude: 46.651963, longitude: 6.969467 },
  { id: 66, order: 66, address: "Route de Rueyres 4", latitude: 46.65102, longitude: 6.970336 },
  { id: 67, order: 67, address: "Route de Romanens 86", latitude: 46.650606, longitude: 6.970679 },
  { id: 68, order: 68, address: "Route de Romanens 89", latitude: 46.650906, longitude: 6.970799 },
  { id: 69, order: 69, address: "Route de Romanens 93", latitude: 46.651236, longitude: 6.971287 },
  { id: 70, order: 70, address: "Route de Romanens 92", latitude: 46.65109, longitude: 6.971857 },
  { id: 71, order: 71, address: "Route de Romanens 90", latitude: 46.650865, longitude: 6.971659 },
  { id: 72, order: 72, address: "Route de Romanens 88", latitude: 46.650705, longitude: 6.971389 },
  { id: 73, order: 73, address: "Route de Romanens 98", latitude: 46.651124, longitude: 6.973333 },
  { id: 74, order: 74, address: "Route de Romanens 96", latitude: 46.651391, longitude: 6.97308 },
  { id: 75, order: 75, address: "Route de Romanens 107A", latitude: 46.640298, longitude: 6.975262 }, // ⚠️ approx
  { id: 76, order: 76, address: "Impasse de la Buchille 5", latitude: 46.652807, longitude: 6.972997 },
  { id: 77, order: 77, address: "Chemin du Clos-Pittet 3", latitude: 46.652879, longitude: 6.972552 },
  { id: 78, order: 78, address: "Chemin du Clos-Pittet 7", latitude: 46.652702, longitude: 6.972065 },
  { id: 79, order: 79, address: "Chemin du Clos-Pittet 9", latitude: 46.652875, longitude: 6.971678 },
  { id: 80, order: 80, address: "Chemin du Clos-Pittet 15", latitude: 46.652833, longitude: 6.970978 },
  { id: 81, order: 81, address: "Chemin du Clos-Pittet 10", latitude: 46.653376, longitude: 6.97171 },
  { id: 82, order: 82, address: "Chemin du Clos-Pittet 8", latitude: 46.653398, longitude: 6.971897 },
  { id: 83, order: 83, address: "Chemin du Clos-Pittet 6", latitude: 46.653206, longitude: 6.972274 },
  { id: 84, order: 84, address: "Chemin du Clos-Pittet 4", latitude: 46.653127, longitude: 6.972627 },
  { id: 85, order: 85, address: "Chemin du Clos-Pittet 2", latitude: 46.653115, longitude: 6.972892 },
  { id: 86, order: 86, address: "Chemin du Clos-Pittet 2C", latitude: 46.65298, longitude: 6.972107 }, // ⚠️ approx
  { id: 87, order: 87, address: "Impasse de la Buchille 25", latitude: 46.653579, longitude: 6.972327 },
  { id: 88, order: 88, address: "Impasse de la Buchille 27", latitude: 46.653727, longitude: 6.972139 },
  { id: 89, order: 89, address: "Impasse de la Buchille 29", latitude: 46.653793, longitude: 6.971705 },
  { id: 90, order: 90, address: "Impasse de la Buchille 31", latitude: 46.654008, longitude: 6.971953 },
  { id: 91, order: 91, address: "Impasse de la Buchille 33", latitude: 46.654397, longitude: 6.971787 },
  { id: 92, order: 92, address: "Impasse de la Buchille 32", latitude: 46.654075, longitude: 6.972526 },
  { id: 93, order: 93, address: "Impasse de la Buchille 30", latitude: 46.654074, longitude: 6.973121 },
  { id: 94, order: 94, address: "Impasse de la Buchille 28", latitude: 46.653759, longitude: 6.972729 },
  { id: 95, order: 95, address: "Impasse de la Buchille 26", latitude: 46.653601, longitude: 6.972969 },
  { id: 96, order: 96, address: "Impasse de la Buchille 24", latitude: 46.653478, longitude: 6.973322 },
  { id: 97, order: 97, address: "Impasse de la Buchille 16", latitude: 46.653491, longitude: 6.973865 },
  { id: 98, order: 98, address: "Impasse de la Buchille 22", latitude: 46.654074, longitude: 6.973749 },
  { id: 99, order: 99, address: "Impasse de la Buchille 14", latitude: 46.653289, longitude: 6.973729 },
  { id: 100, order: 100, address: "Impasse de la Buchille 12", latitude: 46.653141, longitude: 6.973481 },
  { id: 101, order: 101, address: "Impasse de la Buchille 10", latitude: 46.653038, longitude: 6.973895 },
  { id: 102, order: 102, address: "Impasse de la Buchille 8", latitude: 46.652833, longitude: 6.9737 },
  { id: 103, order: 103, address: "Impasse de la Buchille 6", latitude: 46.652821, longitude: 6.97333 },
  { id: 104, order: 104, address: "Impasse de la Buchille 4", latitude: 46.652558, longitude: 6.973358 },
  { id: 105, order: 105, address: "Route de Romanens 107", latitude: 46.652143, longitude: 6.97352 },
  { id: 106, order: 106, address: "Route de Romanens 111", latitude: 46.652266, longitude: 6.974019 },
  { id: 107, order: 107, address: "Route de Romanens 113", latitude: 46.652556, longitude: 6.974001 },
  { id: 108, order: 108, address: "Route de Romanens 115", latitude: 46.652749, longitude: 6.974254 },
  { id: 109, order: 109, address: "Route de Romanens 118", latitude: 46.65263, longitude: 6.974668 },
  { id: 110, order: 110, address: "Route de Romanens 117", latitude: 46.652837, longitude: 6.974491 },
  { id: 111, order: 111, address: "Route de Romanens 119", latitude: 46.653141, longitude: 6.974373 },
  { id: 112, order: 112, address: "Route de Romanens 122", latitude: 46.652852, longitude: 6.975096 },
  { id: 113, order: 113, address: "Route de Romanens 124", latitude: 46.652877, longitude: 6.975143 },
  { id: 114, order: 114, address: "Route de Romanens 126", latitude: 46.640298, longitude: 6.975262 }, // ⚠️ approx
  { id: 115, order: 115, address: "Route de Romanens 128", latitude: 46.652977, longitude: 6.975673 },
  { id: 116, order: 116, address: "Route de Romanens 132", latitude: 46.653071, longitude: 6.975934 },
  { id: 117, order: 117, address: "Route de Romanens 127", latitude: 46.653307, longitude: 6.975649 },
  { id: 118, order: 118, address: "Route de Romanens 134", latitude: 46.653118, longitude: 6.976145 },
  { id: 119, order: 119, address: "Route de Romanens 140", latitude: 46.653223, longitude: 6.976504 },
  { id: 120, order: 120, address: "Route de Romanens 142", latitude: 46.653315, longitude: 6.976989 },
  { id: 121, order: 121, address: "Route de Romanens 146", latitude: 46.653334, longitude: 6.97759 },
  { id: 122, order: 122, address: "Chemin du Haut-des-Roches 34", latitude: 46.653067, longitude: 6.977631 },
  { id: 123, order: 123, address: "Chemin du Haut-des-Roches 29", latitude: 46.653179, longitude: 6.977308 },
  { id: 124, order: 124, address: "Chemin du Haut-des-Roches 30", latitude: 46.652544, longitude: 6.977584 },
  { id: 125, order: 125, address: "Chemin du Haut-des-Roches 27", latitude: 46.653071, longitude: 6.977145 },
  { id: 126, order: 126, address: "Chemin du Haut-des-Roches 26", latitude: 46.652776, longitude: 6.977204 },
  { id: 127, order: 127, address: "Chemin du Haut-des-Roches 24", latitude: 46.652338, longitude: 6.977199 },
  { id: 128, order: 128, address: "Chemin du Haut-des-Roches 22", latitude: 46.652397, longitude: 6.976919 },
  { id: 129, order: 129, address: "Chemin du Haut-des-Roches 21", latitude: 46.652802, longitude: 6.976636 },
  { id: 130, order: 130, address: "Chemin du Haut-des-Roches 20", latitude: 46.65233, longitude: 6.976715 },
  { id: 131, order: 131, address: "Chemin du Haut-des-Roches 18", latitude: 46.652507, longitude: 6.976587 },
  { id: 132, order: 132, address: "Chemin du Haut-des-Roches 19", latitude: 46.652678, longitude: 6.976371 },
  { id: 133, order: 133, address: "Chemin du Haut-des-Roches 17", latitude: 46.652924, longitude: 6.976319 },
  { id: 134, order: 134, address: "Chemin du Haut-des-Roches 14", latitude: 46.652434, longitude: 6.976103 },
  { id: 135, order: 135, address: "Chemin du Haut-des-Roches 11", latitude: 46.652632, longitude: 6.975946 },
  { id: 136, order: 136, address: "Chemin du Haut-des-Roches 10", latitude: 46.652302, longitude: 6.975796 },
  { id: 137, order: 137, address: "Chemin du Haut-des-Roches 9", latitude: 46.652517, longitude: 6.975661 },
  { id: 138, order: 138, address: "Chemin du Haut-des-Roches 8", latitude: 46.651982, longitude: 6.975558 },
  { id: 139, order: 139, address: "Chemin du Haut-des-Roches 6", latitude: 46.652176, longitude: 6.975281 },
  { id: 140, order: 140, address: "Chemin du Haut-des-Roches 4", latitude: 46.652003, longitude: 6.974925 },
  { id: 141, order: 141, address: "Chemin du Haut-des-Roches 2", latitude: 46.652036, longitude: 6.974848 },
  { id: 142, order: 142, address: "Route de Romanens 116", latitude: 46.652345, longitude: 6.974443 },
  { id: 143, order: 143, address: "Route de Romanens 112", latitude: 46.652122, longitude: 6.974188 },
  { id: 144, order: 144, address: "Route de Romanens 110", latitude: 46.651862, longitude: 6.974294 },
  { id: 145, order: 145, address: "Route de Romanens 108", latitude: 46.651951, longitude: 6.97382 },
  { id: 146, order: 146, address: "Route de Romanens 106", latitude: 46.651613, longitude: 6.973956 },
  { id: 147, order: 147, address: "Route de Rueyres 3", latitude: 46.650943, longitude: 6.970084 },
  { id: 148, order: 148, address: "Route de Rueyres 1", latitude: 46.650498, longitude: 6.96517 }, // ⚠️ approx
  { id: 149, order: 149, address: "Route du Moulin 58", latitude: 46.648379, longitude: 6.966328 },
  { id: 150, order: 150, address: "Route de Romanens 71", latitude: 46.647293, longitude: 6.970186 },
  { id: 151, order: 151, address: "Route de Romanens 65", latitude: 46.648506, longitude: 6.972883 },
  { id: 152, order: 152, address: "Route de Romanens 59", latitude: 46.648264, longitude: 6.973854 },
  { id: 153, order: 153, address: "Route de Romanens 57", latitude: 46.648007, longitude: 6.974431 },
  { id: 154, order: 154, address: "Route de Romanens 55", latitude: 46.647853, longitude: 6.974686 },
  { id: 155, order: 155, address: "Route de Romanens 51", latitude: 46.647226, longitude: 6.975247 },
  { id: 156, order: 156, address: "Chemin de la Grotte 4", latitude: 46.646784, longitude: 6.976535 },
  { id: 157, order: 157, address: "Chemin de la Grotte 3", latitude: 46.647123, longitude: 6.976333 },
  { id: 158, order: 158, address: "Chemin de la Grotte 5", latitude: 46.647215, longitude: 6.976663 },
  { id: 159, order: 159, address: "Chemin de la Grotte 37", latitude: 46.648646, longitude: 6.979171 },
  { id: 160, order: 160, address: "Chemin de la Grotte 36", latitude: 46.648014, longitude: 6.979473 },
  { id: 161, order: 161, address: "Chemin de la Grotte 22", latitude: 46.647345, longitude: 6.977877 },
  { id: 162, order: 162, address: "Chemin de la Grotte 24", latitude: 46.647247, longitude: 6.977972 },
  { id: 163, order: 163, address: "Route de Romanens 47", latitude: 46.646914, longitude: 6.975427 },
  { id: 164, order: 164, address: "Route de Romanens 46", latitude: 46.646695, longitude: 6.975862 },
  { id: 165, order: 165, address: "Route de Romanens 43", latitude: 46.646286, longitude: 6.97544 },
  { id: 166, order: 166, address: "Route de Romanens 41", latitude: 46.645999, longitude: 6.975483 },
  { id: 167, order: 167, address: "Route de Romanens 40", latitude: 46.646012, longitude: 6.97625 },
  { id: 168, order: 168, address: "Route de Romanens 39", latitude: 46.645632, longitude: 6.975467 },
  { id: 169, order: 169, address: "Route de Romanens 7", latitude: 46.642024, longitude: 6.97462 },
  { id: 170, order: 170, address: "Route de Romanens 1", latitude: 46.641051, longitude: 6.975455 },
  { id: 171, order: 171, address: "Route de la Rosaire 50", latitude: 46.640305, longitude: 6.975575 },
  { id: 172, order: 172, address: "Route de la Rosaire 48", latitude: 46.640091, longitude: 6.975153 },
  { id: 173, order: 173, address: "Route du Moulin 4", latitude: 46.640635, longitude: 6.974474 },
  { id: 174, order: 174, address: "Route du Moulin 3", latitude: 46.640421, longitude: 6.974247 },
  { id: 175, order: 175, address: "Route du Moulin 19", latitude: 46.64261, longitude: 6.971576 },
  { id: 176, order: 176, address: "Route de Maules 60", latitude: 46.640627, longitude: 6.986761 }, // ⚠️ revisar (Maules)
  { id: 177, order: 177, address: "Route de Maules 66", latitude: 46.641033, longitude: 6.983647 }, // ⚠️ revisar (Maules)
  { id: 178, order: 178, address: "Route de Maules 99", latitude: 46.641033, longitude: 6.983647 }, // ⚠️ revisar (Maules)
  { id: 179, order: 179, address: "Route de Maules 96", latitude: 46.638515, longitude: 6.990887 }, // ⚠️ revisar (Maules)
  { id: 180, order: 180, address: "Route de Maules 92", latitude: 46.638747, longitude: 6.990365 }, // ⚠️ revisar (Maules)
  { id: 181, order: 181, address: "Route du Charpentier 3", latitude: 46.639436, longitude: 6.990506 }, // ⚠️ revisar (Maules)
  { id: 182, order: 182, address: "Route du Charpentier 5", latitude: 46.639614, longitude: 6.990717 }, // ⚠️ revisar (Maules)
  { id: 183, order: 183, address: "Route du Charpentier 7", latitude: 46.639914, longitude: 6.991156 }, // ⚠️ revisar (Maules)
  { id: 184, order: 184, address: "Route du Charpentier 9", latitude: 46.640005, longitude: 6.990808 }, // ⚠️ revisar (Maules)
  { id: 185, order: 185, address: "Route du Charpentier 11", latitude: 46.640101, longitude: 6.990593 }, // ⚠️ revisar (Maules)
  { id: 186, order: 186, address: "Route du Charpentier 15", latitude: 46.640144, longitude: 6.990161 }, // ⚠️ revisar (Maules)
  { id: 187, order: 187, address: "Route du Charpentier 17", latitude: 46.64038, longitude: 6.990753 }, // ⚠️ revisar (Maules)
  { id: 188, order: 188, address: "Route du Charpentier 21", latitude: 46.640264, longitude: 6.99114 }, // ⚠️ revisar (Maules)
  { id: 189, order: 189, address: "Route du Charpentier 23", latitude: 46.640681, longitude: 6.991419 }, // ⚠️ revisar (Maules)
  { id: 190, order: 190, address: "Route du Charpentier 25", latitude: 46.640997, longitude: 6.991755 }, // ⚠️ revisar (Maules)
  { id: 191, order: 191, address: "Route du Charpentier 29", latitude: 46.640283, longitude: 6.991349 }, // ⚠️ revisar (Maules)
  { id: 192, order: 192, address: "Route du Charpentier 31", latitude: 46.639297, longitude: 6.991329 }, // ⚠️ revisar (Maules)
  { id: 193, order: 193, address: "Route de la Forge 3", latitude: 46.638773, longitude: 6.990796 }, // ⚠️ revisar (Maules)
  { id: 194, order: 194, address: "Route de la Forge 4", latitude: 46.638586, longitude: 6.991237 }, // ⚠️ revisar (Maules)
  { id: 195, order: 195, address: "Route de la Forge 7", latitude: 46.639012, longitude: 6.991149 }, // ⚠️ revisar (Maules)
  { id: 196, order: 196, address: "Route de la Forge 13", latitude: 46.639299, longitude: 6.99154 }, // ⚠️ revisar (Maules)
  { id: 197, order: 197, address: "Route de la Forge 16", latitude: 46.639565, longitude: 6.992353 }, // ⚠️ revisar (Maules)
  { id: 198, order: 198, address: "Chemin du Publio 17", latitude: 46.63997, longitude: 6.993197 }, // ⚠️ revisar (Maules)
  { id: 199, order: 199, address: "Chemin du Publio 19", latitude: 46.639961, longitude: 6.992956 }, // ⚠️ revisar (Maules)
  { id: 200, order: 200, address: "Chemin du Publio 21", latitude: 46.639956, longitude: 6.992674 }, // ⚠️ revisar (Maules)
  { id: 201, order: 201, address: "Chemin du Publio 23", latitude: 46.639937, longitude: 6.992452 }, // ⚠️ revisar (Maules)
  { id: 202, order: 202, address: "Chemin du Publio 25", latitude: 46.639933, longitude: 6.992383 }, // ⚠️ revisar (Maules)
  { id: 203, order: 203, address: "Chemin du Publio 27", latitude: 46.639932, longitude: 6.992314 }, // ⚠️ revisar (Maules)
  { id: 204, order: 204, address: "Chemin du Publio 18", latitude: 46.645442, longitude: 7.010032 }, // ⚠️ revisar (Maules)
  { id: 205, order: 205, address: "Chemin du Publio 11", latitude: 46.639846, longitude: 6.993588 }, // ⚠️ revisar (Maules)
  { id: 206, order: 206, address: "Chemin du Publio 12", latitude: 46.639516, longitude: 6.993681 }, // ⚠️ revisar (Maules)
  { id: 207, order: 207, address: "Route de la Forge 19", latitude: 46.639753, longitude: 6.991853 }, // ⚠️ revisar (Maules)
  { id: 208, order: 208, address: "Route de la Forge 38", latitude: 46.640614, longitude: 6.992906 }, // ⚠️ revisar (Maules)
  { id: 209, order: 209, address: "Route de la Forge 40", latitude: 46.640665, longitude: 6.993146 }, // ⚠️ revisar (Maules)
  { id: 210, order: 210, address: "Route de la Forge 59", latitude: 46.641892, longitude: 6.991799 }, // ⚠️ revisar (Maules)
  { id: 211, order: 211, address: "Route de la Forge 63", latitude: 46.642415, longitude: 6.992613 }, // ⚠️ revisar (Maules)
  { id: 212, order: 212, address: "Route de la Forge 72", latitude: 46.642429, longitude: 6.993312 }, // ⚠️ revisar (Maules)
  { id: 213, order: 213, address: "Route de la Forge 60", latitude: 46.641923, longitude: 6.992379 }, // ⚠️ revisar (Maules)
  { id: 214, order: 214, address: "Route de la Forge 58", latitude: 46.641962, longitude: 6.992827 }, // ⚠️ revisar (Maules)
  { id: 215, order: 215, address: "Route de la Forge 56", latitude: 46.641824, longitude: 6.99276 }, // ⚠️ revisar (Maules)
  { id: 216, order: 216, address: "Route de la Forge 54", latitude: 46.641555, longitude: 6.992324 }, // ⚠️ revisar (Maules)
  { id: 217, order: 217, address: "Route de la Forge 52", latitude: 46.641302, longitude: 6.992374 }, // ⚠️ revisar (Maules)
  { id: 218, order: 218, address: "Route de la Forge 48", latitude: 46.64105, longitude: 6.992484 }, // ⚠️ revisar (Maules)
  { id: 219, order: 219, address: "Route de la Forge 42", latitude: 46.640773, longitude: 6.992429 }, // ⚠️ revisar (Maules)
  { id: 220, order: 220, address: "Route de la Forge 34", latitude: 46.640314, longitude: 6.993125 }, // ⚠️ revisar (Maules)
  { id: 221, order: 221, address: "Route de la Forge 8", latitude: 46.63895, longitude: 6.991722 }, // ⚠️ revisar (Maules)
  { id: 222, order: 222, address: "Route de la Forge 10", latitude: 46.64024, longitude: 6.992173 }, // ⚠️ revisar (Maules)
  { id: 223, order: 223, address: "Impasse de la Vuara 3", latitude: 46.635295, longitude: 6.988971 }, // ⚠️ revisar (Maules)
  { id: 224, order: 224, address: "Impasse de la Vuara 7", latitude: 46.635356, longitude: 6.988773 }, // ⚠️ revisar (Maules)
  { id: 225, order: 225, address: "Impasse de la Vuara 9", latitude: 46.635583, longitude: 6.988958 }, // ⚠️ revisar (Maules)
  { id: 226, order: 226, address: "Impasse de la Vuara 11", latitude: 46.635831, longitude: 6.989099 }, // ⚠️ revisar (Maules)
  { id: 227, order: 227, address: "Impasse de la Vuara 15", latitude: 46.636005, longitude: 6.989352 }, // ⚠️ revisar (Maules)
  { id: 228, order: 228, address: "Impasse de la Vuara 14", latitude: 46.635904, longitude: 6.989655 }, // ⚠️ revisar (Maules)
  { id: 229, order: 229, address: "Impasse de la Vuara 12", latitude: 46.635699, longitude: 6.989388 }, // ⚠️ revisar (Maules)
  { id: 230, order: 230, address: "Impasse de la Vuara 22", latitude: 46.635703, longitude: 6.989839 }, // ⚠️ revisar (Maules)
  { id: 231, order: 231, address: "Impasse de la Vuara 20", latitude: 46.63533, longitude: 6.989816 }, // ⚠️ revisar (Maules)
  { id: 232, order: 232, address: "Impasse de la Vuara 18", latitude: 46.635229, longitude: 6.989544 }, // ⚠️ revisar (Maules)
  { id: 233, order: 233, address: "Impasse de la Vuara 16", latitude: 46.63504, longitude: 6.989403 }, // ⚠️ revisar (Maules)
  { id: 234, order: 234, address: "Impasse de la Vuara 8", latitude: 46.635127, longitude: 6.989031 }, // ⚠️ revisar (Maules)
  { id: 235, order: 235, address: "Impasse de la Vuara 6", latitude: 46.634609, longitude: 6.989395 }, // ⚠️ revisar (Maules)
  { id: 236, order: 236, address: "Chemin du Paquier 5", latitude: 46.636716, longitude: 6.990526 }, // ⚠️ revisar (Maules)
  { id: 237, order: 237, address: "Chemin du Paquier 34", latitude: 46.634726, longitude: 6.991399 }, // ⚠️ revisar (Maules)
  { id: 238, order: 238, address: "Chemin du Paquier 13", latitude: 46.636027, longitude: 6.990704 }, // ⚠️ revisar (Maules)
  { id: 239, order: 239, address: "Chemin du Paquier 11", latitude: 46.636001, longitude: 6.99066 }, // ⚠️ revisar (Maules)
  { id: 240, order: 240, address: "Chemin du Paquier 15", latitude: 46.636178, longitude: 6.990909 }, // ⚠️ revisar (Maules)
  { id: 241, order: 241, address: "Chemin du Paquier 12", latitude: 46.635751, longitude: 6.990484 }, // ⚠️ revisar (Maules)
  { id: 242, order: 242, address: "Chemin du Paquier 27", latitude: 46.634726, longitude: 6.991399 }, // ⚠️ revisar (Maules)
  { id: 243, order: 243, address: "Chemin du Paquier 31", latitude: 46.635581, longitude: 6.991698 }, // ⚠️ revisar (Maules)
  { id: 244, order: 244, address: "Chemin du Paquier 45", latitude: 46.634726, longitude: 6.991399 }, // ⚠️ revisar (Maules)
  { id: 245, order: 245, address: "Route des Condémines 2", latitude: 46.638424, longitude: 6.990537 }, // ⚠️ revisar (Maules)
  { id: 246, order: 246, address: "Route des Condémines 4", latitude: 46.638376, longitude: 6.990604 }, // ⚠️ revisar (Maules)
  { id: 247, order: 247, address: "Route des Condémines 1", latitude: 46.638236, longitude: 6.990937 }, // ⚠️ revisar (Maules)
  { id: 248, order: 248, address: "Route des Condémines 5", latitude: 46.633915, longitude: 6.987592 }, // ⚠️ revisar (Maules)
  { id: 249, order: 249, address: "Route des Condémines 20", latitude: 46.636571, longitude: 6.988969 }, // ⚠️ revisar (Maules)
  { id: 250, order: 250, address: "Route des Condémines 22", latitude: 46.636406, longitude: 6.988953 }, // ⚠️ revisar (Maules)
  { id: 251, order: 251, address: "Route des Condémines 30", latitude: 46.635951, longitude: 6.98856 }, // ⚠️ revisar (Maules)
  { id: 252, order: 252, address: "Route des Condémines 28", latitude: 46.636143, longitude: 6.988163 }, // ⚠️ revisar (Maules)
  { id: 253, order: 253, address: "Route des Condémines 26", latitude: 46.636405, longitude: 6.988301 }, // ⚠️ revisar (Maules)
  { id: 254, order: 254, address: "Route des Condémines 24", latitude: 46.636202, longitude: 6.988797 }, // ⚠️ revisar (Maules)
  { id: 255, order: 255, address: "Route des Condémines 36", latitude: 46.635644, longitude: 6.987615 }, // ⚠️ revisar (Maules)
  { id: 256, order: 256, address: "Route des Condémines 32", latitude: 46.635683, longitude: 6.988209 }, // ⚠️ revisar (Maules)
  { id: 257, order: 257, address: "Route des Condémines 40", latitude: 46.635296, longitude: 6.988093 }, // ⚠️ revisar (Maules)
  { id: 258, order: 258, address: "Route des Condémines 42", latitude: 46.635115, longitude: 6.987949 }, // ⚠️ revisar (Maules)
  { id: 259, order: 259, address: "Route des Condémines 50", latitude: 46.634621, longitude: 6.987792 }, // ⚠️ revisar (Maules)
  { id: 260, order: 260, address: "Route des Condémines 46", latitude: 46.634819, longitude: 6.987509 }, // ⚠️ revisar (Maules)
  { id: 261, order: 261, address: "Route des Condémines 9", latitude: 46.633915, longitude: 6.987592 }, // ⚠️ revisar (Maules)
  { id: 262, order: 262, address: "Sur les Crêts 11", latitude: 46.627744, longitude: 6.990617 }, // ⚠️ revisar (Maules)
  { id: 263, order: 263, address: "Sur les Crêts 21", latitude: 46.627744, longitude: 6.990617 }, // ⚠️ revisar (Maules)
  { id: 264, order: 264, address: "Rue de l'Hôtel-de-Ville 41", latitude: 46.624871, longitude: 6.990038 }, // ⚠️ approx
  { id: 265, order: 265, address: "Rue de l'Hôtel-de-Ville 42", latitude: 46.623275, longitude: 6.989122 }, // ⚠️ approx
  { id: 266, order: 266, address: "La Rietta 7", latitude: 46.624016, longitude: 6.991654 }, // ⚠️ approx
  { id: 267, order: 267, address: "La Rietta 9", latitude: 46.623686, longitude: 6.992121 }, // ⚠️ approx
  { id: 268, order: 268, address: "La Rietta 5", latitude: 46.623686, longitude: 6.992121 }, // ⚠️ approx
  { id: 269, order: 269, address: "Chemin de Champ-Lassey 1", latitude: 46.623408, longitude: 6.988679 }, // ⚠️ approx
  { id: 270, order: 270, address: "Chemin de Champ-Lassey 3", latitude: 46.623408, longitude: 6.988679 }, // ⚠️ approx
  { id: 271, order: 271, address: "Chemin de Champ-Lassey 5", latitude: 46.623408, longitude: 6.988679 }, // ⚠️ approx
];
