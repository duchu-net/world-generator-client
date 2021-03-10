// import { CALL_API } from './enums'
import { Galaxy } from 'xenocide-world-generator'
// const Galaxy = require('xenocide-world-generator')
// import * as THREE from 'three'
// import Xeno from 'xenocide-world-generator'
// import { CONSTANTS } from './generatorStore'

export default () => {
  // const Galaxy = require('xenocide-world-generator')
  // eslint-disable-next-line no-restricted-globals
  self.addEventListener('message', ({ data }) => {
    console.log('###1', data)
    // console.log('###2', Xeno)
    // console.log('###3', new THREE.Vector3())
    // console.log('###4', CONSTANTS)
    if (data.generator) {
      console.log('###5', data)
      const galaxy = new Galaxy({
        ...data.generator,
        buildData: { ...(data.generator.buildData || {}) }
      })
      // console.log(galaxy)
      postMessage({ status: 'COMPLETED', galaxy })
    }
    // if (!e && e.data !== CALL_API) return

    // let { data } = e

    // fetch('https://jsonplaceholder.typicode.com/comments')
    //   .then((response) => response.json())
    //   .then((res) => {
    //     console.log('res -> ', res)
    //     const list = res.filter((item, idx) => {
    //       return item.email.includes(data)
    //     })
    //     postMessage(list)
    //   })
    //   .catch((error) => postMessage(null))
  })
}

// onmessage = function (event) {
//   const workerResult = event.data
//   if (!workerResult) return null

//   workerResult.onmessage = true
//   console.log('###', event)

//   postMessage(workerResult)
// }
