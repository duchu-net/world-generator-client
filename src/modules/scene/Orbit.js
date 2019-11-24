import * as THREE from 'three'
import React, { useState, useMemo, useRef } from 'react'
import { useThree, useFrame } from 'react-three-fiber'
import fontFile from './assets/sans'

export default function Orbit({
  opacity = 0.3,
  radius = 1,
  color = '#000000',
  linewidth = 5,
  // size = 1,  color = '#000000',
  // centerX = true,
  // centerY = true,
  ...props
}) {
  const groupRef = useRef()
  // const [font] = useState(() => new THREE.FontLoader().parse(fontFile))
  const [geometry] = useMemo(() => {
    // let x = 0,
    //   y = 0
    // let letters = [...String(children)]
    // let mat = new THREE.MeshBasicMaterial({
    //   color,
    //   opacity: opacity,
    //   transparent: true,
    //   side: THREE.DoubleSide
    // })
    const circle = new THREE.Shape()
    circle.moveTo(radius, 0)
    circle.absarc(0, 0, radius, 0 + 1 / radius, Math.PI * 2 - 1 / radius, false)
    // const points = circle.createPointsGeometry(100)

    // const points = new THREE.Geometry().setFromPoints(circle)
    // console.log(points)

    // const geometry = new THREE.ExtrudeGeometry(circle, {
    //   // depth: 5
    //   // bevelEnabled: false
    // })

    const geometry = new THREE.CircleGeometry(radius, 100)
    geometry.vertices.shift()

    return [
      geometry
      // [x, y]
    ]
  }, [radius])

  // useFrame(
  //   ({ camera }) => frontToCamera && groupRef.current.lookAt(camera.position)
  //   // () => (groupRef.current.rotation.x = groupRef.current.rotation.y += 0.01)
  // )

  return (
    <group
      {...props}
      ref={groupRef}
      rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
    >
      <lineLoop
        position={new THREE.Vector3(0, 0, 0)}
        geometry={geometry}
        material={
          new THREE.LineBasicMaterial({
            color,
            opacity,
            linewidth,
            transparent: opacity === 0 ? false : true
          })
        }
      >
        {/* <geometry vertices={points.vertices} /> */}
        {/* <lineBasicMaterial
          color={new THREE.Color(color)}
          transparent
          opacity={opacity}
          linewidth={5}
        /> */}
      </lineLoop>
    </group>
  )
}
