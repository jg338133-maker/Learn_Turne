import { OrganizationProfile, RouteSection, RouteStop } from "../types";

const ROUTE_136_SECTIONS: RouteSection[] = [
  { id: "A1", name: "Riaz · Pierre-Alex", startOrder: 1, endOrder: 61 },
  { id: "A2", name: "Champ-Francey · Aurore", startOrder: 63, endOrder: 120 },
  { id: "B1", name: "Plaisance · Pervenches · Campanules", startOrder: 121, endOrder: 169 },
  { id: "B2", name: "Coquilles · Longeraye", startOrder: 170, endOrder: 216 },
  { id: "C1", name: "Ogoz · Combes", startOrder: 217, endOrder: 254 },
  { id: "C2", name: "Corna · Fontanette · Champ-Francey", startOrder: 255, endOrder: 290 },
];

export const DEFAULT_SLOT_ORDER = ["A2", "B2", "C2", "A1", "B1", "C1"];

function streetName(address: string): string {
  return address.replace(/\s+\d.*$/, "");
}

function sectionName(stops: RouteStop[]): string {
  const names: string[] = [];
  for (const stop of stops) {
    const name = streetName(stop.address);
    if (names[names.length - 1] !== name) names.push(name);
    if (names.length === 2) break;
  }
  return names.join(" · ") || "Secteur";
}

export function createDefaultProfile(
  routeId: string,
  stops: RouteStop[]
): OrganizationProfile {
  if (routeId === "ruta-2") {
    return {
      routeId,
      sections: ROUTE_136_SECTIONS.map((section) => ({ ...section })),
      slotOrder: [...DEFAULT_SLOT_ORDER],
    };
  }

  const sorted = [...stops].sort((a, b) => a.order - b.order);
  const sections: RouteSection[] = [];
  const ids = ["A1", "A2", "B1", "B2", "C1", "C2"];
  for (let i = 0; i < ids.length; i += 1) {
    const from = Math.floor((i * sorted.length) / ids.length);
    const to = Math.max(from, Math.floor(((i + 1) * sorted.length) / ids.length) - 1);
    const slice = sorted.slice(from, to + 1);
    if (!slice.length) continue;
    sections.push({
      id: ids[i],
      name: sectionName(slice),
      startOrder: slice[0].order,
      endOrder: slice[slice.length - 1].order,
    });
  }
  return { routeId, sections, slotOrder: DEFAULT_SLOT_ORDER.filter((id) => sections.some((s) => s.id === id)) };
}

export function sectionForOrder(
  profile: OrganizationProfile,
  order: number
): RouteSection | undefined {
  return profile.sections.find(
    (section) => order >= section.startOrder && order <= section.endOrder
  );
}

export function validateProfile(profile: OrganizationProfile): string | null {
  for (const section of profile.sections) {
    if (!section.name.trim()) return `Le secteur ${section.id} n'a pas de nom.`;
    if (section.startOrder > section.endOrder) {
      return `La plage de ${section.id} n'est pas valide.`;
    }
  }
  const sorted = [...profile.sections].sort((a, b) => a.startOrder - b.startOrder);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].startOrder <= sorted[i - 1].endOrder) {
      return `Les secteurs ${sorted[i - 1].id} et ${sorted[i].id} se chevauchent.`;
    }
  }
  return null;
}
