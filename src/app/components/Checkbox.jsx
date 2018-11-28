import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers } from 'recompose'
import ReduxFormField from 'Components/ReduxFormField'
import PropTypes from 'prop-types'
import * as validator from 'Utilities/validator'

const Checkbox = ({ validateCheckbox, label, ...props, }) => (
  <ReduxFormField
    className='ml-0'
    type='checkbox'
    label={label}
    validate={validateCheckbox}
    {...props} 
  />
)

export default compose(
  setDisplayName('Checkbox'),
  setPropTypes({
    name: PropTypes.string.isRequired,
    label: PropTypes.node,
  }),
  defaultProps({
    label: ''
  }),
  withHandlers({
    validateCheckbox: () => validator.checked(),
  })
)(Checkbox)
  
