const initialState = {
  opened: 0
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'RESET_ALL':
    return initialState
  case 'SET_WALLET':
    return {
      ...state,
      type: action.payload.type,
      address: action.payload.address,
      data: action.payload.data
    }
  case 'WALLET_OPENED':
    return {
      ...state,
      address: action.payload.address,
      opened: state.opened + 1
    }
  default:
    return state
  }
}
