import React from 'react'
import PropTypes from 'prop-types'
import { reduceStyles, fill, resize } from 'Utilities/style'

import Icon from 'Img/loading-spinner.svg?inline'

const defaultStyle = { height: '0.125rem', width: '5rem' }

const inlineStyle = {
  display: 'inline-block',
  lineHeight: 0,
  verticalAlign: 'middle'
}

const blockStyle = {
  display: 'block'
}

const Spinner = ({ inline, size, style, ...props }) => (
  <Icon style={reduceStyles(
    defaultStyle,
    resize(size),
    fill('primary'),
    (inline ? inlineStyle : blockStyle),
    style
  )} {...props} />
)

Spinner.propTypes = {
  size: PropTypes.string
}

Spinner.defaultProps = {
  size: 'md'
}

export default Spinner