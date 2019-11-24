import React, { useRef, useEffect, forwardRef, useState } from 'react'
// import ReactDOM from "react-dom";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as THREE from 'three'
// import * as TWEEN from "tween";
import { OrbitControls } from './assets/OrbitControls'
import {
  extend,
  useRender,
  useThree,
  useFrame,
  Canvas
  // Scene
} from 'react-three-fiber'
// import { Galaxy } from 'xenocide-world-generator'
import { generatorActions } from '../generator'
// import Interface from "./interface/Interface";
// import useStore, { useSelectedSystem } from "../store";
import Star from './Star'
import System from './System'
import { actions } from './sceneStore'

extend({ OrbitControls })

export const Controls = ({ onAttach = () => {}, ...props }) => {
  const { gl, camera } = useThree()
  const controls = useRef()
  useRender((state, delta) => {
    if (controls.current) {
      controls.current.update()
      controls.current.updateTween()
    }
  })
  useEffect(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const containerWidth = 300
    camera.controls = controls.current
    camera.setViewOffset(width, height, -(containerWidth / 2), 0, width, height)
    onAttach()
    // console.log('controls', camera, controls)
    // camera&&control ? (camera.controls = controls.current) : ''
  }, [camera])
  // if (controls.current) {
  //   controls.current.cameraTo(new THREE.Vector3(0, 0, 0), 1, 1, 150, 4000);
  // }
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} {...props} />
  )
}

export function Scene({
  fov,
  systems,
  generator,
  updateGalaxy,
  updateSystem,
  initGenerator,
  controlsAttached
}) {
  // const { fov } = useStore(state => state.mutation);
  // const [selectedSystem, setSelectedSystem] = useSelectedSystem();
  // const [, setGalaxy] = useState({});
  // const [counter, setCounter] = useState(0);
  // const [, setSystems] = useState([]);

  useEffect(() => {
    initGenerator()
    return () => {}
  }, [])

  console.log('>', 'render scene', systems.length)

  // const { size, setDefaultCamera } = useThree()
  // useEffect(() => setDefaultCamera(camera.current), [])
  // useRender(() => {
  //   controls.current.obj.update()
  // })
  const groupRef = useRef()
  // const canvasRef = useRef();
  // useFrame(
  //   () => (groupRef.current.rotation.x = groupRef.current.rotation.y += 0.01)
  // );

  return (
    <Canvas
      className="canvas"
      // ref={canvasRef}
      // onPointerMove={actions.updateMouse}
      // onClick={actions.shoot}
      camera={{ position: [0, 50, 50], near: 0.01, far: 10000, fov }}
      onCreated={({ gl, camera }) => {
        console.log('onCreated')
        // actions.init(camera);
        gl.gammaInput = true
        gl.toneMapping = THREE.Uncharted2ToneMapping
        gl.setClearColor(new THREE.Color('#020207'))
      }}
    >
      <scene>
        <Controls
          onAttach={() => controlsAttached()}
          enableDamping
          rotateSpeed={0.3}
          dampingFactor={0.1}
        />
        <ambientLight intensity={0.25} color="white" />
        <group ref={groupRef}>
          {/* <fog attach="fog" args={["black", 100, 700]} /> */}
          {/* <ambientLight intensity={0.25} /> */}
          {/* <Star /> */}
          {/* <orbitControls ref={controls} /> */}
          {/* <Star position={[0, 0, 3000]} /> */}
          {systems.map((system, idx) => (
            <System
              key={
                '' +
                system.position.x +
                system.position.y +
                system.position.z +
                system.code
              }
              system={system}
            />
          ))}
        </group>
      </scene>
    </Canvas>
  )
}

export default connect(
  state => ({
    fov: state.root.fov,
    systems: (state.generator && state.generator.systems) || [],
    generator: state.generator.settings
  }),
  dispatch => bindActionCreators({ ...generatorActions, ...actions }, dispatch)
)(Scene)
