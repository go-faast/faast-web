import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import PropTypes from 'prop-types'
import { stepsContainer, clearfix, step, current } from './style'
import classNames from 'class-names'

const ProgressBar = ({ steps, currentStep }) => (
  <div className='container'>	
    <div className={classNames(stepsContainer, clearfix)}>
      {steps.map((description, i) => (<div key={description} className={classNames(step,  currentStep >= i ? current : '')}> <span>{i + 1}. {description}</span></div>))}
    </div>
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
