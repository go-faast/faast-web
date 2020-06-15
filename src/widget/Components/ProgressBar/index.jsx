import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import classNames from 'class-names'

import style from './style.scss'

const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className={style.formSteps}>
      {steps.map((step, i) => {
        return (
          <div key={step.text} className={classNames(style.formStepsItem, i == currentStep && style.formStepsItemActive, i < currentStep && style.formStepsItemCompleted)}>
            <div className={style.formStepsItemContent}>
              <span className={style.formStepsItemIcon}>{i + 1}</span>
              <span className={i !== 0 && style.formStepsItemLine}></span>
              <span className={style.formStepsItemText}>{step.text}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default compose(
  setDisplayName('ProgressBar'),
  connect(createStructuredSelector({
  }), {
  }),
)((ProgressBar))
