import * as THREE from 'three'
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { useThree, useLoader } from 'react-three-fiber'
import { a } from 'react-spring/three'
import { Html } from '@react-three/drei/web/Html'

const Selector = ({ hovered, size = 1 }) => {
  return (
    <a.mesh
      // position={[0, 0, 0]}
      geometry={new THREE.IcosahedronGeometry(size, 1)}
      material={
        new THREE.MeshBasicMaterial({
          color: new THREE.Color('#1e88e5'),
          transparent: true,
          wireframe: true,
          opacity: hovered ? 0.1 : 0.2
        })
      }
      // visible={hovered || selected}
    />
  )
}

export default Selector
