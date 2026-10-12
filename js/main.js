// Wires up the main screen UI: location, date, and weather display.
import { searchLocations, fetchForecast, describeWeather } from "./weather.js";
import { loadLocation, saveLocation, loadVariants, saveVariants, variantKey } from "./storage.js";
import { getSelectableDates } from "./dates.js";
import { buildRecommendation } from "./recommendation.js";
import { CATEGORY_LABELS, RECOMMENDATION_TEXT, REMINDER_TEXT } from "./content.js";

// ---------- Elements ----------
const locationButton = document.getElementById("location-button");
const locationDialog = document.getElementById("location-dialog");
const locationForm = document.getElementById("location-form");
const locationInput = document.getElementById("location-input");
const locationMessage = document.getElementById("location-message");
const locationResults = document.getElementById("location-results");
const geolocateButton = document.getElementById("geolocate-button");

const dateButton = document.getElementById("date-button");
const dateDialog = document.getElementById("date-dialog");
const dateList = document.getElementById("date-list");
const forecastStrip = document.getElementById("forecast-strip");

const conditions = document.querySelector(".conditions");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const contextEl = document.getElementById("context");
const statusEl = document.getElementById("status");
const retryButton = document.getElementById("retry-button");
const recommendationEl = document.getElementById("recommendation");
const remindersEl = document.getElementById("reminders");
const characterPanel = document.querySelector(".character");
const normalArt = document.getElementById("normal-art");
const halloweenArt = document.getElementById("halloween-art");
const outfitCaption = document.getElementById("outfit-caption");

// ---------- State ----------
let currentLocation = loadLocation();
let dates = getSelectableDates();
let selectedDate = dates[0];
let forecast = null;      // { today, days } for the current location, or null
let requestId = 0;        // lets a newer request ignore an older, slower one

// ---------- Location ----------
function showLocation() {
  const label = currentLocation ? currentLocation.label : "Choose location";
  locationButton.textContent = label;
  // accessible name keeps the visible text first, then says what the button does
  locationButton.setAttribute("aria-label", currentLocation ? `${label}, change location` : label);
}

function chooseLocation(match) {
  currentLocation = { label: match.label, latitude: match.latitude, longitude: match.longitude };
  saveLocation(currentLocation);
  showLocation();
  locationDialog.close();
  loadForecast();
}

locationButton.addEventListener("click", () => {
  locationMessage.textContent = "";
  locationResults.replaceChildren();
  locationDialog.showModal();
  locationInput.focus();
});
document.getElementById("location-close").addEventListener("click", () => locationDialog.close());

locationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = locationInput.value.trim();
  if (!query) return;

  locationMessage.textContent = "Searching…";
  locationResults.replaceChildren();

  try {
    const matches = await searchLocations(query);
    if (matches.length === 0) {
      // Req 10a: keep the previously saved location
      locationMessage.textContent = "We couldn't find that US location.";
      return;
    }
    locationMessage.textContent = "Choose your location:";
    for (const match of matches) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "control result";
      button.textContent = match.county ? `${match.label} (${match.county})` : match.label;
      button.addEventListener("click", () => chooseLocation(match));
      const item = document.createElement("li");
      item.append(button);
      locationResults.append(item);
    }
  } catch {
    locationMessage.textContent = "Couldn't reach the location service. Check your connection and try again.";
  }
});

// Device location: only requested when the user taps the button, never on page load (Req 1).
const MANUAL_FALLBACK = "You can still search for a US city or ZIP code above.";

geolocateButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showGeolocationProblem(`Your browser doesn't support device location. ${MANUAL_FALLBACK}`);
    return;
  }
  locationMessage.textContent = "Finding your location…";
  locationResults.replaceChildren();
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
  locationMessage.textContent = text;
  locationInput.focus();
}

// ---------- Dates ----------
// Builds one button per selectable date in both the picker and the laptop strip.
function renderDates() {
  dateList.replaceChildren();
  forecastStrip.replaceChildren();
  for (const date of dates) {
    const pressed = String(date.iso === selectedDate.iso);
    const high = forecast?.days[date.iso]?.high;

    const pickerButton = document.createElement("button");
    pickerButton.type = "button";
    pickerButton.className = "control result";
    pickerButton.textContent = date.label;
    pickerButton.setAttribute("aria-pressed", pressed);
    pickerButton.addEventListener("click", () => { chooseDate(date); dateDialog.close(); });
    const item = document.createElement("li");
    item.append(pickerButton);
    dateList.append(item);

    const stripButton = document.createElement("button");
    stripButton.type = "button";
    stripButton.className = "control day";
    stripButton.setAttribute("aria-pressed", pressed);
    stripButton.append(date.weekday, document.createElement("br"), date.monthDay);
    // explicit name: the line breaks above would otherwise run the words together for screen readers
    stripButton.setAttribute("aria-label", `${date.weekday}, ${date.monthDay}${high != null ? `, high ${Math.round(high)} degrees` : ""}`);
    if (high != null) stripButton.append(document.createElement("br"), `${Math.round(high)}°F`);
    stripButton.addEventListener("click", () => chooseDate(date));
    forecastStrip.append(stripButton);
  }
}

function chooseDate(date) {
  selectedDate = date;
  dateButton.textContent = date.label;
  dateButton.setAttribute("aria-label", `${date.label}, change date`);
  renderDates();
  renderWeather();
}

dateButton.addEventListener("click", () => dateDialog.showModal());
document.getElementById("date-close").addEventListener("click", () => dateDialog.close());

// The forecast knows the location's own "today", which can differ from the device's date.
function syncToday(todayIso) {
  if (dates[0].iso === todayIso) return;
  const offset = dates.findIndex((date) => date.iso === selectedDate.iso);
  const [year, month, day] = todayIso.split("-").map(Number);
  dates = getSelectableDates(new Date(year, month - 1, day));
  selectedDate = dates[Math.max(offset, 0)];
}

// ---------- Weather ----------
function setStatus(state, text = "") {
  conditions.dataset.state = state;
  statusEl.textContent = text;
  retryButton.hidden = state !== "error";
}

async function loadForecast() {
  if (!currentLocation) {
    forecast = null;
    renderWeather();
    return;
  }
  const thisRequest = ++requestId;
  forecast = null;
  setStatus("loading", "Loading weather…"); // Req 9
  clearRecommendation();
  tempEl.textContent = "--°F";
  conditionEl.textContent = "--";

  try {
    const result = await fetchForecast(currentLocation.latitude, currentLocation.longitude);
    if (thisRequest !== requestId) return; // a newer request replaced this one
    forecast = result;
    syncToday(result.today);
    chooseDate(selectedDate);
  } catch {
    if (thisRequest !== requestId) return;
    forecast = null;
    renderWeather("error");
  }
}

// Shows the selected date's weather, or the matching empty/error state.
function renderWeather(failure) {
  clearRecommendation();
  contextEl.textContent = `${selectedDate.isToday ? "Today (current)" : "Forecast"} · Weather: Open-Meteo`;

  if (!currentLocation) {
    setStatus("empty", "Choose a location to see the forecast.");
    return;
  }
  if (failure === "error") {
    // Req 10: clearly different from loading, with a retry option
    setStatus("error", "We couldn't load the weather. Check your connection and try again.");
    return;
  }
  if (!forecast) return; // still loading

  const day = forecast.days[selectedDate.iso];
  if (!day || day.temperature == null) {
    setStatus("error", "Weather data isn't available for that day. Try again or pick another day.");
    return;
  }
  setStatus("ready");
  tempEl.textContent = `${Math.round(day.temperature)}°F`;
  conditionEl.textContent = day.weatherCode == null ? "--" : describeWeather(day.weatherCode).label;
  renderRecommendation(day);
}

retryButton.addEventListener("click", loadForecast);

// ---------- Recommendation ----------
// One state object drives the character, written text, and reminders, so they always agree (Req 4).
function renderRecommendation(day) {
  const key = variantKey(currentLocation, day.iso);
  const { state, variants } = buildRecommendation(day, loadVariants(key));
  saveVariants(key, variants, forecast.today);

  const category = CATEGORY_LABELS[state.outfitCategory];
  recommendationEl.textContent = RECOMMENDATION_TEXT[state.outfitCategory][state.textVariantIndex];

  // Placeholder art: the real outfit images will be chosen by outfitCategory + outfitVariantIndex
  const outfit = `${category} outfit ${state.outfitVariantIndex + 1} of 3`;
  outfitDescription = outfit;
  characterPanel.dataset.outfit = `${state.outfitCategory}-${state.outfitVariantIndex}`;
  renderCharacter();

  remindersEl.replaceChildren();
  for (const reminder of state.reminders) {
    const row = document.createElement("p");
    row.className = "reminder";
    row.dataset.type = reminder.type;
    const icon = document.createElement("span");
    icon.className = "reminder-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⚠";
    row.append(icon, REMINDER_TEXT[reminder.type][reminder.wordingVariantIndex]);
    remindersEl.append(row);
  }
  remindersEl.hidden = state.reminders.length === 0;
}

// Clears the written outputs so nothing stale shows while loading or after an error
function clearRecommendation() {
  recommendationEl.textContent = "";
  outfitDescription = "";
  renderCharacter();
  remindersEl.replaceChildren();
  remindersEl.hidden = true;
}

// ---------- Hidden Halloween outfit (Req 14) ----------
// A double-action toggles it: double-tap (touch), double-click (mouse), or Enter/Space twice
// while the character is focused. A reload resets it; changing date or location does not.
const DOUBLE_ACTION_MS = 500;
let halloween = false;
let outfitDescription = "";   // set by renderRecommendation, e.g. "Hot outfit 2 of 3"
let lastActionAt = 0;

// Shows the normal outfit art or the Halloween art, with a matching caption
function renderCharacter() {
  // SVG elements have no .hidden property, so toggle the attribute
  normalArt.toggleAttribute("hidden", halloween);
  halloweenArt.toggleAttribute("hidden", !halloween);
  if (halloween) {
    outfitCaption.textContent = "Halloween outfit (placeholder art)";
  } else {
    normalArt.setAttribute("aria-label", `Placeholder character wearing ${outfitDescription}`);
    outfitCaption.textContent = outfitDescription ? `${outfitDescription} (placeholder art)` : "";
  }
}

// Two actions within 500 ms count as one double-action
function registerAction(now = Date.now()) {
  if (now - lastActionAt <= DOUBLE_ACTION_MS) {
    halloween = !halloween;
    renderCharacter();
    lastActionAt = 0;
  } else {
    lastActionAt = now;
  }
}

// click covers mouse and touch taps; keydown covers keyboard users
characterPanel.addEventListener("click", () => registerAction());
characterPanel.addEventListener("keydown", (event) => {
  if (event.target !== characterPanel || event.repeat) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault(); // Space would otherwise scroll the page
    registerAction();
  }
});

// ---------- Start ----------
// Last, so every module-level variable above is initialized before the first render
showLocation();
chooseDate(selectedDate);
loadForecast();
