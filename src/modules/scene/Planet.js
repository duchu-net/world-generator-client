import * as THREE from 'three'
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { useThree, useLoader } from 'react-three-fiber'
import { a } from 'react-spring/three'

import starImg from './assets/sunmap.jpg'
import moonImg from './assets/moon_surface.png'
// import earthImg from '../images/earth.jpg'
// import moonImg from '../images/moon.png'
// import { useSelectedSystem } from "../store";
import Text from './Text'
import PlanetMedium from './PlanetMedium'

import { getStore } from '../../store'
import { selectors } from './sceneStore'

// const store = getStore()

function PlanetAsset({ asset }) {
  const texture = useLoader(THREE.TextureLoader, asset)
  const props = {
    roughness: 1,
    // color:color || '#FFFF99',
    map: texture,
    fog: false
  }
  return <material attach={'material'} {...props} />
}

export default function Planet({
  position,
  color = '#595959',
  scale = 1,
  ...props
}) {
  // const [selected, setSelected] = useState(false)
  // useEffect(() => {
  //   console.log(props)
  //   const unsubscribe = store.subscribe(() => {
  //     setSelected(selectors.getSelected(store.getState()) === props.code)
  //   })
  //   return () => {
  //     unsubscribe()
  //   }
  // }, [])

  // const [texture] = useLoader(THREE.TextureLoader, [moonImg])
  // console.log(texture)

  const ref = useRef()

  return (
    <group
      ref={ref}
      // scale={[scale, scale, scale]}
      position={position || [0, 0, 0]}
    >
      <Text
        frontToCamera
        color="white"
        size={0.3}
        opacity={0.5}
        position={[0, 1.5, 0]}
        // rotation={[-Math.PI / 2, 0, 0]}
        children={'xyz'}
        // visible={hovered || selected}
      />
      {/* <Text
        color="white"
        size={0.5}
        opacity={0.5}
        position={[1, 0, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        children={'xyz'}
      /> */}
      <group scale={[scale, scale, scale]}>
        <Suspense
          // fallback={() => (
          //   <mesh
          //     geometry={new THREE.SphereBufferGeometry(1, 16, 16)}
          //     material={
          //       new THREE.MeshBasicMaterial({ color: color, fog: false })
          //     }
          //   />
          // )}
          fallback={null}
        >
          <PlanetMedium />
        </Suspense>
        <mesh
          geometry={new THREE.SphereBufferGeometry(1, 16, 16)}
          material={new THREE.MeshBasicMaterial({ color: color, fog: false })}
          // meterial={
          //   !texture
          //     ? new THREE.MeshBasicMaterial({ color: '#FFFF99', fog: false })
          //     : new THREE.MeshStandardMaterial({
          //         roughness: 1,
          //         // color:color || '#FFFF99',
          //         map: texture,
          //         fog: false
          //       })
          // }
        />
      </group>
    </group>
  )
}
