import React from 'react'
import PropTypes from 'prop-types'

/** Provide a hidden username field as per Google's password form guide:
  * https://goo.gl/9p2vKq
  *
  * Uses absolute position off screen because certain password managers
  * ignore fields with style="display: none" or type="hidden"
  */
const HiddenUsernameField = (props) => (
  <input type='text' name='username' autoComplete='username'
    readOnly style={{ position: 'absolute', top: 100000 }}
    {...props}
  />
)

HiddenUsernameField.propTypes = {
  value: PropTypes.string.isRequired,
}

export default HiddenUsernameField
