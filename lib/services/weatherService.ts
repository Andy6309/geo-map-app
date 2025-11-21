/**
 * National Weather Service API integration
 * Based on huntNotes weather service implementation
 */

// NWS API Response Types
export interface NwsValue {
  value: number | null;
  unitCode?: string;
}

export interface NwsPointProperties {
  forecast: string;
  forecastHourly: string;
  observationStations: string;
}

export interface NwsPointResponse {
  properties: NwsPointProperties;
}

export interface NwsForecastPeriod {
  startTime: string;
  temperature: number;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  icon: string;
  relativeHumidity?: NwsValue;
  isDaytime?: boolean;
  name?: string;
}

export interface NwsForecastResponse {
  properties: {
    periods: NwsForecastPeriod[];
  };
}

export interface NwsObservationProperties {
  timestamp: string;
  textDescription: string;
  temperature: NwsValue;
  windChill?: NwsValue;
  relativeHumidity: NwsValue;
  windSpeed: NwsValue;
  windDirection: NwsValue;
  barometricPressure?: NwsValue;
  visibility?: NwsValue;
}

export interface NwsObservationResponse {
  properties: NwsObservationProperties;
}

export interface NwsStationProperties {
  stationIdentifier: string;
}

export interface NwsStationFeature {
  properties: NwsStationProperties;
}

export interface NwsStationsResponse {
  features: NwsStationFeature[];
}

// Weather Snapshot Model
export interface WeatherSnapshot {
  latitude: number;
  longitude: number;
  timestamp: Date;
  fetchedAt: Date;
  
  // Current conditions
  temperatureCelsius: number;
  temperatureFahrenheit: number;
  feelsLikeCelsius?: number;
  feelsLikeFahrenheit?: number;
  highTempFahrenheit?: number;
  lowTempFahrenheit?: number;
  humidity: number; // percentage
  pressureHPa?: number;
  windSpeedMps?: number; // meters per second
  windSpeedMph?: number; // miles per hour
  windDirectionDegrees?: number;
  windDirection?: string;
  precipitationMm?: number;
  cloudCoverPercentage?: number;
  visibilityMeters?: number;
  
  // Conditions
  condition: string;
  description: string;
  iconUrl?: string;
  
  // Astronomical data
  sunrise?: Date;
  sunset?: Date;
  moonPhase?: string;
  moonIllumination?: number; // 0-100 percentage
  moonrise?: Date;
  moonset?: Date;
  
  // Metadata
  source: string;
  expiresAt: Date;
}

// Astronomical data interface
export interface AstronomicalData {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dayLength: number; // minutes
  moonPhase: string;
  moonPhaseCode?: string;
  moonIllumination: number; // 0-100
  moonFraction?: number; // 0-1
  moonAgeDays?: number;
  moonDayNumber?: number;
  moonDayName?: string;
  moonrise?: Date;
  moonset?: Date;
  moonOverhead?: Date;
  moonUnderfoot?: Date;
}

// Weather Settings
const WEATHER_SETTINGS = {
  baseUrl: 'https://api.weather.gov',
  userAgent: 'GeoMapApp/1.0 (geospatial mapping application)',
  cacheDurationMinutes: 60,
};

const MOON_DAY_NAMES = [
  'New Moon',
  'Waxing Crescent 1',
  'Waxing Crescent 2',
  'Waxing Crescent 3',
  'Waxing Crescent 4',
  'Waxing Crescent 5',
  'Waxing Crescent 6',
  'First Quarter',
  'Waxing Gibbous 1',
  'Waxing Gibbous 2',
  'Waxing Gibbous 3',
  'Waxing Gibbous 4',
  'Waxing Gibbous 5',
  'Waxing Gibbous 6',
  'Full Moon',
  'Waning Gibbous 1',
  'Waning Gibbous 2',
  'Waning Gibbous 3',
  'Waning Gibbous 4',
  'Waning Gibbous 5',
  'Waning Gibbous 6',
  'Last (Third) Quarter',
  'Waning Crescent 1',
  'Waning Crescent 2',
  'Waning Crescent 3',
  'Waning Crescent 4',
  'Waning Crescent 5',
  'Waning Crescent 6',
  'Waning Crescent 7',
  'Waning Crescent 8'
];

// Simple in-memory cache
const weatherCache = new Map<string, WeatherSnapshot>();

/**
 * Validate if coordinates are within the United States
 * NWS API only works for US locations
 */
export function isWithinUnitedStates(latitude: number, longitude: number): boolean {
  // Continental US bounds
  const CONUS_MIN_LATITUDE = 24.396308;
  const CONUS_MAX_LATITUDE = 49.384358;
  const CONUS_MIN_LONGITUDE = -125.0;
  const CONUS_MAX_LONGITUDE = -66.93457;
  
  // Alaska bounds
  const ALASKA_MIN_LATITUDE = 51.0;
  const ALASKA_MAX_LATITUDE = 71.5;
  const ALASKA_MIN_LONGITUDE = -179.0;
  const ALASKA_MAX_LONGITUDE = -129.0;
  
  // Hawaii bounds
  const HAWAII_MIN_LATITUDE = 18.0;
  const HAWAII_MAX_LATITUDE = 23.0;
  const HAWAII_MIN_LONGITUDE = -161.0;
  const HAWAII_MAX_LONGITUDE = -154.0;
  
  // Puerto Rico bounds
  const PR_MIN_LATITUDE = 17.5;
  const PR_MAX_LATITUDE = 18.5;
  const PR_MIN_LONGITUDE = -67.5;
  const PR_MAX_LONGITUDE = -65.0;
  
  // Check Continental US
  if (latitude >= CONUS_MIN_LATITUDE && latitude <= CONUS_MAX_LATITUDE &&
      longitude >= CONUS_MIN_LONGITUDE && longitude <= CONUS_MAX_LONGITUDE) {
    return true;
  }
  
  // Check Alaska
  if (latitude >= ALASKA_MIN_LATITUDE && latitude <= ALASKA_MAX_LATITUDE &&
      longitude >= ALASKA_MIN_LONGITUDE && longitude <= ALASKA_MAX_LONGITUDE) {
    return true;
  }
  
  // Check Hawaii
  if (latitude >= HAWAII_MIN_LATITUDE && latitude <= HAWAII_MAX_LATITUDE &&
      longitude >= HAWAII_MIN_LONGITUDE && longitude <= HAWAII_MAX_LONGITUDE) {
    return true;
  }
  
  // Check Puerto Rico
  if (latitude >= PR_MIN_LATITUDE && latitude <= PR_MAX_LATITUDE &&
      longitude >= PR_MIN_LONGITUDE && longitude <= PR_MAX_LONGITUDE) {
    return true;
  }
  
  return false;
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9 / 5) + 32;
}

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5 / 9;
}

/**
 * Convert meters per second to miles per hour
 */
export function mpsToMph(mps: number): number {
  return mps * 2.23694;
}

/**
 * Convert kilometers per hour to meters per second
 */
export function kmhToMps(kmh: number): number {
  return kmh / 3.6;
}

/**
 * Parse wind speed string from NWS (e.g., "10 mph" or "5 to 10 mph")
 */
export function parseWindSpeed(windSpeed: string | undefined): number {
  if (!windSpeed) return 0;
  
  const parts = windSpeed.split(' ');
  if (parts.length > 0) {
    const speed = parseFloat(parts[0]);
    if (!isNaN(speed)) return speed;
  }
  
  return 0;
}

/**
 * Convert wind direction string to degrees
 */
export function windDirectionToDegrees(direction: string | undefined): number | undefined {
  if (!direction) return undefined;
  
  const directionMap: Record<string, number> = {
    'N': 0, 'NNE': 22, 'NE': 45, 'ENE': 67,
    'E': 90, 'ESE': 112, 'SE': 135, 'SSE': 157,
    'S': 180, 'SSW': 202, 'SW': 225, 'WSW': 247,
    'W': 270, 'WNW': 292, 'NW': 315, 'NNW': 337,
  };
  
  return directionMap[direction.toUpperCase()];
}

/**
 * Convert wind direction degrees to cardinal direction
 */
export function degreesToWindDirection(degrees: number | undefined): string {
  if (degrees === undefined || degrees === null) return 'N/A';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(latitude: number, longitude: number): Promise<WeatherSnapshot | null> {
  // Validate location
  if (!isWithinUnitedStates(latitude, longitude)) {
    throw new Error('Weather data is only available for locations within the United States and territories.');
  }
  
  try {
    // Step 1: Get the grid point data for the location
    const pointUrl = `${WEATHER_SETTINGS.baseUrl}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointResponse = await fetch(pointUrl, {
      headers: {
        'User-Agent': WEATHER_SETTINGS.userAgent,
        'Accept': 'application/geo+json',
      },
    });
    
    if (!pointResponse.ok) {
      console.error('Failed to fetch point data:', pointResponse.statusText);
      return null;
    }
    
    const pointData: NwsPointResponse = await pointResponse.json();
    
    if (!pointData.properties) {
      console.error('No point data found');
      return null;
    }
    
    // Step 2: Get current observations from the nearest station
    const observationUrl = pointData.properties.observationStations;
    const stationsResponse = await fetch(observationUrl, {
      headers: {
        'User-Agent': WEATHER_SETTINGS.userAgent,
        'Accept': 'application/geo+json',
      },
    });
    
    if (!stationsResponse.ok) {
      console.error('Failed to fetch stations:', stationsResponse.statusText);
      return null;
    }
    
    const stationsData: NwsStationsResponse = await stationsResponse.json();
    
    let snapshot: WeatherSnapshot | null = null;
    
    if (stationsData.features && stationsData.features.length > 0) {
      const stationId = stationsData.features[0].properties.stationIdentifier;
      
      if (stationId) {
        const latestObsUrl = `${WEATHER_SETTINGS.baseUrl}/stations/${stationId}/observations/latest`;
        const obsResponse = await fetch(latestObsUrl, {
          headers: {
            'User-Agent': WEATHER_SETTINGS.userAgent,
            'Accept': 'application/geo+json',
          },
        });
        
        if (obsResponse.ok) {
          const obsData: NwsObservationResponse = await obsResponse.json();
          
          if (obsData.properties) {
            snapshot = mapObservationToSnapshot(obsData.properties, latitude, longitude);
          }
        }
      }
    }
    
    // If no observation data, use forecast data
    if (!snapshot) {
      const forecastUrl = pointData.properties.forecast;
      const forecastResponse = await fetch(forecastUrl, {
        headers: {
          'User-Agent': WEATHER_SETTINGS.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (forecastResponse.ok) {
        const forecastData: NwsForecastResponse = await forecastResponse.json();
        
        if (forecastData.properties?.periods && forecastData.properties.periods.length > 0) {
          snapshot = mapForecastToSnapshot(forecastData.properties.periods[0], latitude, longitude);
        }
      }
    }
    
    // Add astronomical data
    if (snapshot) {
      const astroData = getAstronomicalData(latitude, longitude);
      snapshot.sunrise = astroData.sunrise;
      snapshot.sunset = astroData.sunset;
      snapshot.moonPhase = astroData.moonPhase;
      snapshot.moonIllumination = astroData.moonIllumination;
      snapshot.moonrise = astroData.moonrise;
      snapshot.moonset = astroData.moonset;
      
      // Cache the result
      const cacheKey = getCacheKey(latitude, longitude);
      weatherCache.set(cacheKey, snapshot);
    }
    
    return snapshot;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Get hourly forecast for a location
 */
export async function getForecast(latitude: number, longitude: number, hours: number = 24): Promise<WeatherSnapshot[]> {
  // Validate location
  if (!isWithinUnitedStates(latitude, longitude)) {
    throw new Error('Weather data is only available for locations within the United States and territories.');
  }
  
  try {
    const pointUrl = `${WEATHER_SETTINGS.baseUrl}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointResponse = await fetch(pointUrl, {
      headers: {
        'User-Agent': WEATHER_SETTINGS.userAgent,
        'Accept': 'application/geo+json',
      },
    });
    
    if (!pointResponse.ok) {
      return [];
    }
    
    const pointData: NwsPointResponse = await pointResponse.json();
    
    if (!pointData.properties) {
      return [];
    }
    
    const forecastUrl = pointData.properties.forecastHourly;
    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        'User-Agent': WEATHER_SETTINGS.userAgent,
        'Accept': 'application/geo+json',
      },
    });
    
    if (!forecastResponse.ok) {
      return [];
    }
    
    const forecastData: NwsForecastResponse = await forecastResponse.json();
    
    if (!forecastData.properties?.periods) {
      return [];
    }
    
    const snapshots = forecastData.properties.periods
      .slice(0, hours)
      .map(period => mapForecastToSnapshot(period, latitude, longitude));
    
    return snapshots;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
}

/**
 * Get weekly (7-day) forecast for a location
 */
export async function getWeeklyForecast(latitude: number, longitude: number): Promise<WeatherSnapshot[]> {
  // Validate location
  if (!isWithinUnitedStates(latitude, longitude)) {
    throw new Error('Weather data is only available for locations within the United States and territories.');
  }
  
  try {
    const pointUrl = `${WEATHER_SETTINGS.baseUrl}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointResponse = await fetch(pointUrl, {
      headers: {
        'User-Agent': WEATHER_SETTINGS.userAgent,
        'Accept': 'application/geo+json',
      },
    });
    
    if (!pointResponse.ok) {
      return [];
    }
    
    const pointData: NwsPointResponse = await pointResponse.json();
    
    if (!pointData.properties) {
      return [];
    }
    
    // Use regular forecast (not hourly) for weekly view
    const forecastUrl = pointData.properties.forecast;
    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        'User-Agent': WEATHER_SETTINGS.userAgent,
        'Accept': 'application/geo+json',
      },
    });
    
    if (!forecastResponse.ok) {
      return [];
    }
    
    const forecastData: NwsForecastResponse = await forecastResponse.json();
    
    if (!forecastData.properties?.periods) {
      return [];
    }
    
    // NWS returns day/night periods, take up to 14 periods (7 days)
    const snapshots = forecastData.properties.periods
      .slice(0, 14)
      .map(period => mapForecastToSnapshot(period, latitude, longitude));
    
    return snapshots;
  } catch (error) {
    console.error('Error fetching weekly forecast:', error);
    return [];
  }
}

/**
 * Get cached weather or fetch if expired
 */
export async function getCachedWeather(latitude: number, longitude: number): Promise<WeatherSnapshot | null> {
  const cacheKey = getCacheKey(latitude, longitude);
  const cached = weatherCache.get(cacheKey);
  
  if (cached) {
    const age = Date.now() - cached.fetchedAt.getTime();
    const maxAge = WEATHER_SETTINGS.cacheDurationMinutes * 60 * 1000;
    
    if (age < maxAge) {
      console.log('Returning cached weather');
      return cached;
    }
  }
  
  return getCurrentWeather(latitude, longitude);
}

/**
 * Map NWS observation to WeatherSnapshot
 */
function mapObservationToSnapshot(obs: NwsObservationProperties, lat: number, lon: number): WeatherSnapshot {
  const tempC = obs.temperature?.value ?? 0;
  const tempF = celsiusToFahrenheit(tempC);
  const feelsLikeC = obs.windChill?.value ?? tempC;
  const feelsLikeF = celsiusToFahrenheit(feelsLikeC);
  
  // NWS observation wind speed is in km/h, convert to m/s and mph
  const windSpeedKmh = obs.windSpeed?.value ?? 0;
  const windSpeedMps = kmhToMps(windSpeedKmh);
  const windSpeedMph = mpsToMph(windSpeedMps);
  
  const windDirDegrees = obs.windDirection?.value ?? undefined;
  const windDir = windDirDegrees !== undefined ? degreesToWindDirection(windDirDegrees) : undefined;
  
  return {
    latitude: lat,
    longitude: lon,
    timestamp: new Date(obs.timestamp),
    fetchedAt: new Date(),
    temperatureCelsius: tempC,
    temperatureFahrenheit: tempF,
    feelsLikeCelsius: feelsLikeC,
    feelsLikeFahrenheit: feelsLikeF,
    humidity: Math.round(obs.relativeHumidity?.value ?? 0),
    pressureHPa: obs.barometricPressure?.value ? obs.barometricPressure.value / 100 : undefined, // Convert Pa to hPa
    windSpeedMps: windSpeedMps,
    windSpeedMph: windSpeedMph,
    windDirectionDegrees: windDirDegrees,
    windDirection: windDir,
    condition: obs.textDescription ?? 'Unknown',
    description: obs.textDescription ?? '',
    visibilityMeters: obs.visibility?.value ?? undefined,
    source: 'NWS Observation',
    expiresAt: new Date(Date.now() + WEATHER_SETTINGS.cacheDurationMinutes * 60 * 1000),
  };
}

/**
 * Map NWS forecast period to WeatherSnapshot
 */
function mapForecastToSnapshot(period: NwsForecastPeriod, lat: number, lon: number): WeatherSnapshot {
  const tempF = period.temperature ?? 0;
  const tempC = fahrenheitToCelsius(tempF);
  
  const windSpeedMph = parseWindSpeed(period.windSpeed);
  const windSpeedMps = windSpeedMph / 2.23694;
  
  const windDirDegrees = windDirectionToDegrees(period.windDirection);
  const windDir = period.windDirection ?? undefined;
  
  return {
    latitude: lat,
    longitude: lon,
    timestamp: new Date(period.startTime),
    fetchedAt: new Date(),
    temperatureCelsius: tempC,
    temperatureFahrenheit: tempF,
    humidity: Math.round(period.relativeHumidity?.value ?? 0),
    windSpeedMps: windSpeedMps,
    windSpeedMph: windSpeedMph,
    windDirectionDegrees: windDirDegrees,
    windDirection: windDir,
    condition: period.shortForecast ?? 'Unknown',
    description: period.detailedForecast ?? '',
    iconUrl: period.icon,
    source: 'NWS Forecast',
    expiresAt: new Date(Date.now() + WEATHER_SETTINGS.cacheDurationMinutes * 60 * 1000),
  };
}

/**
 * Generate cache key for coordinates
 */
function getCacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

/**
 * Calculate sunrise and sunset times
 * More accurate algorithm based on astronomical formulas
 */
export function calculateSunriseSunset(latitude: number, longitude: number, date: Date = new Date()): { sunrise: Date; sunset: Date; solarNoon: Date } {
  const lw = -longitude * Math.PI / 180;
  const phi = latitude * Math.PI / 180;
  
  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);
  const Jnoon = solarTransitJ(ds, M, L);
  
  const h0 = -0.833 * Math.PI / 180; // Sunrise angle (accounts for refraction)
  
  const Jset = getSetJ(h0, lw, phi, dec, n, M, L);
  const Jrise = Jnoon - (Jset - Jnoon);
  
  return {
    sunrise: fromJulian(Jrise),
    sunset: fromJulian(Jset),
    solarNoon: fromJulian(Jnoon)
  };
}

// Astronomical helper functions
const dayMs = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;
const e = Math.PI / 180 * 23.4397; // obliquity of the Earth
const MINUTES_PER_DAY = 24 * 60;
const MOON_SAMPLE_STEP_MINUTES = 5;
const MOON_ALTITUDE_CORRECTION = 0.133 * Math.PI / 180; // refraction + moon radius

function toJulian(date: Date): number {
  return date.valueOf() / dayMs - 0.5 + J1970;
}

function fromJulian(j: number): Date {
  return new Date((j + 0.5 - J1970) * dayMs);
}

function toDays(date: Date): number {
  return toJulian(date) - J2000;
}

function getStartOfDayInTimezone(date: Date, timezoneOffsetMinutes: number): Date {
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return new Date(utcMidnight + timezoneOffsetMinutes * 60 * 1000);
}

function rightAscension(l: number, b: number): number {
  return Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
}

function declination(l: number, b: number): number {
  return Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
}

function azimuth(H: number, phi: number, dec: number): number {
  return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
}

function altitude(H: number, phi: number, dec: number): number {
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}

function siderealTime(d: number, lw: number): number {
  return (280.16 + 360.9856235 * d) * Math.PI / 180 - lw;
}

function solarMeanAnomaly(d: number): number {
  return (357.5291 + 0.98560028 * d) * Math.PI / 180;
}

function eclipticLongitude(M: number): number {
  const C = (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) * Math.PI / 180;
  const P = (102.9372 * Math.PI / 180);
  return M + C + P + Math.PI;
}

function julianCycle(d: number, lw: number): number {
  return Math.round(d - 0.0009 - lw / (2 * Math.PI));
}

function approxTransit(Ht: number, lw: number, n: number): number {
  return 0.0009 + (Ht + lw) / (2 * Math.PI) + n;
}

function solarTransitJ(ds: number, M: number, L: number): number {
  return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngle(h: number, phi: number, d: number): number {
  return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
}

function getSetJ(h: number, lw: number, phi: number, dec: number, n: number, M: number, L: number): number {
  const w = hourAngle(h, phi, dec);
  const a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}

/**
 * Calculate moon phase, illumination, and fraction of lunar cycle
 */
export function calculateMoonPhase(date: Date = new Date()): { phase: string; phaseCode: string; illumination: number; age: number; fraction: number; dayNumber: number; dayName: string } {
  const synodicMonth = 29.530588853; // average length of lunar cycle in days
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14); // reference new moon (Jan 6 2000)
  const currentUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  
  const daysSinceNew = (currentUtc - knownNewMoon) / (1000 * 60 * 60 * 24);
  let fraction = (daysSinceNew / synodicMonth) % 1;
  if (fraction < 0) fraction += 1;
  
  const age = fraction * synodicMonth;
  const illumination = ((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100;

  let dayNumber = Math.floor(age);
  const cycleLength = MOON_DAY_NAMES.length;
  if (dayNumber >= cycleLength) {
    dayNumber = dayNumber % cycleLength;
  }
  if (dayNumber < 0) {
    dayNumber = (dayNumber % cycleLength + cycleLength) % cycleLength;
  }
  const dayName = MOON_DAY_NAMES[dayNumber] ?? 'New Moon';
  
  const phaseBreaks = [
    { threshold: 0.0625, name: 'New Moon', code: 'NM' },
    { threshold: 0.1875, name: 'Waxing Crescent', code: 'WC' },
    { threshold: 0.3125, name: 'First Quarter', code: 'FQ' },
    { threshold: 0.4375, name: 'Waxing Gibbous', code: 'WG' },
    { threshold: 0.5625, name: 'Full Moon', code: 'FM' },
    { threshold: 0.6875, name: 'Waning Gibbous', code: 'WNG' },
    { threshold: 0.8125, name: 'Last Quarter', code: 'LQ' },
    { threshold: 0.9375, name: 'Waning Crescent', code: 'WNC' }
  ];
  
  let phaseName = 'New Moon';
  let phaseCode = 'NM';
  for (const phase of phaseBreaks) {
    if (fraction < phase.threshold) {
      phaseName = phase.name;
      phaseCode = phase.code;
      break;
    }
    // Wrap around to New Moon if past last threshold
    phaseName = 'New Moon';
    phaseCode = 'NM';
  }
  
  return { phase: phaseName, phaseCode, illumination, age, fraction, dayNumber, dayName };
}

/**
 * Calculate moonrise and moonset times via high-resolution sampling
 */
export function calculateMoonriseMoonset(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezoneOffsetMinutes: number = date.getTimezoneOffset()
): { moonrise?: Date; moonset?: Date } {
  const startDate = getStartOfDayInTimezone(date, timezoneOffsetMinutes);
  const baseDay = toDays(startDate);

  const sampleAltitude = (minutes: number) => {
    const fractionOfDay = minutes / MINUTES_PER_DAY;
    return getMoonPosition(baseDay + fractionOfDay, latitude, longitude).altitude - MOON_ALTITUDE_CORRECTION;
  };

  let previousAltitude = sampleAltitude(0);
  let previousMinute = 0;
  let moonriseMinutes: number | undefined;
  let moonsetMinutes: number | undefined;

  for (let minute = MOON_SAMPLE_STEP_MINUTES; minute <= MINUTES_PER_DAY; minute += MOON_SAMPLE_STEP_MINUTES) {
    const altitude = sampleAltitude(minute);

    if (moonriseMinutes === undefined && previousAltitude < 0 && altitude >= 0) {
      const ratio = previousAltitude / (previousAltitude - altitude);
      moonriseMinutes = previousMinute + ratio * MOON_SAMPLE_STEP_MINUTES;
    }

    if (moonsetMinutes === undefined && previousAltitude > 0 && altitude <= 0) {
      const ratio = previousAltitude / (previousAltitude - altitude);
      moonsetMinutes = previousMinute + ratio * MOON_SAMPLE_STEP_MINUTES;
    }

    if (moonriseMinutes !== undefined && moonsetMinutes !== undefined) {
      break;
    }

    previousAltitude = altitude;
    previousMinute = minute;
  }

  return {
    moonrise: moonriseMinutes !== undefined ? new Date(startDate.getTime() + moonriseMinutes * 60 * 1000) : undefined,
    moonset: moonsetMinutes !== undefined ? new Date(startDate.getTime() + moonsetMinutes * 60 * 1000) : undefined,
  };
}

function calculateMoonTransits(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezoneOffsetMinutes: number = date.getTimezoneOffset()
): { moonOverhead?: Date; moonUnderfoot?: Date } {
  const startDate = getStartOfDayInTimezone(date, timezoneOffsetMinutes);
  const baseDay = toDays(startDate);

  const sampleAltitude = (minutes: number) => {
    const fraction = minutes / MINUTES_PER_DAY;
    return getMoonPosition(baseDay + fraction, latitude, longitude).altitude;
  };

  let maxAltitude = -Infinity;
  let minAltitude = Infinity;
  let maxMinute = 0;
  let minMinute = 0;

  for (let minute = 0; minute <= MINUTES_PER_DAY; minute += MOON_SAMPLE_STEP_MINUTES) {
    const altitude = sampleAltitude(minute);
    if (altitude > maxAltitude) {
      maxAltitude = altitude;
      maxMinute = minute;
    }
    if (altitude < minAltitude) {
      minAltitude = altitude;
      minMinute = minute;
    }
  }

  // Refine extrema within +- step window at 1-minute resolution
  const refineExtremum = (initialMinute: number, comparator: 'max' | 'min') => {
    const start = Math.max(0, initialMinute - MOON_SAMPLE_STEP_MINUTES);
    const end = Math.min(MINUTES_PER_DAY, initialMinute + MOON_SAMPLE_STEP_MINUTES);
    let bestMinute = initialMinute;
    let bestAltitude = comparator === 'max' ? -Infinity : Infinity;

    for (let minute = start; minute <= end; minute += 1) {
      const altitude = sampleAltitude(minute);
      if ((comparator === 'max' && altitude > bestAltitude) || (comparator === 'min' && altitude < bestAltitude)) {
        bestAltitude = altitude;
        bestMinute = minute;
      }
    }

    return bestMinute;
  };

  const refinedMaxMinute = refineExtremum(maxMinute, 'max');
  const refinedMinMinute = refineExtremum(minMinute, 'min');

  return {
    moonOverhead: new Date(startDate.getTime() + refinedMaxMinute * 60 * 1000),
    moonUnderfoot: new Date(startDate.getTime() + refinedMinMinute * 60 * 1000),
  };
}

/**
 * Get moon position for a given date and location
 */
function getMoonPosition(d: number, lat: number, lng: number): { altitude: number; azimuth: number; distance: number } {
  const lw = -lng * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const c = getMoonCoords(d);
  
  const H = siderealTime(d, lw) - c.ra;
  let h = altitude(H, phi, c.dec);
  
  // Altitude correction for refraction
  h = h + 0.017 * Math.PI / 180 / Math.tan(h + 10.26 * Math.PI / 180 / (h + 5.10 * Math.PI / 180));
  
  return {
    azimuth: azimuth(H, phi, c.dec),
    altitude: h,
    distance: c.dist
  };
}

/**
 * Get moon coordinates
 */
function getMoonCoords(d: number): { ra: number; dec: number; dist: number } {
  const L = (218.316 + 13.176396 * d) * Math.PI / 180; // ecliptic longitude
  const M = (134.963 + 13.064993 * d) * Math.PI / 180; // mean anomaly
  const F = (93.272 + 13.229350 * d) * Math.PI / 180;  // mean distance
  
  const l = L + 6.289 * Math.PI / 180 * Math.sin(M); // longitude
  const b = 5.128 * Math.PI / 180 * Math.sin(F);     // latitude
  const dt = 385001 - 20905 * Math.cos(M);  // distance to the moon in km
  
  return {
    ra: rightAscension(l, b),
    dec: declination(l, b),
    dist: dt
  };
}

/**
 * Get astronomical data for a location
 */
export function getAstronomicalData(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezoneOffsetMinutes: number = date.getTimezoneOffset()
): AstronomicalData {
  const sunTimes = calculateSunriseSunset(latitude, longitude, date);
  const moonData = calculateMoonPhase(date);
  const moonTimes = calculateMoonriseMoonset(latitude, longitude, date, timezoneOffsetMinutes);
  const transits = calculateMoonTransits(latitude, longitude, date, timezoneOffsetMinutes);
  
  const dayLength = (sunTimes.sunset.getTime() - sunTimes.sunrise.getTime()) / (1000 * 60); // minutes
  
  return {
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    solarNoon: sunTimes.solarNoon,
    dayLength,
    moonPhase: moonData.phase,
    moonPhaseCode: moonData.phaseCode,
    moonIllumination: moonData.illumination,
    moonFraction: moonData.fraction,
    moonAgeDays: moonData.age,
    moonDayNumber: moonData.dayNumber,
    moonDayName: moonData.dayName,
    moonrise: moonTimes.moonrise,
    moonset: moonTimes.moonset,
    moonOverhead: transits.moonOverhead,
    moonUnderfoot: transits.moonUnderfoot
  };
}


