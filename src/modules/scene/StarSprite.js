import React, { Suspense } from 'react'
import { useLoader } from 'react-three-fiber'
import * as THREE from 'three'
import glowImg from './assets/circle.png'

export default function StarSprite({
  asset = glowImg,
  color = '#ffffff',
  position = [0, 0, 0],
  scale = 1
}) {
  const texture = useLoader(THREE.TextureLoader, asset)

  return (
    <sprite
      position={position}
      scale={[scale, scale, scale]}
      material={
        new THREE.SpriteMaterial({
          map: texture,
          color: color,
          blending: THREE.NormalBlending
        })
      }
      sortParticles
    />
  )
}
