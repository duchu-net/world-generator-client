import React from 'react'
import { useLoader } from 'react-three-fiber'
import * as THREE from 'three'
import glowImg from './assets/glow.png'

export default function SystemGlow({
  asset = glowImg,
  color = '#ffffff',
  position = [0, 0, 0]
}) {
  const texture = useLoader(THREE.TextureLoader, asset)
  // return <primitive object={gltf.scene} />
  texture.color = color
  // console.log(texture, color)
  return (
    <group position={position} scale={[10, 10, 10]}>
      <sprite
        material={
          new THREE.SpriteMaterial({
            map: texture,
            blending: THREE.AdditiveBlending,
            opacity: 0.5,
            transparent: true
          })
        }
        sortParticles
      />
    </group>
  )
}
