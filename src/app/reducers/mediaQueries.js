import { mediaBreakpointDown } from 'Utilities/breakpoints'

const initialState = {
  breakpoints: {},
  isMobile: false
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
  case 'SET_BREAKPOINTS':
    const newBreakpoints = Object.assign({}, state.breakpoints, payload)
    return Object.assign({}, state, {
      breakpoints: newBreakpoints,
      isMobile: mediaBreakpointDown(newBreakpoints, 'md')
    })
  default:
    return state
  }
}
