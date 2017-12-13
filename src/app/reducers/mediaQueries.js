const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'SET_MEDIA_QUERIES':
    return Object.assign({}, state, action.payload)
  default:
    return state
  }
}
