import { mediaBreakpointDown } from 'Utilities/breakpoints'

const initialState = {}

export default (state = initialState, { type, payload }) => {
  switch (type) {
  case 'SET_MEDIA_QUERIES':
    return Object.assign({}, state, payload, {
      isMobile: mediaBreakpointDown(payload, 'xs')
    })
  default:
    return state
  }
}
