import React, { useEffect, useState, useRef } from 'react'

import { getStore } from '../../store'
import { generatorSelectors } from '../generator'
import System from './System'

const store = getStore()

export default function GalaxyStarsPoints({}) {
  // const positions = []
  const [systemCodes = [], setCodes] = useState(
    generatorSelectors.getSystemCodes(store.getState())
  )
  // const [status, setStatus] = useState(null)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      // setStatus(generatorSelectors.getStatus(state))
      setCodes(generatorSelectors.getSystemCodes(state))
      // setSelected(selectors.isSystemSelected(state, code))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  console.log('>', 'render systems', systemCodes.length)

  const groupRef = useRef()
  return (
    <group ref={groupRef}>
      {/* <fog attach="fog" args={["black", 100, 700]} /> */}
      {/* <ambientLight intensity={0.25} /> */}
      {systemCodes.map((code, idx) => (
        <System key={code} code={code} />
      ))}
    </group>
  )
}
