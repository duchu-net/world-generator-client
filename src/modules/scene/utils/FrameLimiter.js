const FrameLimiter = (props) => {
  const [clock] = React.useState(new THREE.Clock())

  useFrame((state) => {
    state.ready = false
    const timeUntilNextFrame = 1000 / props.fps - clock.getDelta()

    setTimeout(() => {
      state.ready = true
      state.invalidate()
    }, Math.max(0, timeUntilNextFrame))
  })

  return <></>
}
