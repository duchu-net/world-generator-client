import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from 'react-three-fiber'

import { getStore } from '../../store'
import { selectors, actions } from './sceneStore'
// import { actions } from './sceneStore'
import Star from './Star'
import Text from './Text'
import Orbit from './Orbit'

const store = getStore()

export function System({ system: { stars = [], position, ...system } = {} }) {
  const [selected, setSelected] = useState(false)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const nextSelected = selectors.getSelected(store.getState())
      setSelected(
        nextSelected === system.code ||
          // stars.findIndex(star => star.code === nextSelected) > -1
          (typeof nextSelected === 'string' &&
            nextSelected.startsWith(system.code + '.'))
      )
    })
    return () => {
      unsubscribe()
    }
  }, [])

  useFrame(
    () =>
      selected &&
      binaryRef.current &&
      (binaryRef.current.rotation.y = binaryRef.current.rotation.y += 0.001)
  )

  const ref = useRef()
  const { camera } = useThree()
  useEffect(() => {
    if (selected) {
      console.log('selected first time', camera.uuid)
      /** @TODO the camera is shooting pirouettes when transfer between -/+ */
      const position = new THREE.Vector3()
      position.setFromMatrixPosition(ref.current.matrixWorld)

      const lookAt = new THREE.Spherical()

      const target = position.clone()
      target.sub(position)
      lookAt.setFromCartesianCoords(
        camera.position.x,
        camera.position.y,
        camera.position.z
      )
      // console.log(target, lookAt, camera.position)

      camera.controls.cameraTo(
        position,
        // new THREE.Vector3(position.x, position.y, position.z),
        // null,
        Math.abs(lookAt.theta),
        // null,
        Math.abs(lookAt.phi),
        15, // radius
        4000
      )
    }
  }, [selected])

  const binaryRef = useRef()

  return (
    <group
      ref={ref}
      position={[position.x, position.y, position.z]}
      // onClick={e => {
      //   e.stopPropagation()
      //   store.dispatch(actions.select(system.code))
      // }}
    >
      {selected && (
        <>
          <Text
            color="white"
            size={1}
            position={[0, 0, 10]}
            rotation={[-Math.PI / 2, 0, -Math.PI]}
            children={system.code}
            opacity={0.3}
            // visible={hovered || selected}
          />
          <Text
            color="white"
            size={1}
            position={[0, 0, -10]}
            rotation={[-Math.PI / 2, 0, 0]}
            children={system.code}
            opacity={0.3}
            // visible={hovered || selected}
          />

          <Text
            color="white"
            size={1}
            position={[10, 0, 0]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            children={'+'}
            opacity={0.5}
            // visible={hovered || selected}
          />
          <Text
            color="white"
            size={1}
            position={[-10, 0, 0]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            children={'+'}
            opacity={0.5}
            // visible={hovered || selected}
          />
          <mesh
            position={[0, 0, 0]}
            geometry={new THREE.IcosahedronGeometry(9, 1)}
            material={
              new THREE.MeshBasicMaterial({
                color: new THREE.Color('gray'),
                transparent: true,
                wireframe: true,
                opacity: 0.1
              })
            }
            // visible={hovered || selected}
          />
          <Orbit radius={5} color={'white'} />
        </>
      )}
      <group>
        {/* {((selected && stars.length === 1) || !selected) && ( */}
        {stars.length === 1 && <Star {...stars[0]} key={stars[0].code} />}
        {stars.length === 2 && (
          <group ref={binaryRef}>
            {/* <axesHelper /> */}
            {stars.map((star = {}, starIdx) => (
              <Star
                {...star}
                key={star.code}
                code={star.code}
                scale={starIdx ? 0.5 : 1}
                position={[-(starIdx ? 1.5 : -1) * 2, 0, 0]}
                // position={[-(!starIdx ? -1 : 1) * 2, -(!starIdx ? -1 : 1) * 2, 0]}
                // color={star.color}
              />
            ))}
          </group>
        )}
      </group>
    </group>
  )
}

export default System
