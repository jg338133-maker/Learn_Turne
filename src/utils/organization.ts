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

export function streetNameFromAddress(address: string): string {
  return address.replace(/\s+\d.*$/, "").trim();
}

function sectionName(stops: RouteStop[]): string {
  const names: string[] = [];
  for (const stop of stops) {
    const name = streetNameFromAddress(stop.address);
    if (names[names.length - 1] !== name) names.push(name);
    if (names.length === 2) break;
  }
  return names.join(" · ") || "Secteur";
}

function assignUniqueStreets(sections: RouteSection[], stops: RouteStop[]): RouteSection[] {
  const claimed = new Set<string>();
  return sections.map((section) => {
    const streetNames = [...new Set(stops
      .filter((stop) => stop.order >= section.startOrder && stop.order <= section.endOrder)
      .map((stop) => streetNameFromAddress(stop.address)))]
      .filter((street) => {
        if (claimed.has(street)) return false;
        claimed.add(street);
        return true;
      });
    return { ...section, streetNames };
  });
}

export function createDefaultProfile(
  routeId: string,
  stops: RouteStop[]
): OrganizationProfile {
  if (routeId === "ruta-2") {
    return {
      routeId,
      sections: assignUniqueStreets(ROUTE_136_SECTIONS, stops),
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
      streetNames: [...new Set(slice.map((stop) => streetNameFromAddress(stop.address)))],
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

export function sectionForStop(
  profile: OrganizationProfile,
  stop: RouteStop
): RouteSection | undefined {
  const street = streetNameFromAddress(stop.address);
  const streetMode = profile.sections.some((section) => section.streetNames !== undefined);
  if (streetMode) {
    return profile.sections.find((section) => section.streetNames?.includes(street));
  }
  return sectionForOrder(profile, stop.order);
}

export function withStreetAssignments(
  profile: OrganizationProfile,
  stops: RouteStop[]
): OrganizationProfile {
  if (profile.sections.every((section) => section.streetNames !== undefined)) return profile;
  return {
    ...profile,
    sections: assignUniqueStreets(profile.sections, stops),
  };
}

export function validateProfile(profile: OrganizationProfile): string | null {
  const owners = new Map<string, string>();
  for (const section of profile.sections) {
    if (!section.name.trim()) return `Le secteur ${section.id} n'a pas de nom.`;
    for (const street of section.streetNames ?? []) {
      const owner = owners.get(street);
      if (owner && owner !== section.id) {
        return `La rue « ${street} » est présente dans ${owner} et ${section.id}.`;
      }
      owners.set(street, section.id);
    }
  }
  return null;
}
