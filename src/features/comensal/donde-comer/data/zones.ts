export interface CommercialZone {
  id: string;
  name: string;
  city: string;
  description: string;
  lat: number;
  lng: number;
}

export interface CityOption {
  id: string;
  name: string;
  enabled: boolean;
}

export const SUPPORTED_CITIES: CityOption[] = [
  { id: "quito", name: "Quito", enabled: true },
  { id: "guayaquil", name: "Guayaquil (Próximamente)", enabled: false },
  { id: "cuenca", name: "Cuenca (Próximamente)", enabled: false },
];

export const COMMERCIAL_ZONES: CommercialZone[] = [
  {
    id: "puce",
    name: "Frente a la PUCE",
    city: "quito",
    description: "Av. 12 de Octubre y La Católica · Zona universitaria",
    lat: -0.2115,
    lng: -78.4912,
  },
  {
    id: "floresta",
    name: "La Floresta",
    city: "quito",
    description: "Madrid, Coruña y Redondel · Distrito gastronómico",
    lat: -0.2085,
    lng: -78.487,
  },
  {
    id: "mariscal",
    name: "La Mariscal",
    city: "quito",
    description: "Plaza Foch, Amazonas y Colón · Zona comercial y turística",
    lat: -0.203,
    lng: -78.4925,
  },
  {
    id: "centro",
    name: "Centro Histórico",
    city: "quito",
    description: "San Blas, Plaza del Teatro y Plaza Grande",
    lat: -0.22,
    lng: -78.508,
  },
  {
    id: "cumbaya",
    name: "Cumbayá / USFQ",
    city: "quito",
    description: "Parque Central, Vía Interoceánica y USFQ",
    lat: -0.198,
    lng: -78.435,
  },
  {
    id: "inaquito",
    name: "Iñaquito / La Carolina",
    city: "quito",
    description: "Av. Amazonas, CCI, Quicentro Norte y Parque La Carolina",
    lat: -0.18,
    lng: -78.484,
  },
  {
    id: "epn",
    name: "EPN / Salesiana",
    city: "quito",
    description: "Ladrón de Guevara y Politécnica Nacional",
    lat: -0.212,
    lng: -78.489,
  },
  {
    id: "villaflora",
    name: "Villaflora",
    city: "quito",
    description: "Av. Rodrigo de Chávez y 5 de Junio · Sur de Quito",
    lat: -0.245,
    lng: -78.521,
  },
];

/**
 * Cálculo de distancia Haversine en metros entre dos coordenadas geográficas.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Tiempo estimado caminando a 4.8 km/h (~80 m/min).
 */
export function estimateWalkingTimeMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / 80));
}

