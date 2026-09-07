# PS//2026 — portfolio foundation

Run `npm run dev`. This is the visual shell and placeholder content, not the finished portfolio.

## Structure

- `src/App.jsx`: seven independently replaceable sections inside the global provider.
- `src/components/LenisProvider.jsx`: one Lenis instance and one owned RAF loop, cleaned up on unmount (including React Strict Mode).
- `src/components/Section.jsx`: shared semantic section frame.
- `src/components/ContributionGraph.jsx`: accessible calendar table and intensity legend.
- `src/sections/`: Hero, About, Activity, Work, Stack, Lab, Contact.
- `src/data/sections.js`: placeholder section copy.
- `src/data/contributions.js`: dated sample records and calendar layout.
- `src/three/`: persistent scene, existing CORE, material treatment, and bloom.
- `src/hooks/`: shared animation state, subscription hooks, reduced-motion preference.
- `src/animations/usePageAnimations.js`: scoped Anime.js hero text clipping/stagger and one-time section reveals.
- `src/styles/global.css`: responsive brutalist shell, graph, and accessibility styles.

## Shared input and Lenis

`useAnimationState()` returns a stable store. Read `store.state` inside an R3F `useFrame`, or use `useAnimationFrame(callback)` for imperative DOM updates. Subscriptions run once per provider frame and return an unsubscribe function. These updates do not set React state.

```js
const store = useAnimationState()
// store.state:
// scroll: vertical pixels
// progress: clamped 0–1 across the whole document (0 if it cannot scroll)
// velocity: Lenis's native scroll velocity
// mouse: { x, y, velocityX, velocityY }
//   x/y: viewport-normalized coordinates, positive y points upward
//   velocities: normalized units/second with decay
// idleTime: seconds since pointer movement or scroll activity
```

Lenis owns smooth wheel scrolling and same-page anchors, using its native reduced-motion support. Touch and keyboard scrolling remain native; navigation keys cancel unfinished wheel easing before the browser handles them. The provider feeds Lenis from its RAF loop (`autoRaf: false`), synchronizes resize-dependent progress, tracks pointer input over the DOM, and cancels all work on cleanup. No second Lenis instance is created for the canvas or sections.

## CORE interface

`Gyroscope` accepts `position`, `rotation`, `scale`, `mouseInfluence`, and `reducedMotion`. Its optional React ref exposes:

- `current.group`: outer transforms, independent of idle/mouse motion.
- `current.model`: cloned hierarchy; named nodes are available through `getObjectByName`.
- `current.input`: the live shared state described above.

Scroll progress/velocity, mouse velocity, and global idle time are exposed for future choreography. Only the existing damped mouse-follow and bounded idle motion currently drive the model. There are no section-driven 3D transforms yet.

One fixed Canvas persists across the whole document. Camera view offsets compose the CORE beside the desktop headline and below it on narrow screens. Opaque content sections cover the scene after the hero. When the hero leaves the viewport, the Canvas switches to demand rendering without unmounting; reduced motion also uses demand rendering.

## Contribution data

Replace `contributions` with records shaped like `{ date: '2026-01-01', count: 4 }` and set `contributionYear`. Missing days are zero. Invalid dates, negative/fractional counts, and duplicate dates are rejected. Records outside the displayed year are ignored. Month/week alignment uses UTC, handles leap years, and supports 53/54-week grids. Counts map to five intensity levels: 0, 1–3, 4–6, 7–9, 10+.

The graph uses a real table with seven weekday rows, twelve month headings, square CSS cells, per-day labels, a total, and a LESS/MORE legend. On narrow screens only the graph scrolls horizontally. All activity is explicitly labelled placeholder data; no API requests, embeds, or images.

## Animation and performance

Anime.js scopes clean up transforms and observers on unmount or preference changes. `[data-hero-line]` and `[data-reveal]` are the initial animation hooks; future text, grid, and navigation work can extend this module. Content stays readable without animation. No extra animation framework is included.

Scroll and mouse changes mutate stable objects instead of triggering React renders. The graph is memoized. Canvas DPR is capped at 1.5, environment reflections are captured once at 128px, and particles use one GPU point cloud (45 particles). No shadow maps or remote environment assets. Bloom still adds GPU work; target-device frame-rate profiling remains necessary. Vite reports a large Three.js bundle; code splitting is deferred until the content/loading strategy is established.

## Asset

`useGLTF('/models/gyroscope.glb')` preserves this hierarchy:

```text
Sketchfab_model
└─ eneergy_core_1_low.fbx
   └─ RootNode
      └─ energy_core_1_low
         └─ energy_core_1_low_Material_0 (mesh)
```

The GLB has one mesh (8,708 triangles), one double-sided PBR material named `Material`, four embedded textures, and no animation clips. Rings/core/frame are baked into one mesh and cannot be transformed independently. The asset file, geometry, and texture data remain unchanged. Runtime materials are cloned for neutral metal and purple emission using the original texture brightness as a mask.

Embedded credits: [Sci Fi Energy Core 1](https://sketchfab.com/3d-models/sci-fi-energy-core-1-a5aefe7b281f46529aed2ec9d873bc52) by [FilipZelinka](https://sketchfab.com/FilipZelinka), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Runtime appearance changes: neutral metal and purple emission.

## Checks

```sh
npm run build
npm run lint
npm test
```

Checks cover calendar alignment, leap years, input validation, shared state/subscriptions, bounded motion, and preservation of original material maps.
