import React, { useRef, useEffect, forwardRef, useState } from 'react'
// import { useSelectedSystem } from "../store";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { generatorActions } from '../modules/generator'
import { sceneSelectors, sceneActions } from '../modules/scene'
import starImg from './bg_star_blue.jpg'

function SystemsListItem({ system = {}, selected, select }) {
  const isSelected =
    selected === system.code ||
    system.stars.find(star => star.code === selected)
  const star = system.stars[0]
  const STAR_TYPES_BY_STARS_COUNT = {
    '1': 'single star',
    '2': 'binary star',
    '3': 'triple star',
    '4': 'quadruple star'
  }

  return (
    <div
      // key={system.name}
      onClick={() => select(star.code)}
      className={'systems-list-item ' + (isSelected ? 'selected' : '')}
    >
      <div className={'systems-list-item-body'}>
        <a href={`#${system.code}`} id={system.code} />
        <div>{system.name}</div>
        <div style={{ fontSize: '75%', opacity: 0.7 }}>
          {STAR_TYPES_BY_STARS_COUNT[system.stars.length]}
        </div>
      </div>
      <div className={'stars-list'}>
        {system.stars.map(star => (
          <div
            className={'stars-list-item'}
            style={{ backgroundImage: `url(${starImg})` }}
          >
            <div style={{ background: star.color }}>{star.subtype}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Interface({
  initGenerator,
  setGenerator,
  galaxy,
  systems,
  selected,
  select,
  settings
}) {
  // const [selectedSystem, setSelectedSystem] = useSelectedSystem();

  return (
    <div className="Interface">
      <div className="main-container">
        <div>
          <button
            onClick={() => {
              // console.log("set generator grid", generatorActions);
              setGenerator({
                classification: 'grid',
                buildData: { gridOptions: [100, 30] }
              })
            }}
          >
            grid
          </button>
          <button onClick={() => setGenerator({ classification: 'spiral' })}>
            spiral
          </button>
          <div style={{ textAlign: 'left' }}>
            {/* <code>{JSON.stringify(settings, null, ' ')}</code> */}
            <code
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(settings, null, '&nbsp; ').replace(
                  /\n/g,
                  '</br>'
                )
              }}
            />
          </div>
          <button onClick={() => initGenerator()}>generate</button>
        </div>
        {galaxy && galaxy.name ? (
          <h2>
            {galaxy.name} [{galaxy.code}]
          </h2>
        ) : (
          <h2>loading...</h2>
        )}
        <h3>{systems.length}</h3>
        {/* {selectedSystem.code && <span>{selectedSystem.code}</span>} */}
        <span>{JSON.stringify(galaxy.statistics)}</span>
        {/* <h1>Hello CodeSandbox</h1> */}
        {/* <h2>Start editing to see some magic happen!</h2> */}
        {systems.map(system => {
          const isSelected =
            selected === system.code ||
            system.stars.find(star => star.code === selected)
          const star = system.stars[0]
          const STAR_TYPES_BY_STARS_COUNT = {
            '1': 'single star system',
            '2': 'binary star system',
            '3': 'triple star system',
            '4': 'quadruple star system'
          }
          return (
            <SystemsListItem
              key={system.name}
              selected={selected}
              system={system}
              select={select}
            />
          )
          // return (
          //   <div
          //     key={system.name}
          //     onClick={() => select(star.code)}
          //     className={'system ' + (isSelected ? 'selected' : '')}
          //   >
          //     <a href={`#${system.code}`} id={system.code} />
          //     {STAR_TYPES_BY_STARS_COUNT[system.stars.length]} [
          //     {system.stars.map(star => star.subtype).join('-')}] {system.name},
          //   </div>
          // )
        })}
      </div>
    </div>
  )
}

export default connect(
  state => ({
    settings: state.generator.settings,
    galaxy: state.generator.galaxy,
    systems: state.generator.systems,
    selected: sceneSelectors.getSelected(state)
  }),
  dispatch =>
    bindActionCreators(
      {
        ...generatorActions,
        ...sceneActions
        // select(payload) {
        //   dispatch({ type: 'scene/SELECT_SYSTEM', payload })
        // }
      },
      dispatch
    )
)(Interface)
