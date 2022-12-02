import React, { memo, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'

import { generatorSelectors } from '../modules/generator'
import { sceneSelectors } from '../modules/scene'
import { Text } from './typo'
import starImg from './bg_star_blue.jpg'
import styles from './SystemsListItem.scss'

const STAR_TYPES_BY_STARS_COUNT = {
  '1': 'single star',
  '2': 'binary star',
  '3': 'triple star',
  '4': 'quadruple star'
}

const STAR_TYPE_BY_SUBTYPE = {
  O: ['blue giant', 'blue supergiant'].join('/'),
  B: ['blue giant', 'blue supergiant'].join('/'),
  A: 'A-type main-sequence star',
  F: 'F-type main-sequence star',
  G: 'yellow supergiant',
  K: 'K-type main-sequence star',
  M: ['red dwarf', 'red giant', 'red supergiant'].join('/')
}

const PLANET_COLOR_BY_SUBTYPE = {
  ASTEROID_BELT: 'rgba(255,255,255,0.2)',
  lava: '#f44336',
  barren: '#9e9e9e',
  earth: '#4caf50',
  ocean: '#2196f3',
  desert: '#ffeb3b',
  ice: '#b3e5fc',
  gas_giant: '#ff9800',
  ice_giant: '#00e5ff'
}

function SystemsListItem({ system = {}, planets, selected, select }) {
  const listItemRef = useRef()

  useEffect(() => {
    if (selected) listItemRef.current.scrollIntoViewIfNeeded()
  }, [selected])

  const isSelected = selected
  const isHabitable = system.stars?.every((star) => star.habitable)

  return (
    <div
      // key={system.name}
      ref={listItemRef}
      onClick={() => {
        console.log('click on system')
        select({ system: system.code })
      }}
      className={cx('systems-list-item', {
        'systems-list-item--selected': isSelected
      })}
      style={{ backgroundImage: isSelected ? `url(${starImg})` : 'none' }}
    >
      <div className={'systems-list-item__body'}>
        <div>
          <a href={`#${system.code}`} id={system.code} />
          <div>{system.name}</div>
        </div>
        <Text tag="div" size="4">
          <div style={{ opacity: 0.7 }}>
            planets:{' '}
            {planets?.filter((planet) => planet.type == 'PLANET').length ||
              'pristine*'}
            <div className={isHabitable ? 'habitable' : 'unhabitable'}>
              {/* habitable: {isHabitable ? 'yes' : 'no'} */}
            </div>
            {STAR_TYPES_BY_STARS_COUNT[system.stars?.length]}
          </div>
        </Text>
      </div>
      {/* <div className={'center'}>stars</div> */}

      <div className={cx('list-header')}>Stars:</div>
      <div className={'list stars-list'}>
        {system.stars?.map((star) => (
          <StarItem
            key={star.code}
            code={star.code}
            star={star}
            onClick={(event) => {
              event.stopPropagation()
              select({ system: system.code, object: star.code })
            }}
          />
        ))}
      </div>
      {isSelected && planets?.length > 0 && (
        <>
          <div className={cx('list-header')}>Planets:</div>
          <div className={'list planets-list'}>
            {planets.map((planet) =>
              planet.type !== 'EMPTY' ? (
                <PlanetItem
                  key={planet.code}
                  code={planet.code}
                  planet={planet}
                  onClick={(event) => {
                    event.stopPropagation()
                    select({ system: system.code, object: planet.code })
                  }}
                />
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  )
}

const makeMapStateToPropsForObjects = (initialState, { code }) => (state) => ({
  selected: sceneSelectors.isObjectSelected(state, code)
})
const StarItem = connect(makeMapStateToPropsForObjects)(
  // const StarItem = ({ star, selected, onClick }) => (
  ({ star, selected, onClick }) => (
    <div
      key={star.code}
      className={cx('list__item', {
        'list__item--selected': selected
      })}
      style={{
        background: star.color
        // backgroundImage: isSelected ? `url(${starImg})` : 'none'
      }}
      onClick={onClick}
    >
      <div className={'text-2 bold'} style={{ background: star.color }}>
        {star.subtype}
      </div>
      <Text tag={'div'} size={4}>
        <div>star: {star.designation}</div>
        {/* <div>{STAR_TYPE_BY_SUBTYPE[star.subtype]}</div> */}
        <div>temp {Number(star.temperature * 5778).toFixed(0, 10)} K</div>
        <div>mass {Number(star.mass).toFixed(2, 10)} sun</div>
      </Text>
    </div>
  )
)

const PlanetItem = connect(makeMapStateToPropsForObjects)(
  // const PlanetItem = ({ planet, selected, onClick }) => (
  ({ planet, selected, onClick }) => (
    <div
      key={planet.code}
      className={cx('list__item', {
        'list__item--selected': selected
      })}
      style={{
        backgroundColor: PLANET_COLOR_BY_SUBTYPE[planet.subtype] || 'white'
      }}
      onClick={onClick}
    >
      <div>{planet.designation}</div>
      <div>subtype: {String(planet.subtype).toLocaleLowerCase()}</div>
      <div>zone: {planet.zone}</div>
    </div>
  )
)

const makeMapStateToProps = (initialState, { code }) => {
  const mapStateToProps = (state) => {
    return {
      // @TODO selected as overall object
      selected: sceneSelectors.isSystemSelected(state, code),
      system: generatorSelectors.getSystemByCode(state, code),
      planets: generatorSelectors.getSystemPlanets(state, code)
    }
  }
  return mapStateToProps
}

export default connect(makeMapStateToProps)(memo(SystemsListItem))
