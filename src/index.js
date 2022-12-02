import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Interface from './interface/Interface'
import { Scene, Galaxy } from './modules/scene'
import { getStore } from './store'
// import GalaxyStrategic from './modules/scene/astronomical/GalaxyStrategic'

import './styles.css'

function App() {
  return (
    <Provider store={getStore()}>
      <Scene>
        <>
          <Galaxy />
          {/* <GalaxyStrategic /> */}
        </>
      </Scene>
      <Interface />
    </Provider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
