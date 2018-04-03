import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import {
  Col, FormGroup, FormFeedback, Label,
  Input, InputGroup, InputGroupAddon,
} from 'reactstrap'
import { isFunction } from 'lodash'

const RenderInput = (props) => {
  const {
    meta: { touched, error, warning, form: formName },
    label, type, placeholder, id, disabled, autoComplete,
    addonPrepend, addonAppend, row, className, inputClassName, labelProps, inputCol
  } = props
  let { input: inputProps } = props
  const check = ['checkbox', 'radio'].includes(type)
  let { labelPosition } = props
  if (!labelPosition) {
    labelPosition = check ? 'append' : 'prepend'
  }
  const invalid = touched && (error || warning)
  const inputId = id || (label ? `form-${formName}-${inputProps.name}` : undefined)
  inputProps = {
    ...inputProps,
    id: inputId, placeholder, type,
    disabled, autoComplete,
    valid: (invalid ? false : undefined),
    className: inputClassName
  }
  const inputElement = (
    <Input key='input' {...inputProps} />
  )

  const useInputGroup = Boolean(addonPrepend || addonAppend)
  const renderAddon = (addonType, AddonContent) => AddonContent && (
    <InputGroupAddon addonType={addonType}>
      {isFunction(AddonContent) ? (<AddonContent invalid={invalid} {...props}/>) : AddonContent}
    </InputGroupAddon>
  )

  const feedbackElement = touched && ([
    (error && <FormFeedback key='feedback-error'>{error}</FormFeedback>),
    (warning && <FormFeedback key='feedback-warn' className='text-warning'>{warning}</FormFeedback>),
  ])

  const inputGroupElement = !useInputGroup ? [inputElement, !check && feedbackElement] : (
    <InputGroup key='input-group'>
      {renderAddon('prepend', addonPrepend)}
      {inputElement}
      {renderAddon('append', addonAppend)}
      {feedbackElement}
    </InputGroup>
  )

  const labelElement = label && [(
    <Label key='label' for={inputId} check={check}{...labelProps}>
      {label}
    </Label>
  ), check && feedbackElement]
  
  return (
    <FormGroup className={className} row={row} check={check}>
      {labelPosition === 'prepend' && labelElement}
      {inputCol
        ? (<Col {...inputCol}>{inputGroupElement}</Col>)
        : (inputGroupElement)}
      {labelPosition === 'append' && labelElement}
    </FormGroup>
  )
}

const ReduxFormField = (props) => (
  <Field
    component={RenderInput}
    {...props}
  />
)

const addonPropType = PropTypes.oneOfType([PropTypes.node, PropTypes.func])

ReduxFormField.propTypes = {
  addonPrepend: addonPropType,
  addonAppend: addonPropType,
  row: PropTypes.bool, // Whether this FormGroup is a row
  className: PropTypes.string, // Props for FormGroup
  inputClassName: PropTypes.string, // Additional classes for rendered Input
  inputCol: PropTypes.object, // Props to pass to Col surrounding Input
  labelProps: PropTypes.object,
  labelPosition: PropTypes.oneOf(['prepend', 'append'])
}

export default ReduxFormField