import React, { useRef } from 'react'
import { useLoader, useFrame } from 'react-three-fiber'
import * as THREE from 'three'

import mercuryImg from '../assets/mercury_surface.jpg'
import venusImg from '../assets/venus_surface.jpg'
import earthImg from '../assets/earth_surface.png'
import moonImg from '../assets/moon_surface.png'
import marsImg from '../assets/mars_surface.jpg'
import jupiterImg from '../assets/jupiter_surface.jpg'
import saturnImg from '../assets/saturn_surface.jpg'
import uranusImg from '../assets/uranus_surface.jpg'
import neptuneImg from '../assets/neptune_surface.jpg'

const PLANET_COLOR_BY_SUBTYPE = {
  // ASTEROID_BELT: 'black',
  lava: { color: '#fa2c2c', texture: venusImg },
  barren: { color: '#b5b5b5', texture: mercuryImg },
  earth: { color: '#7fae42', texture: earthImg },
  ocean: { color: '#6363fa', texture: neptuneImg },
  desert: { color: 'sandybrown', texture: marsImg },
  ice: 'lightblue',
  gas_giant: { color: '#f6662d', texture: jupiterImg },
  ice_giant: { color: 'deepskyblue', texture: uranusImg }
}

const getSurface = (type) => {
  if (PLANET_COLOR_BY_SUBTYPE[type]?.texture) {
    return PLANET_COLOR_BY_SUBTYPE[type]?.texture
  }

  switch (type) {
    case 'mercury':
      return mercuryImg
    case 'venus':
      return venusImg
    case 'earth':
      return earthImg
    case 'mars':
      return marsImg
    default:
      return moonImg
  }
}

export default function PlanetMedium({
  color = '#ffffff',
  scale = [1, 1, 1],
  position = [0, 0, 0],
  type
}) {
  const [texture] = useLoader(THREE.TextureLoader, [getSurface(type)])
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  const pivotRef = useRef()
  useFrame(() => {
    const idx = 1
    const rotation = pivotRef.current?.rotation || {}
    rotation.y = rotation.y += 0.015 * idx
  })

  // console.log(texture)
  // const texture = useLoader(THREE.TextureLoader, asset)
  // return <primitive object={gltf.scene} />
  // texture.color = color
  // console.log(texture, color)
  return (
    <group ref={pivotRef} position={position} scale={scale}>
      <mesh
        // position={[0, 0, 0]}
        geometry={new THREE.SphereBufferGeometry(1, 16, 16)}
        material={
          new THREE.MeshStandardMaterial({
            // roughness: 1,
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
