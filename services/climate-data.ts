export interface MonthClimate {
  month: string;
  temperature: number;
  precipitation: number;
}

export interface YearClimate {
  year: number;
  data: MonthClimate[];
  avgTemp: number;
  totalPrecipitation: number;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Natal typical precipitations per month (base) in mm
const BASE_PRECIPITATION = [60, 90, 180, 240, 220, 320, 250, 130, 60, 20, 20, 30];

// Natal typical temperatures per month (base) in °C
const BASE_TEMPERATURE = [27, 27.5, 27.5, 27, 26.5, 25.5, 24.5, 25, 25.5, 26.5, 27, 27];

function generateClimateData(): YearClimate[] {
  const years: YearClimate[] = [];
  const currentYear = new Date().getFullYear(); // Using 2024 roughly
  const endYear = 2024;
  const startYear = endYear - 70; // 1954

  for (let year = startYear; year <= endYear; year++) {
    // Add a global warming trend over the 70 years: +1.2°C over 70 years
    const warmingTrend = ((year - startYear) / 70) * 1.2;

    let totalPrecip = 0;
    let sumTemp = 0;
    const monthlyData: MonthClimate[] = [];

    // Simple pseudo-random using year as seed for consistency
    const seed = year * 1337;
    const random = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    for (let m = 0; m < 12; m++) {
      // Precipitation varies between -30% and +30%
      const precipVariation = 0.7 + random(m) * 0.6;
      const precipitation = Math.max(0, BASE_PRECIPITATION[m] * precipVariation);

      // Temperature varies +/- 0.8 degrees
      const tempVariation = -0.8 + random(m + 12) * 1.6;
      const temperature = BASE_TEMPERATURE[m] + warmingTrend + tempVariation;

      monthlyData.push({
        month: MONTHS[m],
        temperature: parseFloat(temperature.toFixed(1)),
        precipitation: Math.round(precipitation),
      });

      totalPrecip += precipitation;
      sumTemp += temperature;
    }

    years.push({
      year,
      data: monthlyData,
      avgTemp: parseFloat((sumTemp / 12).toFixed(1)),
      totalPrecipitation: Math.round(totalPrecip),
    });
  }

  // Return in descending order so the newest year is first
  return years.reverse();
}

export const CLIMATE_DATA = generateClimateData();

export async function fetchRealClimateData(): Promise<YearClimate[]> {
  try {
    // Latitude and longitude for Natal, RN
    const lat = -5.79448;
    const lon = -35.211;
    
    // We will query the past 6 full years (2018 to 2023)
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2018-01-01&end_date=2023-12-31&daily=temperature_2m_mean,precipitation_sum&timezone=America/Fortaleza`
    );
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const json = await response.json();
    const daily = json.daily;
    if (!daily || !daily.time) {
      throw new Error("Invalid response payload from Open-Meteo");
    }

    // yearMonthMap: { [year: number]: { [month: number]: { temps: number[], precips: number } } }
    const yearMonthMap: Record<number, Record<number, { temps: number[]; precipSum: number }>> = {};

    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i];
      const temp = daily.temperature_2m_mean[i];
      const precip = daily.precipitation_sum[i];

      if (!dateStr) continue;
      
      // Parse YYYY-MM-DD safely
      const parts = dateStr.split('-');
      if (parts.length !== 3) continue;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed month

      if (isNaN(year) || isNaN(month)) continue;

      if (!yearMonthMap[year]) {
        yearMonthMap[year] = {};
      }
      if (!yearMonthMap[year][month]) {
        yearMonthMap[year][month] = { temps: [], precipSum: 0 };
      }

      if (typeof temp === "number" && !isNaN(temp)) {
        yearMonthMap[year][month].temps.push(temp);
      }
      if (typeof precip === "number" && !isNaN(precip)) {
        yearMonthMap[year][month].precipSum += precip;
      }
    }

    const yearsList: YearClimate[] = [];

    for (const yearStr of Object.keys(yearMonthMap)) {
      const year = parseInt(yearStr, 10);
      const monthsData = yearMonthMap[year];
      const monthlyData: MonthClimate[] = [];
      let yearTempSum = 0;
      let yearTempCount = 0;
      let yearPrecipSum = 0;

      for (let m = 0; m < 12; m++) {
        const monthInfo = monthsData[m];
        const monthName = MONTHS[m];
        
        let avgTemp = 0;
        let totalPrecip = 0;

        if (monthInfo) {
          if (monthInfo.temps.length > 0) {
            const sum = monthInfo.temps.reduce((acc, val) => acc + val, 0);
            avgTemp = parseFloat((sum / monthInfo.temps.length).toFixed(1));
            yearTempSum += sum;
            yearTempCount += monthInfo.temps.length;
          } else {
            avgTemp = BASE_TEMPERATURE[m];
          }
          totalPrecip = Math.round(monthInfo.precipSum);
          yearPrecipSum += monthInfo.precipSum;
        } else {
          avgTemp = BASE_TEMPERATURE[m];
          totalPrecip = BASE_PRECIPITATION[m];
        }

        monthlyData.push({
          month: monthName,
          temperature: avgTemp,
          precipitation: totalPrecip,
        });
      }

      const avgTemp = yearTempCount > 0 
        ? parseFloat((yearTempSum / yearTempCount).toFixed(1)) 
        : parseFloat((monthlyData.reduce((acc, m) => acc + m.temperature, 0) / 12).toFixed(1));

      yearsList.push({
        year,
        data: monthlyData,
        avgTemp,
        totalPrecipitation: Math.round(yearPrecipSum),
      });
    }

    // Sort descending by year
    yearsList.sort((a, b) => b.year - a.year);
    
    if (yearsList.length > 0) {
      return yearsList;
    }
    return CLIMATE_DATA;
  } catch (error) {
    console.warn("Failed to fetch real climate data, falling back to static:", error);
    return CLIMATE_DATA;
  }
}

export interface AtmosphericDynamicsData {
  windSpeed: number;
  windDirection: number;
  relativeHumidity: number;
  surfacePressure: number;
  uvIndex: number;
  cloudCover: number;
  temperature: number;
}

export const FALLBACK_ATMOSPHERIC: AtmosphericDynamicsData = {
  windSpeed: 22.4,
  windDirection: 115,
  relativeHumidity: 72,
  surfacePressure: 1013,
  uvIndex: 8.5,
  cloudCover: 40,
  temperature: 28.2,
};

export async function fetchAtmosphericDynamics(): Promise<AtmosphericDynamicsData> {
  try {
    const lat = -5.79448;
    const lon = -35.211;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,cloud_cover&timezone=America/Fortaleza`
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const json = await response.json();
    const current = json.current;
    if (!current) {
      throw new Error("Invalid response format");
    }

    return {
      windSpeed: current.wind_speed_10m ?? FALLBACK_ATMOSPHERIC.windSpeed,
      windDirection: current.wind_direction_10m ?? FALLBACK_ATMOSPHERIC.windDirection,
      relativeHumidity: current.relative_humidity_2m ?? FALLBACK_ATMOSPHERIC.relativeHumidity,
      surfacePressure: current.surface_pressure ?? FALLBACK_ATMOSPHERIC.surfacePressure,
      uvIndex: current.uv_index ?? FALLBACK_ATMOSPHERIC.uvIndex,
      cloudCover: current.cloud_cover ?? FALLBACK_ATMOSPHERIC.cloudCover,
      temperature: current.temperature_2m ?? FALLBACK_ATMOSPHERIC.temperature,
    };
  } catch (error) {
    console.warn("Failed to fetch real-time atmospheric dynamics, using fallback:", error);
    return FALLBACK_ATMOSPHERIC;
  }
}

export interface AirQualityData {
  pm25: number;
  pm10: number;
  co: number;
  o3: number;
  no2: number;
  so2: number;
}

export const FALLBACK_AIR_QUALITY: AirQualityData = {
  pm25: 8.5,
  pm10: 12.2,
  co: 180,
  o3: 35.5,
  no2: 4.2,
  so2: 1.5,
};

export async function fetchAirQuality(): Promise<AirQualityData> {
  try {
    const lat = -5.79448;
    const lon = -35.211;
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide&timezone=America/Fortaleza`
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const json = await response.json();
    const current = json.current;
    if (!current) {
      throw new Error("Invalid response format");
    }

    return {
      pm25: current.pm2_5 ?? FALLBACK_AIR_QUALITY.pm25,
      pm10: current.pm10 ?? FALLBACK_AIR_QUALITY.pm10,
      co: current.carbon_monoxide ?? FALLBACK_AIR_QUALITY.co,
      o3: current.ozone ?? FALLBACK_AIR_QUALITY.o3,
      no2: current.nitrogen_dioxide ?? FALLBACK_AIR_QUALITY.no2,
      so2: current.sulphur_dioxide ?? FALLBACK_AIR_QUALITY.so2,
    };
  } catch (error) {
    console.warn("Failed to fetch real-time air quality, using fallback:", error);
    return FALLBACK_AIR_QUALITY;
  }
}
