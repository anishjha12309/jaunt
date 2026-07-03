import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const POINT_COUNT = 400
const BLUE = new THREE.Color(0x1d40f0)
const INK = new THREE.Color(0x1b1b18)

/**
 * Sparse drifting point field, blue/ink on transparent, rendered behind the summary strip
 * and the queue-clear state only. Lazy-loaded (its own chunk) and never mounted under
 * reduced motion. Kept at opacity ≤ .35 and `pointer-events-none` so it never fights the UI.
 */
export default function AmbientScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 1
    const height = mount.clientHeight || 1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const positions = new Float32Array(POINT_COUNT * 3)
    const colors = new Float32Array(POINT_COUNT * 3)
    for (let i = 0; i < POINT_COUNT; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      const tint = Math.random() < 0.5 ? BLUE : INK
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let parallax = 0
    const onScroll = () => {
      parallax = window.scrollY * 0.0006
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onResize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let raf = 0
    const render = () => {
      const t = clock.getElapsedTime()
      points.rotation.y = t * 0.02
      points.rotation.x = Math.sin(t * 0.05) * 0.05 + parallax
      renderer.render(scene, camera)
      raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} aria-hidden="true" className="h-full w-full opacity-30" />
}
