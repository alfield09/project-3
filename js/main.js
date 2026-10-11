// Wires up the main screen UI.
import { searchLocations } from "./weather.js";
import { loadLocation, saveLocation } from "./storage.js";

const locationButton = document.getElementById("location-button");
const dialog = document.getElementById("location-dialog");
const form = document.getElementById("location-form");
const input = document.getElementById("location-input");
const message = document.getElementById("location-message");
const resultsList = document.getElementById("location-results");

let currentLocation = loadLocation();
showLocation();

function showLocation() {
  locationButton.textContent = currentLocation ? currentLocation.label : "Choose location";
}

function openDialog() {
  message.textContent = "";
  resultsList.replaceChildren();
  dialog.showModal();
  input.focus();
}

locationButton.addEventListener("click", openDialog);
document.getElementById("location-close").addEventListener("click", () => dialog.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  message.textContent = "Searching…";
  resultsList.replaceChildren();

  try {
    const matches = await searchLocations(query);
    if (matches.length === 0) {
      // Req 10a: keep the previously saved location
      message.textContent = "We couldn't find that US location.";
      return;
    }
    message.textContent = "Choose your location:";
    for (const match of matches) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "control result";
      button.textContent = match.county ? `${match.label} (${match.county})` : match.label;
      button.addEventListener("click", () => chooseLocation(match));
      item.append(button);
      resultsList.append(item);
    }
  } catch {
    message.textContent = "Couldn't reach the location service. Check your connection and try again.";
  }
});

function chooseLocation(match) {
  currentLocation = { label: match.label, latitude: match.latitude, longitude: match.longitude };
  saveLocation(currentLocation);
  showLocation();
  dialog.close();
}

// Device location: only requested when the user taps the button, never on page load (Req 1).
const geolocateButton = document.getElementById("geolocate-button");
const MANUAL_FALLBACK = "You can still search for a US city or ZIP code above.";

geolocateButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showGeolocationProblem(`Your browser doesn't support device location. ${MANUAL_FALLBACK}`);
    return;
  }
  message.textContent = "Finding your location…";
  resultsList.replaceChildren();
  navigator.geolocation.getCurrentPosition(
    (position) => chooseLocation({
      // Open-Meteo has no reverse geocoding, so a device location has no place name
      label: "Current location",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }),
    (error) => {
      const reason = error.code === error.PERMISSION_DENIED
        ? "Location permission was denied."
        : "We couldn't get your device location.";
      showGeolocationProblem(`${reason} ${MANUAL_FALLBACK}`);
    },
    { timeout: 10000 },
  );
});

// Req 11: explain the problem and fall back to manual entry; never fail silently
function showGeolocationProblem(text) {
  message.textContent = text;
  input.focus();
}
