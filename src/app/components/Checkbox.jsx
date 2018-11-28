import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withProps, } from 'recompose'
import ReduxFormField from 'Components/ReduxFormField'
import PropTypes from 'prop-types'
import * as validator from 'Utilities/validator'

export default compose(
  setDisplayName('Checkbox'),
  setPropTypes({
    name: PropTypes.string,
    label: PropTypes.node,
  }),
  defaultProps({
    name: 'requiredCheckbox',
    label: '',
  }),
  withHandlers({
    validate: () => validator.checked(),
  }),
  withProps(() => ({
    type: 'checkbox',
  }))
)(ReduxFormField)
  
