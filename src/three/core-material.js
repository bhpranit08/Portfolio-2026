import { BoxGeometry, EdgesGeometry, ExtrudeGeometry, IcosahedronGeometry, LineBasicMaterial, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Path, Shape, SphereGeometry, TorusGeometry } from 'three'

export function createReactorResources() {
  const shape = new Shape()
  shape.absarc(0, 0, 1.5, 0, Math.PI * 2, false)
  const hole = new Path()
  hole.absarc(0, 0, 1.35, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const casing = new ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, steps: 1, curveSegments: 64 })
  casing.translate(0, 0, -0.05)
  const crystal = new IcosahedronGeometry(0.55, 0)
  const geometry = {
    casing, crystal, edges: new EdgesGeometry(crystal),
    rim: new TorusGeometry(1.5, 0.012, 6, 128),
    channel: new TorusGeometry(1.345, 0.015, 6, 128),
    housing: new BoxGeometry(0.14, 0.2, 0.19),
    diode: new BoxGeometry(0.035, 0.085, 0.014),
    bolt: new SphereGeometry(0.025, 6, 4),
    heart: new IcosahedronGeometry(0.29, 1),
  }
  const material = {
    metal: new MeshStandardMaterial({ color: '#68717e', metalness: 0.95, roughness: 0.27 }),
    dark: new MeshStandardMaterial({ color: '#151b25', metalness: 0.85, roughness: 0.32 }),
    silver: new MeshStandardMaterial({ color: '#c6d2e5', metalness: 1, roughness: 0.2 }),
    energy: new MeshStandardMaterial({ color: '#bb9aff', emissive: '#9e64ff', emissiveIntensity: 3, metalness: 0.3, roughness: 0.22 }),
    crystal: new MeshPhysicalMaterial({ color: '#9c78e8', metalness: 0.45, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true, opacity: 0.8, flatShading: true }),
    heart: new MeshBasicMaterial({ color: '#eadcff', toneMapped: false }),
    lines: new LineBasicMaterial({ color: '#d4b9ff', transparent: true, opacity: 0.7 }),
  }
  return { geometry, material, dispose() { Object.values(geometry).forEach((item) => item.dispose()); Object.values(material).forEach((item) => item.dispose()) } }
}
