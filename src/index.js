import React, { useRef } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { useFrame, Canvas, Scene } from "react-three-fiber";
import { Galaxy } from "xenocide-world-generator";

import useStore from "./store";
import Star from "./3d/Star";
import "./styles.css";

function App() {
  const { fov } = useStore(state => state.mutation);
  const actions = useStore(state => state.actions);

  const galaxy = new Galaxy({
    classification: "grid",
    buildData: { gridOptions: [100, 30] }
  });

  const systems = [];
  console.log("*** Galaxy generated:", galaxy.name, galaxy.code);
  for (let system of galaxy.generateSystems()) {
    // await system.build()
    console.log("** System generated:", system.name, system.code);
    const temp = { position: system.position };
    for (let star of system.generateStars()) {
      console.log("* Star generated:", star.designation, star.code, star);
      temp.star = { color: star.color };
    }
    systems.push(temp);
    // for (let planet of system.generatePlanets()) {
    //   console.log("* Planet generated:", planet.designation, planet.code);
    // }
  }
  console.log(galaxy.statistics);

  const controls = useRef();
  // useFrame(state => controls.current.update());
  const groupRef = useRef();
  // useFrame(
  //   () => (groupRef.current.rotation.x = groupRef.current.rotation.y += 0.01)
  // );

  return (
    <>
      <Canvas
        onPointerMove={actions.updateMouse}
        // onClick={actions.shoot}
        camera={{ position: [0, 0, 50], near: 0.01, far: 1000, fov }}
        onCreated={({ gl, camera }) => {
          actions.init(camera);
          gl.gammaInput = true;
          gl.toneMapping = THREE.Uncharted2ToneMapping;
          gl.setClearColor(new THREE.Color("#020207"));
        }}
      >
        <scene>
          <group ref={groupRef}>
            {/* <fog attach="fog" args={["black", 100, 700]} /> */}
            {/* <ambientLight intensity={0.25} /> */}
            {/* <Star /> */}
            {/* <orbitControls ref={controls} /> */}
            <Star position={[0, 0, 3000]} />
            {systems.map(({ position, star, ...system }, idx) => (
              <Star
                key={idx}
                position={[position.x, position.y, position.z]}
                color={star.color}
              />
            ))}
          </group>
        </scene>
      </Canvas>
      <div className="App">
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
