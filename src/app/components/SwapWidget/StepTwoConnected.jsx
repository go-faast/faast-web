import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import classNames from 'class-names'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'

import { ensureSwapTxCreated } from 'Actions/swap'
import SingleSwapSubmit from 'Components/SingleSwapSubmit'

import { container } from './style.scss'

export default compose(
  setDisplayName('StepTwoConnected'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
  connect(null, {
    ensureSwapTxCreated,
  }),
  lifecycle({
    componentDidMount() {
      const { swap, ensureSwapTxCreated } = this.props
      ensureSwapTxCreated(swap)
    }
  }),
)(({ swap }) => (
  <Card className={classNames('container justify-content-center p-0', container)}>
    <CardHeader className='text-center'>
      <h4>
        Confirm Swap Transaction
      </h4>
    </CardHeader>

    <CardBody className='pt-1'>
      <div className='w-75 mx-auto'>
        <SingleSwapSubmit swap={swap} termsAccepted/>
      </div>
    </CardBody>
  </Card>
))
