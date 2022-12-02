import React, { memo, useRef, useState, useEffect, Suspense } from 'react'
import * as THREE from 'three'
import { useThree, useLoader } from 'react-three-fiber'
import { Html } from '@react-three/drei/web/Html'

import styles from './HtmlLabel.scss'

const MAP_TYPE_TO_STRING = {
  ASTEROID_BELT: 'asteroid belt'
}
const getTypeString = (type) => MAP_TYPE_TO_STRING[type] || type
const parseConstants = (string) => String(string).replaceAll('_', ' ')

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const HtmlLabel = ({
  data = {},
  // position = new THREE.Vector3(1, 1, -1),
  position = new THREE.Vector3(0, 0, 0),
  type,
  subtype,
  // orbit,
  designation,
  onClick,
  show = false
}) => {
  const [isShow, setIsShow] = useState(false)
  const isShowPrevious = usePrevious(isShow)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    let timeout
    if (show || isHovered) setIsShow(true)
    if (!show && !isHovered && isShowPrevious)
      timeout = setTimeout(() => setIsShow(false), 1000)

    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [show, isHovered, isShowPrevious])

  // console.log(data)
  if (!isShow) return null
  return (
    <Html position={position}>
      <div
        className="html-label"
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setIsHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setIsHovered(false)
        }}
      >
        <div className="name">
          {data.designation || designation || data.name}
        </div>
        <div className="type">
          <span className="subtype">
            {data.type === 'PLANET' && (
              <span>
                {data.type}: {parseConstants(data.subtype)}
                {data.orbit.zone === 'habitable' && (
                  <span className="value"> (habitable)</span>
                )}
              </span>
            )}
            {type === 'SYSTEM' && (
              <>{getTypeString(data.type || type)} system</>
            )}
            {data.type !== 'PLANET' && type !== 'SYSTEM' && (
              <>
                {getTypeString(data.type || type)}
                {data.type !== data.subtype &&
                  `: ${parseConstants(data.subtype || subtype)}`}
              </>
            )}
          </span>
        </div>

        {type === 'SYSTEM' && (
          <>
            <div>
              stars: <span className="value">{Number(data.stars?.length)}</span>
            </div>
            <div>
              planets:{' '}
              <span className="value">{Number(data.planets?.length)}</span>
            </div>
          </>
        )}
        {data.type === 'STAR' && (
          <>
            <div>
              mass:{' '}
              <span className="value">
                {Number(data.mass).toFixed(2)} Sun mass
              </span>
            </div>
            <div>
              radius:{' '}
              <span className="value">
                {Number(data.radius).toFixed(2)} Sun radius
              </span>
            </div>
            <div>
              luminosity:{' '}
              <span className="value">
                {Number(data.luminosity).toFixed(2)} Sun luminosity
              </span>
            </div>
            <div>
              evolution sustaining:{' '}
              <span className="value">{String(data.evolution)}</span>
            </div>
          </>
        )}
        {data.orbit && (
          <>
            <div>
              distance from star:{' '}
              <span className="value">{data.orbit.distance} AU</span>
            </div>
            <div>
              orbital period:{' '}
              <span className="value">
                {Number(data.orbit.orbital_period).toFixed(2)} years (
                {data.orbit.orbital_period_in_days} days)
              </span>
            </div>
          </>
        )}
      </div>
    </Html>
  )
}

export default HtmlLabel
