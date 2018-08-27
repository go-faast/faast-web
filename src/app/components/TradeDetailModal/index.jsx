import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { getSwap } from 'Selectors/swap'
import SwapStatusCard from '../SwapStatusCard';

export default compose(
  setDisplayName('TradeDetailModal'),
  connect(createStructuredSelector({
    swap: (state, props) => getSwap(state, props.tradeId)
  })),
  setPropTypes({
    showWalletLabels: PropTypes.bool,
    showFees: PropTypes.bool,
    showDetails: PropTypes.bool
  }),
  defaultProps({
    showWalletLabels: true,
    showFees: false,
    showDetails: false
  })
)(({
  swap, isOpen, toggle,
}) => (
<Modal size='lg' isOpen={isOpen} toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'>
  <ModalHeader tag='h4' toggle={toggle} className='text-primary'>
    Trade Details
  </ModalHeader>
  <ModalBody>
    <SwapStatusCard swap={swap} expanded/>
  </ModalBody>
</Modal>
))
