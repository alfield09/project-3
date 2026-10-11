# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved research, project brief, and hand-drawn screen designs into testable requirements.

## Instructions for the Developer

Make and approve the product decisions, draw every proposed screen, provide the drawings to the Agent, and keep this file current as the intended result changes.

To begin, open the project repository in a fresh chat and enter:

`Read ./spec.md and help me begin the Project 3 specification.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, and this file. Review the screen drawings the Developer provides. Ask one focused question at a time, surface gaps and trade-offs without inventing requirements, and keep the specification concise and testable.

## Goal

State what the app should help its Users accomplish and name the user story or stories that define that need.

Help college students quickly decide what to wear each day by turning the current or forecasted weather for their chosen US location into a character-driven outfit recommendation, with helpful reminders (umbrella, sunscreen, hydration) when conditions call for them.

Grounded in the user story from `research.md`: "As a college student checking the weather each morning, I want to quickly see what to wear based on the day's forecast, so that I can get dressed appropriately without having to interpret raw weather data myself."

## Screen designs

Draw every proposed screen by hand, in both phone and laptop layouts, on paper, a tablet, a whiteboard, or another hand-drawing surface. Save photos or exports in `reference/`, provide them to the Agent, and link them here. Use the drawings to define layout, hierarchy, controls, navigation, and important interaction states.

**Main screen — phone:** [IMG_0205.jpeg](reference/IMG_0205.jpeg). Portrait, single column: Location/Date controls at top, Temp/Condition, character illustration (fills most of the screen), written clothing recommendation below it, a Reminder callout, and an (i) info button at the bottom for one-handed thumb reach.

**Main screen — laptop:** [IMG_0204.jpeg](reference/IMG_0204.jpeg). Landscape, uses the wider screen: same top bar and character illustration, but the Reminder is placed beside the character instead of stacked below it, and a 7-day forecast strip (tap a date to preview) runs alongside — content the phone layout doesn't show. Info button in the corner.

**Info screen — phone and laptop:** [IMG_0206.jpeg](reference/IMG_0206.jpeg). One layout reused for both sizes (simple scrollable text stack, no responsive restructuring needed): Back button and "Info" label at top, then creator credit, weather-data source (Open-Meteo), a brief explanation of how recommendations work (temp bands, UV, PoP, feels-like temperature) with a link to the methodology, a privacy statement (location saved on-device only), and art credits (AI-generated).

## Requirements

Translate every fixed brief requirement and the selected research-driven feature into a testable requirement. Define the chosen behavior, content, controls, current and forecast data, responsive layout, accessibility, error handling, privacy, credits, and deployment. The main screen should make clear the location, date, units, data source, and whether conditions are current or forecast. Include an acceptance check for each requirement.

**Location & date**
1. User can enter a US location manually (city/zip) or use device geolocation (requested only on explicit user action, never on page load).
2. Only the most recently used location is saved (on-device, e.g. localStorage) — no server storage, no history of past locations.
3. User can select "today" or any forecast date up to 7 days out; dates beyond that are not selectable.
*Acceptance: entering a location and reloading the page shows that same location pre-filled; selecting a date 8+ days out is not possible in the UI.*

**Recommendation state**
4. For a given location + date, one recommendation state (derived from Open-Meteo's temp, UV index, precipitation probability, and feels-like temperature) determines the character's outfit, the weather icon, the written recommendation text, and any reminders — all four always agree with each other.
*Acceptance: changing the date changes all four together; none can show a mismatched combination (e.g., winter coat with a "hot" written recommendation).*

**Content variation**
5. Each of the 4 temperature categories (Cold/Cool/Mild/Hot) has 3 outfit-art variations and 3 written-recommendation wordings, chosen independently at random.
6. Each reminder (umbrella/sunscreen/hydration) has 3 wording variations, chosen independently at random, and reminders only appear when their threshold is met (PoP ≥ 40%, UV ≥ 3, feels-like temperature ≥ 90°F).
7. Returning to a previously selected date (same session or after reload) shows the exact same outfit/wording/reminder variations as before — the random choice is rolled once and stored per date+location, not re-rolled.
*Acceptance: selecting the same date twice (including after a page reload) never shows a different variation than the first time.*

**Info screen**
8. Info screen shows: creator name, weather-data source (Open-Meteo, with link), a plain-language explanation of the recommendation method (temp bands/UV/PoP/feels-like temperature) with a link to the cited sources in research.md, a privacy statement (location stored on-device only, never sent to a server), and art credits (AI-generated, tool disclosed).

**Error/loading/permission handling**
9. Loading state shown while fetching weather data.
10. If the weather API fails or returns no temperature, show a clear error message distinct from the loading state, with a retry option. If only UV or precipitation probability is missing, still show the outfit and treat the missing value as "no reminder".
10a. If a manually entered location is not found or is not in the US, show "We couldn't find that US location" and keep the previously saved location.
11. If geolocation permission is denied, show a message explaining manual entry is still available, and fall back to the manual-entry control — never a silent failure.

**Main-screen context**
16. The main screen always shows the resolved place name (e.g., "Austin, TX"), the date labeled "Today (current)" or "Forecast", the temperature with °F, and a small "Weather: Open-Meteo" credit.
*Acceptance: every state of the main screen shows all four items; switching from today to a forecast date changes the label.*

**Responsive & accessibility**
12. Phone layout matches IMG_0205 (one-handed, bottom-reachable controls); laptop layout matches IMG_0204 (uses extra width for the 7-day strip + side-by-side reminder).
13. All interactive elements are at least 44×44px with at least 3:1 contrast against their background (per WCAG guidance in research.md).
13a. Body text has at least 4.5:1 contrast. Every control works by keyboard with a visible focus ring. The character and icons have alt text stating the outfit and conditions; the written recommendation is real text.
*Acceptance: tabbing reaches every control in a logical order with a visible focus; contrast checker passes; a screen reader announces the outfit and conditions.*

**Additional feature**
14. Double-tapping the character on the main screen reveals a hidden Halloween outfit variation, replacing the normal outfit art until the same double-action is repeated or the screen is reloaded. Works by double-tap (touch), double-click (laptop), and pressing Enter or Space twice within 500 ms while the character is focused.
*Acceptance: each of the three inputs toggles the Halloween outfit on and off.*

**Deployment**
15. App is deployed to a public HTTPS URL via GitHub Pages, matching this approved spec.

## Recommendation state and data flow

Define the weather inputs, recommendation categories, coded rules, and shared state. Weather values must come from the provider, and rules must follow the weather guidance cited in `research.md`. The selected location, date, and live weather data must produce one recommendation state that drives every visual and written output.

```
Inputs (from Open-Meteo, per location + date):
  - temperature (°F): today = current temperature; forecast dates = daily high
  - UV index: daily max (today and forecast)
  - precipitation probability (%): daily max (today and forecast)
  - feels-like temperature (°F): Open-Meteo apparent_temperature, daily max (today and forecast)
  - condition code (clear/cloudy/rain/snow/etc., for the weather icon)

Coded rules:
  outfitCategory =  (temp rounded to whole °F first)
    temp <= 44  -> "cold"
    45-59       -> "cool"
    60-74       -> "mild"
    75+         -> "hot"

  reminders = [
    "umbrella"  if precipProbability >= 40
    "sunscreen" if uvIndex >= 3
    "hydration" if feelsLikeTemp >= 90
  ]

Recommendation state (one object per location+date, variant indices stored so re-visits match):
  {
    outfitCategory,       // drives character art + written text pool
    outfitVariantIndex,   // 0-2, random but stored
    reminders[],          // each with its own wordingVariantIndex, 0-2, random but stored
    conditionCode,        // drives weather icon
    isForecast: bool      // true if date != today
  }
```

This single state object is what both the character display and the written/reminder text read from — nothing else independently decides what to show. The `outfitVariantIndex` and each reminder's `wordingVariantIndex` are generated once (with `Math.random()`, the first time that `location+date` is viewed) and stored in localStorage keyed on `location+date`, so revisiting the same date — even after a reload — reproduces the same state instead of re-rolling.

## Content variation

Define at least three outfit variations for each recommendation category and at least three wording variations for each reminder type. Define how outfit and reminder variations are chosen independently at random, and how a previously selected date keeps the same variations, including whether they persist after the page reloads.

- 4 outfit categories (Cold/Cool/Mild/Hot) × 3 outfit-art variations each = 12 outfit assets, plus 3 written-recommendation wordings per category.
- 3 reminder types (umbrella/sunscreen/hydration) × 3 wording variations each.
- Each variation (`outfitVariantIndex`, each reminder's `wordingVariantIndex`) is chosen independently at random the first time a given location+date is viewed, then stored in localStorage keyed on `location+date`. Revisiting that same date — including after a full page reload — reads the stored indices instead of re-rolling, so the same outfit and wording always reappear for that date.

## Assets

List every art and graphical asset: the character, each outfit variation, icons, and any other visuals. For each, note where it appears, its format, and whether it will be created, generated, or licensed, with its credit or license.

All assets below: AI-generated (sketched/hand-drawn illustration style per research.md's Visual direction decision), PNG with transparent background, credited on the info screen as "AI-generated" with the generating tool named.

| Asset | Count | Appears on |
|---|---|---|
| Base character | 1 | Main screen |
| Outfit variations (Cold) | 3 | Main screen, character display |
| Outfit variations (Cool) | 3 | Main screen, character display |
| Outfit variations (Mild) | 3 | Main screen, character display |
| Outfit variations (Hot) | 3 | Main screen, character display |
| Hidden Halloween outfit | 1 | Main screen, double-tap easter egg |
| Weather condition icons (clear, cloudy, rain, snow, thunderstorm, fog) | 6 | Main screen, near temp/condition |
| Reminder icons (umbrella, sunscreen, hydration) | 3 | Main screen, reminder callout |
| UI chrome icons (location pin, calendar/date, back arrow, info (i)) | 4 | Main + info screens |

Total: 27 distinct sketched-style assets.

## Out of scope

Record features intentionally excluded from this project.

- Non-US locations
- Forecast dates beyond 7 days
- User accounts, login, or cross-device sync (only on-device, most-recent-location storage)
- Multiple saved/favorite locations or location history
- Manual outfit customization (outfits are always weather-driven, never user-picked, unlike WeatherFit's approach)
- Push notifications or scheduled reminders
- Offline support / cached forecasts without connectivity
- Languages other than English

## Revisions

After implementation or testing, record requirement changes and the evidence that prompted them. Update the screen drawings when a material layout or interaction changes.

- 2026-10-11: Req 16 (place name) — a location from device geolocation is labeled "Current location" instead of a place name. Evidence: Open-Meteo has no reverse-geocoding endpoint, and the alternative (a second service) would send coordinates to another third party. Developer chose the "Current location" label. Manually entered locations still show "City, ST".

## Approval

The Developer reviews and explicitly approves this specification and its screen designs before planning begins.

- [x] Approved by the Developer on 2026-10-11.

## Saving the transcript

After the Developer approves the specification, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
