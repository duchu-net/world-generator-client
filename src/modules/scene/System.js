import React, { useState, useEffect, useRef, Suspense } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from 'react-three-fiber'

import { getStore } from '../../store'
import { generatorSelectors } from '../generator'
import { selectors, actions } from './sceneStore'
// import { actions } from './sceneStore'
import Star from './Star'
import Planet from './Planet'
import Text from './Text'
import Orbit from './Orbit'
import SystemGlowSprite from './SystemGlowSprite'
import PolarGrid from './PolarGrid'

const store = getStore()

export function System({ code }) {
  /** system by code */
  const [system, setSystem] = useState(
    generatorSelectors.getSystemByCode(store.getState(), code)
  )
  /** selected, not default(?) */
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      setSystem(generatorSelectors.getSystemByCode(state, code))
      setSelected(selectors.isSystemSelected(state, code))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  /** Animation */
  useFrame(
    () =>
      selected &&
      binaryRef.current &&
      (binaryRef.current.rotation.y = binaryRef.current.rotation.y += 0.001)
  )

  const ref = useRef()
  const { camera } = useThree()
  const { stars = [], position = {} } = system || {}
  const isStars = Boolean(stars.length)

  /** On Select System */
  useEffect(() => {
    if (selected && position) {
      console.log('selected one time', code)
      /** @TODO the camera is shooting pirouettes when transfer between -/+ */
      const position = new THREE.Vector3()
      position.setFromMatrixPosition(ref.current.matrixWorld)

      const cameraRool = new THREE.Spherical()

      const target = position.clone()
      target.sub(position)
      cameraRool.setFromCartesianCoords(
        camera.position.x,
        camera.position.y,
        camera.position.z
      )
      camera.controls.cameraTo(
        position,
        // new THREE.Vector3(position.x, position.y, position.z),
        Math.abs(cameraRool.theta),
        null, // phi - null=default
        15, // radius
        4000
      )
    }
  }, [selected])

  const binaryRef = useRef()

  return (
    <Suspense fallback={null}>
      <group
        ref={ref}
        position={[position.x, position.y, position.z]}
        scale={[selected ? 1 : 0.5, selected ? 1 : 0.5, selected ? 1 : 0.5]}
        // onClick={e => {
        //   e.stopPropagation()
        //   store.dispatch(actions.select(code))
        // }}
      >
        {!selected && isStars && <SystemGlowSprite color={stars[0].color} />}

        {selected && (
          <>
            <Text
              color="white"
              size={1}
              position={[0, 0, 10]}
              rotation={[-Math.PI / 2, 0, -Math.PI]}
              children={system.name}
              opacity={0.3}
              // visible={hovered || selected}
            />
            <Text
              color="white"
              size={1}
              position={[0, 0, -10]}
              rotation={[-Math.PI / 2, 0, 0]}
              children={system.name}
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
                  opacity: 0.05
                })
              }
              // visible={hovered || selected}
            />
            <PolarGrid />
            <Orbit radius={4} color={'#1e88e5'} idx={3}>
              <Planet name={'planet 1'} color={'brown'} scale={0.3} />
              <Orbit radius={1} color={'gray'} idx={-3}>
                <Planet name={'moon 1'} color={'gray'} scale={0.07} />
              </Orbit>
              <Orbit radius={1.5} color={'gray'} idx={1}>
                <Planet name={'moon 2'} color={'gray'} scale={0.1} />
              </Orbit>
            </Orbit>
            <Orbit radius={6.5} color={'#1e88e5'} idx={1}>
              <Planet name={'planet 2'} color={'lightblue'} scale={0.3} />
            </Orbit>
            {/* <Orbit radius={6} color={'#1e88e5'} idx={2}>
            <Planet color={'green'} scale={0.4} />
            <Orbit radius={1} color={'#1e88e5'} idx={4}>
              <Planet color={'slategray'} scale={0.16} />
            </Orbit>
            <Orbit radius={1.5} color={'#1e88e5'} idx={2}>
              <Planet color={'slategray'} scale={0.24} />
            </Orbit>
          </Orbit>
          <Orbit radius={8} color={'#1e88e5'} idx={1}>
            <Planet color={'aqua'} scale={0.3} />
          </Orbit> */}
          </>
        )}

        {/* <mesh
        geometry={new THREE.IcosahedronGeometry(15, 1)}
        material={
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('gray'),
            transparent: true,
            wireframe: true,
            opacity: 0.08
          })
        }
        onClick={() => {
          console.log('onClick')
          store.dispatch(actions.selectSystem(code))
        }}
      /> */}

        <group>
          {stars.length === 1 && (
            <Star {...stars[0]} key={stars[0].code} selectedSystem={selected} />
          )}
          {stars.length === 2 && (
            <group ref={binaryRef}>
              {/* <axesHelper /> */}
              {stars.map((star = {}, starIdx) => (
                <Star
                  {...star}
                  key={star.code}
                  code={star.code}
                  scale={starIdx ? 0.5 : 1}
                  // opacity={selected ? 1 : 0.3}
                  position={[-(starIdx ? 1.5 : -1) * 1, 0, 0]}
                  selectedSystem={selected}
                  // position={[-(!starIdx ? -1 : 1) * 2, -(!starIdx ? -1 : 1) * 2, 0]}
                  // color={star.color}
                />
              ))}
            </group>
          )}
        </group>
      </group>
    </Suspense>
  )
}

export default System
