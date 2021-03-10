import * as THREE from 'three'
import React, { memo, useRef, useState, useEffect, Suspense } from 'react'
import { useThree } from 'react-three-fiber'
import { a } from 'react-spring/three'

import { getStore } from '../../../store'
import { selectors } from '../sceneStore'
import Text from '../utils/Text'
import PlanetMedium from './PlanetMedium'

const store = getStore()

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

function Planet({
  position,
  color = '#595959',
  scale = 1,
  name = 'xyz',
  type,
  systemCode,
  planetCode,
  ...props
}) {
  const [settings, setSettings] = useState(
    selectors.getSettings(store.getState(), 'planet')
  )
  const [selected, setSelected] = useState(false)
  const { camera } = useThree()

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSettings(selectors.getSettings(store.getState(), 'planet'))
      // @TODO
      setSelected(selectors.isPlanetSelected(store.getState(), planetCode))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const ref = useRef()
  useEffect(() => {
    if (selected) camera.updateTarget(ref.current)
  }, [selected, camera])

  return (
    <group
      ref={ref}
      // scale={[scale, scale, scale]}
      position={position}
    >
      {settings['name.show'] && (
        <Text
          frontToCamera
          color="white"
          size={0.3}
          opacity={0.5}
          position={[0, 1.5, 0]}
          // rotation={[-Math.PI / 2, 0, 0]}
          children={name}
          // visible={hovered || selected}
        />
      )}
      {/* <Text
        color="white"
        size={0.5}
        opacity={0.5}
        position={[1, 0, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        children={'xyz'}
      /> */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          console.log('select planet')
          store.dispatch({
            type: 'scene/SELECT_PLANET',
            payload: `${systemCode}/${planetCode}`
          })
        }}
        scale={[scale, scale, scale]}
      >
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
          <PlanetMedium type={type} />
        </Suspense>
        <mesh
          geometry={new THREE.SphereBufferGeometry(0.95, 16, 16)}
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

      {/* @TODO */}
      {selected && (
        <a.mesh
          geometry={new THREE.IcosahedronGeometry(1.3, 1)}
          material={
            new THREE.MeshBasicMaterial({
              color: new THREE.Color('#1e88e5'),
              transparent: true,
              wireframe: true,
              opacity: 0.3
              // opacity: hovered ? 0.1 : 0.2
            })
          }
          // visible={hovered || selected}
        />
      )}
    </group>
  )
}

export default memo(Planet)
