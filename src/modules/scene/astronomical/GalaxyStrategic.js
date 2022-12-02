import React, { useEffect, useState, useRef } from 'react'

import { getStore } from '../../../store'
import { generatorSelectors, generatorActions, GENERATOR } from '../../generator'
import HtmlLabel from './HtmlLabel'
import { Html } from '@react-three/drei/web/Html'
// import System from './System'
// import GalaxyStarsPoints from './GalaxyStarsPoints'

const store = getStore()

export default function GalaxyStrategic() {
  // const [systemCodes, setCodes] = useState([])
  const [systems, setSystems] = useState([])

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      // setGalaxy(generatorSelectors.getGalaxy(state))
      setSystems(generatorSelectors.getSystems(state))
      // const status = generatorSelectors.getStatus(state)
      // status === GENERATOR.GENERATOR_STATUS.RUNNING && setCodes([])
      // status === GENERATOR.GENERATOR_STATUS.COMPLETED && setCodes(generatorSelectors.getSystemCodes(state))
    })
    store.dispatch(generatorActions.initGenerator())

    return () => {
      unsubscribe()
    }
  }, [])

  console.log('systems')

  const groupRef = useRef()
  return (
    <group ref={groupRef}>
      {Object.values(systems).map((system) => (
        <group position={[system.position.x * 1, system.position.y * 1, system.position.z * 1]} key={system.code}>
          {/* <HtmlLabel data={system} type="SYSTEM" show /> */}
          <Html>
            <div style={{ width: 100, display: 'flex' }}>
              <div style={{ opacity: 0.2, fontSize: 8 }}>
                <div>{system.name}</div>
                <div>system</div>
              </div>
              <div
                style={{
                  background: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20
                }}
              />
            </div>
          </Html>
        </group>
      ))}
      {/* @TODO if (system selcted) <><GalaxyStarsPoints /><System/></> else */}
      {/* <fog attach="fog" args={["black", 100, 700]} /> */}
      {/* {systemCodes.map((code, idx) => (
        <System key={`${idx}_${code}`} code={code} />
      ))} */}
    </group>
  )
}
