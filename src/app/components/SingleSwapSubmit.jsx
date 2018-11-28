import PropTypes from 'prop-types'
import {
  compose, setDisplayName, setPropTypes, withHandlers,
} from 'recompose'
import { connect } from 'react-redux'

import {
  isSwapReadyToSign, isSwapReadyToSend,
  isSwapSigning, isSwapSending,
  doesSwapRequireSigning,
} from 'Selectors'
import { signSwap, sendSwap } from 'Actions/swap'

import SwapSubmit from 'Components/SwapSubmit'

export default compose(
  setDisplayName('SingleSwapSubmit'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
  connect((state, { swap }) => ({
    requiresSigning: doesSwapRequireSigning(state, swap.id),
    readyToSign: isSwapReadyToSign(state, swap.id),
    readyToSend: isSwapReadyToSend(state, swap.id),
    startedSigning: isSwapSigning(state, swap.id),
    startedSending: isSwapSending(state, swap.id),
  }), {
    signSwap,
    sendSwap,
  }),
  withHandlers({
    onSign: ({ swap, signSwap }) => () => signSwap(swap),
    onSend: ({ swap, sendSwap }) => () => sendSwap(swap),
  }),
)(SwapSubmit)
