import * as THREE from 'three'
import React, { useState, useMemo, useRef } from 'react'
import { useThree, useFrame } from 'react-three-fiber'
import fontFile from './assets/sans'

export default function Text({
  children,
  opacity = 1,
  size = 1,
  letterSpacing = 0.01,
  color = '#000000',
  centerX = true,
  centerY = true,
  frontToCamera,
  ...props
}) {
  const groupRef = useRef()
  const [font] = useState(() => new THREE.FontLoader().parse(fontFile))
  const [shapes, [x, y]] = useMemo(() => {
    let x = 0,
      y = 0
    let letters = [...String(children)]
    let mat = new THREE.MeshBasicMaterial({
      color,
      opacity: opacity,
      transparent: true,
      side: THREE.DoubleSide
    })
    return [
      letters.map(letter => {
        const geom = new THREE.ShapeGeometry(
          font.generateShapes(letter, size, 1)
        )
        geom.computeBoundingBox()
        const mesh = new THREE.Mesh(geom, mat)
        mesh.position.x = x
        x += geom.boundingBox.max.x + letterSpacing
        y = Math.max(y, geom.boundingBox.max.y)
        return mesh
      }),
      [x, y]
    ]
  }, [font, children, size, letterSpacing, color])

  useFrame(
    ({ camera }) => frontToCamera && groupRef.current.lookAt(camera.position)
    // () => (groupRef.current.rotation.x = groupRef.current.rotation.y += 0.01)
  )

  return (
    <group {...props} ref={groupRef}>
      <group position={[centerX ? -x / 2 : 0, centerY ? -y / 2 : 0, 0]}>
        {shapes.map((shape, index) => (
          <primitive key={index} object={shape} />
        ))}
      </group>
    </group>
  )
}
