// Wires up the main screen UI: location, date, and weather display.
import { searchLocations, fetchForecast, describeWeather } from "./weather.js";
import { loadLocation, saveLocation, loadVariants, saveVariants, variantKey } from "./storage.js";
import { getSelectableDates } from "./dates.js";
import { buildRecommendation } from "./recommendation.js";
import {
  RECOMMENDATION_TEXT, REMINDER_TEXT, OUTFIT_DESCRIPTIONS, HALLOWEEN_DESCRIPTION, BASE_DESCRIPTION,
} from "./content.js";

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
const characterArt = document.getElementById("character-art");
const announcer = document.getElementById("outfit-announcer");
const weatherIcon = document.getElementById("weather-icon");
const locationLabel = document.getElementById("location-label");
const dateLabel = document.getElementById("date-label");

// ---------- State ----------
let currentLocation = loadLocation();
let dates = getSelectableDates();
let selectedDate = dates[0];
let forecast = null;      // { today, days } for the current location, or null
let requestId = 0;        // lets a newer request ignore an older, slower one

// ---------- Location ----------
function showLocation() {
  const label = currentLocation ? currentLocation.label : "Choose location";
  locationLabel.textContent = label;
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
  dateLabel.textContent = date.label;
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
// One state object drives the character, weather icon, written text, and reminders, so they
// always agree (Req 4).
function renderRecommendation(day) {
  const key = variantKey(currentLocation, day.iso);
  const { state, variants } = buildRecommendation(day, loadVariants(key));
  saveVariants(key, variants, forecast.today);

  recommendationEl.textContent = RECOMMENDATION_TEXT[state.outfitCategory][state.textVariantIndex];

  outfit = { category: state.outfitCategory, variantIndex: state.outfitVariantIndex };
  renderCharacter();

  // The condition text beside the icon already says the weather, so the icon is decorative
  if (state.conditionCode == null) {
    weatherIcon.hidden = true;
  } else {
    weatherIcon.src = `assets/weather-${describeWeather(state.conditionCode).group}.png`;
    weatherIcon.hidden = false;
  }

  remindersEl.replaceChildren();
  for (const reminder of state.reminders) {
    const row = document.createElement("p");
    row.className = "reminder";
    row.dataset.type = reminder.type;
    const icon = document.createElement("img");
    icon.className = "reminder-icon";
    icon.src = `assets/reminder-${reminder.type}.png`;
    icon.alt = "";
    icon.width = 40;
    icon.height = 40;
    row.append(icon, REMINDER_TEXT[reminder.type][reminder.wordingVariantIndex]);
    remindersEl.append(row);
  }
  remindersEl.hidden = state.reminders.length === 0;
}

// Clears the outputs so nothing stale shows while loading or after an error
function clearRecommendation() {
  recommendationEl.textContent = "";
  outfit = null;
  renderCharacter();
  weatherIcon.hidden = true;
  remindersEl.replaceChildren();
  remindersEl.hidden = true;
}

// ---------- Character art and the hidden Halloween outfit (Req 14) ----------
// A double-action toggles the Halloween outfit: double-tap (touch), double-click (mouse), or
// Enter/Space twice while the character is focused. A reload resets it; changing date or
// location does not.
const DOUBLE_ACTION_MS = 500;
let halloween = false;
let outfit = null;            // { category, variantIndex } from the recommendation, or null
let lastActionAt = 0;

// Picks the image: Halloween, else the recommended outfit, else the plain base character
// (shown before any weather has loaded)
function renderCharacter() {
  let src = "assets/character-base.png";
  let description = BASE_DESCRIPTION;
  if (halloween) {
    src = "assets/outfit-halloween.png";
    description = HALLOWEEN_DESCRIPTION;
  } else if (outfit) {
    src = `assets/outfit-${outfit.category}-${outfit.variantIndex + 1}.png`;
    description = OUTFIT_DESCRIPTIONS[outfit.category][outfit.variantIndex];
  }
  characterArt.src = src;
  characterArt.alt = `Character wearing ${description}`;
}

// Two actions within 500 ms count as one double-action
function registerAction(now = Date.now()) {
  if (now - lastActionAt <= DOUBLE_ACTION_MS) {
    halloween = !halloween;
    renderCharacter();
    announcer.textContent = halloween ? "Halloween outfit on" : "Halloween outfit off";
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
