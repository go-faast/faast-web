import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withHandlers, lifecycle } from 'recompose'
import { CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'

import routes from 'Routes'
import { ensureSwapTxCreated } from 'Actions/swap'
import SingleSwapSubmit from 'Components/SingleSwapSubmit'

export default compose(
  setDisplayName('StepTwoConnected'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
  connect(null, {
    ensureSwapTxCreated,
    push: pushAction,
  }),
  withHandlers({
    onCancel: ({ swap, push }) => () => push(routes.swapWidget({ from: swap.sendSymbol, to: swap.receiveSymbol }))
  }),
  lifecycle({
    componentWillMount() {
      const { swap, ensureSwapTxCreated } = this.props
      ensureSwapTxCreated(swap)
    }
  }),
)(({ swap, onCancel }) => (
  <Fragment>
    <CardHeader className='text-center'>
      <h4>
        Confirm Swap Transaction
      </h4>
    </CardHeader>

    <CardBody className='pt-1'>
      <SingleSwapSubmit swap={swap} termsAccepted onCancel={onCancel}/>
    </CardBody>
  </Fragment>
))
