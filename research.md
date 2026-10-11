# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Research your context of use, references, weather guidance, technical options, and choices that will guide the specification.

## Instructions for the Developer

Judge sources and recommendations, make the consequential decisions, and keep this file current as the work develops.

To begin, open the project repository in a fresh chat and enter:

`Read ./research.md and help me begin Project 3 research.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, and this file. Ask one focused question at a time. Help investigate and compare options without deciding for the Developer. Verify sources directly and keep this file concise.

## Context of use

As the User, describe when and where you would use the app and what you need from it. Record important circumstances, assumptions, and limitations.

I check the app each morning upon waking, primarily on my phone, to decide what to wear before heading out. I also use it while traveling, when I'm in an unfamiliar US city and need accurate local weather for a location that may not match my home base. Accessibility is a priority throughout — the app should be usable regardless of vision or motor ability, not an afterthought. Assumption: morning connectivity is generally reliable (home wifi or cell data), but location may need manual entry when traveling to a city the device hasn't localized yet.

## User story

Write at least one user story grounded in your context of use:

> As a [type of user], I want to [need or goal], so that [reason or outcome].

Focus on the need rather than prescribing an interface or feature.

> As a college student checking the weather each morning, I want to quickly see what to wear based on the day's forecast, so that I can get dressed appropriately without having to interpret raw weather data myself.

## References

Collect 5–10 reference images from relevant products and interfaces. Save each image in `reference/`, identify its source, and record a brief observation about what is useful, ineffective, or relevant to this project. Reference images are examples only; do not use them in the app.

1. **download (1).jpg** — Source: Pinterest (artist uncredited). Casual sketch of a girl in an oversized tee, cargo pants, and chunky shoes with headphones/accessories. Observation: loose, expressive linework communicates personality without full rendering — useful reference for a quick, approachable character style.
2. **download (2).jpg** — Source: Pinterest (artist uncredited). Two characters in graphic tees and wide-leg pants. Observation: shows how a simple repeated silhouette (baggy pants, loose top) can read consistently across outfit variations — relevant for keeping outfit variants visually cohesive.
3. **download (3).jpg** — Source: Pinterest (artist uncredited, handles "Linne" and "@llinh_ary" visible). Two goth/alt-styled character designs. Observation: strong accessory details (belts, boots, jewelry) show how small variations differentiate otherwise similar outfits — useful for the "three variations per category" requirement.
4. **Aesthetic drawing_3.jpg** — Source: Pinterest (artist uncredited). Digital sketch of two similar characters in streetwear. Observation: demonstrates a repeatable base pose/body template with swappable clothing — directly relevant to how one character design can support multiple outfit layers.
5. **⊹ Sketches ⊹.jpg** — Source: Pinterest (artist uncredited). Pencil sketch, oversized "FKSW" shirt and baggy pants, with a small color swatch palette. Observation: shows how a limited color palette can be planned alongside character sketches — useful for keeping outfit variations visually unified.
6. **♡.jpg** — Source: Pinterest (artist uncredited). Sketch of a character in an oversized hoodie, pleated skirt, and platform boots, with a side bag. Observation: good example of layering (hoodie + skirt + bag) that could map to categories like outerwear + reminder-item accessories (e.g., bag standing in for "bring an umbrella").
7. **carrot-1.png** — Source: CARROT Weather press kit (meetcarrot.com/weather/presskit.html). Sunny-day screen with a flat-illustrated landscape, drone characters, and a sarcastic one-line forecast caption. Observation: shows how a short, personality-driven text line can sit alongside standard forecast data without cluttering it — relevant to our "written recommendation" requirement.
8. **carrot-2.png** — Source: CARROT Weather press kit. Night/rainy screen, same layout with a different illustrated scene and moon/ghost joke text. Observation: demonstrates how background illustration and caption both shift with conditions while the data layout (hourly/daily forecast cards) stays fixed — a useful pattern for keeping the "one recommendation state" consistent.
9. **carrot-3.png** — Source: CARROT Weather press kit. Severe-weather screen with a tornado warning banner and heavy-rain chart. Observation: good example of clearly surfacing urgent alerts above routine forecast content — relevant to handling service/weather alerts distinctly from normal reminders.
10. **weatherfit-current-conditions.png** — Source: WeatherFit official press kit (weatherfit.com/press-kit.html). Character standing in an illustrated park/city scene, dressed for 60° "mostly clear" weather. Observation: the character and background both read instantly at a glance — this is the closest direct precedent for this project's core concept (character + outfit = weather state).
11. **weatherfit-clothing-selection.png** — Source: WeatherFit official press kit. Grid of selectable sweater colors/styles on a mannequin silhouette. Observation: shows a clean approach to offering outfit variety, though it's user-driven selection rather than randomized/weather-driven — a useful contrast since our brief requires automatic, randomized variation rather than manual picking.

## Weather and technical evidence

Record each useful source, what it supports, and important limitations. Research the weather variables, apparel guidance, reminders, accessibility, privacy, artwork, weather providers, and technical options needed for informed decisions.

**Apparel temperature bands** (synthesized from [fittheforecast.com](https://fittheforecast.com/blog/what-to-wear-by-temperature), [Nike layering guide](https://www.nike.com/a/how-to-layer-clothes), and general layering-guide consensus): below 32°F = heavy coat/thermal layers; 32–45°F = medium coat + sweater/fleece; 45–60°F = light jacket or hoodie; 60–75°F = light layer/long sleeve; 75°F+ = t-shirt/shorts, light fabrics. Limitation: these are general-population guides, not campus- or demographic-specific, and don't account for personal cold/heat tolerance.

**Sunscreen reminder threshold — UV Index** ([WHO UV Index guide](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index); [ICNIRP/WHO Global Solar UV Index practical guide](https://www.icnirp.org/cms/upload/publications/ICNIRPWHOSolarUVI.pdf)). UV Index 0–2 = low, minimal protection needed; 3+ is the widely-used threshold at which sun protection (sunscreen, hat, shade) is recommended. Supports triggering a sunscreen reminder at UV ≥ 3.

**Hydration reminder threshold — Heat Index** ([NWS heat safety notices](https://www.weather.gov/media/notification/pdfs/pns12heat_aaa.pdf)). NWS heat index categories: Caution 80–90°F, Extreme Caution 90–103°F (fatigue possible with prolonged exposure), Danger 103–124°F. Supports triggering a hydration reminder at heat index ≥ 90°F. *Implementation note: Open-Meteo does not provide the NWS heat index, so the app uses its feels-like (apparent) temperature as a proxy at the same 90°F threshold; this is disclosed on the info screen.*

**Umbrella reminder threshold — Probability of Precipitation (PoP)** ([NWS PoP explainer](https://www.weather.gov/media/pah/WeatherEducation/pop.pdf); [govfacts.org](https://govfacts.org/government/federal/agencies/commerce/noaa/what-do-precipitation-percentages-in-weather-forecasts-actually-mean/)). PoP is the statistical chance of measurable precipitation (≥0.01in). General guidance: 30–40% is "worth keeping an umbrella handy," 60%+ is "plan for rain." Supports triggering an umbrella reminder at PoP ≥ 40%. Limitation: PoP thresholds for umbrella-carrying are a social convention, not a scientific standard — different sources suggest anywhere from 40% to 60%.

**Accessibility — touch target size and contrast** ([WCAG 2.5.8 Target Size](https://silktide.com/accessibility-guide/the-wcag-standard/2-5/input-modalities/2-5-8-target-size-minimum/); [WCAG 1.4.11 Non-text Contrast](https://www.accessitool.com/blog/wcag-mobile-requirements-complete-guide-app-web-developers-2026)). WCAG 2.2 Level AA requires touch targets of at least 24×24 CSS px, though Apple (44×44pt) and Google (48×48dp) recommend larger for real-world usability — relevant to the "comfortable one-handed phone use" requirement. UI components (buttons, icons) need at least 3:1 contrast against their background. Supports designing all interactive elements (date/location controls, info button) at 44px+ with sufficient contrast, not just the WCAG-minimum 24px.

**Privacy — geolocation handling** ([geolocation privacy practices overview](https://www.if-so.com/geolocation-api-browser-location/); [browser geolocation permission best practices](https://botbrowser.io/en/blog/geolocation-permission-and-location-accuracy/)). Best practice is to request location only when the user initiates it (not on page load), explain why it's needed, and keep a manual-entry fallback. Having location on the client doesn't justify sending it to a server. Supports the brief's requirement to save only the most recent location on-device (e.g., localStorage) rather than any server-side storage, and to request geolocation permission only when the user chooses "use my location" rather than automatically.

**Weather provider — Open-Meteo** ([open-meteo.com](https://open-meteo.com/)). Free, no API key, 10,000 calls/day limit, clean JSON, includes current conditions plus multi-day forecast with variables like precipitation probability, UV index, and humidity in one call — directly supports apparel/reminder logic (umbrella, sunscreen, hydration) without extra lookups. Compared against NWS/api.weather.gov (official US-only source, also free/no key, but requires a two-step lat/lon-to-grid lookup and lacks UV/precip-probability data natively) and OpenWeatherMap (well-documented but capped at 1,000 calls/day and requires a registered API key). Limitation: Open-Meteo is a data aggregator, not an official government source, so the info screen should cite it accurately rather than implying NWS/government backing.

## Decisions

Record the selected weather provider, forecast range, recommendation categories and rules, screen structure, visual direction, artwork approach (original, AI-generated, or appropriately licensed), deployment method, and one additional feature justified by the research. Briefly explain important trade-offs.

**Weather provider:** Open-Meteo — chosen over NWS/api.weather.gov and OpenWeatherMap for its no-key access, generous free limit, and built-in variables (UV index, precipitation probability, humidity) needed for apparel/reminder logic. Trade-off: it's an aggregator, not an official government source, so it will be cited accurately (not implied as NWS-backed) on the info screen.

**Forecast range:** Capped at 7 days. Open-Meteo supports up to 16 days, but forecast accuracy drops sharply past ~3–7 days, so dates further out would produce unreliable outfit recommendations. Trade-off: users can't preview outfits for dates beyond a week, but the recommendations shown stay meaningfully accurate.

**Recommendation categories and rules:**
- Outfit categories by temperature: Cold (below 45°F), Cool (45–60°F), Mild (60–75°F), Hot (75°F+). Each category needs 3 outfit-art variations chosen at random.
- Reminders (triggered independently of outfit category, each with 3 wording variations): Umbrella at PoP ≥ 40%; Sunscreen at UV Index ≥ 3; Hydration at feels-like temperature ≥ 90°F (proxy for Heat Index).
- Trade-off: thresholds are synthesized from general apparel/safety guidance (see Weather and technical evidence), not campus-specific data — they may need adjustment after peer usability testing.

**Visual direction:** Sketched/hand-drawn illustration style, applied to the character and outfits *and* the surrounding interface (icons, buttons, weather/reminder icons) — not just the character art, inspired by reference images 1–6. Trade-off: this is a larger art workload than a flat-vector UI (like Carrot/WeatherFit, references 7–11), since every interface element needs custom sketched art rather than reusable icon sets or UI-kit components.

Once the recommendation categories are chosen, estimate the art needed: the character, three outfit variations per category, weather icons, and reminder icons. Use that estimate to choose the artwork approach.

**Art estimate:** ~30+ distinct sketched-style assets — 1 base character, 12 outfit variations (4 categories × 3), 6–8 weather icons, 3 reminder icons, and 6–8 UI chrome icons (location pin, calendar, settings, etc.), all in the hand-drawn style from the Visual direction decision.

**Artwork approach:** AI-generated, given the volume above is impractical to hand-draw solo within the two-week build. Trade-off: requires disclosing AI-generated art (not an original/licensed human artist) on the info screen's art-credits section per the brief, and checking the chosen AI tool's terms for rights to use generated images in a deployed project.

**Screen structure:** Two screens — a main screen (character, weather icon, written recommendation, reminders, plus location/date controls as an overlay or inline picker) and an info screen (creator, weather-data source, recommendation methods/sources, privacy practices, art credits). Detailed phone/laptop layouts will be hand-drawn during the specification phase.

**Additional feature:** A hidden Halloween outfit, unlocked by double-tapping the character on the main screen. Justified by the brief's framing of the app as a "playful" tool for a social-engagement campaign — a tappable secret outfit is a lightweight, shareable easter egg suited to a youth clothing brand's social presence, and adds one extra outfit-art asset to the estimate above.

**Deployment method:** GitHub Pages, as recommended by the brief — free, matches a static front-end app with no server-side logic needed (weather data fetched client-side from Open-Meteo).

## Revisions

Record new evidence or changed decisions and explain why they changed.

## Approval

The Developer reviews the sources and decisions, corrects this file, and explicitly approves it before specification begins.

## Saving the transcript

After the Developer approves the research, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
