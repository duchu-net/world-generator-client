import React, { useRef, useEffect, forwardRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Interface from './interface/Interface'
import { Scene } from './modules/scene'
import './styles.css'
import { getStore } from './store'

import './styles.css'

function App() {
  // useEffect(() => {
  //   return () => {};
  // }, []);

  console.log('>', 'render index')

  return (
    <Provider store={getStore()}>
      <Scene />
      <Interface />
    </Provider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
