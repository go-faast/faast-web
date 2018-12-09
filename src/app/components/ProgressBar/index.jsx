import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import { Row, Col } from 'reactstrap'

import { step, current } from './style'

const ProgressBar = ({ steps, currentStep }) => (
  <div>
    <Row className='no-gutters justify-content-center'>
      {steps.map((description, i) => (
        <Col key={description} xs='4' sm='3' lg='2'>
          <div className={classNames(step,  currentStep >= i ? current : '')}>
            {i + 1}. {description}
          </div>
        </Col>
      ))}
    </Row>
  </div>
)

export default compose(
  setDisplayName('ProgressBar'),
  setPropTypes({
    steps: PropTypes.array,
    currentStep: PropTypes.number
  }),
  defaultProps({
    steps: [],
    currentStep: 0
  })
)(ProgressBar)
