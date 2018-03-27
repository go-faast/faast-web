import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import { FormGroup, FormFeedback, Label, Input, InputGroup, Col } from 'reactstrap'
import { isFunction } from 'lodash'

const RenderInput = (props) => {
  const {
    input: inputProps, label, type, meta: { touched, error, warning },
    addonPrepend, addonAppend, row, className, inputClassName, labelProps, inputCol
  } = props
  const check = ['checkbox', 'radio'].includes(type)
  let { labelPosition } = props
  if (!labelPosition) {
    labelPosition = check ? 'append' : 'prepend'
  }
  const invalid = touched && (error || warning)
  const useInputGroup = Boolean(addonPrepend || addonAppend)
  const renderAddon = (Addon) => isFunction(Addon) ? (<Addon invalid={invalid} {...props}/>) : Addon
  const inputElement = (
    <Input type={type} className={inputClassName} {...inputProps} valid={invalid ? false : undefined}/>
  )
  const feedbackElement = touched && (
    (error && <FormFeedback>{error}</FormFeedback>) ||
    (warning && <FormFeedback className='text-warning'>{warning}</FormFeedback>)
  )
  const inputGroupElement = !useInputGroup ? inputElement : (
    <InputGroup>
      {renderAddon(addonPrepend)}
      {inputElement}
      {renderAddon(addonAppend)}
      {feedbackElement}
    </InputGroup>
  )
  const labelComponent = (
    <Label for={inputProps.id || inputProps.name} check={check}{...labelProps}>
      {label}
    </Label>
  )
  return (
    <FormGroup className={className} row={row} check={check}>
      {label && labelPosition === 'prepend' && labelComponent}
      {inputCol
        ? (<Col {...inputCol}>{inputGroupElement}</Col>)
        : (inputGroupElement)}
      {label && labelPosition === 'append' && labelComponent}
      {!useInputGroup && feedbackElement}
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