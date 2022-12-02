import React, { useRef, useEffect } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from 'react-three-fiber'
import { Stats } from '@react-three/drei/core/Stats'
import { OrbitControls } from './utils/OrbitControls'
import { actions, selectors } from './sceneStore'

extend({ OrbitControls })

export const Controls = ({ onAttach = () => {}, cameraProps, ...props }) => {
  const { gl, camera, setDefaultCamera } = useThree()
  const controls = useRef()
  const cameraRef = useRef()

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
  }, [camera])

  useEffect(() => {
    setDefaultCamera(cameraRef.current)
    cameraRef.current.updateTarget = function (targetObj) {
      console.log('camera updateTarget', this.isCamera)
    }
  }, [])

  return (
    <>
      <perspectiveCamera ref={cameraRef} {...cameraProps} />
      <orbitControls ref={controls} args={[camera, gl.domElement]} {...props} />
    </>
  )
}

export function Scene({ settings, controlsAttached, children }) {
  return (
    <Canvas
      className="canvas"
      onCreated={({ gl, camera }) => {
        console.log('onCreated')
        gl.setClearColor(new THREE.Color('#020207'))
      }}
    >
      {settings.stats_show && <Stats showPanel={0} className="stats" />}
      <scene>
        <Controls
          onAttach={() => controlsAttached()}
          enableDamping
          rotateSpeed={0.3}
          dampingFactor={0.1}
          cameraProps={{
            position: [0, 50, 50],
            near: 0.01,
            far: 10000,
            fov: settings.fov
          }}
        />
        <ambientLight intensity={0.15} color="white" />
        {/* <SquareGrid /> */}
        {/* <axisHelper /> */}
        {/* <fog attach="fog" args={["black", 100, 700]} /> */}
        {/* <ambientLight intensity={0.25} /> */}
        {children}
      </scene>
    </Canvas>
  )
}

const makeMapStateToProps = (initialState, initialProps) => {
  const mapStateToProps = (state) => {
    return {
      settings: selectors.getSettings(state)
    }
  }
  return mapStateToProps
}
const mapDispatchToProps = (dispatch) => bindActionCreators({ ...actions }, dispatch)

export default connect(makeMapStateToProps, mapDispatchToProps)(Scene)
