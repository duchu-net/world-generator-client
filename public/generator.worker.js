import { Galaxy } from 'xenocide-world-generator'
// import { generateGalaxy } from '../src/modules/generator/generatorStore.js'
// const Gen = self.importScripts('../src/modules/generator/generatorStore.js')
console.log('generator.worker')
let counter = 0

// setInterval(() => {
//   self.postMessage({ counter: counter++ })
// }, 100)

self.onmessage = function ({ data }) {
  console.log('# onmessage')
  // switch (msg.data.aTopic) {
  //   case 'do_sendWorkerArrBuff':
  //     sendWorkerArrBuff(msg.data.aBuf)
  //     break
  //   default:
  //     throw 'no aTopic on incoming message to ChromeWorker'
  // }
  if (data.generator) {
    const galaxy = new Galaxy({
      ...data.generator,
      buildData: { ...(data.generator.buildData || {}) }
    })
    self.postMessage({ status: 'COMPLETED', galaxy })
  }
}
