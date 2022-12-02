import React, { memo, useState, useEffect, useRef, Suspense } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from 'react-three-fiber'

import { getStore } from '../../../store'
import { generatorSelectors } from '../../generator'
import { selectors, actions } from '../sceneStore'
// import { actions } from './sceneStore'
import Star from './Star'
import StarSprite from './StarSprite'
import Planet from './Planet'
import SystemPlane from './SystemPlane'
import Orbit from '../utils/Orbit'
import SystemGlowSprite from './SystemGlowSprite'
import HtmlLabel from './HtmlLabel'

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
      //  @TODO too much checks - cut off `set` functions
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

  // console.log('render')

  /** On Select System */
  useEffect(() => {
    if (selected && position) {
      console.log('selected one time', code)
      /** @TODO the camera is shooting pirouettes when transfer between -/+ */
      const position = new THREE.Vector3()
      position.setFromMatrixPosition(ref.current.matrixWorld)

      const cameraRool = new THREE.Spherical()

      // const target = position.clone()
      // target.sub(position)
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
  const [hovered, setHovered] = useState(false)

  const handleSelectSystem = (event) => {
    event.stopPropagation()
    store.dispatch({
      type: 'scene/SELECT_SYSTEM',
      payload: { system: system.code }
    })
  }

  if (!system) return null

  return (
    <Suspense fallback={null}>
      <group
        // visible={selected}
        ref={ref}
        position={[position.x * 1.1, position.y * 1.1, position.z * 1.1]}
        scale={[selected ? 1 : 0.5, selected ? 1 : 0.5, selected ? 1 : 0.5]}
        // onClick={e => {
        //   e.stopPropagation()
        //   store.dispatch(actions.select(code))
        // }}
      >
        {/* TODO ... in progress */}
        {/* {!selected && (
          <group>
            <HtmlLabel
              show={hovered}
              data={system}
              type={'SYSTEM'}
              // subtype={props.type}
              // designation={system.designation}
              onClick={handleSelectSystem}
            />

            <group
              scale={hovered ? [2, 2, 2] : [1, 1, 1]}
              onPointerOver={(e) => {
                e.stopPropagation()
                setHovered(true)
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                setHovered(false)
              }}
              onClick={handleSelectSystem}
            >
              <StarSprite color={stars[0].color} />
            </group>
            <SystemGlowSprite scale={4} color={stars[0].color} />
          </group>
        )} */}

        {!selected && <SystemGlowSprite color={stars[0].color} />}
        {/* {selected && ( */}
        <group>
          {stars.length === 1 && (
            <Star
              {...stars[0]}
              data={stars[0]}
              key={stars[0].code}
              systemCode={code}
              selectedSystem={selected}
            />
          )}
          {stars.length === 2 && (
            <group ref={binaryRef}>
              {stars.map((star = {}, starIdx) => (
                <Star
                  {...star}
                  data={star}
                  key={star.code}
                  code={star.code}
                  systemCode={code}
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
        {/* )} */}
        {selected && <SystemPlane code={code} name={system.name} />}
      </group>
    </Suspense>
  )
}

export default System
