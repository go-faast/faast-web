const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'RESET_ALL':
    return initialState
  case 'SET_MOCK':
    return Object.assign({}, action.payload, {
      mocking: true
    })
  default:
    return state
  }
}
