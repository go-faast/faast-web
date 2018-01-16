const initialState = {
  opened: 0
}

export default (state = initialState, { type, payload }) => {
  const { wallet } = (payload || {})
  switch (type) {
  case 'RESET_ALL':
    return initialState
  case 'SET_WALLET':
    return {
      ...state,
      type: wallet.type,
      address: wallet.getId(),
      opened: wallet.type === 'MultiWallet' ? wallet.wallets.length : 1,
      isBlockstack: wallet.isBlockstack
    }
  case 'WALLET_OPENED':
    const address = wallet.address || wallet.getAddress()
    return {
      ...state,
      type: wallet.type,
      address: typeof state.address !== 'undefined'
        ? (Array.isArray(state.address) ? [...state.address, address] : [state.address, address])
        : address,
      opened: state.opened + 1,
      isBlockstack: wallet.isBlockstack
    }
  default:
    return state
  }
}
