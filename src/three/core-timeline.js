import { heroPhase } from '../animations/hero-motion.js'

// Position: fractions of the viewport from its center (Y up); Z: fitted camera distance.
// Rotation: radians. Camera and lookAt are relative to the fitted viewport.
export const coreStates = [
  { id: 'hero', position: [0.24, -0.01, 0], rotation: [0.12, -0.25, -0.18], scale: 1, separation: 0, energy: 1, particles: 1, camera: [0, 0, 0], lookAt: [0, 0, 0], mobile: { position: [0, -0.22, 0], scale: 0.9 } },
  { id: 'about', position: [0.27, -0.04, 0], rotation: [0.1, 0.45, -0.3], scale: 0.8, separation: 1, energy: 0.8, particles: 0.6, camera: [0.025, 0.01, 0.03], lookAt: [0.01, 0, 0], mobile: { position: [0.32, 0.05, 0], scale: 0.42, separation: 0.6 } },
  { id: 'work', position: [0.39, 0.36, -0.03], rotation: [0.3, -0.5, 0.1], scale: 0.28, separation: 0.1, energy: 0.7, particles: 0.25, camera: [-0.01, 0, 0.02], lookAt: [0, 0, 0], mobile: { position: [0.36, 0.35, 0], scale: 0.25 } },
  { id: 'stack', position: [-0.28, -0.08, 0], rotation: [-0.2, 0.55, -0.25], scale: 0.75, separation: 0.55, energy: 0.9, particles: 0.6, camera: [-0.025, 0, 0.02], lookAt: [-0.01, 0, 0], mobile: { position: [0.36, 0.3, 0], scale: 0.3 } },
  { id: 'activity', position: [0.34, 0.3, -0.02], rotation: [-0.2, 0.8, 0.1], scale: 0.3, separation: 0, energy: 0.55, particles: 0.25, camera: [0, 0, 0.03], lookAt: [0, 0, 0], mobile: { position: [0.34, 0.32, 0], scale: 0.27 } },
  { id: 'lab', position: [-0.23, -0.09, 0], rotation: [0.18, 0.3, -0.2], scale: 0.9, separation: 0, energy: 1.1, particles: 1, camera: [-0.02, 0, 0], lookAt: [-0.01, 0, 0], mobile: { position: [0, -0.22, 0], scale: 0.92 } },
  { id: 'contact', arrival: 0.15, position: [0.27, -0.2, -0.02], rotation: [0.15, 0.2, 0.15], scale: 0.65, separation: 0, energy: 0.65, particles: 0.4, camera: [0, 0, 0.03], lookAt: [0, 0, 0], mobile: { position: [0.28, -0.26, 0], scale: 0.5 } },
]

export const coreTransition = { hold: 0.55, arc: 0.065, damping: 5, fadeStart: 0.65 }
const clamp = (value) => Math.max(0, Math.min(1, value))
const vectorKeys = ['position', 'rotation', 'camera', 'lookAt']
const scalarKeys = ['scale', 'energy', 'particles', 'separation']

export function createCoreState() {
  return { position: [...coreStates[0].position], rotation: [...coreStates[0].rotation], camera: [0, 0, 0], lookAt: [0, 0, 0], scale: 1, separation: 0, energy: 1, particles: 1, opacity: 1 }
}

export function fitCoreToLab(target, timeline, frame, viewport, scroll, mobile) {
  if (!frame || frame.width <= 0 || frame.height <= 0) return target
  const transition = heroPhase(timeline.progress, coreTransition.hold, 1)
  const weight = timeline.current === 'lab' ? 1 - transition : timeline.next === 'lab' ? transition : 0
  if (!weight) return target
  const lab = coreStates.find(({ id }) => id === 'lab')
  const origin = mobile ? lab.mobile.position : lab.position
  target.position[0] += ((frame.left + frame.width / 2) / viewport.width - 0.5 - origin[0]) * weight
  target.position[1] += (0.5 - (frame.top - scroll + frame.height / 2) / viewport.height - origin[1]) * weight
  const worldWidth = viewport.worldHeight * viewport.width / viewport.height
  const available = Math.min(frame.width / viewport.width * worldWidth, frame.height / viewport.height * viewport.worldHeight)
  const scale = available * 0.92 / (3.4 + target.separation * 1.1)
  target.scale += (scale - (mobile ? lab.mobile.scale : lab.scale)) * weight
  return target
}

export function createSectionStops(sections, viewportHeight, limit) {
  return sections.map(({ id, top }, index) => ({
    id, progress: 0,
    // Give short closing sections a destination before the document ends.
    anchor: index === 0 ? 0 : limit <= 0 ? 1 : Math.min(id === 'contact' ? 0.99 : 1, clamp((top - viewportHeight * (coreStates.find((state) => state.id === id)?.arrival ?? 0.45)) / limit)),
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
export function sampleCoreState(target, timeline, pageProgress, mobile = false, labMode = 'assembled') {
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
  // Lab controls yield to the scroll path before the next section handoff.
  if (from.id === 'lab') {
    target.separation += (labMode === 'exploded' ? 1.15 : labMode === 'pulse' ? 0.18 : 0) * (1 - t)
    target.energy += (labMode === 'pulse' ? 0.8 : 0) * (1 - t)
  }
  const ending = from.id === 'contact' ? heroPhase(timeline.progress, 0, 1) : 0
  target.scale *= 1 - ending * 0.18
  target.energy *= 1 - ending * 0.7
  target.particles *= 1 - ending * 0.8
  target.opacity = pageProgress >= 1 ? 0 : from.id === 'contact' ? 1 - heroPhase(timeline.progress, coreTransition.fadeStart, 1) : 1
  return target
}
