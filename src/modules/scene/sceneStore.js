// export const REDUCER_STORE_NAME = 'scene'
export const CONSTANTS = {
  STORE_NAME: 'scene',
  UPDATE_SETTINGS: 'scene/UPDATE_SETTINGS',
  CONTROLS_ATTACHED: 'scene/CONTROLS_ATTACHED',
  SELECT_SYSTEM: 'scene/SELECT_SYSTEM',
  SELECT_SYSTEM_: 'scene/SELECT_SYSTEM_',
  SELECT_PLANET: 'scene/SELECT_PLANET'
}

const { STORE_NAME } = CONSTANTS

const initialState = {
  counter: 0,
  selected: null,
  // settings: { fov: 70 },
  settings: {
    // system_glow: { active: true },
    scene: { fov: 70 },
    galaxy: {},
    system: {
      'cage.show': true
      // 'cage.show': false
    },
    star: {},
    planet: {
      'name.show': true
    }
  }
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case '3d/INIT': {
      return { ...state, counter: state.counter + 1 }
    }
    case CONSTANTS.SELECT_SYSTEM: {
      // console.log(action, state, { ...state, selected: action.payload })
      return { ...state, selected: action.payload }
    }
    case CONSTANTS.SELECT_PLANET: {
      const [system, planet] = action.payload.split('/')
      console.log('SELECT_PLANET', system, planet)
      return { ...state, selected: { system, planet } }
    }
    // case CONSTANTS.UPDATE_SETTINGS: {
    //   return {
    //     ...state,
    //     settings: { ...state.settings, scene: action.payload }
    //   }
    // }
    default:
      return state
  }
}

export const selectors = {
  getSettings(state, elementName = 'scene') {
    return state[STORE_NAME].settings[elementName]
  },
  // getElementSettings(state, name) {
  //   return state[STORE_NAME].eSettings[name]
  // },
  getSelected(state) {
    // console.log('getSelected', state)
    return state[STORE_NAME].selected
  },
  isSelected(state, code) {
    return selectors.getSelected(state) === code
  },
  isSystemSelected(state, code) {
    let selected = selectors.getSelected(state)
    if (selected?.system) selected = selected.system
    return (
      selected === code ||
      (typeof selected === 'string' && selected.startsWith(code + '.'))
    )
  },
  // @TODO
  isPlanetSelected(state, code) {
    let selected = selectors.getSelected(state)
    if (selected?.planet) selected = selected.planet
    return (
      selected === code ||
      (typeof selected === 'string' && selected.startsWith(code))
    )
  }
}

export const actions = {
  select(payload) {
    return { type: CONSTANTS.SELECT_SYSTEM, payload }
  },
  selectSystem(code) {
    return function (store) {
      console.log(store)
      return { type: CONSTANTS.SELECT_SYSTEM_, payload: { code } }
    }
  },
  controlsAttached() {
    return { type: CONSTANTS.CONTROLS_ATTACHED }
  },
  updateSettings: (payload) => ({
    type: CONSTANTS.UPDATE_SETTINGS,
    payload
  })
}
