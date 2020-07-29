import React from 'react'
import PropTypes from 'prop-types'
import { Container } from 'reactstrap'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'
import AppNavbar from 'Components/AppNavbar'

const Layout = ({ tag: Tag, navbarProps, afterNav, className, children, ...props }) => (
  <div>
    <AppNavbar {...navbarProps}/>
    {afterNav}
    <Tag className={classNames(className, 'content pb-5')} {...props}>
      {children}
    </Tag>
  </div>
)

Layout.propTypes = {
  tag: tagPropType,
  navbarProps: PropTypes.object
}

Layout.defaultProps = {
  tag: Container,
  navbarProps: {}
}

export default Layout
