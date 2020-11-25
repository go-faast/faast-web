import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'

import LoadingFullscreen from 'Components/LoadingFullscreen'
import withAuth from './withAuth'

export default compose(
  setDisplayName('Authenticated'),
  setPropTypes({
    wrapper: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]),
  }),
  defaultProps({
    wrapper: 'span',
  }),
  withAuth(),
)(({ auth, children, wrapper: Wrapper }) => {
  if (!auth.isAuthenticated()) {
    auth.login()
    return (<LoadingFullscreen bgColor='#fff' fillViewport/>)
  }
  return (Array.isArray(children)
    ? (<Wrapper>{children}</Wrapper>)
    : children)
})