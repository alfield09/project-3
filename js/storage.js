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
