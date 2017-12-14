import React from 'react'
import PropTypes from 'prop-types'
import LayoutView from './view'

const Layout = (props) => (
  <LayoutView {...props}>{props.children}</LayoutView>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired
}

export default Layout
