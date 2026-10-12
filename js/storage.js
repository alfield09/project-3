// localStorage access. Only the most recent location is saved (Req 2).
const LOCATION_KEY = "weatherfit.location";

// Returns the saved location {label, latitude, longitude}, or null.
export function loadLocation() {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_KEY));
  } catch {
    return null; // storage blocked or data corrupted: behave as if nothing saved
  }
}

export function saveLocation(location) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  } catch {
    // storage unavailable: the app still works, it just won't remember
  }
}

// ---------- Per-date variations (Req 7) ----------
// Variation numbers are rolled once per location+date and kept here, so revisiting a date
// (even after a reload) shows the same outfit and wording instead of re-rolling.
const VARIANTS_KEY = "weatherfit.variants";

function readVariants() {
  try {
    return JSON.parse(localStorage.getItem(VARIANTS_KEY)) ?? {};
  } catch {
    return {};
  }
}

// Keys use the calendar date (never "today") and coordinates rounded to ~1 km.
export function variantKey(location, iso) {
  return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}|${iso}`;
}

export function loadVariants(key) {
  return readVariants()[key] ?? null;
}

// Saves variations for one key and drops entries for dates before `todayIso`.
export function saveVariants(key, variants, todayIso) {
  const all = readVariants();
  all[key] = variants;
  for (const existing of Object.keys(all)) {
    if (existing.split("|")[1] < todayIso) delete all[existing];
  }
  try {
    localStorage.setItem(VARIANTS_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable: variations just won't persist
  }
}
