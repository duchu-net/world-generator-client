import * as THREE from 'three'
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { a } from 'react-spring/three'
// import earthImg from '../images/earth.jpg'
// import moonImg from '../images/moon.png'
// import { useSelectedSystem } from "../store";
import { useThree, useLoader } from 'react-three-fiber'
import Text from './Text'
import StarHight from './StarHight'

import { getStore } from '../../store'
import { selectors } from './sceneStore'

const store = getStore()

function changeColor(colorValue, hsL = 0.05) {
  const color = new THREE.Color(colorValue)
  const hsl = color.getHSL(color)
  color.setHSL(hsl.h, hsl.s, Math.max(hsl.l - hsL, 0))
  return color
}

export default function Star({
  position = [0, 0, 0],
  color = 'red',
  scale = 1,
  opacity = 1,
  ...props
}) {
  const [selected, setSelected] = useState(false)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSelected(selectors.getSelected(store.getState()) === props.code)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  // const { camera } = useThree()
  // useEffect(() => {
  //   if (selected) {
  //     console.log('selected first time', camera.uuid)
  //     /** @TODO the camera is shooting pirouettes when transfer between -/+ */
  //     const position = new THREE.Vector3()
  //     position.setFromMatrixPosition(ref.current.matrixWorld)

  //     const lookAt = new THREE.Spherical()

  //     const target = position.clone()
  //     target.sub(position)
  //     lookAt.setFromCartesianCoords(
  //       camera.position.x,
  //       camera.position.y,
  //       camera.position.z
  //     )
  //     // console.log(target, lookAt, camera.position)

  //     camera.controls.cameraTo(
  //       position,
  //       // new THREE.Vector3(position.x, position.y, position.z),
  //       // null,
  //       Math.abs(lookAt.theta),
  //       // null,
  //       Math.abs(lookAt.phi),
  //       15, // radius
  //       4000
  //     )
  //   }
  // }, [selected])

  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  // if (selected) window.location.href = `#${props.code}`;

  return (
    <group ref={ref} position={position}>
      {(hovered || selected) && (
        <Text
          frontToCamera
          color="white"
          size={0.5}
          position={[0, 1.5, 0]}
          // rotation={[-Math.PI / 2, 0, 0]}
          children={props.code.split('.').slice(-1)[0]}
          // visible={hovered || selected}
        />
      )}
      {/* {(hovered || selected) && ( */}
      {hovered && (
        <a.mesh
          position={[0, 0, 0]}
          geometry={new THREE.IcosahedronGeometry(4, 1)}
          material={
            new THREE.MeshBasicMaterial({
              color: new THREE.Color('#1e88e5'),
              transparent: true,
              wireframe: true,
              opacity: hovered ? 0.1 : 0.2
            })
          }
          // visible={hovered || selected}
        />
      )}

      {/* <mesh position={[0, 0, 0]}>
        <sphereBufferGeometry attach="geometry" args={[1.1, 32, 32]} />
        <meshStandardMaterial
          attach="material"
          roughness={1}
          map={texture}
          color={color}
          fog={false}
        />
      </mesh> */}
      {/* <pointLight position={[-5, -5, -5]} distance={1000} intensity={6} /> */}
      {selected && (
        <group scale={[scale, scale, scale]}>
          {/* <Suspense fallback={null}>
            <StarHight scale={[1.1, 1.1, 1.1]} color={color} />
          </Suspense> */}
        </group>
      )}
      <a.mesh
        scale={[scale, scale, scale]}
        // scale={hovered ? [2, 2, 2] : [1, 1, 1]}
        position={[0, 0, 0]}
        onClick={e => {
          e.stopPropagation()
          store.dispatch({ type: 'scene/SELECT_SYSTEM', payload: props.code })
        }}
        onPointerOver={e => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={e => {
          e.stopPropagation()
          setHovered(false)
        }}
        // onWheel={e => console.log("wheel spins")}
        // onPointerUp={e => console.log("up")}
        // onPointerDown={e => console.log("down")}
        // onPointerEnter={e => console.log("enter")}
        // onPointerLeave={e => console.log("leave")}
        // onPointerMove={e => console.log("move")}
        // onUpdate={self => console.log("props have been updated")}

        // geometry={new THREE.IcosahedronGeometry(1, 1)}
        geometry={
          new THREE.SphereBufferGeometry(
            selected ? 1 : 1,
            selected ? 32 : 16,
            selected ? 32 : 16
          )
        }
        // geometry={
        //   new THREE.SphereGeometry(1, selected ? 16 : 8, selected ? 16 : 8)
        // }
      >
        {/* <sphereBufferGeometry attach="geometry" args={[1, 32, 32]} /> */}
        <meshBasicMaterial
          attach="material"
          color={color ? changeColor(color) : '#FFFF99'}
          fog={false}
          opacity={opacity}
        />
        <pointLight
          distance={10}
          intensity={10}
          color={color || 'white'}
          // decay={2}
        />
      </a.mesh>
    </group>
  )
}
