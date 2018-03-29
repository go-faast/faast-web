const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RESET_ALL':
      return initialState
    case 'SET_SETTINGS':
      return Object.assign({}, state, action.payload || {})
    default:
      return state
  }
}
