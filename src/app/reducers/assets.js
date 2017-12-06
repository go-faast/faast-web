const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'SET_ASSETS':
    return action.payload
  default:
    return state
  }
}
