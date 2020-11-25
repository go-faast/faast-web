import PropTypes from 'prop-types'
import { getContext } from 'recompose'

import Auth from 'Services/Auth'

export default () => getContext({
  auth: PropTypes.instanceOf(Auth).isRequired,
})