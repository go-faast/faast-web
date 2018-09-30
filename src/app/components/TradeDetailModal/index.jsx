import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { pick } from 'lodash'

import { getSwap } from 'Selectors/swap'
import SwapStatusCard from 'Components/SwapStatusCard'

const handleRedirect = (props) => {
  if (props.isOpen && !props.swap) {
    props.toggle(null, true)
  }
}

export default compose(
  setDisplayName('TradeDetailModal'),
  setPropTypes({
    tradeId: PropTypes.string.isRequired,
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    swap: (state, props) => getSwap(state, props.tradeId)
  })),
  lifecycle({
    componentWillMount() {
      handleRedirect(this.props)
    },
    componentWillReceiveProps(next) {
      handleRedirect(next)
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
    <ModalBody>
      <SwapStatusCard swap={swap} expanded/>
    </ModalBody>
  </Modal>
))
