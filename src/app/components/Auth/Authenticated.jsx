import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import Loading from 'Components/LoadingFullscreen'
import { useAuth0 } from '@auth0/auth0-react'

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
  connect(createStructuredSelector({
  }), {
    push,
  })
)(({ push, children, wrapper: Wrapper }) => {
  const { isAuthenticated } = useAuth0()
  if (!isAuthenticated()) {
    push('/makers/login')
    return (<Loading />)
  }
  return (Array.isArray(children)
    ? (<Wrapper>{children}</Wrapper>)
    : children)
})