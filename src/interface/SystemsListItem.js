import React from 'react'
import { connect } from 'react-redux'
import { generatorSelectors } from '../modules/generator'
import { sceneSelectors } from '../modules/scene'
import { Text } from './typo'

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

function SystemsListItem({ system = {}, selected, select }) {
  const isSelected = selected
  const isHabitable = system.stars.every(star => star.habitable)

  const star = system.stars[0]
  // console.log(system)
  return (
    <div
      // key={system.name}
      onClick={() => select(star.code)}
      className={'systems-list-item ' + (isSelected ? 'selected' : '')}
    >
      <div className={'systems-list-item-body'}>
        <div>
          <a href={`#${system.code}`} id={system.code} />
          <div>{system.name}</div>
        </div>
        <Text tag="div" size="4">
          <div style={{ opacity: 0.7 }}>
            planets: [*demo]
            <div className={isHabitable ? 'habitable' : 'unhabitable'}>
              {/* habitable: {isHabitable ? 'yes' : 'no'} */}
            </div>
            {STAR_TYPES_BY_STARS_COUNT[system.stars.length]}
          </div>
        </Text>
      </div>
      {/* <div className={'center'}>stars</div> */}
      <div className={'stars-list'}>
        {system.stars.map(star => (
          <div
            key={star.code}
            className={'stars-list-item'}
            style={{
              background: star.color
              // backgroundImage: `url(${starImg})`
            }}
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
        ))}
      </div>
    </div>
  )
}

const makeMapStateToProps = (initialState, { code }) => {
  const mapStateToProps = state => {
    return {
      selected: sceneSelectors.isSystemSelected(state, code),
      system: generatorSelectors.getSystemByCode(state, code)
    }
  }
  return mapStateToProps
}

export default connect(makeMapStateToProps)(SystemsListItem)
