import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withContext } from 'recompose'

import Auth from 'Services/Auth'

export default compose(
  setDisplayName('AuthProvider'),
  setPropTypes({
    auth: PropTypes.instanceOf(Auth).isRequired,
    children: PropTypes.node.isRequired,
  }),
  withContext({
    auth: PropTypes.instanceOf(Auth).isRequired
  }, ({ auth }) => ({
    auth
  }))
)(({ children }) => children)