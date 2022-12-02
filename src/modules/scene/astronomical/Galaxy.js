import React, { useEffect, useState, useRef } from 'react'

import { getStore } from '../../../store'
import {
  generatorSelectors,
  generatorActions,
  GENERATOR
} from '../../generator'
import System from './System'
// import GalaxyStarsPoints from './GalaxyStarsPoints'

const store = getStore()

export default function Galaxy() {
  const [systemCodes, setCodes] = useState([])

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      const status = generatorSelectors.getStatus(state)
      // status === GENERATOR.GENERATOR_STATUS.RUNNING && setCodes([])
      status === GENERATOR.GENERATOR_STATUS.COMPLETED &&
        setCodes(generatorSelectors.getSystemCodes(state))
    })
    store.dispatch(generatorActions.initGenerator())

    return () => {
      unsubscribe()
    }
  }, [])

  const groupRef = useRef()
  return (
    <group ref={groupRef}>
      {/* @TODO if (system selected) <><GalaxyStarsPoints /><System/></> else */}
      {/* <fog attach="fog" args={["black", 100, 700]} /> */}
      {systemCodes.map((code, idx) => (
        <System key={`${idx}_${code}`} code={code} />
      ))}
    </group>
  )
}
