import { Galaxy } from 'xenocide-world-generator'

export const CONSTANTS = {
  STORE_NAME: 'generator',
  INIT: 'generator/INIT',
  SYSTEM: 'generator/SYSTEM',
  GALAXY: 'generator/GALAXY',
  SET_GENERATOR: 'scene/SET_GENERATOR'
}
const { STORE_NAME } = CONSTANTS

const initialState = {
  settings: true
    ? {
        classification: 'grid',
        buildData: { gridOptions: [100, 30] }
      }
    : { classification: 'spiral' },
  galaxy: {},

  systems: [],
  systemCodes: [],
  systemByCode: {}
}

export function reducer(state = initialState, action) {
  // console.log(action.type);
  // console.log(action.type, action.selected, action.payload);
  switch (action.type) {
    // case "3d/INIT": {
    //   return { ...state, counter: state.counter + 1 };
    // }
    case CONSTANTS.SET_GENERATOR: {
      console.log(CONSTANTS.SET_GENERATOR, action.payload)
      return {
        ...state,
        settings: action.payload
      }
    }
    case CONSTANTS.INIT: {
      console.log(CONSTANTS.INIT, action.payload)
      return {
        ...state,
        galaxy: {},
        systems: [],
        systemCodes: [],
        systemByCode: {}
      }
    }
    case CONSTANTS.SYSTEM: {
      return {
        ...state,
        systems: [...state.systems, action.payload],
        systemCodes: [...state.systemCodes, action.payload.code],
        systemByCode: {
          ...state.systemByCode,
          [action.payload.code]: action.payload
        }
      }
    }
    case CONSTANTS.GALAXY: {
      return { ...state, galaxy: action.payload }
    }
    default:
      return state
  }
}

export const selectors = {
  getSettings(state) {
    return state[STORE_NAME].settings
  },
  getGalaxy(state) {
    return state[STORE_NAME].galaxy
  },
  DEPRECATED_getSystems(state) {
    return state[STORE_NAME].systems
  },
  getSystemCodes(state) {
    return state[STORE_NAME].systemCodes
  },
  getSystemByCode(state, code) {
    return state[STORE_NAME].systemByCode[code]
  }
}

async function generate(dispatch, generator) {
  console.log('> start generator', generator)

  const galaxy = new Galaxy({
    ...generator,
    buildData: { ...(generator.buildData || {}) }
  })
  dispatch(actions.updateGalaxy(galaxy))

  const systemsTemp = []
  console.log('*** Galaxy generated:', galaxy.name, galaxy.code)
  /**
   * @TODO generation in chunks
   * - it takes too long to genere one item at a time
   * - parallel - generating multiple items asynchronously is fast
   *   but impossible to stop before the end
   * solution: chunks?
   **/
  // for async (const system of galaxy.generateSystems()) {

  // let promises = [];
  // for (let i = 0; i < 50; i++) {
  //   promises.push(
  //     (async () => {
  //       const system = await galaxy.generateSystems();
  //       console.log(system.next().done);
  //       for await (const star of system.generateStars()) {
  //       }
  //       systemsTemp.push(system);
  //       dispatch(actions.updateSystem(system));
  //     })()
  //   );
  // }
  // await Promise.all(promises);

  for (const system of galaxy.generateSystems()) {
    if (!isRunning) return
    // await system.build()
    // console.log("** System generated:", system.name, system.code);
    for (const star of system.generateStars()) {
      // console.log("* Star generated:", star.designation, star.code, star);
      // if (Array.isArray(system.stars)) system.stars = [];
      // system.stars.push(star);
    }
    systemsTemp.push(system)
    dispatch(actions.updateSystem(system))
    // for (let planet of system.generatePlanets()) {
    //   console.log("* Planet generated:", planet.designation, planet.code);
    // }
  }
  console.log(`> finish generator, ${systemsTemp.length} systems generated`)
}

let isRunning = false
export const middleware = store => next => async action => {
  // console.log("middleware", isRunning);
  next(action)
  switch (action.type) {
    case CONSTANTS.INIT: {
      if (isRunning) return
      isRunning = true
      await generate(store.dispatch, store.getState().generator.settings)
      // @TODO make it working! it's can release loop :D
      // await new Promise((resolve, reject) => setTimeout(resolve, 10)).then(() =>
      //   generate(store.dispatch, store.getState().generator.settings)
      // )
      isRunning = false
      return
    }
    default:
      return
  }
}

export const actions = {
  setGenerator(payload) {
    return { type: CONSTANTS.SET_GENERATOR, payload }
  },
  initGenerator() {
    return { type: CONSTANTS.INIT }
  },
  updateGalaxy(payload) {
    return { type: CONSTANTS.GALAXY, payload }
  },
  updateSystem(payload) {
    return { type: CONSTANTS.SYSTEM, payload }
  }
}
