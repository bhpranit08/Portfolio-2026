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
- `src/animations/useHeroAnimations.js`: the hero entrance timeline and imperative DOM scroll response. `usePageAnimations.js` retains the existing section reveals.
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

`Gyroscope` accepts `position`, `rotation`, `scale`, `mouseInfluence`, `reducedMotion`, and a mutable `controls` object (`intro`, `active`, `progress`, `velocity`). Its optional React ref exposes:

- `current.group`: outer transforms, independent of idle/mouse motion.
- `current.model`: cloned hierarchy; named nodes are available through `getObjectByName`.
- `current.input`: the live shared state described above.
- `current.controls`: the current section control object. Named `core-root` and `core-motion` groups keep external and procedural transforms separate.

Scroll progress/velocity, mouse velocity, and global idle time remain available for future choreography. `state.hero` contains the first section’s normalized, damped controls. `hero-motion.js` derives them from the existing Lenis state and measured hero bounds; `wake` and `exit` phase values synchronize DOM and 3D. No other section choreography is implemented.

One fixed, transparent Canvas persists across the whole document. It renders above the existing opaque section backgrounds and below DOM content. Camera view offsets compose the CORE beside the desktop headline and below it on narrow screens. There is no hero-intersection visibility cutoff: the machine remains visible after the hero and keeps its final pose until a later transition is explicitly designed. Reduced motion uses demand rendering; normal motion continues while the machine is visible.

## Contribution data

Replace `contributions` with records shaped like `{ date: '2026-01-01', count: 4 }` and set `contributionYear`. Missing days are zero. Invalid dates, negative/fractional counts, and duplicate dates are rejected. Records outside the displayed year are ignored. Month/week alignment uses UTC, handles leap years, and supports 53/54-week grids. Counts map to five intensity levels: 0, 1–3, 4–6, 7–9, 10+.

The graph uses a real table with seven weekday rows, twelve month headings, square CSS cells, per-day labels, a total, and a LESS/MORE legend. On narrow screens only the graph scrolls horizontally. All activity is explicitly labelled placeholder data; no API requests, embeds, or images.

## Animation and performance

Anime.js scopes clean up transforms and observers on unmount or preference changes. `[data-hero-line]` and `[data-reveal]` are the initial animation hooks; future text, grid, and navigation work can extend this module. Content stays readable without animation. No extra animation framework is included.

Scroll and mouse changes mutate stable objects instead of triggering React renders. The graph is memoized. Canvas DPR is capped at 1.5 on desktop and 1.25 on mobile, environment reflections are captured once at 128px, and particles use one GPU point cloud (45 particles). No shadow maps or remote environment assets. Bloom still adds GPU work; target-device frame-rate profiling remains necessary. Vite reports a large Three.js bundle; code splitting is deferred until the content/loading strategy is established.

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

Checks cover calendar alignment, leap years, input validation, shared state/subscriptions, hero scroll/velocity damping, intro gating, bounded motion, energy settling, and preservation of original material maps.

## Hero interaction pass

The resting layout, headline, and palette are preserved. One Anime.js timeline introduces the wordmark (0ms), status (140ms), metadata (280ms), CORE fade (420ms), clipped headline lines (650ms, staggered 110ms), supporting text (1350ms), technical captions (1510ms), and scroll indicator (1750ms). Normal CORE idle/mouse motion starts when the timeline finishes at about 2200ms. The DOM intro never waits on asset loading; a late CORE still fades in when ready. Restored scroll positions skip the intro, and reduced motion displays the resting composition immediately.

`three/motion.js` adds slow bounded tilt, tiny position drift, heavy mouse damping, and approximately 2% emissive breathing. The wake phase turns the CORE by 0.35 radians, increases its model scale to 1.12, shifts its position, and pushes the camera in by 10%. The exit phase continues to 1 radian of yaw, adds tilt/roll, moves the composition toward the lower center, and settles model scale at 0.8. This pose holds after the hero. Signed velocity adds up to 0.14 radians of yaw plus roll, a small scale boost, and up to 0.35 extra emissive intensity. Velocity settles toward the current scroll pose instead of resetting to the initial hero. The same 45 particles expand, rotate faster, and brighten with speed. No material transparency, geometry edits, new models, or extra canvases are used.

`three/CoreStage.jsx` owns camera framing, the canvas fade, and atmosphere response. Desktop framing is roughly 15% larger, while tablet/mobile retain a smaller object to protect the headline. The postprocessing effect invalidates after resize so demand-mode canvases draw their newly allocated targets.

The headline shifts up to 88px left and 140px upward, fading during exit; supporting UI shifts up to 48px. Scroll variables live on the hero wrapper, separate from Anime.js transforms. The arrow drifts 4px only after the intro and its wrapper fades as scrolling begins; keyboard focus keeps the link visible. Subscriptions, the ResizeObserver, and Anime.js scopes are cleaned up. DOM writes stop once the rounded scroll pose settles.

Browser checks cover intro sequencing, scroll indicator fading/return, preference changes, and desktop/tablet/mobile composition. Frame-rate measurements in the software WebGL environment are not representative of target hardware.

## Continuous hero handoff

Progress is `clamp((sharedScroll - heroStart) / heroHeight, 0, 1)`, with time-based damping. Smoothstep phases provide an initial wake-up from 2.5% to 20%, followed by the exit from 20% to 100%. The baseline pose is therefore determined by progress, with separate bounded idle/mouse/velocity offsets. The original intro controls canvas opacity; scroll never fades or hides the machine.

The previous disappearance had two causes: `GlobalScene` hid itself via a hero IntersectionObserver, and section backgrounds occluded its layer. Removing that cutoff and placing the transparent scene between section backgrounds and content preserves the existing layout and colors while keeping the handoff visible.

Rendered browser checkpoints were checked at 0%, 10%, 20%, 60%, 100%, and 130% of hero height. They verify the same canvas, full post-intro opacity, transparent clear alpha, a visibly changed wake pose, and a persistent exit pose. The software renderer was stepped deterministically for captures; target-hardware frame-rate profiling remains outstanding. Later sections intentionally have no additional pose or disappearance timeline yet.
