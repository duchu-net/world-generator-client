import * as THREE from "three";
import { Curves } from "three/examples/jsm/curves/CurveExtras";
// import { addEffect } from "react-three-fiber";
import create from "zustand";
// import { useState } from "react";
// import * as audio from './audio'

let guid = 1;

const [useStore, api] = create((set, get) => {
  let spline = new Curves.GrannyKnot();
  let track = new THREE.TubeBufferGeometry(spline, 250, 0.2, 10, true);
  // let cancelLaserTO = undefined;
  // let cancelExplosionTO = undefined;
  // const box = new THREE.Box3();

  return {
    sound: true,
    camera: undefined,
    points: 0,
    health: 100,
    lasers: [],
    explosions: [],
    rocks: randomData(100, track, 150, 8, () => 1 + Math.random() * 2.5),
    enemies: randomData(10, track, 20, 15, 1),

    mutation: {
      t: 0,
      position: new THREE.Vector3(),
      startTime: Date.now(),

      track,
      scale: 15,
      fov: 70,
      hits: false,
      rings: randomRings(30, track),
      // particles: randomData(
      //   2500,
      //   track,
      //   100,
      //   1,
      //   () => 0.5 + Math.random() * 0.8
      // ),
      looptime: 40 * 1000,
      binormal: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      clock: new THREE.Clock(false),
      mouse: new THREE.Vector2(-250, 50),

      // Re-usable objects
      dummy: new THREE.Object3D(),
      ray: new THREE.Ray(),
      box: new THREE.Box3()
    }
  };
});

function randomData(count, track, radius, size, scale) {
  return new Array(count).fill().map(() => {
    const t = Math.random();
    const pos = track.parameters.path.getPointAt(t);
    pos.multiplyScalar(15);
    const offset = pos
      .clone()
      .add(
        new THREE.Vector3(
          -radius + Math.random() * radius * 2,
          -radius + Math.random() * radius * 2,
          -radius + Math.random() * radius * 2
        )
      );
    const speed = 0.1 + Math.random();
    return {
      guid: guid++,
      scale: typeof scale === "function" ? scale() : scale,
      size,
      offset,
      pos,
      speed,
      radius,
      t,
      hit: new THREE.Vector3(),
      distance: 1000
    };
  });
}

function randomRings(count, track) {
  let temp = [];
  let t = 0.4;
  for (let i = 0; i < count; i++) {
    t += 0.003;
    const pos = track.parameters.path.getPointAt(t);
    pos.multiplyScalar(15);
    const segments = track.tangents.length;
    const pickt = t * segments;
    const pick = Math.floor(pickt);
    const lookAt = track.parameters.path
      .getPointAt((t + 1 / track.parameters.path.getLength()) % 1)
      .multiplyScalar(15);
    const matrix = new THREE.Matrix4().lookAt(
      pos,
      lookAt,
      track.binormals[pick]
    );
    temp.push([pos.toArray(), matrix]);
  }
  return temp;
}

function playAudio(audio, volume = 1, loop = false) {
  if (api.getState().sound) {
    audio.currentTime = 0;
    audio.volume = volume;
    audio.loop = loop;
    audio.play();
  } else audio.pause();
}

export default useStore;
// export { audio, playAudio }
