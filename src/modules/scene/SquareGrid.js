import * as THREE from 'three'
import React, { useState, useMemo, useRef } from 'react'

export default function SquareGrid({
  color = 'gray',
  opacity = 0.1,
  linewidth = 1,
  axisCount = 32,
  minRadius = 3,
  maxRadius = 8,
  children
}) {
  const groupRef = useRef()

  const circlesCount = Math.floor(maxRadius - minRadius) + 1

  const material = new THREE.LineBasicMaterial({
    color,
    opacity,
    linewidth,
    transparent: opacity === 0 ? false : true
  })
  // const rightMaterial = new THREE.LineBasicMaterial({
  //   color: 'white',
  //   opacity: Math.min(opacity * 1.5, 1),
  //   linewidth,
  //   transparent: opacity === 0 ? false : true
  // })

  const axisGeometry = new THREE.Geometry()
  axisGeometry.vertices = [
    new THREE.Vector3(0, 0, -50),
    new THREE.Vector3(0, 0, 50)
  ]
  // const rightAxisGeometry = new THREE.Geometry()
  // rightAxisGeometry.vertices = [
  //   new THREE.Vector3(minRadius - 0.5, 0, 0),
  //   new THREE.Vector3(maxRadius + 0.5, 0, 0)
  // ]

  const lines = Array.from({ length: axisCount })

  return (
    <group ref={groupRef} position={new THREE.Vector3(0, -0.1, 0)}>
      {lines.map((_, idx) => {
        return (
          <line
            key={idx}
            position={new THREE.Vector3(idx % 2 === 0 ? idx : -idx, 0, 0)}
            // rotation={new THREE.Euler(0, (idx * Math.PI) / (axisCount / 2), 0)}
            geometry={axisGeometry}
            material={material}
          />
        )
      })}
      <group rotation={new THREE.Euler(0, Math.PI / 2, 0)}>
        {lines.map((_, idx) => {
          return (
            <line
              key={idx}
              position={new THREE.Vector3(idx % 2 === 0 ? idx : -idx, 0, 0)}
              // rotation={new THREE.Euler(0, (idx * Math.PI) / (axisCount / 2), 0)}
              geometry={axisGeometry}
              material={material}
            />
          )
        })}
      </group>
      {/* {Array.from({ length: axisCount }).map((_, idx) => {
        const isRightAxe = idx % (axisCount / 4) === 0
        return (
          <line
            key={idx}
            rotation={new THREE.Euler(0, (idx * Math.PI) / (axisCount / 2), 0)}
            geometry={isRightAxe ? rightAxisGeometry : axisGeometry}
            material={isRightAxe ? rightMaterial : material}
          />
        )
      })} */}
      {/* <group rotation={new THREE.Euler(Math.PI / 2, 0, 0)}>
        {Array.from({ length: circlesCount }).map((_, idx) => {
          const geometry = new THREE.CircleGeometry(idx + minRadius, 100)
          geometry.vertices.shift()
          return <lineLoop key={idx} geometry={geometry} material={material} />
        })}
      </group> */}
    </group>
  )
}
