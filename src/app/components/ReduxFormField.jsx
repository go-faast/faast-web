import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import { FormGroup, FormFeedback, Label, Input, InputGroup, Col } from 'reactstrap'
import { isFunction } from 'lodash'

const RenderInput = (props) => {
  const {
    input: inputProps, meta: { touched, error, warning, form: formName },
    label, type, placeholder, id, disabled,
    addonPrepend, addonAppend, row, className, inputClassName, labelProps, inputCol
  } = props
  const check = ['checkbox', 'radio'].includes(type)
  let { labelPosition } = props
  if (!labelPosition) {
    labelPosition = check ? 'append' : 'prepend'
  }
  const inputId = id || (label ? `form-${formName}-${inputProps.name}` : undefined)
  const invalid = touched && (error || warning)
  const useInputGroup = Boolean(addonPrepend || addonAppend)
  const renderAddon = (Addon) => isFunction(Addon) ? (<Addon invalid={invalid} {...props}/>) : Addon
  const inputElement = (
    <Input key='input' {...inputProps}
      className={inputClassName} id={inputId} placeholder={placeholder}
      type={type} disabled={disabled} valid={invalid ? false : undefined}
    />
  )
  const feedbackElement = touched && (
    (error && <FormFeedback key='feedback-error'>{error}</FormFeedback>) ||
    (warning && <FormFeedback key='feedback-warn' className='text-warning'>{warning}</FormFeedback>)
  )
  const inputGroupElement = !useInputGroup ? [inputElement, !check && feedbackElement] : (
    <InputGroup key='input-group'>
      {renderAddon(addonPrepend)}
      {inputElement}
      {renderAddon(addonAppend)}
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