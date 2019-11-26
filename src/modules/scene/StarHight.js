import React from 'react'
import { useLoader } from 'react-three-fiber'
import * as THREE from 'three'
// import glowImg from './assets/glow.png'
import starImg from './assets/star_surface.png'

export default function StarHight({
  // asset = glowImg,
  color = '#ffffff',
  scale = [1, 1, 1],
  position = [0, 0, 0]
}) {
  const [texture] = useLoader(THREE.TextureLoader, [starImg])
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  // const texture = useLoader(THREE.TextureLoader, asset)
  // return <primitive object={gltf.scene} />
  // texture.color = color
  // console.log(texture, color)
  return (
    <group position={position} scale={scale}>
      <mesh
        // position={[0, 0, 0]}
        material={
          new THREE.ShaderMaterial({
            color: color,
            uniforms: {},
            vertexShader: `
            varying vec3 vNormal;
            void main() 
            {
                vNormal = normalize( normalMatrix * normal );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
            fragmentShader: ` 
            varying vec3 vNormal;
            void main() 
            {
              float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 ); 
                gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;
            }`,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
          })
        }
      >
        <sphereBufferGeometry attach="geometry" args={[1, 32, 32]} />
        {/* <meshStandardMaterial
          attach="material"
          roughness={1}
          map={texture}
          color={color}
          blending={THREE.AdditiveBlending}
          fog={false}
        /> */}
      </mesh>
      {/* <sprite
        material={
          new THREE.SpriteMaterial({
            map: texture,
            blending: THREE.AdditiveBlending,
            opacity: 0.5,
            transparent: true
          })
        }
        sortParticles
      /> */}
    </group>
  )
}
