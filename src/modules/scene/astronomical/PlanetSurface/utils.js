import * as THREE from 'three'

const config = {}

export function hasLocalStorage() {
  try {
    return 'localStorage' in window && window.localStorage !== null
  } catch (e) {
    return false
  }
}

export function hasSessionStorage() {
  try {
    return 'sessionStorage' in window && window.sessionStorage !== null
  } catch (e) {
    return false
  }
}

export function humanSort(a, b) {
  let aa = a.name.split(/(\d+)/)
  let bb = b.name.split(/(\d+)/)

  for (let x = 0; x < Math.max(aa.length, bb.length); x++) {
    if (aa[x] != bb[x]) {
      let cmp1 = isNaN(parseInt(aa[x], 10)) ? aa[x] : parseInt(aa[x], 10)
      let cmp2 = isNaN(parseInt(bb[x], 10)) ? bb[x] : parseInt(bb[x], 10)

      if (cmp1 === undefined || cmp2 === undefined) {
        return aa.length - bb.length
      } else {
        return cmp1 < cmp2 ? -1 : 1
      }
    }
  }

  return 0
}

export function travelTimeForAU(distanceAU) {
  return config.approximateTraveltimePerAU * distanceAU
}

export function hashString(s) {
  var hash = 0
  var length = s.length
  if (length === 0) return hash
  for (var i = 0; i < length; ++i) {
    var character = s.charCodeAt(1)
    hash = (hash << 5) - hash + character
    hash |= 0
  }
  return hash
}

export function adjustRange(value, oldMin, oldMax, newMin, newMax) {
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin
}

export function accumulateArray(array, state, accumulator) {
  for (var i = 0; i < array.length; ++i) {
    state = accumulator(state, array[i])
  }
  return state
}

export function slerp(p0, p1, t) {
  var omega = Math.acos(p0.dot(p1))
  return p0
    .clone()
    .multiplyScalar(Math.sin((1 - t) * omega))
    .add(p1.clone().multiplyScalar(Math.sin(t * omega)))
    .divideScalar(Math.sin(omega))
}

export function calculateTriangleArea(pa, pb, pc) {
  var vab = new THREE.Vector3().subVectors(pb, pa)
  var vac = new THREE.Vector3().subVectors(pc, pa)
  var faceNormal = new THREE.Vector3().crossVectors(vab, vac)
  var vabNormal = new THREE.Vector3().crossVectors(faceNormal, vab).normalize()
  var plane = new THREE.Plane().setFromNormalAndCoplanarPoint(vabNormal, pa)
  var height = plane.distanceToPoint(pc)
  var width = vab.length()
  var area = width * height * 0.5
  return area
}

export function randomUnitVector(random) {
  var theta = random.real(0, Math.PI * 2)
  var phi = Math.acos(random.realInclusive(-1, 1))
  var sinPhi = Math.sin(phi)
  return new THREE.Vector3(
    Math.cos(theta) * sinPhi,
    Math.sin(theta) * sinPhi,
    Math.cos(phi)
  )
}

export function intersectRayWithSphere(ray, sphere) {
  var v1 = sphere.center.clone().sub(ray.origin)
  var v2 = v1.clone().projectOnVector(ray.direction)
  var d = v1.distanceTo(v2)
  return d <= sphere.radius
}

export class XorShift128 {
  constructor(x, y, z, w) {
    this.x = x ? x >>> 0 : 123456789
    this.y = y ? y >>> 0 : 362436069
    this.z = z ? z >>> 0 : 521288629
    this.w = w ? w >>> 0 : 88675123
  }

  next() {
    var t = this.x ^ ((this.x << 11) & 0x7fffffff)
    this.x = this.y
    this.y = this.z
    this.z = this.w
    this.w = this.w ^ (this.w >> 19) ^ (t ^ (t >> 8))
    return this.w
  }

  unit() {
    return this.next() / 0x80000000
  }

  unitInclusive() {
    return this.next() / 0x7fffffff
  }

  integer(min, max) {
    return this.integerExclusive(min, max + 1)
  }

  integerExclusive(min, max) {
    min = Math.floor(min)
    max = Math.floor(max)
    return Math.floor(this.unit() * (max - min)) + min
  }

  real(min, max) {
    return this.unit() * (max - min) + min
  }

  realInclusive(min, max) {
    return this.unitInclusive() * (max - min) + min
  }

  reseed(x, y, z, w) {
    this.x = x ? x >>> 0 : 123456789
    this.y = y ? y >>> 0 : 362436069
    this.z = z ? z >>> 0 : 521288629
    this.w = w ? w >>> 0 : 88675123
  }
}

export class SteppedAction {
  constructor(progressUpdater, unbrokenInterval, sleepInterval) {
    this.callStack = null
    this.subactions = []
    this.finalizers = []
    this.unbrokenInterval =
      typeof unbrokenInterval === 'number' && unbrokenInterval >= 0
        ? unbrokenInterval
        : 16
    this.sleepInterval =
      typeof sleepInterval === 'number' && sleepInterval >= 0
        ? sleepInterval
        : 0
    this.loopAction = false
    this.started = false
    this.canceled = false
    this.completed = false
    this.intervalIteration = 0 //number of times an unbroken interval has been completed
    this.stepIteration = 0 //number of times any of the stepper functions have been called
    this.intervalStepIteration = null //number of times any of the stepper functions have been called during the current interval
    this.intervalStartTime = null //begin time of the current interval
    this.intervalEndTime = null //end time of the current interval
    this.progressUpdater =
      typeof progressUpdater === 'function' ? progressUpdater : null
  }

  execute() {
    if (
      !this.canceled &&
      !this.completed &&
      this.callStack === null &&
      this.started === false
    ) {
      this.started = true
      if (this.subactions.length > 0) {
        this.beginSubactions(0, 1)
        if (this.progressUpdater !== null) this.progressUpdater(this)
        window.setTimeout(this.step.bind(this), this.sleepInterval)
      } else {
        this.completed = true
      }
    }
    return this
  }

  step() {
    this.intervalStartTime = Date.now()
    this.intervalEndTime = this.intervalStartTime + this.unbrokenInterval
    this.intervalStepIteration = 0
    while (
      Date.now() < this.intervalEndTime &&
      !this.canceled &&
      !this.completed
    ) {
      var action = this.callStack.actions[this.callStack.index]

      this.callStack.loop = false
      action.action(this)
      this.intervalStepIteration += 1
      this.stepIteration += 1

      if (this.subactions.length > 0) {
        this.beginSubactions(
          this.getProgress(),
          this.callStack.loop
            ? 0
            : (((1 - this.callStack.loopProgress) * action.proportion) /
                this.callStack.proportionSum) *
                this.callStack.parentProgressRange
        )
      } else {
        while (
          this.callStack !== null &&
          this.callStack.loop === false &&
          this.callStack.index === this.callStack.actions.length - 1
        ) {
          for (var i = 0; i < this.callStack.finalizers.length; ++i) {
            this.callStack.finalizers[i](this)
          }
          this.callStack = this.callStack.parent
        }
        if (this.callStack !== null) {
          if (this.callStack.loop === false) {
            this.callStack.loopProgress = 0
            this.callStack.index += 1
          }
        } else {
          this.completed = true
        }
      }
    }
    this.intervalStartTime = null
    this.intervalEndTime = null
    this.intervalStepIteration = null

    if (this.progressUpdater !== null) this.progressUpdater(this)

    this.intervalIteration += 1
    if (this.canceled) {
      while (this.callStack !== null) {
        for (var i = 0; i < this.callStack.finalizers.length; ++i) {
          this.callStack.finalizers[i](this)
        }
        this.callStack = this.callStack.parent
      }
    } else if (!this.completed) {
      window.setTimeout(this.step.bind(this), this.sleepInterval)
    }
  }

  beginSubactions(parentProgress, parentProgressRange) {
    this.callStack = {
      actions: this.subactions,
      finalizers: this.finalizers,
      proportionSum: accumulateArray(this.subactions, 0, function (
        sum,
        subaction
      ) {
        return sum + subaction.proportion
      }),
      index: 0,
      loop: false,
      loopProgress: 0,
      parent: this.callStack,
      parentProgress: parentProgress,
      parentProgressRange: parentProgressRange
    }
    this.subactions = []
    this.finalizers = []
  }

  cancel() {
    this.canceled = true
  }

  provideResult(resultProvider) {
    this.callStack.resultProvider = resultProvider
  }

  loop(progress) {
    this.callStack.loop = true
    if (typeof progress === 'number' && progress >= 0 && progress < 1) {
      this.callStack.loopProgress = progress
    }
  }

  executeSubaction(subaction, proportion, name) {
    proportion =
      typeof proportion === 'number' && proportion >= 0 ? proportion : 1
    this.subactions.push({
      action: subaction,
      proportion: proportion,
      name: name
    })
    return this
  }

  getResult(recipient) {
    this.subactions.push({
      action: function (action) {
        var resultProvider = action.callStack.resultProvider
        var resultProviderType = typeof resultProvider
        if (resultProviderType === 'function') recipient(resultProvider())
        else if (resultProviderType !== 'undefined') recipient(resultProvider)
        else recipient()
      },
      proportion: 0
    })
    return this
  }

  finalize(finalizer) {
    this.finalizers.push(finalizer)
    return this
  }

  getTimeRemainingInInterval() {
    if (this.intervalEndTime !== null) {
      return Math.max(0, this.intervalEndTime - Date.now())
    } else {
      return 0
    }
  }

  getProgress() {
    if (this.callStack !== null) {
      if (this.callStack.proportionSum === 0)
        return this.callStack.parentProgress

      var currentProportionSum = 0
      for (var i = 0; i < this.callStack.index; ++i) {
        currentProportionSum += this.callStack.actions[i].proportion
      }
      currentProportionSum +=
        this.callStack.loopProgress *
        this.callStack.actions[this.callStack.index].proportion
      return (
        this.callStack.parentProgress +
        (currentProportionSum / this.callStack.proportionSum) *
          this.callStack.parentProgressRange
      )
    } else {
      return this.completed ? 1 : 0
    }
  }

  getCurrentActionName() {
    var callStack = this.callStack
    while (callStack !== null) {
      var action = callStack.actions[callStack.index]
      if (typeof action.name === 'string') return action.name
      callStack = callStack.parent
    }

    return ''
  }
}
