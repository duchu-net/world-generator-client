import React, { memo, useRef, useState, useEffect, Suspense } from 'react'
import * as THREE from 'three'
import HtmlLabel from './HtmlLabel'
import ringImg from '../assets/saturn-rings-top.png'

import { getStore } from '../../../store'
import { selectors } from '../sceneStore'

const store = getStore()

function AsteroidBelt({
  position,
  scale = 1,
  name = 'xyz',
  type,
  systemCode,
  data = {},
  radius,
  ...props
}) {
  // const [texture] = useLoader(THREE.TextureLoader, [ringImg])
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  const [selected, setSelected] = useState(false)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSelected(selectors.isObjectSelected(store.getState(), data.code))
    })
    return () => {
      unsubscribe()
    }
  }, [])

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

  const showSelector = isHovered || selected

  const handleSelectSystem = (event) => {
    event.stopPropagation()
    store.dispatch({
      type: 'scene/SELECT_SYSTEM',
      payload: { system: systemCode, object: data.code }
    })
  }

  return (
    <group>
      <HtmlLabel
        show={showSelector}
        position={new THREE.Vector3(radius, 0, 0)}
        type={data.type}
        // subtype={data.subtype}
        designation={data.designation}
        // orbit={data.orbit}
        onClick={handleSelectSystem}
        data={data}
      />
      <mesh
        onClick={handleSelectSystem}
        onPointerOver={(e) => {
          e.stopPropagation()
          setIsHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setIsHovered(false)
        }}
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
            opacity: showSelector ? 0.2 : 0.08
          })
        }
      />
    </group>
  )
}

export default AsteroidBelt
