import { heroPhase } from '../animations/hero-motion.js'

// Position: fractions of the viewport from its center (Y up); Z: fitted camera distance.
// Rotation: radians. Scale and energy/particles: multipliers of the original HERO.
export const coreStates = [
  { id: 'hero', position: [0.24, 0, 0], rotation: [0.08, -0.28, -0.12], scale: 1, energy: 1, particles: 1, camera: [0, 0, 0], mobile: { position: [0, -0.24, 0] } },
  { id: 'about', position: [0.27, -0.22, -0.02], rotation: [0.25, 0.65, 0.16], scale: 0.76, energy: 0.72, particles: 0.7, camera: [0.008, 0, 0.015], mobile: { position: [0.36, -0.3, -0.02], scale: 0.5 } },
  { id: 'activity', position: [0.35, 0.3, -0.05], rotation: [-0.12, 1.1, -0.24], scale: 0.43, energy: 0.58, particles: 0.45, camera: [-0.006, 0.005, 0.025], mobile: { position: [0.3, 0.34, -0.05], scale: 0.4 } },
  { id: 'work', position: [0.35, -0.08, 0.015], rotation: [0.32, -0.65, 0.2], scale: 0.64, energy: 1.08, particles: 0.8, camera: [0.006, -0.004, -0.015], mobile: { position: [0.38, 0.32, -0.02], scale: 0.3 } },
  { id: 'stack', position: [-0.27, -0.18, -0.02], rotation: [-0.24, 0.38, -0.32], scale: 0.72, energy: 1, particles: 0.85, camera: [-0.008, 0, 0.01], mobile: { position: [0.38, 0.32, -0.02], scale: 0.3 } },
  { id: 'lab', position: [-0.27, -0.22, 0.01], rotation: [0.7, 1.45, 0.6], scale: 0.8, energy: 1.3, particles: 1.35, camera: [0.01, 0.006, -0.01], mobile: { position: [0.38, 0.32, -0.02], scale: 0.32 } },
  { id: 'contact', arrival: 0.7, position: [0.3, -0.28, -0.06], rotation: [0.12, 0.25, -0.18], scale: 0.5, energy: 0.6, particles: 0.5, camera: [0, 0, 0.03], mobile: { position: [0.22, -0.32, -0.06], scale: 0.46 } },
]

export const coreTransition = { hold: 0.55, arc: 0.065, damping: 5, fadeStart: 0.97 }
const clamp = (value) => Math.max(0, Math.min(1, value))
const vectorKeys = ['position', 'rotation', 'camera']
const scalarKeys = ['scale', 'energy', 'particles']

export function createCoreState() {
  return { position: [...coreStates[0].position], rotation: [...coreStates[0].rotation], camera: [0, 0, 0], scale: 1, energy: 1, particles: 1, opacity: 1 }
}

export function createSectionStops(sections, viewportHeight, limit) {
  return sections.map(({ id, top }, index) => ({
    id, progress: 0,
    // Contact arrives earlier so even a short mobile section settles before the end fade.
    anchor: index === 0 ? 0 : limit <= 0 ? 1 : clamp((top - viewportHeight * (coreStates.find((state) => state.id === id)?.arrival ?? 0.45)) / limit),
  }))
}

export function updateSectionProgress(timeline, progress) {
  const stops = timeline.stops
  let index = 0
  for (let i = 0; i < stops.length; i++) {
    const end = stops[i + 1]?.anchor ?? 1
    stops[i].progress = end > stops[i].anchor
      ? clamp((progress - stops[i].anchor) / (end - stops[i].anchor))
      : Number(progress >= end)
    if (progress >= stops[i].anchor) index = i
  }
  timeline.current = stops[index]?.id ?? 'hero'
  timeline.next = stops[index + 1]?.id ?? timeline.current
  timeline.progress = stops[index]?.progress ?? 0
}

// Mutate a reusable target without React updates in the frame loop.
export function sampleCoreState(target, timeline, pageProgress, mobile = false) {
  const from = coreStates.find((state) => state.id === timeline.current) ?? coreStates[0]
  const to = coreStates.find((state) => state.id === timeline.next) ?? from
  const t = heroPhase(timeline.progress, coreTransition.hold, 1)
  const arc = from === to ? 0 : 4 * t * (1 - t) * coreTransition.arc
  for (const key of vectorKeys) {
    const a = (mobile && from.mobile?.[key]) || from[key]
    const b = (mobile && to.mobile?.[key]) || to[key]
    for (let axis = 0; axis < 3; axis++) target[key][axis] = a[axis] + (b[axis] - a[axis]) * t
  }
  target.position[1] += arc
  target.position[2] += arc * 0.35
  for (const key of scalarKeys) {
    const a = (mobile ? from.mobile?.[key] : undefined) ?? from[key]
    const b = (mobile ? to.mobile?.[key] : undefined) ?? to[key]
    target[key] = a + (b - a) * t
  }
  // A perceptible first-scroll wake, returning to the shared path before ABOUT.
  const p = timeline.progress ?? 0
  const wake = from.id === 'hero' ? heroPhase(p, 0.025, 0.25) * (1 - heroPhase(p, 0.3, 1)) : 0
  target.rotation[1] += wake * 0.35
  target.position[1] += wake * 0.025
  target.scale *= 1 + wake * 0.08
  target.camera[2] -= wake * 0.06
  target.energy += wake * 0.12
  const ending = from.id === 'contact' ? heroPhase(timeline.progress, 0, 1) : 0
  target.scale *= 1 - ending * 0.18
  target.energy *= 1 - ending * 0.7
  target.particles *= 1 - ending * 0.8
  target.opacity = from.id === 'contact' ? 1 - heroPhase(pageProgress, coreTransition.fadeStart, 1) : 1
  return target
}
