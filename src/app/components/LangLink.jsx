import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { connect } from 'react-redux'
import { Link } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { getAppLanguage } from 'Common/selectors/app'

export default compose(
  setDisplayName('LangLink'),
  connect(createStructuredSelector({
    currentLanguage: getAppLanguage
  }), {
  }),
)(({ children, to, currentLanguage, ...props }) => (
  <Link 
    to={currentLanguage === 'en' ? to : `/${currentLanguage}${to}`}
    {...props}
  >
    {children}
  </Link>
))