const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'RESET_ALL':
    return initialState
  case 'SET_WALLET':
    return {
      type: action.payload.type,
      address: action.payload.address,
      data: action.payload.data
    }
  default:
    return state
  }
}
