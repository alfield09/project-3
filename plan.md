# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved specification into an ordered, trackable build and verification plan.

## Instructions for the Developer

Set priorities, review the checklist, verify results rather than relying only on the Agent's report, and keep the project documents current as the work changes. Expect the build to take many rounds of testing and fixing; record material changes under Revisions.

To begin planning, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me create the Project 3 implementation plan.`

After approving the plan, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me implement the approved Project 3 plan in working checkpoints.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, `spec.md`, and this file, then inspect the relevant project files. Propose concrete tasks and checks without expanding the approved scope.

During implementation, follow the approved plan in working checkpoints and keep it current. Never mark approvals or items requiring Developer verification complete on the Developer's behalf.

## Approach

Summarize the structure, data flow, dependencies, task order, and main risks.

**Stack:** Plain HTML/CSS/JS, no framework or build step — deploys directly to GitHub Pages. Two static pages (`index.html` for the main screen, `info.html` for the info screen), sharing a CSS file and JS modules.

**Structure:**
- `index.html` / `info.html` — markup for each screen
- `styles.css` — shared styles, including responsive breakpoints (phone vs. laptop) and accessible touch-target/contrast rules
- `js/weather.js` — fetches geocoding (city/zip → lat/lon via Open-Meteo's free Geocoding API) and forecast data from Open-Meteo
- `js/recommendation.js` — turns weather data into the recommendation state object (outfitCategory, variant indices, reminders) defined in `spec.md`
- `js/storage.js` — reads/writes the most-recent location and the per-date recommendation state to localStorage
- `js/main.js` — wires up the main screen UI to the above modules
- `assets/` — the 27 AI-generated art assets listed in `spec.md`

**Data flow:** user location/date input → geocode (if manual entry) → fetch Open-Meteo forecast → compute recommendation state → store in localStorage keyed by location+date → render character art, weather icon, written text, and reminders from that one state object.

**Weather fields:** Today uses `current` temperature; forecast dates use daily `temperature_2m_max`. UV, precipitation probability, and feels-like all use daily max (`uv_index_max`, `precipitation_probability_max`, `apparent_temperature_max`). Feels-like is a proxy for the NWS heat index and is disclosed as such on the info screen.

**Dependencies:** Open-Meteo weather API, Open-Meteo Geocoding API, browser Geolocation API, localStorage. No npm packages required.

**Task order:** static layout first (both screens, both screen sizes) using placeholder art and mock data, then wire up real weather data, then recommendation logic and content variation, then persistence, then error/loading/permission states, then accessibility pass, then deploy, then usability testing.

**Main risks:** Open-Meteo Geocoding API may return ambiguous matches for common city names (needs a disambiguation step, e.g. showing state alongside city); AI-generated art taking longer than expected if initial generations don't match the sketched style consistently; localStorage key design needs to handle both "today" (which changes meaning day-to-day) and fixed forecast dates without collisions, so keys use the calendar date, never the word "today"; feels-like is only a proxy for the NWS heat index, so the info screen must say so.

## Checklist

### Approvals

- [ ] Research approved
- [ ] Specification approved
- [ ] Plan approved

### Build

- [ ] Create or source the assets listed in `spec.md`, starting early
- [x] Scaffold the project (`index.html`, `info.html`, `styles.css`, `js/` modules, `assets/` folder)
- [x] Verify the Open-Meteo fields: one real call each to the geocoding and forecast APIs, confirming the fields in "Weather fields" exist and results can be limited to the US
- [x] Deploy the scaffolded skeleton to GitHub Pages (public HTTPS) and confirm it loads; redeploy at each later checkpoint
- [x] Build the main screen's static layout for phone, using placeholder art, matching IMG_0205
- [x] Build the main screen's static layout for laptop, using placeholder art, matching IMG_0204
- [x] Build the info screen's static layout (shared across phone/laptop), matching IMG_0206
- [ ] Implement manual location entry with geocoding (Open-Meteo Geocoding API)
- [ ] Implement device geolocation entry, requested only on explicit user action
- [ ] Implement date selection (today + up to 7 forecast days)
- [ ] Fetch current and forecast weather data from Open-Meteo for the selected location/date (today = current temperature; forecast = daily high; UV, PoP, feels-like = daily max)
- [ ] Implement the recommendation-state logic per `spec.md`: Cold ≤44, Cool 45–59, Mild 60–74, Hot ≥75 (rounded °F); umbrella PoP ≥40, sunscreen UV ≥3, hydration feels-like ≥90
- [ ] Show the main-screen context (Req 16): place name, "Today (current)" / "Forecast" label, °F, and the "Weather: Open-Meteo" credit
- [ ] Implement independently-randomized outfit and reminder wording variation, rolled once and stored per location+date
- [ ] Implement localStorage persistence for most-recent location and per-date recommendation state
- [ ] Swap in the real AI-generated art assets for the character, outfits, and icons
- [ ] Implement the hidden Halloween outfit (double-tap, double-click, and Enter/Space twice within 500 ms)
- [ ] Implement loading, API-error/retry, denied-geolocation-permission, location-not-found/non-US (Req 10a), and partial-data (missing UV or PoP = no reminder) states
- [ ] Fill in the info screen's real content (creator, data source, methodology, privacy, art credits)
- [ ] Pass an accessibility check (44×44px targets, 3:1 control and 4.5:1 text contrast, keyboard operation with visible focus, alt text) on both screens and sizes
- [ ] Use the approved screen drawings to guide layout and interaction work
- [ ] Keep one recommendation state driving every visual and written output
- [ ] Test and fix each checkpoint against the specification before starting the next
- [ ] Commit meaningful working checkpoints
- [ ] Confirm the final build is deployed at the public HTTPS URL

### Verify and revise

- [ ] Check every specification requirement
- [ ] Test multiple locations, current and forecast dates, recommendation categories, outfit and reminder variations, and failure states
- [ ] Verify that eligible outfit and reminder variations are selected independently rather than as fixed pairs
- [ ] Verify that returning to a previously selected date shows the same variations
- [ ] Test an unknown location, a non-US location, and a response missing UV or PoP
- [ ] Complete a keyboard-only pass (including the Halloween outfit) and a screen-reader pass
- [ ] Test the deployed app, independently of the local version, on a real phone and a laptop, including both screens, accessibility, and one-handed controls
- [ ] Prepare the usability test below
- [ ] Test with three peers and record each session
- [ ] Add the chosen improvement to this checklist, and update `spec.md` if the intended result changes
- [ ] Implement, verify, and redeploy at least one meaningful revision

### Deliver

- [ ] Confirm all brief deliverables, sources, privacy information, and asset credits
- [ ] Save all chat transcripts
- [ ] Complete the debrief

## Usability testing

Before testing, record the purpose, a few realistic tasks, non-leading prompts, and a consistent note format. For each session, use a non-identifying label and record the task, what the tester did or said, successes, barriers or questions, and possible changes. Keep observations separate from interpretations. After all three sessions, summarize the strongest findings and the improvement they support.

**Purpose:** Check whether a first-time user understands the outfit recommendation at a glance, can find/change location and date without help, and notices reminders when shown.

**Tasks (give one at a time, no hints):**
1. "Open the app and tell me what it's telling you to wear today, and why."
2. "Check what the app recommends for [a date 3–4 days out]."
3. "Change the location to a different US city."
4. "Find out where the weather data comes from."

**Non-leading prompts if stuck:** "What would you try next?" / "What are you looking for right now?" — avoid pointing at buttons.

**Note format per session:** tester label (e.g., P1/P2/P3), task, what they did/said (observation), success or barrier (fact), possible change (interpretation, kept separate from the observation).

## Revisions

Record material plan changes and why they were made.

- 2026-10-11: Aligned the plan with the finalized spec (feels-like temperature, band edges, Req 10a/13a/16, Halloween keyboard route, rolled-once-and-stored variations). Moved the first deploy to right after the scaffold so GitHub Pages/HTTPS problems surface early, and added an Open-Meteo field check before layout work.

## Saving transcripts

At the end of planning, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.

At the end of every implementation chat, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/build-YYYY-MM-DD_HHMMSS.md` using the same formatting.
