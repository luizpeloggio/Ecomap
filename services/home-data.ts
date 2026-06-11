export interface SocialVulnerabilityData {
  population: number;
  density: number;
  medianAge: number;
  agingIndex: number;
  sexRatio: number;
  incomePerCapita: number;
}

export interface MapMarkerPoint {
  latitude: number;
  longitude: number;
  title: string;
  type: 'park' | 'drinking_water' | 'ecoponto';
}

export interface ResilienceInfrastructureData {
  parksCount: number;
  drinkingWaterCount: number;
  ecopontosCount: number;
  parksList: string[];
  drinkingWaterList: string[];
  ecopontosList: string[];
  points: MapMarkerPoint[];
}

// Natal, RN area is approximately 167.4 km2
const NATAL_AREA_KM2 = 167.4;

export const FALLBACK_VULNERABILITY: SocialVulnerabilityData = {
  population: 751300,
  density: 4488,
  medianAge: 36,
  agingIndex: 65.56,
  sexRatio: 86.91,
  incomePerCapita: 23057.69,
};

export const FALLBACK_RESILIENCE: ResilienceInfrastructureData = {
  parksCount: 42,
  drinkingWaterCount: 7,
  ecopontosCount: 5,
  parksList: [
    "Parque das Dunas",
    "Bosque dos Namorados",
    "Praça das Flores (Flores)",
    "Parque da Cidade Dom Nivaldo Monte",
    "Praça Augusto Severo",
    "Praça Pedro Velho (Cívica)",
    "Parque Alagamar",
    "Praça do Gringos (Ponta Negra)"
  ],
  drinkingWaterList: [
    "Bosque dos Namorados - Setor Administração",
    "Parque da Cidade - Entrada Sul",
    "UFRN - Prédio da Reitoria",
    "UFRN - Centro de Tecnologia",
    "Praça das Flores - Fonte Pública"
  ],
  ecopontosList: [
    "Ecoponto Ponta Negra",
    "Ecoponto Alecrim",
    "Ecoponto Petrópolis",
    "Ecoponto Redinha",
    "Ecoponto Capim Macio"
  ],
  points: [
    { latitude: -5.8116, longitude: -35.1950, title: "Parque das Dunas", type: "park" },
    { latitude: -5.8080, longitude: -35.1920, title: "Bosque dos Namorados", type: "park" },
    { latitude: -5.7836, longitude: -35.1989, title: "Praça das Flores", type: "park" },
    { latitude: -5.8456, longitude: -35.2167, title: "Parque da Cidade Dom Nivaldo Monte", type: "park" },
    { latitude: -5.7925, longitude: -35.1990, title: "Praça Pedro Velho (Cívica)", type: "park" },
    { latitude: -5.8410, longitude: -35.2030, title: "UFRN - Prédio da Reitoria (Hidratação)", type: "drinking_water" },
    { latitude: -5.8085, longitude: -35.1925, title: "Bosque dos Namorados - Setor Adm (Hidratação)", type: "drinking_water" },
    { latitude: -5.8770, longitude: -35.2045, title: "Ecoponto Ponta Negra", type: "ecoponto" },
    { latitude: -5.8080, longitude: -35.2220, title: "Ecoponto Alecrim", type: "ecoponto" },
    { latitude: -5.7890, longitude: -35.2010, title: "Ecoponto Petrópolis", type: "ecoponto" },
    { latitude: -5.7560, longitude: -35.2120, title: "Ecoponto Redinha", type: "ecoponto" },
    { latitude: -5.8540, longitude: -35.2150, title: "Ecoponto Capim Macio", type: "ecoponto" },
  ],
};

export async function fetchSocialVulnerability(): Promise<SocialVulnerabilityData> {
  try {
    // 1. Fetch population from SIDRA Table 9514
    const popRes = await fetch("https://apisidra.ibge.gov.br/values/t/9514/n6/2408102/v/all");
    if (!popRes.ok) throw new Error("Failed to fetch population");
    const popData = await popRes.json();
    
    // The second item in the array contains the actual value in the "V" field
    const populationValue = popData[1]?.V;
    const population = populationValue ? parseInt(populationValue, 10) : FALLBACK_VULNERABILITY.population;
    const density = parseFloat((population / NATAL_AREA_KM2).toFixed(1));

    // 2. Fetch demographic ratios (aging index, median age, sex ratio) from SIDRA Table 9515
    const ratioRes = await fetch("https://apisidra.ibge.gov.br/values/t/9515/n6/2408102/v/all");
    if (!ratioRes.ok) throw new Error("Failed to fetch demographic ratios");
    const ratioData = await ratioRes.json();

    let agingIndex = FALLBACK_VULNERABILITY.agingIndex;
    let medianAge = FALLBACK_VULNERABILITY.medianAge;
    let sexRatio = FALLBACK_VULNERABILITY.sexRatio;

    // Table 9515 returns multiple rows, one for each variable index:
    // D2C "10612" -> Índice de envelhecimento
    // D2C "10613" -> Idade mediana
    // D2C "8845" -> Razão de sexo
    for (const item of ratioData) {
      if (item.D2C === "10612") {
        agingIndex = parseFloat(parseFloat(item.V).toFixed(2));
      } else if (item.D2C === "10613") {
        medianAge = parseInt(item.V, 10);
      } else if (item.D2C === "8845") {
        sexRatio = parseFloat(parseFloat(item.V).toFixed(2));
      }
    }

    // 3. Fetch GDP (PIB) from IBGE Cidades research 29
    const gdpRes = await fetch("https://servicodados.ibge.gov.br/api/v1/pesquisas/29/resultados/2408102");
    let incomePerCapita = FALLBACK_VULNERABILITY.incomePerCapita;
    if (gdpRes.ok) {
      const gdpData = await gdpRes.json();
      // Find item with id: 21912 (which is total PIB in Reais)
      const pibItem = gdpData.find((d: any) => d.id === 21912);
      if (pibItem && pibItem.res && pibItem.res[0]) {
        // Get newest year available
        const values = pibItem.res[0].res;
        const years = Object.keys(values).sort((a, b) => parseInt(b) - parseInt(a));
        if (years.length > 0) {
          const newestPIB = parseFloat(values[years[0]]);
          if (newestPIB > 0) {
            incomePerCapita = parseFloat((newestPIB / population).toFixed(2));
          }
        }
      }
    }

    return {
      population,
      density,
      medianAge,
      agingIndex,
      sexRatio,
      incomePerCapita,
    };
  } catch (error) {
    console.warn("Failed to fetch real social vulnerability indicators, using fallback:", error);
    return FALLBACK_VULNERABILITY;
  }
}

export async function fetchResilienceInfrastructure(): Promise<ResilienceInfrastructureData> {
  try {
    const query = `[out:json][timeout:15];
area["name"="Natal"]["boundary"="administrative"]->.a;
(
  nwr(area.a)["leisure"="park"];
  nwr(area.a)["amenity"="drinking_water"];
  nwr(area.a)["amenity"="recycling"];
);
out center;`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Using a professional User-Agent header to avoid 406 rate-limits
        "User-Agent": "AmbientalNatalApp/1.0 (contact: developer@natalambiental.org)"
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned status ${response.status}`);
    }

    const json = await response.json();
    const elements = json.elements || [];

    const parks: string[] = [];
    const waterPoints: string[] = [];
    const ecopontos: string[] = [];
    const points: MapMarkerPoint[] = [];

    for (const elem of elements) {
      const tags = elem.tags || {};
      const name = tags.name || tags.official_name || "";
      const lat = elem.lat ?? elem.center?.lat;
      const lon = elem.lon ?? elem.center?.lon;
      
      if (tags.leisure === "park") {
        const parkName = name || "Praça sem nome / Espaço Verde";
        parks.push(parkName);
        if (lat && lon) {
          points.push({
            latitude: lat,
            longitude: lon,
            title: parkName,
            type: "park",
          });
        }
      } else if (tags.amenity === "drinking_water") {
        const waterName = name || `Ponto de Hidratação (${lat?.toFixed(4)}, ${lon?.toFixed(4)})`;
        waterPoints.push(waterName);
        if (lat && lon) {
          points.push({
            latitude: lat,
            longitude: lon,
            title: waterName,
            type: "drinking_water",
          });
        }
      } else if (tags.amenity === "recycling") {
        const ecoName = name || `Ecoponto / Ponto de Reciclagem (${lat?.toFixed(4)}, ${lon?.toFixed(4)})`;
        ecopontos.push(ecoName);
        if (lat && lon) {
          points.push({
            latitude: lat,
            longitude: lon,
            title: ecoName,
            type: "ecoponto",
          });
        }
      }
    }

    // Clean lists (unique names, and filter out unnamed to make it look highly professional)
    const uniqueParks = Array.from(new Set(parks))
      .filter(p => p !== "Praça sem nome / Espaço Verde" && p.trim().length > 0)
      .slice(0, 8); // take top 8 named parks for a clean UI list
    
    const uniqueWater = Array.from(new Set(waterPoints)).slice(0, 6);
    const uniqueEco = Array.from(new Set(ecopontos))
      .filter(e => e.trim().length > 0)
      .slice(0, 6);

    return {
      parksCount: parks.length > 0 ? parks.length : FALLBACK_RESILIENCE.parksCount,
      drinkingWaterCount: waterPoints.length > 0 ? waterPoints.length : FALLBACK_RESILIENCE.drinkingWaterCount,
      ecopontosCount: ecopontos.length > 0 ? ecopontos.length : FALLBACK_RESILIENCE.ecopontosCount,
      parksList: uniqueParks.length > 0 ? uniqueParks : FALLBACK_RESILIENCE.parksList,
      drinkingWaterList: uniqueWater.length > 0 ? uniqueWater : FALLBACK_RESILIENCE.drinkingWaterList,
      ecopontosList: uniqueEco.length > 0 ? uniqueEco : FALLBACK_RESILIENCE.ecopontosList,
      points: points.length > 0 ? points : FALLBACK_RESILIENCE.points,
    };
  } catch (error) {
    console.warn("Failed to fetch real resilience infrastructure from Overpass, using fallback:", error);
    return FALLBACK_RESILIENCE;
  }
}
