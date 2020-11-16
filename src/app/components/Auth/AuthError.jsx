import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'

import LogoutLink from './LogoutLink'

const joinTruthy = (items, delim = ',') => items.filter((item) => !!item).join(delim)

export default compose(
  setDisplayName('AuthError'),
  setPropTypes({
    error: PropTypes.string,
    errorMessage: PropTypes.string,
    errorDescription: PropTypes.string,
  }),
  withProps(({ error, errorMessage, errorDescription }) => ({
    formattedError: joinTruthy([error, errorMessage || errorDescription], ' - ')
  })),
)(({ formattedError }) => (
  <div className="row no-gutters align-items-center" style={{ height: '100vh' }}>
    <div className="col col-12 text-center">
      <h1 className="display-2"><b>Unauthorized...</b></h1>
      <h2><i>
        <b className="text-primary">Sorry! </b>You don&#39;t have permission to access this page.
      </i></h2>
      <h3>
        You could go back to the <a href="/">Homepage</a> or <LogoutLink/>
      </h3>
      {formattedError && (<h4>Error: {formattedError}</h4>)}
    </div>
  </div>
))