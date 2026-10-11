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
