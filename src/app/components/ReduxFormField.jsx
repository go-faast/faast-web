import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import {
  Col, FormGroup, Label, FormFeedback,
  Input, InputGroup,
} from 'reactstrap'

import Expandable from 'Components/Expandable'

const RenderInput = (props) => {
  const {
    meta: { touched, error, warning, form: formName },
    label, type, step, placeholder, id, disabled, autoComplete, size,
    addonPrepend, addonAppend, row, className, inputClass,
    labelProps, labelClass, labelCol, inputCol, autoFocus,
    renderInput, helpText, style, requiredLabel,
  } = props
  let { inputProps, input: reduxFormInput } = props
  const check = ['checkbox', 'radio'].includes(type)
  let { labelPosition } = props
  if (!labelPosition) {
    labelPosition = check ? 'append' : 'prepend'
  }
  const invalid = touched && (error || warning)
  const inputId = id || (label ? `form-${formName}-${reduxFormInput.name}` : undefined)
  inputProps = {
    ...reduxFormInput,
    ...inputProps,
    id: inputId, placeholder, type, step,
    disabled, autoComplete,
    invalid: Boolean(invalid),
    className: inputClass,
    autoFocus,
  }
  const inputElement = renderInput ? renderInput(inputProps) : (
    <Input key='input' {...inputProps} />
  )

  const feedbackElement = (
    <Fragment>
      {touched && error && (<FormFeedback className='d-block'>{error}</FormFeedback>)}
      {touched && warning && (<FormFeedback className='d-block text-warning'>{warning}</FormFeedback>)}
      {helpText}
    </Fragment>
  )

  const renderAddon = (addon) => typeof addon === 'function' ? addon(inputProps) : addon

  const inputGroupElement = (
    <Fragment>
      {addonPrepend || addonAppend ? (
        <InputGroup size={size}>
          {renderAddon(addonPrepend)}
          {inputElement}
          {renderAddon(addonAppend)}
        </InputGroup>
      ) : inputElement}
      {!check && feedbackElement}
    </Fragment>
  )

  let labelElement = label && (
    <Fragment>
      <Label key='label' for={inputId} check={check} className={labelClass} {...labelProps}>
        {requiredLabel ? (
          <Expandable
            placement='right'
            shrunk={<Fragment>{label} <span className='text-danger'>*</span></Fragment>}
            expanded='Required'
          />
        ) : label}
      </Label>
      {check && feedbackElement}
    </Fragment>
  )

  labelElement = !labelCol ? labelElement : (<Col {...labelCol}>{labelElement}</Col>)

  return (
    <FormGroup className={className} row={row} check={check} style={style}>
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
  renderInput: PropTypes.func,
  inputProps: PropTypes.object,
  requiredLabel: PropTypes.bool,
}

export default ReduxFormField
