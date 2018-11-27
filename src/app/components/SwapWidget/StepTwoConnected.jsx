import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'
import { Card, CardHeader, CardBody } from 'reactstrap'

import SwapSubmit from 'Components/SwapSubmit'

import { container } from './style.scss'

export default compose(
  setDisplayName('StepTwoConnected'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
)(({ swap }) => (
  <Card className={classNames('container justify-content-center p-0', container)}>
    <CardHeader className='text-center'>
      <h4>
        Confirm Swap Transaction
      </h4>
    </CardHeader>

    <CardBody className='pt-1'>
      <SwapSubmit swap={swap}/>
    </CardBody>
  </Card>
))
