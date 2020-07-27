import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import classNames from 'class-names'

import style from './style.scss'

const ProgressBar = ({ currentStep, text, onBack }) => {
  return (
    <div className={classNames(style.formSteps, 'position-relative')}>
      <div className={classNames(style.formStepsItem, style.formStepsItem)}>
        <div className={style.formStepsItemContent}>
          {currentStep !== 1 && currentStep !== 4 && (
            <Button 
              tag='span'
              className='flat position-absolute' 
              style={{ left: 0, top: -10 }} 
              color='transparent'
              onClick={onBack}
            >
              <i className='fa fa-long-arrow-left position-relative' style={{ top: 2, color: '#4b5464' }} /> 
              <span className='pl-2' style={{ fontSize: 12, color: '#67748a' }}>prev</span> 
            </Button>
          )}
          <span style={{ fontWeight: 500 }} className={style.formStepsItemText}>{text}</span>
          <span style={{ right: 0, top: 1 }} className={classNames('position-absolute', style.formStepsItemIcon)}>
            {currentStep} / 4
          </span>
        </div>
      </div>
    </div>
  )
}

export default compose(
  setDisplayName('ProgressBar'),
  connect(createStructuredSelector({
  }), {
  }),
)((ProgressBar))
