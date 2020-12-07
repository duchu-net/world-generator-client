import React, { useRef, useEffect, forwardRef, useState } from 'react'
// import ReactDOM from "react-dom";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as THREE from 'three'
// import * as TWEEN from "tween";
import { OrbitControls } from './assets/OrbitControls'
import {
  extend,
  useThree,
  useFrame,
  Canvas
  // Scene
} from 'react-three-fiber'
// import { Galaxy } from 'xenocide-world-generator'
import { generatorActions, generatorSelectors } from '../generator'
// import Interface from "./interface/Interface";
// import useStore, { useSelectedSystem } from "../store";
// import Star from './Star'
import System from './System'
import { actions, selectors } from './sceneStore'
// import GalaxyStarsPoints from './GalaxyStarsPoints'
import Systems from './Systems'
import SquareGrid from './SquareGrid'

extend({ OrbitControls })

export const Controls = ({ onAttach = () => {}, ...props }) => {
  const { gl, camera } = useThree()
  const controls = useRef()
  useFrame((state, delta) => {
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
  settings: { fov },
  systemCodes,
  initGenerator,
  controlsAttached
}) {
  useEffect(() => {
    initGenerator()
    return () => {}
  }, [])

  const groupRef = useRef()

  return (
    <Canvas
      className="canvas"
      // ref={canvasRef}
      camera={{ position: [0, 50, 50], near: 0.01, far: 10000, fov }}
      onCreated={({ gl, camera }) => {
        console.log('onCreated')
        // actions.init(camera);
        // gl.getShaderInfoLog = () => {}
        // gl.getProgramInfoLog = () => {}
        // gl.gammaInput = true
        // gl.toneMapping = THREE.Uncharted2ToneMapping
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
        <ambientLight intensity={0.1} color="white" />
        {/* <GalaxyStarsPoints /> */}
        {/* <Systems /> */}

        {/* <SquareGrid />
        <axisHelper /> */}

        <group ref={groupRef}>
          {/* <fog attach="fog" args={["black", 100, 700]} /> */}
          {/* <ambientLight intensity={0.25} /> */}
          {systemCodes.map((code, idx) => (
            <System key={code} code={code} />
          ))}
        </group>
      </scene>
    </Canvas>
  )
}

const makeMapStateToProps = (initialState, initialProps) => {
  const mapStateToProps = (state) => {
    return {
      settings: selectors.getSettings(state),
      systemCodes: generatorSelectors.getSystemCodes(state)
    }
  }
  return mapStateToProps
}
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ ...generatorActions, ...actions }, dispatch)

export default connect(makeMapStateToProps, mapDispatchToProps)(Scene)
