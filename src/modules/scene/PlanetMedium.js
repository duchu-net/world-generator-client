import React from 'react'
import { useLoader } from 'react-three-fiber'
import * as THREE from 'three'
// import glowImg from './assets/glow.png'
import moonImg from './assets/moon_surface.png'

export default function PlanetMedium({
  color = '#ffffff',
  scale = [1, 1, 1],
  position = [0, 0, 0]
}) {
  const [texture] = useLoader(THREE.TextureLoader, [moonImg])
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  // const texture = useLoader(THREE.TextureLoader, asset)
  // return <primitive object={gltf.scene} />
  // texture.color = color
  // console.log(texture, color)
  return (
    <group position={position} scale={scale}>
      <mesh
        // position={[0, 0, 0]}
        geometry={new THREE.SphereBufferGeometry(1, 16, 16)}
        material={
          new THREE.MeshStandardMaterial({
            roughness: 1,
            map: texture,
            color: color
            // blending: THREE.AdditiveBlending,
            // fog: false
          })
        }
      />
    </group>
  )
}
