const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RESET_ALL':
      return initialState
    case 'SET_ENCRYPTED_WALLET':
      return {
        address: window.faast.web3.utils.toChecksumAddress(action.payload.address),
        encrypted: action.payload
      }
    case 'SET_HARDWARE_WALLET':
      return {
        address: window.faast.web3.utils.toChecksumAddress(action.payload.address),
        hw: action.payload
      }
    default:
      return state
  }
}
