import * as THREE from 'three'
import React, { memo, useState, useMemo, useRef, useEffect } from 'react'
import { useThree, useFrame } from 'react-three-fiber'

const dt = new Date()
// const startTime =
//   dt.getSeconds() + 60 * dt.getMinutes() + 60 * 60 * dt.getHours()
//     const { revolution_time } = this.props.planet
//     const from_star = this.props.planet.from_star || this.props.from_star
//     const orbit_period = (this.props.planet || {}).orbit_period || 360 * from_star
//     const yStart = ((dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours())) /60/60/24) * orbit_period * (Math.PI/180)
//     this.$orbitRotation.rotation.y = yStart
//     this.$orbitProjectionRotation.rotation.y = yStart

function Orbit({
  idx = 1,
  opacity = 0.3,
  radius = 1,
  color = '#000000',
  linewidth = 5,
  orbitalPeriod = 1,
  // size = 1,  color = '#000000',
  // centerX = true,
  // centerY = true,
  children,
  ...props
}) {
  // const [dt] = useState(new Date())
  const groupRef = useRef()
  const pivotRef = useRef()
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

  // useEffect(() => {
  //   console.log('useEffect')
  //   const zStart = (startTime / 60 / 60 / 24) * orbitalPeriod * (Math.PI / 180)

  //   pivotRef.current.rotation.z = zStart
  // }, [])

  useFrame(
    //   ({ camera }) => frontToCamera && groupRef.current.lookAt(camera.position)
    () => {
      const rotation = pivotRef.current?.rotation || {}
      rotation.z += 0.0008 * orbitalPeriod
    }
  )

  // const zStart = (startTime / 60 / 60 / 24) * orbitalPeriod * (Math.PI / 180)
  const zStart =
    ((dt.getSeconds() + 60 * dt.getMinutes() + 60 * 60 * dt.getHours()) /
      60 /
      60 /
      24) *
    orbitalPeriod *
    (Math.PI / 180)

  // console.log('render', zStart * 10000)

  return (
    <group
      {...props}
      ref={groupRef}
      // rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
    >
      <group>
        <lineLoop
          rotation={new THREE.Euler(-Math.PI / 2, 0, zStart * 10000)}
          ref={pivotRef}
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
          {children && (
            <group
              position={new THREE.Vector3(radius, 0, 0)}
              rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
            >
              {children}
            </group>
          )}
          {/* <geometry vertices={points.vertices} /> */}
          {/* <lineBasicMaterial
          color={new THREE.Color(color)}
          transparent
          opacity={opacity}
          linewidth={5}
        /> */}
        </lineLoop>
      </group>
    </group>
  )
}

export default memo(Orbit)
