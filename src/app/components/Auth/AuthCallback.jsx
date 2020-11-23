import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import { withRouter } from 'react-router-dom'
import qs from 'qs'

import withAuth from './withAuth'
import LoadingFullScreen from 'Components/LoadingFullscreen'
import { text } from 'Components/Maker/style'

export default compose(
  setDisplayName('AuthCallback'),
  setPropTypes({
    errorPath: PropTypes.string.isRequired,
    successPath: PropTypes.string.isRequired,
  }),
  withAuth(),
  withRouter,
  lifecycle({
    componentWillMount() {
      const { auth, history, location, errorPath, successPath } = this.props
      const redirectError = (err) => history.replace(`${errorPath}?${qs.stringify(err)}`)
      if (/access_token|id_token|error/.test(location.hash)) {
        auth.handleCallback()
          .then(() => {
            history.replace(successPath)
          })
          .catch(redirectError);
      } else {
        console.error('AuthCallback: missing hash')
        redirectError({ error: 'missing_hash', errorMessage: 'An authentication error has occured.' })
      }
    }
  })
)(() => (<LoadingFullScreen bgColor='#fff' label={<span className={text}>Authenticating Maker...</span>} />))