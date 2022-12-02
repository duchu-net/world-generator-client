import React, { useEffect, useState, useRef } from 'react'

import { getStore } from '../../../store'
import HtmlLabel from '../astronomical/HtmlLabel'
// import {
//   generatorSelectors,
//   generatorActions,
//   GENERATOR
// } from '../../generator'
// import System from './System'

const store = getStore()

export default function Selectable({ render, selected }) {
  const [hovered, setHovered] = useState(false)
  const [systemCodes, setCodes] = useState([])

  useEffect(() => {
    // const unsubscribe = store.subscribe(() => {
    //   const state = store.getState()
    //   const status = generatorSelectors.getStatus(state)
    //   // status === GENERATOR.GENERATOR_STATUS.RUNNING && setCodes([])
    //   status === GENERATOR.GENERATOR_STATUS.COMPLETED &&
    //     setCodes(generatorSelectors.getSystemCodes(state))
    // })
    // store.dispatch(generatorActions.initGenerator())

    return () => {
      // unsubscribe()
    }
  }, [])

  const groupRef = useRef()
  return (
    <group
      ref={groupRef}
      // scale={hovered ? [2, 2, 2] : [1, 1, 1]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
      // onClick={handleSelectSystem}
    >
      <HtmlLabel
        show={hovered}
        // data={system}
        type={'SYSTEM'}
        // onClick={handleSelectSystem}
      />
      {/* {render && render({ selected, hovered })} */}
    </group>
  )
}
