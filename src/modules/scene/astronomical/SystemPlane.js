import React, { memo, useState, useEffect, useRef, Suspense } from 'react'

import * as THREE from 'three'
import { generatorSelectors } from '../../generator'
import { getStore } from '../../../store'
import Text from '../utils/Text'
import Planet from './Planet'
import Orbit from '../utils/Orbit'
import PolarGrid from '../utils/PolarGrid'
import AsteroidBelt from './AsteroidBelt'
import GalaxyStarsPoints from './GalaxyStarsPoints'

const store = getStore()

export function SystemPlane({ code, name }) {
  const [planets, setPlanets] = useState(
    generatorSelectors.getSystemPlanets(store.getState(), code)
  )

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      setPlanets(generatorSelectors.getSystemPlanets(state, code) || [])
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const systemSize = planets.length
    ? planets[planets.length - 1].orbit.from_star
    : 3
  const textDistance = systemSize * 1.5 + 6

  // console.log(planets, code)

  return (
    <>
      {/* <GalaxyStarsPoints /> */}
      <Text
        color="white"
        size={1}
        position={[0, 0, textDistance]}
        rotation={[-Math.PI / 2, 0, -Math.PI]}
        children={name}
        opacity={0.3}
        // visible={hovered || selected}
      />
      <Text
        color="white"
        size={1}
        position={[0, 0, -textDistance]}
        rotation={[-Math.PI / 2, 0, 0]}
        children={name}
        opacity={0.3}
        // visible={hovered || selected}
      />

      <Text
        color="white"
        size={1}
        position={[textDistance, 0, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        children={'+'}
        opacity={0.5}
        // visible={hovered || selected}
      />
      <Text
        color="white"
        size={1}
        position={[-textDistance, 0, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        children={'+'}
        opacity={0.5}
        // visible={hovered || selected}
      />
      <mesh
        position={[0, 0, 0]}
        geometry={new THREE.IcosahedronGeometry(systemSize * 1.5 + 10, 1)}
        material={
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('gray'),
            transparent: true,
            wireframe: true,
            opacity: 0.03
          })
        }
        // visible={hovered || selected}
      />
      <PolarGrid
        linewidth={0.7}
        minRadius={2.9}
        maxRadius={systemSize * 1.5 + 4}
        opacity={0.1}
      />
      {planets.length === 0 && <DemoPlanets code={code} />}
      {planets.map((planet) => {
        switch (planet.type) {
          case 'PLANET':
            return (
              <PlanetOrbitPlane key={planet.code} planet={planet} code={code} />
            )
          case 'ASTEROID_BELT':
            return (
              <AsteroidBelt
                key={planet.code}
                data={planet}
                systemCode={code}
                radius={planet.orbit.from_star * 1.5 + 2}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

const ORBIT_COLOR_BY_ZONE = {
  inner: '#ED4C3E',
  outer: '#1e88e5',
  habitable: '#009D50'
}
const PlanetOrbitPlane = memo(({ planet, code }) => (
  <group key={planet.code}>
    <Orbit
      radius={planet.orbit.from_star * 1.5 + 2}
      // color={'#1e88e5'}
      color={ORBIT_COLOR_BY_ZONE[planet.zone] || '#1e88e5'}
      idx={planet.orbit.from_star} //deprecated
      orbitalPeriod={1 / planet.orbit.orbital_period}
    >
      <Planet
        name={planet.designation}
        type={planet.subtype}
        data={planet}
        color={'lightblue'}
        scale={0.3}
        from_star={planet.orbit.from_star}
        systemCode={code}
        planetCode={planet.code}
      />
    </Orbit>
  </group>
))

const DemoPlanets = ({ code }) => (
  <>
    <Orbit radius={4} color={'#1e88e5'} idx={3}>
      <Planet
        name={'planet 1'}
        type="mercury"
        color={'brown'}
        scale={0.3}
        systemCode={code}
        planetCode={'planet1'}
      />
      <Orbit radius={1} color={'gray'} idx={-3}>
        <Planet name={'moon 1'} type="moon" color={'gray'} scale={0.07} />
      </Orbit>
      <Orbit radius={1.5} color={'gray'} idx={1.5}>
        <Planet name={'moon 2'} type="earth" color={'gray'} scale={0.1} />
      </Orbit>
    </Orbit>
    <Orbit radius={6.5} color={'#1e88e5'} idx={1}>
      <Planet
        name={'planet 2'}
        type="venus"
        color={'lightblue'}
        scale={0.3}
        systemCode={code}
        planetCode={'planet2'}
      />
    </Orbit>
  </>
)

export default SystemPlane
