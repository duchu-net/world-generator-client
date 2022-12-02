import React, { Suspense } from 'react'
import { useLoader } from 'react-three-fiber'
import * as THREE from 'three'
import glowImg from '../assets/glow.png'

const SystemGlowSprite = ({
  asset = glowImg,
  scale = 6,
  color = '#ffffff',
  position = [0, 0, 0]
}) => {
  const texture = useLoader(THREE.TextureLoader, asset)

  return (
    <sprite
      position={position}
      scale={[scale, scale, scale]}
      material={
        new THREE.SpriteMaterial({
          color,
          map: texture,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          transparent: true
        })
      }
      sortParticles
    />
  )
}

export default SystemGlowSprite
