// Talks to Open-Meteo: geocoding (city/ZIP -> coordinates) and, later, forecasts.
import { STATE_ABBREVIATIONS } from "./states.js";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Builds a display label such as "Austin, TX" from a geocoding result.
function makeLabel(result) {
  const state = STATE_ABBREVIATIONS[result.admin1] ?? result.admin1;
  return state ? `${result.name}, ${state}` : result.name;
}

// Returns up to 5 US matches for a city name or ZIP code.
// Resolves to [] when nothing matches; throws if the request itself fails.
export async function searchLocations(query) {
  const params = new URLSearchParams({
    name: query,
    count: "5",
    countryCode: "US",
    language: "en",
    format: "json",
  });
  const response = await fetch(`${GEOCODING_URL}?${params}`);
  if (!response.ok) throw new Error(`Geocoding failed (${response.status})`);

  const data = await response.json();
  return (data.results ?? [])
    .filter((result) => result.country_code === "US")
    .map((result) => ({
      label: makeLabel(result),
      county: result.admin2 ?? "",
      latitude: result.latitude,
      longitude: result.longitude,
    }));
}

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Fetches today + 7 forecast days for a location in one call.
// Returns { today: "YYYY-MM-DD" (the location's own date), days: { [iso]: day } } where each day is
//   { iso, temperature, high, feelsLikeMax, uvMax, precipProbabilityMax, weatherCode, isForecast }
// Temperature rule (spec): today = current temperature; forecast dates = daily high.
// Any value Open-Meteo leaves out is null. Throws if the request fails or has no daily data.
export async function fetchForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code",
    daily: "temperature_2m_max,apparent_temperature_max,uv_index_max,precipitation_probability_max,weather_code",
    temperature_unit: "fahrenheit",
    timezone: "auto",
    forecast_days: "8",
  });
  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok) throw new Error(`Forecast failed (${response.status})`);

  const data = await response.json();
  const daily = data.daily;
  if (!daily?.time?.length) throw new Error("Forecast had no daily data");

  const days = {};
  daily.time.forEach((iso, i) => {
    const isToday = i === 0;
    days[iso] = {
      iso,
      temperature: (isToday ? data.current?.temperature_2m : daily.temperature_2m_max?.[i]) ?? null,
      high: daily.temperature_2m_max?.[i] ?? null,
      feelsLikeMax: daily.apparent_temperature_max?.[i] ?? null,
      uvMax: daily.uv_index_max?.[i] ?? null,
      precipProbabilityMax: daily.precipitation_probability_max?.[i] ?? null,
      weatherCode: (isToday ? data.current?.weather_code : null) ?? daily.weather_code?.[i] ?? null,
      isForecast: !isToday,
    };
  });
  return { today: daily.time[0], days };
}

// Turns a WMO weather code into a label and the icon group it maps to.
export function describeWeather(code) {
  if (code === 0) return { label: "Clear", group: "clear" };
  if (code === 1 || code === 2) return { label: "Partly cloudy", group: "cloudy" };
  if (code === 3) return { label: "Cloudy", group: "cloudy" };
  if (code === 45 || code === 48) return { label: "Fog", group: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", group: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", group: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", group: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", group: "rain" };
  if (code === 85 || code === 86) return { label: "Snow showers", group: "snow" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", group: "thunderstorm" };
  return { label: "Conditions unavailable", group: "cloudy" };
}
