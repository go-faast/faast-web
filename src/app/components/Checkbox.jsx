import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withProps, } from 'recompose'
import ReduxFormField from 'Components/ReduxFormField'
import PropTypes from 'prop-types'
import * as validator from 'Utilities/validator'

export default compose(
  setDisplayName('Checkbox'),
  setPropTypes({
    name: PropTypes.string,
    label: PropTypes.node,
    required: PropTypes.bool
  }),
  defaultProps({
    name: 'requiredCheckbox',
    label: '',
    required: true,
  }),
  withHandlers({
    validate: ({ required }) =>  validator.all(...(required ? [validator.checked()] : [])),
  }),
  withProps(() => ({
    type: 'checkbox',
  }))
)(ReduxFormField)
  
