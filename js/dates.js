// Selectable dates: today plus 7 forecast days (Req 3). Nothing beyond that is offered.
const FORECAST_DAYS = 7;

// Local calendar date as YYYY-MM-DD (avoids the UTC shift of toISOString).
function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Returns 8 entries: [{ iso, label, weekday, isToday }], starting with `today`.
export function getSelectableDates(today = new Date()) {
  const dates = [];
  for (let offset = 0; offset <= FORECAST_DAYS; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    dates.push({
      iso: toIsoDate(date),
      label: offset === 0 ? "Today" : `${weekday}, ${monthDay}`,
      weekday: offset === 0 ? "Today" : weekday,
      monthDay,
      isToday: offset === 0,
    });
  }
  return dates;
}
