# Pranit Bhandari — Built from Curiosity

A personal portfolio built around an articulated 3D reactor, five source-grounded projects, and a hands-on machine playground. React + Vite, React Three Fiber, Drei, Three.js, Anime.js, and Lenis. No backend is required.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

The development server defaults to port 3000. Vite prints an alternative port if it is occupied.

## Content

The story runs through **Hero → About → Work → Stack → Activity → Lab → Contact**. Section IDs remain stable for bookmarks and navigation.

- `src/data/sections.js`: section titles and Pranit’s confirmed profile: self-taught full-stack developer, Kathmandu, mountain biking and hiking.
- `src/data/contact.js`: confirmed email, GitHub, and LinkedIn destinations.
- `src/data/projects.js`: exactly five featured projects, implemented capabilities, technologies, image descriptions, accents, and optional website/source destinations.
- `src/data/stack.js`: technologies evidenced by the local project source.
- `src/data/lab.js`: the assembled, exploded, and energy-pulse controls.

Featured projects are **Purple Star DMS**, **Smart Monkey Detection**, **Kids Universe Hub**, **Power Track**, and **ConnectAble**. Descriptions were checked against their local source, rather than inferred from folder names. ConnectAble is labeled a frontend prototype with demonstration data. No user counts, commercial outcomes, employers, or availability claims are invented.

Public links were checked on 2026-10-17. Purple Star’s website and the Monkey Detection, Power Track, and ConnectAble repositories returned successful responses. The old ConnectAble deployment returned HTTP 410; the DMS and Kids Universe Hub repositories returned HTTP 404 without authentication, so those destinations are omitted. Their project descriptions remain public with the owner’s permission.

Project media lives in `public/projects/`. Purple Star and ConnectAble use the owner’s archived screenshots from Portfolio-Latest. The other three use original vector illustrations of the implemented systems; they are labeled illustrations, not screenshots or live data. Failed image requests expose a project-title fallback without collapsing the layout.

## Motion architecture

One Lenis instance owns scrolling and publishes a stable mutable animation store. Scroll, pointer, camera, and mesh updates do not re-render the React tree. ResizeObserver keeps chapter positions current when the viewport or contribution data changes.

One lazy-loaded R3F Canvas persists through all chapters. The reactor is original procedural geometry: three beveled mechanical rings with instanced housings, fasteners, and diodes around a faceted energy chamber. Shared geometry and materials are disposed on unmount. The old fused GLB and its texture-specific implementation have been removed.

`core-timeline.js` samples viewport-relative poses, camera targets, ring separation, energy, and the final fade. Damped motion adds bounded pointer and signed scroll response. Lab overrides blend out before the Contact boundary, so controls cannot distort the rest of the journey. The closing handoff waits until the Lab controls have entered view on a phone; the final fade follows Contact’s own progress rather than a percentage of the entire long page. Desktop project activation changes the sticky visual and reactor accent; mobile shows each visual with its article. Focus inside a project also activates its desktop preview.

Drei Environment and Lightformer provide reflections without a remote HDR asset. Desktop has restrained bloom; mobile and reduced-motion views render directly. DPR caps at 1.5 desktop and 1.25 mobile. Hidden documents and the navigation modal stop the scene; reduced motion and the final faded pose use demand rendering.

The header motion switch disables decorative DOM and 3D motion as well as smooth wheel scrolling. Operating-system reduced motion takes precedence. Lab states remain usable as immediate static changes. No sound or custom cursor is used.

## Accessibility and failure behavior

All content is ordinary HTML above the decorative canvas. Native links, buttons, headings, lists, and a modal dialog preserve keyboard navigation. The menu traps focus, handles Escape, restores focus, and uses the existing scroll owner. The skip link bypasses the introduction. Lab buttons expose their pressed state and explain loading or unavailable 3D.

Scene import/render failures and unsupported WebGL show a static vector reactor while the portfolio remains usable. Missing project images keep their visual frame and title. Reduced-motion settings can change while the page is open.

Activity retains the accessible rolling 365-day GitHub calendar for `bhpranit08`. It requests the public GitHub Contributions API directly, with validation, shared in-flight requests, one-hour caching, and a ten-second timeout. Failure uses deterministic sample data explicitly labeled **LOCAL SAMPLE / FALLBACK**. Keyboard arrows, Home/End, tooltips, and the contained horizontal scroller remain supported.

## Design references and licenses

- [Codrops: cinematic 3D scroll experiences](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) informed camera choreography. The existing Anime.js/Lenis stack implements this site; GSAP was not added.
- [Codrops: WebGL image reveals](https://tympanus.net/codrops/2024/02/07/on-scroll-revealing-webgl-image-explorations/) informed the clipped, perspective-based gallery transitions, implemented here in CSS.
- [Drei Environment](https://drei.docs.pmnd.rs/staging/environment) and [Lightformer](https://drei.docs.pmnd.rs/staging/lightformer) provide the lighting components already included in the project dependencies.
- Self-hosted [Space Grotesk](https://github.com/floriankarsten/space-grotesk) and [IBM Plex Mono](https://github.com/IBM/plex) use the SIL Open Font License. License files are retained beside the fonts in `public/fonts/`.

## Verification

`npm test` covers contribution validation and network failure handling, stable input state, motion bounds, reduced-motion ring poses, resource disposal, reversible chapter transitions, finite camera paths, and Lab overrides/restoration. `npm run build` checks the production bundle. The deferred Three.js chunk still triggers Vite’s expected large-chunk advisory.

Production Chromium checks passed at 1440×1000, 900×1000, 390×844, and 320×740: exactly five projects, all seven chapter destinations, the same persistent Canvas, forward/reverse gallery activation, Lab image changes, idle demand rendering, runtime system/manual motion switching, native modal focus behavior, calendar keys, working contact destinations, phone Lab-to-Contact timing, exact end fading with reverse-scroll recovery, and no page overflow or JavaScript errors on healthy runs. Simulated missing images, failed scene imports, unsupported WebGL, and unavailable contribution data all retained the expected usable fallback.

The redesign removes the original 3.2 MB GLB request and reduces the deferred scene JavaScript from approximately 1,044 KB to 966 KB before gzip. A 24-frame sample at 1100×760, DPR 1, in headless Chromium/SwiftShader measured median frame intervals of 900 ms for the original development build and 700 ms for the redesigned production build (95th percentiles: 1116.6 ms and 750 ms). Both are constrained by software rasterization.

Software-rendered Chromium is useful for functional checks; it does not establish frame rates on physical devices or compatibility with Safari and Firefox.

Delivery is local to this repository. No deployment or domain changes are made.
