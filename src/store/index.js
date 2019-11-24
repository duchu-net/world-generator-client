import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import {
  generatorReducer,
  generatorMiddleware,
  GENERATOR
} from '../modules/generator'
import { sceneReducer, SCENE } from '../modules/scene'

let store = null
export function getStore() {
  if (!store) {
    // const middlewares = [thunk, SocketMiddleware, AuthMiddleware]
    const middlewares = [generatorMiddleware]
    // createReducer(), compose(
    //   applyMiddleware(...middlewares)
    // )
    store = createStore(
      createReducer({
        [GENERATOR.STORE_NAME]: generatorReducer,
        [SCENE.STORE_NAME]: sceneReducer
      }),
      compose(applyMiddleware(...middlewares))
    )
  }

  // store = createStore(reducers)};
  return store
}

const initialState = {
  // generator: true
  //   ? {
  //       classification: "grid",
  //       buildData: { gridOptions: [100, 30] }
  //     }
  //   : { classification: "spiral" },
  fov: 70,
  selected: null,
  counter: 0
}

const REDUCER_STORE_NAME = 'root'
// export const selectors = {
//   getSelected(state) {
//     return state[REDUCER_STORE_NAME].selected
//   }
// }

export function rootReducer(state = initialState, action) {
  // console.log(action.type)
  // console.log(action.type, action.selected, action.payload);
  switch (action.type) {
    case '3d/INIT': {
      return { ...state, counter: state.counter + 1 }
    }
    // case "scene/SET_GENERATOR": {
    //   return {
    //     ...state,
    //     generator: action.payload
    //   };
    // }
    // case 'scene/SELECT_SYSTEM': {
    //   return { ...state, selected: action.payload }
    // }
    // case "generator/INIT": {
    //   return { ...state, systems: [] };
    // }
    // case "generator/SYSTEM": {
    //   return { ...state, systems: [...state.systems, action.payload] };
    // }
    // case "generator/GALAXY": {
    //   return { ...state, galaxy: action.payload };
    // }
    default:
      return state
  }
}

function createReducer(reducers) {
  return combineReducers({
    [REDUCER_STORE_NAME]: rootReducer,
    // Socket: (state={}) => state,
    // App: AppReducer,
    ...reducers
  })

  // return persistReducer({
  //   key: 'root',
  //   storage,
  //   whitelist: ['App'],
  //   // There is an issue in the source code of redux-persist (default setTimeout does not cleaning)
  //   timeout: null,
  // }, combineReducers({
  //   root: (state=null) => state,
  //   App: AppReducer,
  //   ...reducers
  // }))
}
