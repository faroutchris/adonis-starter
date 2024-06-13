export default (element) => {
  const mounted = () => {
    console.log('mounted')
  }

  const destroyed = () => {
    console.log('destroyed')
  }

  return {
    mounted,
    destroyed,
  }
}
