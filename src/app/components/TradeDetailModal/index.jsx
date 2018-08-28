import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

import routes from 'Routes'
import { getSwap } from 'Selectors/swap'
import SwapStatusCard from 'Components/SwapStatusCard'
import conditionalRedirect from 'Hoc/conditionalRedirect'

export default compose(
  setDisplayName('TradeDetailModal'),
  setPropTypes({
    tradeId: PropTypes.string.isRequired,
  }),
  connect(createStructuredSelector({
    swap: (state, props) => getSwap(state, props.tradeId)
  })),
  conditionalRedirect(
    routes.tradeHistory(),
    ({ swap }) => !swap)
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
