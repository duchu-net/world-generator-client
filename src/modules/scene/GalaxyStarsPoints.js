import React, { useEffect, useState } from 'react'

import { getStore } from '../../store'
import { generatorSelectors } from '../generator'

const store = getStore()

export default function GalaxyStarsPoints({}) {
  // const positions = []
  const [systems = {}, setSystems] = useState({})
  const [status, setStatus] = useState(null)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      setStatus(generatorSelectors.getStatus(state))
      setSystems(generatorSelectors.DEPRECATED_getSystems(state))
      // setSelected(selectors.isSystemSelected(state, code))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const positions = Object.values(systems)
    .map(system => [system.position.x, system.position.y, system.position.z])
    .reduce((prev, curr) => {
      prev.push(curr[0])
      prev.push(curr[1])
      prev.push(curr[2])
      return prev
    }, [])
  console.log(positions)

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={3}
        sizeAttenuation
        color="white"
        fog={false}
      />
    </points>
  )
}
