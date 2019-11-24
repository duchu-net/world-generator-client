import * as THREE from 'three'
import React, { useRef, useState, useEffect } from 'react'
import { a } from 'react-spring/three'
import starImg from './assets/sunmap.jpg'
import moonImg from './assets/moon_surface.png'
// import earthImg from '../images/earth.jpg'
// import moonImg from '../images/moon.png'
// import { useSelectedSystem } from "../store";
import Text from './Text'

import { getStore } from '../../store'
import { selectors } from './sceneStore'
import { useThree, useLoader } from 'react-three-fiber'

const store = getStore()

function Glow({}) {
  return 'skadj'
}

export default function Star({
  position,
  color,
  scale = 1,
  opacity = 1,
  ...props
}) {
  const [selected, setSelected] = useState(false)
  useEffect(() => {
    // console.log(props)
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

  // const counter = useSelector(state => state.counter);
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  // const [selected, setSelected] = useState(false);

  // const [nil, setSelectedSystem] = useSelectedSystem(null, true);
  // const selected = selectedSystem.code === props.code;
  // if (selected) window.location.href = `#${props.code}`;

  // console.log("<>", props);
  // const [texture, moon] = useLoader(THREE.TextureLoader, [earthImg, moonImg])

  // const [texture, moon] = useLoader(THREE.TextureLoader, [starImg, moonImg])

  return (
    <group
      ref={ref}
      // scale={[100, 100, 100]}
      position={position || [0, 0, 0]}
    >
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

      {/* {selected && texture && (
        <mesh position={[0, 0, 0]}>
          <sphereBufferGeometry attach="geometry" args={[1, 32, 32]} />
          <meshStandardMaterial
            roughness={1}
            attach="material"
            color={color || '#FFFF99'}
            map={texture}
            fog={false}
          />
        </mesh>
        // <mesh
        //   scale={[scale, scale, scale]}
        //   material={
        //     new THREE.MeshPhongMaterial({
        //       map: texture
        //       // side: THREE.FrontSide
        //     })
        //   }
        //   geometry={new THREE.SphereGeometry(1, 32, 32)}
        // />
      )} */}

      {/* <mesh position={[5, -5, -5]}>
        <sphereBufferGeometry attach="geometry" args={[0.75, 32, 32]} />
        <meshStandardMaterial attach="material" roughness={1} map={moon} fog={false} />
      </mesh> */}
      {/* <pointLight position={[-5, -5, -5]} distance={1000} intensity={6} /> */}
      <a.mesh
        scale={[scale, scale, scale]}
        // scale={hovered ? [2, 2, 2] : [1, 1, 1]}
        position={[0, 0, 0]}
        onClick={e => {
          e.stopPropagation()
          // console.log("click", props.code, selected);
          // setSelected(!selected);
          // setSelectedSystem({ code: props.code });
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
          color={color || '#FFFF99'}
          fog={false}
          opacity={opacity}
        />
        {/* <pointLight distance={100} intensity={1} color="white" /> */}
      </a.mesh>
    </group>
  )
}
