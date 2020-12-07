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
  upperCase = true,
  ...props
}) {
  const groupRef = useRef()
  const [font] = useState(() => new THREE.FontLoader().parse(fontFile))
  let text = String(children)
  if (upperCase) text = text.toUpperCase()
  const [shapes, [x, y]] = useMemo(() => {
    let x = 0,
      y = 0
    // let letters = [...String(children)]
    let mat = new THREE.MeshBasicMaterial({
      color,
      opacity: opacity,
      transparent: true,
      side: THREE.DoubleSide
    })
    const geom = new THREE.ShapeGeometry(font.generateShapes(text, size, 1))
    geom.computeBoundingBox()
    x = geom.boundingBox.max.x
    y = geom.boundingBox.max.y
    return [
      // letters.map((letter) => {
      //   const geom = new THREE.ShapeGeometry(
      //     font.generateShapes(letter, size, 1)
      //   )
      //   geom.computeBoundingBox()
      //   const mesh = new THREE.Mesh(geom, mat)
      //   mesh.position.x = x
      //   x += geom.boundingBox.max.x + letterSpacing
      //   y = Math.max(y, geom.boundingBox.max.y)
      //   return mesh
      // }),
      new THREE.Mesh(geom, mat),
      [x, y]
    ]
  }, [font, children, size, letterSpacing, color])

  useFrame(
    ({ camera }) => frontToCamera && groupRef.current?.lookAt(camera.position)
    // () => (groupRef.current.rotation.x = groupRef.current.rotation.y += 0.01)
  )

  return (
    <group {...props} ref={groupRef}>
      {/* <group position={[centerX ? -x / 2 : 0, centerY ? -y / 2 : 0, 0]}> */}
      <group position={[centerX ? -x / 2 : 0, centerY ? -y / 2 : 0, 0]}>
        <primitive object={shapes} />
        {/* {shapes.map((shape, index) => (
          <primitive key={index} object={shape} />
        ))} */}
      </group>
    </group>
  )
}
