import React, { memo, useRef, useState, useEffect, Suspense } from 'react'
import * as THREE from 'three'
import { useThree, useLoader } from 'react-three-fiber'
// import { a } from 'react-spring/three'

import ringImg from '../assets/saturn-rings-top.png'
// import { getStore } from '../../../store'
// import { selectors } from '../sceneStore'
// import Text from '../utils/Text'
// import PlanetMedium from './PlanetMedium'

// const store = getStore()

// function PlanetAsset({ asset }) {
//   const texture = useLoader(THREE.TextureLoader, asset)
//   const props = {
//     roughness: 1,
//     // color:color || '#FFFF99',
//     map: texture,
//     fog: false
//   }
//   return <material attach={'material'} {...props} />
// }

function AsteroidBelt({
  position,
  scale = 1,
  name = 'xyz',
  type,
  systemCode,
  object,
  radius,
  ...props
}) {
  // const [texture] = useLoader(THREE.TextureLoader, [ringImg])
  const meshRef = useRef()

  // useEffect(() => {
  //   const { geometry } = meshRef.current
  //   const pos = geometry.attributes.position
  //   const v3 = new THREE.Vector3()
  //   for (let i = 0; i < pos.count; i++) {
  //     v3.fromBufferAttribute(pos, i)
  //     geometry.attributes.uv.setXY(i, v3.length() < 4 ? 0 : 1, 1)
  //   }
  //   geometry.attributes.position.needsUpdate = true
  // },[])

  return (
    <group>
      <mesh
        ref={meshRef}
        // position={[0, 0, 0]}
        rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
        geometry={new THREE.RingBufferGeometry(radius - 0.5, radius + 0.5, 64)}
        material={
          new THREE.MeshBasicMaterial({
            // map: texture,
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.08
          })
        }
      />
    </group>
  )
}

export default AsteroidBelt
