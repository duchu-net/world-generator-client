import React, { useRef, useEffect } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from 'react-three-fiber'
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

  // if (controls.current) {
  //   controls.current.cameraTo(new THREE.Vector3(0, 0, 0), 1, 1, 150, 4000);
  // }
  return (
    <>
      <perspectiveCamera ref={cameraRef} {...cameraProps} />
      <orbitControls ref={controls} args={[camera, gl.domElement]} {...props} />
    </>
  )
}

// export const Camera = (props) => {
//   const cameraRef = useRef()
//   const pivotRef = useRef()
//   const { setDefaultCamera } = useThree()

//   useEffect(() => {
//     setDefaultCamera(cameraRef.current)
//     let temp = new THREE.Vector3()
//     cameraRef.current.updateTarget = function (targetObj) {
//       console.log('camera updateTarget', this.isCamera)
//       // temp.setFromMatrixPosition(targetObj.matrixWorld)
//       // this.position.lerp(temp, 0.2)
//       // const temp2 = new THREE.Vector3()
//       // targetObj.getWorldPosition(temp2)
//       // this.lookAt(targetObj.position)

//       // this.getWorldPosition(temp)
//       // targetObj.add(pivotRef.current)
//       // this.position = this.worldToLocal(temp)
//       // // this.controls.cameraTo(new THREE.Vector3(0, 0, 10))
//     }
//   }, [])
//   // useFrame(() => cameraRef.current.updateMatrixWorld())

//   return (
//     <group ref={pivotRef}>
//       <perspectiveCamera ref={cameraRef} {...props} />
//     </group>
//   )
// }

export function Scene({ settings, controlsAttached, children }) {
  return (
    <Canvas
      className="canvas"
      // camera={{
      //   position: [0, 50, 50],
      //   near: 0.01,
      //   far: 10000,
      //   fov: settings.fov
      // }}
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
      {/* <Camera
        position={[0, 50, 50]}
        near={0.01}
        far={10000}
        fov={settings.fov}
      /> */}
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
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ ...actions }, dispatch)

export default connect(makeMapStateToProps, mapDispatchToProps)(Scene)
