const initialState = {
  show: false
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'RESET_ALL':
    return initialState
  case 'TOGGLE_ORDER_MODAL':
    return { show: !state.show }
  case 'SHOW_ORDER_MODAL':
    return { show: true }
  case 'HIDE_ORDER_MODAL':
    return { show: false }
  default:
    return state
  }
}
