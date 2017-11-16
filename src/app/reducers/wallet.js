const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RESET_ALL':
      return initialState
    case 'SET_ENCRYPTED_WALLET':
      return {
        address: action.payload.address,
        encrypted: action.payload.wallet
      }
    case 'SET_HARDWARE_WALLET':
      return {
        address: action.payload.address,
        hw: action.payload.wallet
      }
    default:
      return state
  }
}
