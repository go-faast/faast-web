import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers } from 'recompose'
import ReduxFormField from 'Components/ReduxFormField'
import PropTypes from 'prop-types'
import * as validator from 'Utilities/validator'

const Checkbox = ({ validateCheckbox, label, ...props, }) => (
    <ReduxFormField
        row
        className='gutter-3 align-items-center ml-0'
        id='customCheckbox'
        name='customCheckbox'
        type='checkbox'
        label={label}
        labelProps={{ xs: '12', md: '6' }}
        inputClass='flat'
        validate={validateCheckbox}
      {...props} 
    />
  )

export default compose(
    setDisplayName('Checkbox'),
    setPropTypes({
      label: PropTypes.node
    }),
    defaultProps({
      label: ''
    }),
    withHandlers({
      validateCheckbox: () => validator.checked(),
    })
  )(Checkbox)
  
