import React, { useRef, useEffect, forwardRef, useState } from 'react'
// import { useSelectedSystem } from "../store";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { generatorActions, generatorSelectors } from '../modules/generator'
import { sceneSelectors, sceneActions } from '../modules/scene'
import starImg from './bg_star_blue.jpg'
import SystemsListItem from './SystemsListItem'
import { Text } from './typo'

export function Interface({
  initGenerator,
  setGenerator,
  galaxy,
  systemCodes,
  // systems,
  // selected,
  select,
  settings
}) {
  // const [selectedSystem, setSelectedSystem] = useSelectedSystem();

  return (
    <div className="Interface">
      <div className="main-container">
        <div>
          <div className={'generator center'}>
            <div className={'setters'}>
              <button
                disabled={settings.classification === 'grid'}
                onClick={() => {
                  // console.log("set generator grid", generatorActions);
                  setGenerator({
                    classification: 'grid',
                    buildData: { gridOptions: [100, 30] }
                  })
                }}
              >
                set grid generator
              </button>
              <button
                disabled={settings.classification === 'spiral'}
                onClick={() => setGenerator({ classification: 'spiral' })}
              >
                set spiral generator
              </button>
            </div>
            {/* <div style={{ textAlign: 'left' }}>
            <code
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(settings, null, '&nbsp; ').replace(
                  /\n/g,
                  '</br>'
                )
              }}
            />
          </div> */}
            <div className={'controls'}>
              <span>classification: {settings.classification} </span>
              <button onClick={() => initGenerator()}>generate</button>
            </div>
          </div>

          {/* <div className={'container info'}> */}
          <Text tag={'div'} size={4} className={'container info'}>
            <div className={'center'}>Galaxy Info</div>
            <div>
              <span>name: {galaxy.name}</span>
            </div>
            <div>
              code <code>{galaxy.code}</code>
            </div>
          </Text>

          <div className={'container right'}>
            <Text size="4">systems count: {systemCodes.length}</Text>
          </div>
        </div>
        {/* {selectedSystem.code && <span>{selectedSystem.code}</span>} */}
        {/* <span>{JSON.stringify(galaxy.statistics)}</span> */}
        {systemCodes.map((code, systemIdx) => {
          return (
            <SystemsListItem
              key={code + systemIdx}
              code={code}
              select={select}
              // selected={isSelected}
              // system={system}
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

const makeMapStateToProps = (initialState, initialProps) => {
  const mapStateToProps = state => {
    return {
      settings: generatorSelectors.getSettings(state),
      galaxy: generatorSelectors.getGalaxy(state),
      systemCodes: generatorSelectors.getSystemCodes(state),
      selected: sceneSelectors.getSelected(state)
    }
  }
  return mapStateToProps
}
const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...generatorActions, ...sceneActions }, dispatch)

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(Interface)
