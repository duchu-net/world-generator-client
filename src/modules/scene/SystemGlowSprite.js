import React, { Suspense } from 'react'
import { useLoader } from 'react-three-fiber'
import * as THREE from 'three'
import glowImg from './assets/glow.png'

export default function SystemGlow({
  asset = glowImg,
  color = '#ffffff',
  position = [0, 0, 0],
  scale = 8
}) {
  const texture = useLoader(THREE.TextureLoader, asset)
  // return <primitive object={gltf.scene} />
  // texture.color = color
  // console.log(texture, color)
  return (
    <sprite
      position={position}
      scale={[scale, scale, scale]}
      material={
        new THREE.SpriteMaterial({
          color,
          map: texture,
          blending: THREE.AdditiveBlending,
          opacity: 0.5,
          transparent: true
        })
      }
      sortParticles
    />
  )
}
