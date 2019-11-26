// export const REDUCER_STORE_NAME = 'scene'
export const CONSTANTS = {
  STORE_NAME: 'scene',
  CONTROLS_ATTACHED: 'scene/CONTROLS_ATTACHED',
  SELECT_SYSTEM: 'scene/SELECT_SYSTEM'
}

const { STORE_NAME } = CONSTANTS

const initialState = {
  selected: null,
  settings: { fov: 70 },
  eSettings: {
    system_glow: { active: true }
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
    default:
      return state
  }
}

export const selectors = {
  getSettings(state) {
    return state[STORE_NAME].settings
  },
  getElementSettings(state, name) {
    return state[STORE_NAME].eSettings[name]
  },
  getSelected(state) {
    // console.log('getSelected', state)
    return state[STORE_NAME].selected
  },
  isSelected(state, code) {
    return selectors.getSelected(state) === code
  },
  isSystemSelected(state, code) {
    const selected = selectors.getSelected(state)
    return (
      selected === code ||
      (typeof selected === 'string' && selected.startsWith(code + '.'))
    )
  }
}

export const actions = {
  select(payload) {
    return { type: CONSTANTS.SELECT_SYSTEM, payload }
  },
  controlsAttached() {
    return { type: CONSTANTS.CONTROLS_ATTACHED }
  }
}
