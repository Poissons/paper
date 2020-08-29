/* exported whenResize */
const whenResize = (() => {
  const listeners = []
  let timeout = 0
  window.addEventListener(
    'resize',
    () => {
      if (timeout) cancelAnimationFrame(timeout)
      timeout = requestAnimationFrame(() => {
        for (const listener of listeners) {
          listener()
        }
      }, 100)
    },
    false,
  )
  return (fn) => {
    listeners.push(fn)
  }
})()
