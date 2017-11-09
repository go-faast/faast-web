import React from 'react'
import PropTypes from 'prop-types'
import Layout from 'Views/Layout'

const LayoutController = (props) => (
  <Layout {...props}>{props.children}</Layout>
)

LayoutController.propTypes = {
  children: PropTypes.node.isRequired
}

export default LayoutController
