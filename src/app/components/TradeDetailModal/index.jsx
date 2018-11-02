import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { pick } from 'lodash'

import { retrieveSwap } from 'Actions/swap'
import { getSwap } from 'Selectors/swap'
import SwapStatusCard from 'Components/SwapStatusCard'

import { p0Small } from './style'

export default compose(
  setDisplayName('TradeDetailModal'),
  setPropTypes({
    tradeId: PropTypes.string.isRequired,
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    swap: (state, { tradeId }) => getSwap(state, tradeId)
  }), {
    retrieveSwap: retrieveSwap
  }),
  lifecycle({
    componentWillMount() {
      const { swap, tradeId, retrieveSwap } = this.props
      if (!swap) {
        retrieveSwap(tradeId)
      }
    }
  })
)(({
  swap, toggle, ...props,
}) => !swap ? null : (
  <Modal
    size='lg' toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'
    {...pick(props, Object.keys(Modal.propTypes))}>
    <ModalHeader tag='h4' toggle={toggle} className='text-primary'>
      Order Details
    </ModalHeader>
    <ModalBody className={p0Small}>
      <SwapStatusCard swap={swap} expanded/>
    </ModalBody>
  </Modal>
))
