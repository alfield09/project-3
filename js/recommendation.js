// Turns one day of weather into the single recommendation state that drives every
// visual and written output (Req 4). Nothing else decides what to show.

// Thresholds from spec.md / research.md
const REMINDER_THRESHOLDS = { umbrella: 40, sunscreen: 3, hydration: 90 };

// Cold <= 44, Cool 45-59, Mild 60-74, Hot >= 75 (temperature rounded to whole degrees first)
export function categoryFor(temperature) {
  const t = Math.round(temperature);
  if (t <= 44) return "cold";
  if (t <= 59) return "cool";
  if (t <= 74) return "mild";
  return "hot";
}

// Which reminders apply. A missing (null) value never triggers a reminder.
export function remindersFor(day) {
  const reminders = [];
  if (day.precipProbabilityMax != null && day.precipProbabilityMax >= REMINDER_THRESHOLDS.umbrella) reminders.push("umbrella");
  if (day.uvMax != null && day.uvMax >= REMINDER_THRESHOLDS.sunscreen) reminders.push("sunscreen");
  if (day.feelsLikeMax != null && day.feelsLikeMax >= REMINDER_THRESHOLDS.hydration) reminders.push("hydration");
  return reminders;
}

const randomVariant = () => Math.floor(Math.random() * 3); // 0, 1, or 2

// Builds the state for a day. `stored` holds the variation numbers already rolled for this
// location+date ({ outfit, text, reminders: { umbrella: n, ... } }), or null the first time.
// Returns { state, variants }: save `variants` so revisiting the date reproduces the same look.
// Outfit art, recommendation wording, and each reminder's wording are rolled independently (Req 5, 6).
export function buildRecommendation(day, stored) {
  const variants = {
    outfit: stored?.outfit ?? randomVariant(),
    text: stored?.text ?? randomVariant(),
    reminders: { ...stored?.reminders },
  };

  const reminders = remindersFor(day).map((type) => {
    variants.reminders[type] ??= randomVariant();
    return { type, wordingVariantIndex: variants.reminders[type] };
  });

  const state = {
    outfitCategory: categoryFor(day.temperature),
    outfitVariantIndex: variants.outfit,
    textVariantIndex: variants.text,
    reminders,
    conditionCode: day.weatherCode,
    isForecast: day.isForecast,
  };
  return { state, variants };
}
