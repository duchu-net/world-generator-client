import * as THREE from 'three'
import React, { memo, useRef, useState, useEffect, Suspense } from 'react'
import { useThree } from 'react-three-fiber'
import { a } from 'react-spring/three'

import { getStore } from '../../../store'
import { selectors } from '../sceneStore'
import Text from '../utils/Text'
import Selector from '../utils/Selector'
import PlanetMedium from './PlanetMedium'
import PlanetHigh from './PlanetHigh'
import HtmlLabel from './HtmlLabel'

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
  data = {},
  systemCode,
  planetCode,
  from_star,
  ...props
}) {
  const [settings, setSettings] = useState(
    selectors.getSettings(store.getState(), 'planet')
  )
  const [selected, setSelected] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { camera } = useThree()

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSettings(selectors.getSettings(store.getState(), 'planet'))
      // @TODO
      setSelected(selectors.isObjectSelected(store.getState(), planetCode))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const ref = useRef()
  useEffect(() => {
    if (selected) camera.updateTarget(ref.current)
  }, [selected, camera])

  const handleSelectPlanet = (event) => {
    event.stopPropagation()
    store.dispatch({
      type: 'scene/SELECT_SYSTEM',
      payload: { system: systemCode, object: data.code }
    })
  }

  const showSelector = selected || isHovered

  return (
    <group
      ref={ref}
      // scale={[scale, scale, scale]}
      position={position}
    >
      <HtmlLabel
        // position={new THREE.Vector3(radius, 0, 0)}
        show={isHovered || selected}
        type={'planet'}
        subtype={type}
        designation={data.designation || name}
        data={data}
        onClick={handleSelectPlanet}
        // orbit={data.orbit}
      />
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
        onClick={handleSelectPlanet}
        onPointerOver={(e) => {
          e.stopPropagation()
          setIsHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setIsHovered(false)
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
          {/* {from_star == 1 ? (
            <PlanetHigh type={type} />
          ) : (
            <PlanetMedium type={type} />
          )} */}
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
      {showSelector && <Selector hovered={isHovered} />}
    </group>
  )
}

export default memo(Planet)
