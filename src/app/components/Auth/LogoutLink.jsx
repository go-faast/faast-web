import React from 'react'
import { compose, setDisplayName, mapProps, withHandlers } from 'recompose'

import { T } from 'Components/i18n'
import withAuth from './withAuth'

export default compose(
  setDisplayName('LogoutLink'),
  mapProps((props) => ({ extraProps: props })),
  withAuth(),
  withHandlers({
    handleClick: ({ auth }) => (e) => {
      e.preventDefault()
      auth.logout()
    },
  }),
)(({ handleClick, extraProps }) => (
  <a {...extraProps} href="#" onClick={handleClick}>
    <T i18nKey="common:auth.logout">
      Log out
    </T>
  </a>
))