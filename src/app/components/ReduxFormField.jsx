import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import {
  Col, FormGroup, Label,
  Input, InputGroup,
} from 'reactstrap'

const RenderInput = (props) => {
  const {
    meta: { touched, error, warning, form: formName },
    label, type, placeholder, id, disabled, autoComplete, size,
    addonPrepend, addonAppend, row, className, inputClass,
    labelProps, labelClass, labelCol, inputCol, input, createRef
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
    invalid: Boolean(invalid),
    className: inputClass,
    ref: createRef,
  }
  const inputElement = (
    <Input key='input' {...input} {...inputProps} />
  )

  const feedbackElement = touched && ([
    (error && <div key='feedback-error' className='text-danger'>{error}</div>),
    (warning && <div key='feedback-warn' className='text-warning'>{warning}</div>),
  ])

  const useInputGroup = Boolean(addonPrepend || addonAppend)
  const renderAddon = (addon) => typeof addon === 'function' ? addon(inputProps) : addon

  const inputGroupElement = !useInputGroup ? [inputElement, !check && feedbackElement] : (
    <div>
      <InputGroup key='input-group' size={size}>
        {renderAddon(addonPrepend)}
        {inputElement}
        {renderAddon(addonAppend)}
      </InputGroup>
      {feedbackElement}
    </div>
  )

  let labelElement = label && [(
    <Label key='label' for={inputId} check={check} className={labelClass} {...labelProps}>
      {label}
    </Label>
  ), check && feedbackElement]

  labelElement = !labelCol ? labelElement : (<Col {...labelCol}>{labelElement}</Col>)

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
  labelPosition: PropTypes.oneOf(['prepend', 'append']),
  autoFocus: PropTypes.bool,
}

export default ReduxFormField
