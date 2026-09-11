# PS//2026 — Digital Systems

Pranit Bhandari’s brutalist software laboratory. Seven sections share one persistent CORE, one scrolling owner, and a restrained visual system. Project, experiment, profile, technology, and contact content remains intentionally editable.

```sh
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

## Content

| Section | Content source | Presentation |
| --- | --- | --- |
| 01 / HERO | `src/sections/Hero.jsx` | Original headline/composition, sequenced entrance, scroll wake |
| 02 / ABOUT | `src/data/sections.js` | Large statement and technical profile |
| 03 / ACTIVITY | `src/data/contributions.js` | Public GitHub activity; accessible calendar table |
| 04 / WORK | `src/data/projects.js` | Three editorial project records |
| 05 / STACK | `src/data/stack.js` | Editable technology index; no ratings |
| 06 / LAB | `src/data/lab.js` | Six native expandable experiment records |
| 07 / CONTACT | `src/data/contact.js` | System completion, project action, public GitHub link |

Section titles and supporting notes live in `src/data/sections.js`, which also supplies the navigation index. The name field, projects, experiments, and technology selection are placeholders; they are not claims of experience. No employers, metrics, awards, clients, or detailed project histories have been invented.

Each project supports `number`, `title`, `description`, `technologies`, `year`, `status`, optional `url`, optional `image` (a path/URL), and optional `caseStudy` (a link). Missing destinations produce ordinary headings rather than broken links. Optional images lazy-load and hide on failure. Experiment records accept an optional demo `url`.

Set `contact.destination` to a real `mailto:` or `https:` URL to activate the project link. Until then, START A PROJECT expands an honest destination-pending message, with the real GitHub profile available separately. Set About values and the Stack list to your own details before publishing.

## Scrolling and navigation

`src/components/LenisProvider.jsx` owns the only Lenis instance and its RAF loop. It publishes scroll, normalized page progress, velocity, pointer input, and measured section stops through the stable mutable store in `src/hooks/animation-state.js`. ResizeObserver updates section positions when the viewport, Activity data, or disclosure heights change. High-frequency input does not use React state.

`Navigation.jsx` uses a native modal `<dialog>` for focus trapping, an inert background, Escape support, and focus restoration. Anime.js handles opening/closing. The menu stops the existing Lenis instance while open, resumes it on close, and uses that same instance to scroll to the selected section and focus it. Same-page anchors also use Lenis. All listeners, observers, and animation scopes have cleanup.

## CORE architecture

`App.jsx` lazy-loads `GlobalScene.jsx`, keeping Three.js outside the initial UI chunk. There is exactly one persistent R3F Canvas and one gyroscope asset. `SceneBoundary.jsx` protects the rest of the page from scene or scene-chunk failure; Canvas has an unsupported-browser fallback and the model has a loading readout.

`src/three/core-timeline.js` contains the seven poses. Each pose specifies viewport-relative position, rotation, scale, camera offset, energy, and particle intensity, plus mobile overrides. Section anchors come from measured document geometry; interpolation uses normalized section progress, a smooth transition curve, and a small travel arc. The first scroll adds a bounded wake in rotation, scale, height, camera, and energy that returns to the shared path before About. Only the final Contact interval fades the CORE.

`CoreStage.jsx` samples those targets and updates refs in the R3F frame loop. Position and scale use time-based damping; rotation uses quaternion interpolation. `Gyroscope.jsx` applies additive, bounded idle drift, heavy pointer response, and signed velocity motion via `motion.js`. Faster scrolling increases the small additive tilt, scale, energy, and particle response; those values settle when scrolling stops. The model stays mounted through every section.

The machine occupies the hero’s approved composition, the About side space, an Activity corner, the Work margin, and the open left areas beside Stack and Lab. Lab has the strongest energy state. Mobile uses smaller corner poses with opaque content regions behind dense indexes so text stays readable.

## Public GitHub contributions

Activity requests the current UTC calendar year for `bhpranit08` from the hosted [GitHub Contributions API](https://github.com/grubersjoe/github-contributions-api), a public profile-calendar scraper. The browser calls it directly. No GitHub token, authentication, environment variable, backend, or serverless proxy is needed.

`contributions.js` isolates the response format, validates records, and returns `{ date: 'YYYY-MM-DD', count: number }`. `buildContributionCalendar()` calculates totals, five intensity levels, UTC month/week alignment, and leap-year layouts. It rejects invalid dates, negative/fractional counts, and duplicates. Upstream totals and intensity values are not trusted as presentation data.

`useGithubContributions.js` supplies loading, live, and fallback states. In-flight requests are shared, successful results remain in memory for one hour, and a ten-second timeout prevents indefinite loading. Network, HTTP, JSON, and validation failures use the original 2026 sample, explicitly labelled LOCAL SAMPLE / FALLBACK. The graph mounts after records resolve so the entrance counts to the final value once.

The existing `ContributionGraph.jsx` table retains seven weekday rows, twelve month labels, square cells, five purple intensity levels, LESS/MORE legend, a calculated total, and a technical tooltip. Arrow keys move between dates; Home/End jump to the edges; Escape dismisses the tooltip. Only the graph scrolls horizontally on narrow screens.

## DOM motion and accessibility

Anime.js owns hero, About, Activity, menu, section metadata/headings, project entrances, Lab disclosure entrances, and the Contact reveal. There is no GSAP or separate per-section scrolling system. CSS provides restrained hover feedback. Native links, buttons, summaries, headings, lists, and tables retain their semantics and visible focus outlines. The custom cursor was omitted; native pointers work across mouse and touch devices.

Reduced motion skips decorative DOM entrances, disables hover translations, removes hero parallax and procedural CORE motion, uses demand rendering, and disables bloom. Navigation and all content interactions remain available. CORE section poses still follow the page immediately to retain composition. The graph becomes readable without waiting for animation.

## Responsive and performance decisions

Desktop indexes reserve space for the CORE. Tablet reduces column gaps and moves project metadata below its title. Mobile stacks the indexes, retains large type, reduces CORE scale, and contains calendar overflow. The fullscreen navigation scrolls independently when viewport height is short.

The Canvas caps DPR at 1.5 on desktop and 1.25 on mobile. There are 45 particles on desktop and 18 on mobile; environment reflections render once at 128px. Mobile and reduced-motion views skip bloom. Hidden documents and the open navigation overlay stop the R3F frame loop; the final fully faded Contact pose uses demand rendering and resumes when scrolling back. Scroll and pointer input mutate refs rather than rendering hundreds of cells.

The 3D chunk remains large because it includes Three.js, R3F, Drei, and postprocessing. Code splitting improves initial UI availability but does not eliminate the scene download. Software-rendered browser checks do not establish normal-laptop frame rates; target-device profiling remains a release check.

## Asset and attribution

`public/models/gyroscope.glb` is the original 3.3 MB asset. Its bytes, geometry, textures, and hierarchy are unchanged. It contains one mesh (8,708 triangles), four embedded textures, and no animation clips. The rings are baked together, so the site animates the assembled machine rather than pretending the rings are separate.

Runtime materials preserve the texture maps while converting the base appearance to neutral metal and purple emission. Credits are present in the visible footer: [Sci Fi Energy Core 1](https://sketchfab.com/3d-models/sci-fi-energy-core-1-a5aefe7b281f46529aed2ec9d873bc52) by [FilipZelinka](https://sketchfab.com/FilipZelinka), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Material appearance is adapted.

## Checks and remaining release work

`npm test` covers calendar validation and normalization, request caching/failures, shared input state, first-scroll response, all CORE section destinations, continuous handoffs, Contact fading, motion bounds/settling, and material-map preservation. `npm run lint` and `npm run build` validate the source and production bundle.

Before publishing, replace the marked content, set a real contact destination, and review on target hardware. Public activity depends on a third-party service and can be up to an hour old; its labeled sample fallback is intentional. The existing R3F version emits a Three.Clock deprecation warning in development; it comes from the installed dependency, not a second application clock.

## Completion change map

Created:

- `src/components/Navigation.jsx`, `src/components/SceneBoundary.jsx`
- `src/data/projects.js`, `src/data/stack.js`, `src/data/lab.js`, `src/data/contact.js`

Updated in the completion pass:

- `src/App.jsx`, `src/components/LenisProvider.jsx`, `src/components/Section.jsx`
- `src/sections/Hero.jsx`, `Work.jsx`, `Stack.jsx`, `Lab.jsx`, `Contact.jsx`
- `src/data/sections.js`, `src/hooks/animation-state.js`, `src/animations/usePageAnimations.js`
- `src/three/GlobalScene.jsx`, `CoreStage.jsx`, `CoreEffects.jsx`, `core-timeline.js`, `core-timeline.test.js`
- `src/styles/global.css`, `index.html`, `public/favicon.svg`, `README.md`

The pre-existing public contribution pipeline, Activity presentation, About animation, gyroscope asset/material/motion implementation, package manifest, and lockfile were preserved.

## Browser verification — 2026-09-11

The browser scripts are local verification artifacts in `/tmp` and use the already available Playwright/Chromium installation; no browser-test dependency was added to the portfolio.

| Command | Result |
| --- | --- |
| `npm test` | All six test files passed |
| `npm run lint` | Passed, no lint errors |
| `npm run build` | Passed; expected warning for the large deferred 3D chunk |
| `npm run dev -- --host 127.0.0.1` | Development server exercised on port 3001 |
| `npm run preview -- --host 127.0.0.1` | Production preview exercised on port 4173 |
| `node /tmp/portfolio-polish-check.mjs` | Passed at 1440×1000, 900×1000, 390×844, and 320×740 with reduced motion; CORE loaded, seven sections, all menu targets, focus handling, disclosures, graph keys, and no page overflow or console errors |
| `node /tmp/portfolio-production-check.mjs` | Passed against the built mobile site, including the lazy scene, CORE, menu, Activity, and console checks |
| `node /tmp/portfolio-live-check.mjs` | Fresh real browser request passed: 565 contributions, summed from 365 public records |
| `node /tmp/portfolio-motion-check.mjs` | Passed at 1100×760 with normal motion: hero entrance, pointer response, first-scroll wake, all six handoffs with the same Canvas, menu animation, Activity entrance with captured public records, Contact fade, reverse scroll, and reduced-motion switching; no console errors |
| `node /tmp/portfolio-failure-check.mjs` | API failure, timeout, missing model, and failed scene import all left the portfolio and navigation usable |

Desktop and mobile screenshots of all seven sections and the navigation were visually inspected. An earlier normal-motion run encountered a public-data fallback; live networking and animation were subsequently checked separately. Injected network/model failures intentionally produce failed resource requests; the no-console-error result applies to healthy page runs. No physical-device FPS, Safari, or Firefox claim is made.
